package com.vscode4teaching.vscode4teachingserver.services;

import java.util.List;
import java.util.Set;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CantRemoveCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotCreatorException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.UserNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CourseService {
    public List<Course> getAllCourses();

    public Course registerNewCourse(@Valid Course course, String requestUsername) throws TeacherNotFoundException;

    public User getCreator(@Min(1) Long courseId) throws CourseNotFoundException;

    public Exercise addExerciseToCourse(@Min(1) Long courseId, @Valid Exercise exercise, String requestUsername)
            throws CourseNotFoundException, NotInCourseException;

    public Course editCourse(@Min(1) Long courseId, @Valid Course courseData, String requestUsername)
            throws CourseNotFoundException, NotInCourseException;

    public void deleteCourse(@Min(1) Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException, NotCreatorException;

    public List<Exercise> getExercises(@Min(1) Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException;

    public Course getCourseWithSharingCode(String uuid, String requestUsername)
            throws CourseNotFoundException, NotInCourseException, UserNotFoundException;

    public Exercise editExercise(@Min(1) Long exerciseId, @Valid Exercise exerciseData, String requestUsername)
            throws NotInCourseException, ExerciseNotFoundException;

    public void deleteExercise(@Min(1) Long exerciseId, String requestUsername)
            throws NotInCourseException, ExerciseNotFoundException;

    public List<Course> getUserCourses(@Min(1) Long userId) throws UserNotFoundException;

    public Set<User> getUsersInCourse(@Min(1) Long courseId, String requestUsername)
            throws CourseNotFoundException, NotInCourseException;

    public Course addUsersToCourse(@Min(1) Long courseId, Long[] userIds, String requestUsername)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException;

    public Course removeUsersFromCourse(@Min(1) Long courseId, Long[] userIds, String requestUsername)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException, CantRemoveCreatorException;

    public String getCourseCode(Long courseId, String requestUsername)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException;

    public String getExerciseCode(Long exerciseId, String requestUsername)
            throws UserNotFoundException, ExerciseNotFoundException, NotInCourseException;
}