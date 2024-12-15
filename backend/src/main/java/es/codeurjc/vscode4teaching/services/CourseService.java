package es.codeurjc.vscode4teaching.services;

import es.codeurjc.vscode4teaching.model.Course;
import es.codeurjc.vscode4teaching.model.Exercise;
import es.codeurjc.vscode4teaching.model.ExerciseUserInfo;
import es.codeurjc.vscode4teaching.model.User;
import es.codeurjc.vscode4teaching.model.repositories.CourseRepository;
import es.codeurjc.vscode4teaching.model.repositories.ExerciseRepository;
import es.codeurjc.vscode4teaching.model.repositories.ExerciseUserInfoRepository;
import es.codeurjc.vscode4teaching.model.repositories.UserRepository;
import es.codeurjc.vscode4teaching.services.exceptions.*;
import es.codeurjc.vscode4teaching.services.websockets.SocketHandler;
import es.codeurjc.vscode4teaching.servicesimpl.ExceptionUtil;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepo;
    private final ExerciseRepository exerciseRepo;
    private final UserRepository userRepo;
    private final ExerciseUserInfoRepository exerciseUserInfoRepo;
    private final SocketHandler websocketHandler;

    private final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    public CourseService(CourseRepository courseRepo, ExerciseRepository exerciseRepo, UserRepository userRepo,
                         ExerciseUserInfoRepository exerciseUserInfoRepo, SocketHandler websocketHandler) {
        this.courseRepo = courseRepo;
        this.exerciseRepo = exerciseRepo;
        this.userRepo = userRepo;
        this.exerciseUserInfoRepo = exerciseUserInfoRepo;
        this.websocketHandler = websocketHandler;
    }

    public List<Course> getAllCourses() {
        return this.courseRepo.findAll();
    }

    public Optional<Course> getCourseById(Long courseId) {
        return this.courseRepo.findById(courseId);
    }

    public Course registerNewCourse(Course course, String requestUsername) throws TeacherNotFoundException {
        Optional<User> teacherOpt = userRepo.findByUsername(requestUsername);
        User teacher = teacherOpt.orElseThrow(() -> new TeacherNotFoundException(requestUsername));
        course.addUserInCourse(teacher);
        course.setCreator(teacher);
        return this.courseRepo.save(course);
    }

    public User getCreator(@Min(1) Long courseId) throws CourseNotFoundException {
        Course course = courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        return course.getCreator();
    }

    public Exercise addExerciseToCourse(Long courseId, Exercise exercise, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        exercise.setCourse(course);
        // Fetching exercises of course (Lazy initialization)
        course.getExercises();
        course.addExercise(exercise);
        Exercise savedExercise = exerciseRepo.save(exercise);
        courseRepo.save(course);
        // Set up exercise user info for all users in course
        for (User user : course.getUsersInCourse()) {
            ExerciseUserInfo eui = new ExerciseUserInfo(savedExercise, user);
            exerciseUserInfoRepo.save(eui);
        }
        this.websocketHandler.refreshExerciseDashboards(course.getTeachers());
        return savedExercise;
    }

    public Course editCourse(Long courseId, Course courseData, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course courseToEdit = this.courseRepo.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(courseToEdit, requestUsername, true);
        courseToEdit.setName(courseData.getName());
        return courseRepo.save(courseToEdit);
    }

    public void deleteCourse(Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException, NotCreatorException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        ExceptionUtil.throwIfNotCreator(course, requestUsername);
        this.courseRepo.delete(course);
    }

    public List<Exercise> getExercises(Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, false);
        return course.getExercises();
    }

    public Course joinCourseWithSharingCode(String uuid, String requestUsername)
            throws CourseNotFoundException, UserNotFoundException {
        Course course = this.courseRepo.findByUuid(uuid).orElseThrow(() -> new CourseNotFoundException(uuid));
        User user = userRepo.findByUsername(requestUsername)
                .orElseThrow(() -> new UserNotFoundException(requestUsername));
        course.addUserInCourse(user);
        for (Exercise ex : course.getExercises()) {
            ExerciseUserInfo eui = new ExerciseUserInfo(ex, user);
            exerciseUserInfoRepo.save(eui);
        }
        this.websocketHandler.refreshExerciseDashboards(course.getTeachers());
        return courseRepo.save(course);
    }

    public Course getCourseInformationWithSharingCode(String uuid)
            throws CourseNotFoundException {
        return this.courseRepo.findByUuid(uuid).orElseThrow(() -> new CourseNotFoundException(uuid));
    }

    public Exercise getExercise(Long exerciseId) throws ExerciseNotFoundException {
        return this.exerciseRepo.findById(exerciseId).orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
    }

    public Exercise editExercise(Long exerciseId, Exercise exerciseData, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = this.exerciseRepo.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, true);
        exercise.setName(exerciseData.getName());
        exercise.setIncludesTeacherSolution(exerciseData.includesTeacherSolution());
        exercise.setSolutionIsPublic(exerciseData.solutionIsPublic());
        exercise.setAllowEditionAfterSolutionDownloaded(exerciseData.isEditionAfterSolutionDownloadedAllowed());
        return exerciseRepo.save(exercise);
    }

    public void deleteExercise(Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = this.exerciseRepo.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, true);
        this.exerciseRepo.delete(exercise);

    }

    public List<Course> getUserCourses(Long userId) throws UserNotFoundException {
        User user = this.userRepo.findById(userId).orElseThrow(() -> new UserNotFoundException(Long.toString(userId)));
        return user.getCourses();
    }

    public Course addUsersToCourse(@Min(1) Long courseId, Long[] userIds, String requestUsername)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        for (Long userId : userIds) {
            User user = this.userRepo.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(Long.toString(userId)));
            course.addUserInCourse(user);
            for (Exercise ex : course.getExercises()) {
                ExerciseUserInfo eui = new ExerciseUserInfo(ex, user);
                exerciseUserInfoRepo.save(eui);
            }
        }
        this.websocketHandler.refreshExerciseDashboards(course.getTeachers());
        return this.courseRepo.save(course);
    }

    public Set<User> getUsersInCourse(@Min(1) Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, false);
        return course.getUsersInCourse();

    }

    public Course removeUsersFromCourse(@Min(1) Long courseId, Long[] userIds, String requestUsername)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException, CantRemoveCreatorException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        for (Long userId : userIds) {
            User user = this.userRepo.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(Long.toString(userId)));
            if (course.getCreator().equals(user)) {
                throw new CantRemoveCreatorException();
            }
            course.removeUserFromCourse(user);
        }
        List<Long> exerciseIds = course.getExercises().stream().map(Exercise::getId).collect(Collectors.toList());
        this.exerciseUserInfoRepo.deleteByExercise_IdInAndUser_IdIn(exerciseIds, Arrays.asList(userIds));
        this.websocketHandler.refreshExerciseDashboards(course.getTeachers());
        return this.courseRepo.save(course);
    }

    public String getCourseCode(Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        return course.getUuid();
    }

    public String getExerciseCode(Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = this.exerciseRepo.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, true);
        return exercise.getUuid();
    }

}
