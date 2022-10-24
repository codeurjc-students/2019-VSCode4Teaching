package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.UserNotFoundException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.CourseServiceImpl;
import com.vscode4teaching.vscode4teachingserver.services.websockets.SocketHandler;

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
public class CourseServiceImplTests {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseUserInfoRepository exerciseUserInfoRepository;

    @Mock
    private SocketHandler websocketHandler;

    @InjectMocks
    private CourseServiceImpl courseServiceImpl;

    private static final Logger logger = LoggerFactory.getLogger(CourseServiceImplTests.class);

    @Test
    public void registerNewCourse_valid() throws TeacherNotFoundException {
        logger.info("Test registerNewCourse_valid() begins.");
        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Optional<User> userOpt = Optional.of(user);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        Course course = new Course("Spring Boot Course");
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1L);
        when(courseRepository.save(course)).thenReturn(expectedCourse);
        when(userRepository.findByUsername(anyString())).thenReturn(userOpt);

        Course savedCourse = courseServiceImpl.registerNewCourse(course, "johndoe");
        logger.info("Course to save: {}.\n Course saved: {}", course, savedCourse);

        assertThat(savedCourse.getId()).isEqualTo(1L);
        assertThat(savedCourse.getName()).isEqualTo(course.getName());
        assertThat(savedCourse.getExercises()).isNotNull();
        assertThat(savedCourse.getExercises()).isEmpty();
        assertThat(course.getCreator()).isEqualTo(user);
        verify(courseRepository, times(1)).save(course);

