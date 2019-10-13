package com.vscode4teaching.vscode4teachingserver.services;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.validators.ValidationGroupInterfaces.OnCreate;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CourseService {
    public List<Course> getAllCourses();

    @Validated(OnCreate.class)
    public Course registerNewCourse(@Valid Course course);

    @Validated(OnCreate.class)
    public Course addExerciseToCourse(@Min(1) Long courseId, @Valid Exercise exercise) throws CourseNotFoundException;
}