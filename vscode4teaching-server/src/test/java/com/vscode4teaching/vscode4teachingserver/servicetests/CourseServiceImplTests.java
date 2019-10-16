package com.vscode4teaching.vscode4teachingserver.servicetests;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotSameTeacherException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.CourseServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.mockito.AdditionalAnswers.returnsFirstArg;

@ExtendWith(MockitoExtension.class)
public class CourseServiceImplTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private CourseServiceImpl courseServiceImpl;

    private static final Logger logger = LoggerFactory.getLogger(CourseServiceImplTests.class);

    @Test
    public void registerNewCourse_valid() throws TeacherNotFoundException, NotSameTeacherException {
        logger.info("Test registerNewCourse_valid() begins.");
        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Optional<User> userOpt = Optional.of(user);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3l);
        Course course = new Course("Spring Boot Course");
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1l);
        when(courseRepository.save(course)).thenReturn(expectedCourse);
        when(userRepository.findById(anyLong())).thenReturn(userOpt);

        Course savedCourse = courseServiceImpl.registerNewCourse(course, 1l, "johndoe");
        logger.info("Course to save: {}.\n Course saved: {}", course, savedCourse);

        assertThat(savedCourse.getId()).isEqualTo(1l);
        assertThat(savedCourse.getName()).isEqualTo(course.getName());
        assertThat(savedCourse.getExercises()).isNotNull();
        assertThat(savedCourse.getExercises()).isEmpty();
        verify(courseRepository, times(1)).save(course);

        logger.info("Test registerNewCourse_valid() ends.");
    }

    @Test
    public void registerNewCourse_notSameTeacher() {
        logger.info("Test registerNewCourse_notSameTeacher() begins.");
        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        user.setId(1l);
        Optional<User> userOpt = Optional.of(user);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3l);
        Course course = new Course("Spring Boot Course");
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1l);
        when(userRepository.findById(anyLong())).thenReturn(userOpt);

        assertThrows(NotSameTeacherException.class,() -> courseServiceImpl.registerNewCourse(course, 1l, "manolo"));

        logger.info("Test registerNewCourse_notSameTeacher() ends.");
    }
    @Test
    public void getAllCourses_valid() {
        logger.info("Test getAllCourses_valid() begins.");

        List<Course> courses = new ArrayList<>();
        Course c0 = new Course("Spring Boot Course");
        Course c1 = new Course("Angular Course");
        Course c2 = new Course("VS Code API Course");

        courses.add(c0);
        courses.add(c1);
        courses.add(c2);
        when(courseRepository.findAll()).thenReturn(courses);

        List<Course> coursesFromRepo = courseServiceImpl.getAllCourses();
        logger.info("Course to get: {}.\n Course gotten: {}", courses, coursesFromRepo);

        assertThat(coursesFromRepo.size()).isEqualTo(3);
        verify(courseRepository, times(1)).findAll();

        logger.info("Test getAllCourses_valid() ends.");
    }

    @Test
    public void addExerciseToCourse_valid() throws Exception {
        logger.info("Test addExerciseToCourse_valid() begins.");

        Course course = new Course("Spring Boot Course");
        Long courseTestId = 1l;
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3l);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Optional<Course> courseOpt = Optional.of(course);
        
        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);
        when(courseRepository.save(any(Course.class))).then(returnsFirstArg());
        when(exerciseRepository.save(any(Exercise.class))).then(returnsFirstArg());
        Exercise exercise = new Exercise("Unit testing in Spring Boot");

        Course savedCourse = courseServiceImpl.addExerciseToCourse(courseTestId, exercise, "johndoe");

        assertThat(savedCourse.getName()).isEqualTo("Spring Boot Course");
        Exercise savedExerciseInCourse = savedCourse.getExercises().get(0);
        assertThat(savedExerciseInCourse.getName()).isEqualTo("Unit testing in Spring Boot");
        verify(courseRepository, times(1)).findById(courseTestId);
        verify(courseRepository, times(1)).save(course);
        verify(exerciseRepository, times(1)).save(exercise);

        logger.info("Test addExerciseToCourse_valid() ends.");
    }

    @Test
    public void addExerciseToCourse_exception() {
        logger.info("Test addExerciseToCourse_exception() begins.");
        Long courseTestId = 1l;
        Optional<Course> courseOpt = Optional.empty();
        Exercise exercise = new Exercise("Unit testing in Spring Boot");
        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);
        assertThrows(CourseNotFoundException.class,
                () -> courseServiceImpl.addExerciseToCourse(courseTestId, exercise, "johndoe"));

        logger.info("Test addExerciseToCourse_exception() ends.");
    }
}