package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.AdditionalAnswers.returnsFirstArg;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.ExerciseFilesServiceImpl;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(locations = "classpath:test.properties")
public class ExerciseFilesServiceImplTests {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExerciseFileRepository fileRepository;

    @InjectMocks
    private ExerciseFilesServiceImpl filesService;

    private static final Logger logger = LoggerFactory.getLogger(ExerciseFilesServiceImplTests.class);

    @AfterEach
    public void cleanup() {
        try {
                FileUtils.deleteDirectory(Paths.get("null/").toFile());
                FileUtils.deleteDirectory(Paths.get("v4t-course-test/").toFile());
                FileUtils.deleteDirectory(Paths.get("test-uploads/").toFile());
        } catch (IOException e) {
                logger.error(e.getMessage());
        }
    }

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
        ExerciseFile file1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        Map<Exercise, List<File>> filesMap = filesService.getExerciseFiles(1l, "johndoe");
        List<File> files = filesMap.values().stream().findFirst().get();

        assertThat(files.size()).isEqualTo(2);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        verify(exerciseRepository, times(1)).findById(anyLong());

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
        ExerciseFile file1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        ExerciseFile file3 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej1.txt");
        ExerciseFile file4 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej2.txt");
        file3.setOwner(student);
        file4.setOwner(student);
        exercise.addUserFile(file3);
        exercise.addUserFile(file4);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        Map<Exercise, List<File>> filesMap = filesService.getExerciseFiles(1l, "johndoe");
        List<File> files = filesMap.values().stream().findFirst().get();

