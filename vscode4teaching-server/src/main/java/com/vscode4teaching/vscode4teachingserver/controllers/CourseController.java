package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotSameTeacherException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
@Validated
public class CourseController {

    private final CourseService courseService;
    private final JWTTokenUtil jwtTokenUtil;
    private final Logger logger = LoggerFactory.getLogger(CourseController.class);

    public CourseController(CourseService courseService, JWTTokenUtil jwtTokenUtil) {
        this.courseService = courseService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping("/courses")
    @JsonView(CourseViews.GeneralView.class)
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = courseService.getAllCourses();
        logger.info("Courses gotten: {}", courses);
        return !courses.isEmpty() ? ResponseEntity.ok(courses) : ResponseEntity.noContent().build();
    }

    @PostMapping("/teachers/{id}/courses")
    @JsonView(CourseViews.GeneralView.class)
    public ResponseEntity<Course> addCourse(HttpServletRequest request, @PathVariable Long id,
            @Valid @RequestBody CourseDTO courseDTO) throws TeacherNotFoundException, NotSameTeacherException {
        // Get token to check if the logged user is the same as the id passed
        String jwtToken = request.getHeader("Authorization").substring(7); // remove Bearer
        Course course = new Course(courseDTO.name);
        Course savedCourse = courseService.registerNewCourse(course, id, jwtTokenUtil.getUsernameFromToken(jwtToken));
        logger.info("Course saved: {}", savedCourse);
        return new ResponseEntity<>(savedCourse, HttpStatus.CREATED);
    }

    @PostMapping("/courses/{courseId}/exercises")
    @JsonView(CourseViews.ExercisesView.class)
    public ResponseEntity<Course> addExercise(HttpServletRequest request, @PathVariable @Min(1) Long courseId,
            @Valid @RequestBody ExerciseDTO exerciseDTO) throws CourseNotFoundException, NotSameTeacherException {
        // Get token to check if the logged teacher belongs to this course
        String jwtToken = request.getHeader("Authorization").substring(7); // remove Bearer
        Exercise exercise = new Exercise(exerciseDTO.name);
        Course savedCourse = courseService.addExerciseToCourse(courseId, exercise,
                jwtTokenUtil.getUsernameFromToken(jwtToken));
        return new ResponseEntity<>(savedCourse, HttpStatus.CREATED);
    }

}