package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.stream.Collectors;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepo;
    private final ExerciseRepository exerciseRepo;
    private final UserRepository userRepo;

    public CourseServiceImpl(CourseRepository courseRepo, ExerciseRepository exerciseRepo, UserRepository userRepo) {
        this.courseRepo = courseRepo;
        this.exerciseRepo = exerciseRepo;
        this.userRepo = userRepo;
    }

    @Override
    public List<Course> getAllCourses() {
        return this.courseRepo.findAll();
    }

    @Override
    public Course registerNewCourse(Course course, String requestUsername) throws TeacherNotFoundException {
        Optional<User> teacherOpt = userRepo.findByUsername(requestUsername);
        User teacher = teacherOpt
                .orElseThrow(() -> new TeacherNotFoundException("Teacher not found: " + requestUsername));
        course.addUserInCourse(teacher);
        return this.courseRepo.save(course);
    }

    @Override
    public Exercise addExerciseToCourse(Long courseId, Exercise exercise, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        throwExceptionIfNotInCourse(course, requestUsername, true);
        exercise.setCourse(course);
        // Fetching exercises of course (Lazy initialization)
        course.getExercises();
        course.addExercise(exercise);
        Exercise savedExercise = exerciseRepo.save(exercise);
        courseRepo.save(course);
        return savedExercise;
    }

    @Override
    public Course editCourse(Long courseId, Course courseData, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course courseToEdit = this.courseRepo.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException(courseId));
        throwExceptionIfNotInCourse(courseToEdit, requestUsername, true);
        courseToEdit.setName(courseData.getName());
        return courseRepo.save(courseToEdit);
    }

    @Override
    public void deleteCourse(Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        throwExceptionIfNotInCourse(course, requestUsername, true);
        this.courseRepo.delete(course);
    }

    @Override
    public List<Exercise> getExercises(Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException {
        Course course = this.courseRepo.findById(courseId).orElseThrow(() -> new CourseNotFoundException(courseId));
        throwExceptionIfNotInCourse(course, requestUsername, false);
        return course.getExercises();
    }

    @Override
    public Exercise editExercise(Long exerciseId, Exercise exerciseData, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = this.exerciseRepo.findById(exerciseId).orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, true);
        exercise.setName(exerciseData.getName());
        return exerciseRepo.save(exercise);
    }

    @Override
    public void deleteExercise(Long exerciseId, String requestUsername) {
        // TODO Auto-generated method stub

    }

    private void throwExceptionIfNotInCourse(Course course, String requestUsername, boolean hasToBeTeacher)
            throws NotInCourseException {
        Predicate<Role> getTeacherRole = role -> role.getRoleName().equals("ROLE_TEACHER");
        Predicate<User> getUsers;
        List<User> users;
        if (hasToBeTeacher) {
            getUsers = user -> user.getRoles()
                    .contains(user.getRoles().stream().filter(getTeacherRole).findFirst().get());
            users = course.getUsersInCourse().stream().filter(getUsers).collect(Collectors.toList());
        } else {
            users = course.getUsersInCourse();
        }
        List<String> usernames = users.stream().map(user -> user.getUsername()).collect(Collectors.toList());
        if (!usernames.contains(requestUsername)) {
            String exceptionMessage;
            if (hasToBeTeacher) {
                exceptionMessage = "User is not in course or teacher is not in this course.";
            } else {
                exceptionMessage = "User is not in course.";
            }
            throw new NotInCourseException(exceptionMessage);
        }
    }

}