        logger.info("Test registerNewCourse_valid() ends.");
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
        Long courseTestId = 1L;
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Optional<Course> courseOpt = Optional.of(course);

        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);
        when(courseRepository.save(any(Course.class))).then(returnsFirstArg());
        when(exerciseRepository.save(any(Exercise.class))).then(returnsFirstArg());
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).then(returnsFirstArg());
        Exercise exercise = new Exercise();
        exercise.setName("Unit testing in Spring Boot");

        Exercise savedExercise = courseServiceImpl.addExerciseToCourse(courseTestId, exercise, "johndoe");

        assertThat(savedExercise.getName()).isEqualTo("Unit testing in Spring Boot");
        verify(courseRepository, times(1)).findById(courseTestId);
        verify(courseRepository, times(1)).save(course);
        verify(exerciseRepository, times(1)).save(exercise);
        verify(exerciseUserInfoRepository, times(1)).save(any(ExerciseUserInfo.class));

        logger.info("Test addExerciseToCourse_valid() ends.");
    }

    @Test
    public void addExerciseToCourse_exception() {
        logger.info("Test addExerciseToCourse_exception() begins.");
        Long courseTestId = 1L;
        Optional<Course> courseOpt = Optional.empty();
        Exercise exercise = new Exercise();
        exercise.setName("Unit testing in Spring Boot");
        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);
        assertThrows(CourseNotFoundException.class,
                () -> courseServiceImpl.addExerciseToCourse(courseTestId, exercise, "johndoe"));

        logger.info("Test addExerciseToCourse_exception() ends.");
    }

    @Test
    public void editCourse_valid() throws Exception {
        logger.info("Test editCourse_valid() begins.");

        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        Course oldCourse = new Course("Spring Boot Course");
        Course courseData = new Course("New Spring Boot Course");
        Course expectedCourse = new Course("New Spring Boot Course");
        expectedCourse.setId(1L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(oldCourse);
        oldCourse.addUserInCourse(teacher);
        Optional<Course> oldCourseOpt = Optional.of(oldCourse);
        when(courseRepository.save(any(Course.class))).thenReturn(expectedCourse);
        when(courseRepository.findById(1L)).thenReturn(oldCourseOpt);

        Course savedCourse = courseServiceImpl.editCourse(1L, courseData, "johndoe");

        assertThat(savedCourse.getId()).isEqualTo(1L);
        assertThat(savedCourse.getName()).isEqualTo("New Spring Boot Course");
        verify(courseRepository, times(1)).save(any(Course.class));
        verify(courseRepository, times(1)).findById(anyLong());

        logger.info("Test editCourse_valid() ends.");
    }

    @Test
    public void deleteCourse_valid() throws CourseNotFoundException, NotInCourseException, NotCreatorException {
        Course course = new Course("Spring Boot Course");
        Long courseTestId = 1L;
        course.setId(1L);
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        course.setCreator(teacher);
        Optional<Course> courseOpt = Optional.of(course);
        Optional<Course> emptyOpt = Optional.empty();

        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt).thenReturn(emptyOpt);

        courseServiceImpl.deleteCourse(courseTestId, "johndoe");

        assertThrows(CourseNotFoundException.class, () -> courseServiceImpl.getExercises(courseTestId, "johndoe"));
        verify(courseRepository, times(2)).findById(courseTestId);

    }

    @Test
    public void getExercises_valid() throws CourseNotFoundException, NotInCourseException {
        Course course = new Course("Spring Boot Course");
        Long courseTestId = 1L;
        course.setId(courseTestId);
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        User student = new User("johndoejr2@gmail.com", "johndoe2", "pass", "John", "Doe 2");
        Role studentRole = new Role("ROLE_STUDENT");
        Role teacherRole = new Role("ROLE_TEACHER");
        studentRole.setId(2L);
        teacherRole.setId(3L);
        teacher.setId(4L);
        student.setId(5L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        student.addRole(studentRole);
        teacher.addCourse(course);
        student.addCourse(course);
        course.addUserInCourse(teacher);
        course.addUserInCourse(student);
        Exercise exercise = new Exercise();
        exercise.setName("Spring Boot Exercise 1");
        exercise.setId(6L);
        exercise.setCourse(course);
        course.addExercise(exercise);
        Optional<Course> courseOpt = Optional.of(course);
        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);

        List<Exercise> exercises1 = courseServiceImpl.getExercises(courseTestId, "johndoe");
        List<Exercise> exercises2 = courseServiceImpl.getExercises(courseTestId, "johndoe2");

        assertThat(exercises1).contains(exercise);
        assertThat(exercises2).isEqualTo(exercises1);
        verify(courseRepository, times(2)).findById(courseTestId);
    }

    @Test
    public void editExercise_valid() throws ExerciseNotFoundException, NotInCourseException {
        Course course = new Course("Spring Boot Course");
        Long courseTestId = 1L;
        course.setId(courseTestId);
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        Role teacherRole = new Role("ROLE_TEACHER");
        studentRole.setId(2L);
        teacherRole.setId(3L);
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Exercise oldExercise = new Exercise();
        oldExercise.setName("Spring Boot Exercise 1");
        Exercise exerciseData = new Exercise();
        exerciseData.setName("Spring Boot Exercise 2");
        Exercise newExercise = new Exercise();
        newExercise.setName("Spring Boot Exercise 2");
        oldExercise.setId(5L);
        newExercise.setId(5L);
        oldExercise.setCourse(course);
        course.addExercise(oldExercise);
        newExercise.setCourse(course);
        Optional<Exercise> exerciseOpt = Optional.of(oldExercise);
        when(exerciseRepository.findById(5L)).thenReturn(exerciseOpt);
        when(exerciseRepository.save(any(Exercise.class))).thenReturn(newExercise);

        Exercise savedExercise = courseServiceImpl.editExercise(5L, exerciseData, "johndoe");

        assertThat(savedExercise.getName()).isEqualTo("Spring Boot Exercise 2");
        assertThat(savedExercise.getCourse()).isEqualTo(course);
        verify(exerciseRepository, times(1)).findById(anyLong());
        verify(exerciseRepository, times(1)).save(any(Exercise.class));
    }

    @Test
    public void deleteExercise_valid() throws CourseNotFoundException, NotInCourseException, ExerciseNotFoundException {
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Exercise exercise = new Exercise();
        exercise.setName("Spring Boot Exercise 1");
        exercise.setId(6L);
        exercise.setCourse(course);
        course.addExercise(exercise);
        Optional<Exercise> exerciseOpt = Optional.of(exercise);
        Course courseWithoutExercises = new Course("Spring Boot Course");
        courseWithoutExercises.addUserInCourse(teacher);
        Optional<Course> courseOpt = Optional.of(courseWithoutExercises);
        doNothing().when(exerciseRepository).delete(any(Exercise.class));
        when(exerciseRepository.findById(6L)).thenReturn(exerciseOpt);
        when(courseRepository.findById(1L)).thenReturn(courseOpt);

        courseServiceImpl.deleteExercise(6L, "johndoe");
        List<Exercise> savedExercises = courseServiceImpl.getExercises(1L, "johndoe");

        assertThat(savedExercises).isEmpty();
        verify(exerciseRepository, times(1)).findById(6L);
    }

    @Test
    public void joinCourseWithSharingCode_valid() throws CourseNotFoundException, UserNotFoundException {
        logger.info("Test joinCourseWithSharingCode_valid() begins.");
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        Exercise exercise = new Exercise("Spring Boot Exercise 1");
        exercise.setId(2L);
        exercise.setCourse(course);
        course.addExercise(exercise);
        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        user.setId(3L);
        ExerciseUserInfo eui = new ExerciseUserInfo(exercise, user);
        eui.setId(4L);

        when(courseRepository.findByUuid(course.getUuid())).thenReturn(Optional.of(course));
        when(userRepository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).thenReturn(eui);
        when(courseRepository.save(any(Course.class))).thenReturn(course);

        Course returnedCourse = courseServiceImpl.joinCourseWithSharingCode(course.getUuid(), user.getUsername());

        assertThat(returnedCourse).isEqualTo(course);
        logger.info("Test joinCourseWithSharingCode_valid() ends.");
    }

    @Test
    public void getCourseInformationWithSharingCode_valid() throws CourseNotFoundException {
        logger.info("Test getCourseInformationWithSharingCode_valid() begins.");

        Course expectedCourse = new Course("Spring Boot Course");

        when(courseRepository.findByUuid(expectedCourse.getUuid())).thenReturn(Optional.of(expectedCourse));

        Course actualCourse = courseServiceImpl.getCourseInformationWithSharingCode(expectedCourse.getUuid());

        verify(courseRepository, times(1)).findByUuid(expectedCourse.getUuid());
        assertThat(actualCourse).isEqualTo(expectedCourse);

        logger.info("Test getCourseInformationWithSharingCode_valid() ends.");
    }

    @Test
    public void getExercise_valid() throws ExerciseNotFoundException {
        Course course = new Course("Spring Boot Course");
        Long courseTestId = 1L;
        course.setId(courseTestId);
        Exercise expectedExercise = new Exercise();
        Long expectedExerciseId = 2L;
        expectedExercise.setName("Spring Boot Exercise 1");
        expectedExercise.setId(expectedExerciseId);
        expectedExercise.setCourse(course);
        course.addExercise(expectedExercise);
        when(exerciseRepository.findById(expectedExerciseId)).thenReturn(Optional.of(expectedExercise));

        Exercise actualExercise = courseServiceImpl.getExercise(expectedExerciseId);

        assertThat(actualExercise).isEqualTo(expectedExercise);
    }

    @Test
    public void getUserCourses() throws UserNotFoundException {
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        Course course = new Course("Spring Boot Course");
        teacher.setId(4L);
        course.setId(1L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Optional<User> userOpt = Optional.of(teacher);
        when(userRepository.findById(anyLong())).thenReturn(userOpt);

        List<Course> courses = courseServiceImpl.getUserCourses(1L);

        assertThat(courses).contains(course);
        verify(userRepository, times(1)).findById(anyLong());
    }

    @Test
    public void addUserToCourse() throws UserNotFoundException, CourseNotFoundException, NotInCourseException {
        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(5L);
        course.addUserInCourse(teacher);
        Exercise ex = new Exercise("Exercise 1");
        ex.setCourse(course);
        course.addExercise(ex);
        Optional<User> userOpt1 = Optional.of(newUser1);
        Optional<User> userOpt2 = Optional.of(newUser2);
        Optional<Course> courseOpt = Optional.of(course);
        Course expectedSavedCourse = new Course("Spring Boot Course");
        expectedSavedCourse.addUserInCourse(newUser1);
        expectedSavedCourse.addUserInCourse(newUser2);
        when(userRepository.findById(anyLong())).thenReturn(userOpt1).thenReturn(userOpt2);
        when(courseRepository.findById(anyLong())).thenReturn(courseOpt);
        when(courseRepository.save(any(Course.class))).thenReturn(expectedSavedCourse);
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).then(returnsFirstArg());

        Long[] ids = {1L, 5L};
        Course savedCourse = courseServiceImpl.addUsersToCourse(5L, ids, "johndoe");

        assertThat(course.getUsersInCourse()).contains(newUser1);
        assertThat(course.getUsersInCourse()).contains(newUser2);
        assertThat(savedCourse).isEqualTo(expectedSavedCourse);
        verify(userRepository, times(2)).findById(anyLong());
        verify(courseRepository, times(1)).findById(anyLong());
        verify(courseRepository, times(1)).save(any(Course.class));
        verify(exerciseUserInfoRepository, times(2)).save(any(ExerciseUserInfo.class));
    }

    @Test
    public void getUsersInCourse() throws CourseNotFoundException, NotInCourseException {
        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(5L);
        course.addUserInCourse(teacher);
        Optional<Course> courseOpt = Optional.of(course);
        course.addUserInCourse(teacher);
        course.addUserInCourse(newUser1);
        course.addUserInCourse(newUser2);
        when(courseRepository.findById(anyLong())).thenReturn(courseOpt);

        Set<User> users = courseServiceImpl.getUsersInCourse(4L, "johndoe");

        assertThat(course.getUsersInCourse()).contains(newUser1);
        assertThat(course.getUsersInCourse()).contains(newUser2);
        assertThat(course.getUsersInCourse()).isEqualTo(users);
        verify(courseRepository, times(1)).findById(anyLong());
    }

    @Test
    public void removeUsersFromCourse() throws Exception {
        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Course course = new Course("Spring Boot Course");
        course.setId(5L);
        course.addUserInCourse(teacher);
        course.addUserInCourse(newUser1);
        course.addUserInCourse(newUser2);
        Optional<User> userOpt1 = Optional.of(newUser1);
        Optional<User> userOpt2 = Optional.of(newUser2);
        Optional<Course> courseOpt = Optional.of(course);
        Course expectedSavedCourse = new Course("Spring Boot Course");
        course.setCreator(teacher);
        expectedSavedCourse.setCreator(teacher);
        when(userRepository.findById(anyLong())).thenReturn(userOpt1).thenReturn(userOpt2);
        when(courseRepository.findById(anyLong())).thenReturn(courseOpt);
        when(courseRepository.save(any(Course.class))).thenReturn(expectedSavedCourse);

        Long[] ids = {1L, 5L};
        Course savedCourse = courseServiceImpl.removeUsersFromCourse(5L, ids, "johndoe");

        assertThat(course.getUsersInCourse()).doesNotContain(newUser1);
        assertThat(course.getUsersInCourse()).doesNotContain(newUser2);
        assertThat(savedCourse).isEqualTo(expectedSavedCourse);
        verify(userRepository, times(2)).findById(anyLong());
        verify(courseRepository, times(1)).findById(anyLong());
        verify(courseRepository, times(1)).save(any(Course.class));
    }

    @Test
    public void getCreator() throws CourseNotFoundException {
        logger.info("Test getCreator() begins.");
        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        user.setId(4L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        user.addRole(studentRole);
        user.addRole(teacherRole);
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        course.setCreator(user);
        Optional<Course> courseOpt = Optional.of(course);
        when(courseRepository.findById(anyLong())).thenReturn(courseOpt);

        User creatorFound = courseServiceImpl.getCreator(1L);

        assertThat(creatorFound.getUsername()).isEqualTo("johndoe");
        assertThat(course.getCreator()).isEqualTo(user);

        logger.info("Test getCreator() ends.");
    }

    @Test
    public void getCourseCode_valid()
            throws CourseNotFoundException, NotInCourseException, UserNotFoundException {
        Course course = new Course("Spring Boot Course");
        String courseCode = course.getUuid();
        Long courseTestId = 1L;
        course.setId(1L);
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        course.setCreator(teacher);
        Optional<Course> courseOpt = Optional.of(course);

        when(courseRepository.findById(courseTestId)).thenReturn(courseOpt);

        String courseCodeByService = courseServiceImpl.getCourseCode(courseTestId, "johndoe");

        verify(courseRepository, times(1)).findById(courseTestId);
        assertThat(courseCodeByService).isEqualTo(courseCode);

    }

    @Test
    public void getExerciseCode_valid()
            throws NotInCourseException, ExerciseNotFoundException, UserNotFoundException {
        User teacher = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        Exercise exercise = new Exercise();
        String exCode = exercise.getUuid();
        exercise.setName("Spring Boot Exercise 1");
        exercise.setId(6L);
        exercise.setCourse(course);
        course.addExercise(exercise);
        Optional<Exercise> exerciseOpt = Optional.of(exercise);
        when(exerciseRepository.findById(6L)).thenReturn(exerciseOpt);

        String exCodeByService = courseServiceImpl.getExerciseCode(6L, "johndoe");

        assertThat(exCodeByService).isEqualTo(exCode);
        verify(exerciseRepository, times(1)).findById(6L);
    }
}
