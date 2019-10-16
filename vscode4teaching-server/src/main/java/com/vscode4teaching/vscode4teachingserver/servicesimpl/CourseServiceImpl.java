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
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotSameTeacherException;
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
    public Course registerNewCourse(Course course, Long teacherId, String requestUsername)
            throws TeacherNotFoundException, NotSameTeacherException {
        Optional<User> teacherOpt = userRepo.findById(teacherId);
        User teacher = teacherOpt.orElseThrow(() -> new TeacherNotFoundException("Teacher not found."));
        if (!teacher.getUsername().equals(requestUsername)) {
            throw new NotSameTeacherException(
                    "The request to add a course to a teacher has to be from the same teacher.");
        }
        course.addUserInCourse(teacher);
        return this.courseRepo.save(course);
    }

    @Override
    public Course addExerciseToCourse(Long courseId, Exercise exercise, String requestUsername)
            throws CourseNotFoundException, NotSameTeacherException {
        Course course = this.courseRepo.findById(courseId)
                .orElseThrow(() -> new CourseNotFoundException("Course not found."));
        Predicate<Role> getTeacherRole = role -> role.getRoleName().equals("ROLE_TEACHER");
        Predicate<User> getTeachers = user -> user.getRoles()
                .contains(user.getRoles().stream().filter(getTeacherRole).findFirst().get());
        List<User> teachers = course.getUsersInCourse().stream().filter(getTeachers).collect(Collectors.toList());

        List<String> teacherUsernames = teachers.stream().map(user -> user.getUsername()).collect(Collectors.toList());
        if (!teacherUsernames.contains(requestUsername)) {
            throw new NotSameTeacherException(
                    "The request to add an exercise to a course has to be from a course's teacher.");
        }
        exercise.setCourse(course);
        // Fetching exercises of course (Lazy initialization)
        course.getExercises();
        course.addExercise(exercise);
        exerciseRepo.save(exercise);
        return courseRepo.save(course);
    }

}