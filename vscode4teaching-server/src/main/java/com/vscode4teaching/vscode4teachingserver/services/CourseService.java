package com.vscode4teaching.vscode4teachingserver.services;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotSameTeacherException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CourseService {
        public List<Course> getAllCourses();

        public Course registerNewCourse(@Valid Course course, String requestUsername)
                        throws TeacherNotFoundException;

        public Course addExerciseToCourse(@Min(1) Long courseId, @Valid Exercise exercise, String requestUsername)
                        throws CourseNotFoundException, NotSameTeacherException;

        public Course editCourse(@Min(1) Long courseId, @Valid Course courseData, String requestUsername) throws CourseNotFoundException, NotSameTeacherException;

        public void deleteCourse(@Min(1) Long courseId, String requestUsername) throws CourseNotFoundException, NotSameTeacherException;

        public Course getExercises(@Min(1) Long courseId, String requestUsername);

        public Exercise editExercise(@Min(1) Long courseId, @Min(1) Long exerciseId, @Valid Exercise exerciseData, String requestUsername);

        public void deleteExercise(@Min(1) Long courseId, @Min(1) Long exerciseId, String requestUsername);
}