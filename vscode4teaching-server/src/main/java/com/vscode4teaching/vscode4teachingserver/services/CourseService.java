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

        public Course registerNewCourse(@Valid Course course, Long teacherId, String requestUsername)
                        throws TeacherNotFoundException, NotSameTeacherException;

        public Course addExerciseToCourse(@Min(1) Long courseId, @Valid Exercise exercise, String requestUsername)
                        throws CourseNotFoundException, NotSameTeacherException;
}