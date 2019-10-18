package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.TeacherNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.UserNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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

    @PostMapping("/courses")
    @JsonView(CourseViews.GeneralView.class)
    public ResponseEntity<Course> addCourse(HttpServletRequest request, @Valid @RequestBody CourseDTO courseDTO)
            throws TeacherNotFoundException, NotInCourseException {

        Course course = new Course(courseDTO.getName());
        Course savedCourse = courseService.registerNewCourse(course, jwtTokenUtil.getUsernameFromToken(request));
        logger.info("Course saved: {}", savedCourse);
        return new ResponseEntity<>(savedCourse, HttpStatus.CREATED);
    }

    @PutMapping("/courses/{id}")
    @JsonView(CourseViews.GeneralView.class)
    public ResponseEntity<Course> updateCourse(HttpServletRequest request, @PathVariable @Min(1) Long id,
            @Valid @RequestBody CourseDTO courseDTO) throws CourseNotFoundException, NotInCourseException {
        Course course = new Course(courseDTO.getName());
        Course savedCourse = courseService.editCourse(id, course, jwtTokenUtil.getUsernameFromToken(request));
        return ResponseEntity.ok(savedCourse);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(HttpServletRequest request, @PathVariable @Min(1) Long id)
            throws CourseNotFoundException, NotInCourseException {
        courseService.deleteCourse(id, jwtTokenUtil.getUsernameFromToken(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/courses")
    @JsonView(CourseViews.GeneralView.class)
    public ResponseEntity<List<Course>> getUserCourses(@PathVariable @Min(1) Long id) throws UserNotFoundException {
        return ResponseEntity.ok(courseService.getUserCourses(id));
    }
}