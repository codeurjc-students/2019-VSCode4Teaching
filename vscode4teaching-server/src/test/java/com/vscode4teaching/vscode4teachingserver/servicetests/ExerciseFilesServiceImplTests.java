package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

import java.io.File;
import java.util.List;
import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.ExerciseFilesServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.TestPropertySource;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(locations = "classpath:test.properties")
public class ExerciseFilesServiceImplTests {

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private ExerciseFilesServiceImpl filesService;

    private static final Logger logger = LoggerFactory.getLogger(ExerciseFilesServiceImplTests.class);

    @Test
    public void getExerciseFiles_withTemplate() throws Exception {
        User student = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        student.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        student.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(student);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        ExerciseFile file1 = new ExerciseFile("v4t-course-test/spring-boot-course/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile("v4t-course-test/spring-boot-course/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        List<File> files = filesService.getExerciseFiles(1l, "johndoe");

        assertThat(files.size()).isEqualTo(2);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                .isEqualTo("v4t-course-test/spring-boot-course/template/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                .isEqualTo("v4t-course-test/spring-boot-course/template/ej2.txt");

    }

    @Test
    public void getExerciseFiles_withUserFiles() throws Exception {
        User student = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        student.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        student.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(student);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        ExerciseFile file1 = new ExerciseFile("v4t-course-test/spring-boot-course/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile("v4t-course-test/spring-boot-course/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        ExerciseFile file3 = new ExerciseFile("v4t-course-test/spring-boot-course/johndoe/ej1.txt");
        ExerciseFile file4 = new ExerciseFile("v4t-course-test/spring-boot-course/johndoe/ej2.txt");
        file3.setOwner(student);
        file4.setOwner(student);
        exercise.addUserFile(file3);
        exercise.addUserFile(file4);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        List<File> files = filesService.getExerciseFiles(1l, "johndoe");

        logger.info(files.get(0).getAbsolutePath());
        logger.info(files.get(1).getAbsolutePath());
        assertThat(files.size()).isEqualTo(2);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                .isEqualTo("v4t-course-test/spring-boot-course/johndoe/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                .isEqualTo("v4t-course-test/spring-boot-course/johndoe/ej2.txt");
    }

    @Test
    public void getExerciseFiles_noTemplate() throws Exception {
        User student = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        student.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        student.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(student);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        assertThrows(NoTemplateException.class, () -> filesService.getExerciseFiles(1l, "johndoe"));
    }
}