        logger.info(files.get(0).getAbsolutePath());
        logger.info(files.get(1).getAbsolutePath());
        assertThat(files.size()).isEqualTo(2);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej2.txt");
        verify(exerciseRepository, times(1)).findById(anyLong());
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
        verify(exerciseRepository, times(1)).findById(anyLong());
    }

    @Test
    public void saveExerciseFiles() throws Exception {
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
        when(exerciseRepository.findById(anyLong())).thenReturn(Optional.of(exercise));
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(student));
        when(fileRepository.save(any(ExerciseFile.class))).then(returnsFirstArg());
        when(exerciseRepository.save(any(Exercise.class))).then(returnsFirstArg());
        // Get files
        File file = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files", "exs.zip")
                        .toFile();
        MultipartFile mockFile = new MockMultipartFile("file", file.getName(), "application/zip",
                        new FileInputStream(file));

        Map<Exercise, List<File>> filesMap = filesService.saveExerciseFiles(1l, mockFile, "johndoe");
        List<File> savedFiles = filesMap.values().stream().findFirst().get();

        assertThat(Files.exists(Paths.get("null/"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex1.html"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex2.html"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex3/ex3.html")))
                        .isTrue();
        assertThat(Files.readAllLines(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex1.html")))
                        .contains("<html>Exercise 1</html>");
        assertThat(Files.readAllLines(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex2.html")))
                        .contains("<html>Exercise 2</html>");
        assertThat(Files.readAllLines(Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex3/ex3.html")))
                        .contains("<html>Exercise 3</html>");
        assertThat(exercise.getUserFiles()).hasSize(3);
        assertThat(exercise.getUserFiles().get(0).getOwner()).isEqualTo(student);
        assertThat(exercise.getUserFiles().get(1).getOwner()).isEqualTo(student);
        assertThat(exercise.getUserFiles().get(2).getOwner()).isEqualTo(student);
        assertThat(exercise.getUserFiles().get(0).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex1.html").toAbsolutePath()
                                        .toString());
        assertThat(exercise.getUserFiles().get(1).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex2.html").toAbsolutePath()
                                        .toString());
        assertThat(exercise.getUserFiles().get(2).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/johndoe/ex3/ex3.html")
                                        .toAbsolutePath().toString());
        assertThat(savedFiles.size()).isEqualTo(3);
        assertThat(savedFiles.get(0).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getUserFiles().get(0).getPath());
        assertThat(savedFiles.get(1).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getUserFiles().get(1).getPath());
        assertThat(savedFiles.get(2).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getUserFiles().get(2).getPath());
        verify(exerciseRepository, times(1)).findById(anyLong());
        verify(userRepository, times(1)).findByUsername(anyString());
        verify(fileRepository, times(3)).save(any(ExerciseFile.class));
        verify(exerciseRepository, times(1)).save(any(Exercise.class));
    }

    @Test
    public void saveExerciseTemplate() throws Exception {
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        teacher.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        studentRole.setId(10l);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(teacher);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        when(exerciseRepository.findById(anyLong())).thenReturn(Optional.of(exercise));
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(teacher));
        when(fileRepository.save(any(ExerciseFile.class))).then(returnsFirstArg());
        when(exerciseRepository.save(any(Exercise.class))).then(returnsFirstArg());
        // Get files
        File file = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files", "exs.zip")
                        .toFile();
        MultipartFile mockFile = new MockMultipartFile("file", file.getName(), "application/zip",
                        new FileInputStream(file));

        Map<Exercise, List<File>> filesMap = filesService.saveExerciseTemplate(1l, mockFile, "johndoe");
        List<File> savedFiles = filesMap.values().stream().findFirst().get();

        assertThat(Files.exists(Paths.get("null/"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/template"))).isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex1.html")))
                        .isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex2.html")))
                        .isTrue();
        assertThat(Files.exists(Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex3/ex3.html")))
                        .isTrue();
        assertThat(Files.readAllLines(Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex1.html")))
                        .contains("<html>Exercise 1</html>");
        assertThat(Files.readAllLines(Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex2.html")))
                        .contains("<html>Exercise 2</html>");
        assertThat(Files.readAllLines(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex3/ex3.html")))
                                        .contains("<html>Exercise 3</html>");
        assertThat(exercise.getTemplate()).hasSize(3);
        assertThat(exercise.getTemplate().get(0).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex1.html").toAbsolutePath()
                                        .toString());
        assertThat(exercise.getTemplate().get(1).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex2.html").toAbsolutePath()
                                        .toString());
        assertThat(exercise.getTemplate().get(2).getPath()).isEqualToIgnoringCase(
                        Paths.get("null/spring_boot_course_4/exercise_1_1/template/ex3/ex3.html")
                                        .toAbsolutePath().toString());
        assertThat(savedFiles.size()).isEqualTo(3);
        assertThat(savedFiles.get(0).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getTemplate().get(0).getPath());
        assertThat(savedFiles.get(1).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getTemplate().get(1).getPath());
        assertThat(savedFiles.get(2).getAbsolutePath())
                        .isEqualToIgnoringCase(exercise.getTemplate().get(2).getPath());
        verify(exerciseRepository, times(1)).findById(anyLong());
        verify(userRepository, times(1)).findByUsername(anyString());
        verify(fileRepository, times(3)).save(any(ExerciseFile.class));
        verify(exerciseRepository, times(1)).save(any(Exercise.class));
    }

    @Test
    public void getTemplate() throws Exception {
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
        ExerciseFile file1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        Map<Exercise, List<File>> filesMap = filesService.getExerciseTemplate(1l, "johndoe");
        List<File> files = filesMap.values().stream().findFirst().get();

        assertThat(files.size()).isEqualTo(2);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        verify(exerciseRepository, times(1)).findById(anyLong());
    }

    @Test
    public void getAllStudentExercises() throws ExerciseNotFoundException, NotInCourseException {
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe");
        teacher.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(10l);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        User student1 = new User("johndoejr1@gmail.com", "johndoejr1", "pass", "John", "Doe Jr 1");
        student1.setId(11l);
        student1.addRole(studentRole);
        User student2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        student2.setId(12l);
        student2.addRole(studentRole);
        User student3 = new User("johndoejr3@gmail.com", "johndoejr3", "pass", "John", "Doe Jr 3");
        student3.setId(13l);
        student3.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(teacher);
        course.addUserInCourse(student1);
        course.addUserInCourse(student2);
        course.addUserInCourse(student3);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        ExerciseFile file1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt");
        ExerciseFile file2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt");
        exercise.addFileToTemplate(file1);
        exercise.addFileToTemplate(file2);
        ExerciseFile teacherFile1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej1.txt");
        ExerciseFile teacherFile2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoe/ej2.txt");
        teacherFile1.setOwner(teacher);
        teacherFile2.setOwner(teacher);
        exercise.addUserFile(teacherFile1);
        exercise.addUserFile(teacherFile2);
        ExerciseFile student1File1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr1/ej1.txt");
        ExerciseFile student1File2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr1/ej2.txt");
        student1File1.setOwner(student1);
        student1File2.setOwner(student1);
        exercise.addUserFile(student1File1);
        exercise.addUserFile(student1File2);
        ExerciseFile student2File1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr2/ej1.txt");
        ExerciseFile student2File2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr2/ej2.txt");
        student2File1.setOwner(student2);
        student2File2.setOwner(student2);
        exercise.addUserFile(student2File1);
        exercise.addUserFile(student2File2);
        ExerciseFile student3File1 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr3/ej1.txt");
        ExerciseFile student3File2 = new ExerciseFile(
                        "v4t-course-test/spring-boot-course/exercise_1_1/johndoejr3/ej2.txt");
        student3File1.setOwner(student3);
        student3File2.setOwner(student3);
        exercise.addUserFile(student3File1);
        exercise.addUserFile(student3File2);
        Optional<Exercise> exOpt = Optional.of(exercise);
        when(exerciseRepository.findById(anyLong())).thenReturn(exOpt);

        Map<Exercise, List<File>> filesMap = filesService.getAllStudentsFiles(1l, "johndoe");
        List<File> files = filesMap.values().stream().findFirst().get();

        assertThat(files.size()).isEqualTo(6);
        assertThat(files.get(0).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr1/ej1.txt");
        assertThat(files.get(1).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr1/ej2.txt");
        assertThat(files.get(2).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr2/ej1.txt");
        assertThat(files.get(3).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr2/ej2.txt");
        assertThat(files.get(4).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr3/ej1.txt");
        assertThat(files.get(5).getPath().replace("\\", "/"))
                        .isEqualTo("v4t-course-test/spring-boot-course/exercise_1_1/johndoejr3/ej2.txt");
        verify(exerciseRepository, times(1)).findById(anyLong());
    }

    @Test
    public void getFileIds() throws ExerciseNotFoundException {
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe");
        teacher.setId(3l);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(10l);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        User student1 = new User("johndoejr1@gmail.com", "johndoejr1", "pass", "John", "Doe Jr 1");
        student1.setId(11l);
        student1.addRole(studentRole);
        User student2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        student2.setId(12l);
        student2.addRole(studentRole);
        User student3 = new User("johndoejr3@gmail.com", "johndoejr3", "pass", "John", "Doe Jr 3");
        student3.setId(13l);
        student3.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(4l);
        course.addUserInCourse(teacher);
        course.addUserInCourse(student1);
        course.addUserInCourse(student2);
        course.addUserInCourse(student3);
        Exercise exercise = new Exercise();
        exercise.setName("Exercise 1");
        exercise.setId(1l);
        course.addExercise(exercise);
        exercise.setCourse(course);
        ExerciseFile ex1 = new ExerciseFile("johndoejr1" + File.separator + "test1");
        ex1.setId(101l);
        ex1.setOwner(student1);
        ExerciseFile ex2 = new ExerciseFile("johndoejr2" + File.separator + "test2");
        ex2.setId(102l);
        ex2.setOwner(student2);
        ExerciseFile ex3 = new ExerciseFile("johndoejr3" + File.separator + "test3");
        ex3.setId(103l);
        ex3.setOwner(student3);
        exercise.addUserFile(ex1);
        exercise.addUserFile(ex2);
        exercise.addUserFile(ex3);
        when(exerciseRepository.findById(anyLong())).thenReturn(Optional.of(exercise));

        List<ExerciseFile> files = filesService.getFileIdsByExerciseAndOwner(1l, "johndoejr1");

        verify(exerciseRepository, times(1)).findById(anyLong());
        assertThat(files.size()).isEqualTo(1);
        assertThat(files.get(0).getId()).isEqualTo(101l);
        assertThat(files.get(0).getPath()).isEqualTo("test1");
    }
}