package com.vscode4teaching.vscode4teachingserver.controllers;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UserRequest;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;
import com.vscode4teaching.vscode4teachingserver.model.views.UserViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.util.List;
import java.util.Optional;
import java.util.Set;

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
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<List<Course>> getAllCourses() {
        logger.info("Request to GET '/api/courses'");
        List<Course> courses = courseService.getAllCourses();
        return !courses.isEmpty() ? ResponseEntity.ok(courses) : ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}")
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<Course> getCourse(@PathVariable @Min(1) Long courseId) {
        logger.info("Request to GET '/api/courses/{}'", courseId);
        Optional<Course> course = courseService.getCourseById(courseId);
        return course.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/courses/{courseId}/creator")
    @JsonView(UserViews.GeneralView.class)
    public ResponseEntity<User> getCreator(@PathVariable @Min(1) Long courseId) throws CourseNotFoundException {
        logger.info("Request to GET '/api/courses/{}/creator'", courseId);
        return ResponseEntity.ok(courseService.getCreator(courseId));
    }

    @PostMapping("/courses")
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<Course> addCourse(HttpServletRequest request, @Valid @RequestBody CourseDTO courseDTO)
            throws TeacherNotFoundException {
        logger.info("Request to POST '/api/courses' with body '{}'", courseDTO);
        Course course = new Course(courseDTO.getName());
        Course savedCourse = courseService.registerNewCourse(course, jwtTokenUtil.getUsernameFromToken(request));
        return new ResponseEntity<>(savedCourse, HttpStatus.CREATED);
    }

    @PutMapping("/courses/{id}")
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<Course> updateCourse(HttpServletRequest request, @PathVariable @Min(1) Long id,
                                               @Valid @RequestBody CourseDTO courseDTO) throws CourseNotFoundException, NotInCourseException {
        logger.info("Request to PUT '/api/courses/{}' with body '{}'", id, courseDTO);
        Course course = new Course(courseDTO.getName());
        Course savedCourse = courseService.editCourse(id, course, jwtTokenUtil.getUsernameFromToken(request));
        return ResponseEntity.ok(savedCourse);
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(HttpServletRequest request, @PathVariable @Min(1) Long id)
            throws CourseNotFoundException, NotInCourseException, NotCreatorException {
        logger.info("Request to DELETE '/api/courses/{}'", id);
        courseService.deleteCourse(id, jwtTokenUtil.getUsernameFromToken(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{id}/courses")
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<List<Course>> getUserCourses(@PathVariable @Min(1) Long id) throws UserNotFoundException {
        logger.info("Request to GET '/api/users/{}/courses'", id);
        List<Course> courses = courseService.getUserCourses(id);
        return courses.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/{courseId}/users")
    @JsonView(UserViews.GeneralView.class)
    public ResponseEntity<Set<User>> getUsersInCourse(@PathVariable @Min(1) Long courseId, HttpServletRequest request)
            throws CourseNotFoundException, NotInCourseException {
        logger.info("Request to GET '/api/courses/{}/users'", courseId);
        return ResponseEntity.ok(courseService.getUsersInCourse(courseId, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @PostMapping("/courses/{courseId}/users")
    @JsonView(CourseViews.UsersView.class)
    public ResponseEntity<Course> addUserToCourse(@PathVariable @Min(1) Long courseId,
                                                  @Valid @RequestBody UserRequest userRequest, HttpServletRequest request)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException {
        logger.info("Request to POST '/api/courses/{}/users' with body '{}'", courseId, userRequest);
        return ResponseEntity.ok(courseService.addUsersToCourse(courseId, userRequest.getIds(),
                jwtTokenUtil.getUsernameFromToken(request)));
    }

    @DeleteMapping("/courses/{courseId}/users")
    @JsonView(CourseViews.UsersView.class)
    public ResponseEntity<Course> removeUsersFromCourse(@PathVariable @Min(1) Long courseId,
                                                        @Valid @RequestBody UserRequest userRequest, HttpServletRequest request)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException, CantRemoveCreatorException {
        logger.info("Request to DELETE '/api/courses/{}/users' with body '{}'", courseId, userRequest);
        return ResponseEntity.ok(courseService.removeUsersFromCourse(courseId, userRequest.getIds(),
                jwtTokenUtil.getUsernameFromToken(request)));
    }

    @GetMapping("/courses/{courseId}/code")
    public ResponseEntity<String> getCode(@PathVariable Long courseId, HttpServletRequest request)
            throws UserNotFoundException, CourseNotFoundException, NotInCourseException {
        logger.info("Request to GET '/api/courses/{}/code'", courseId);
        return ResponseEntity.ok(courseService.getCourseCode(courseId, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @Deprecated // VERSION 2.1 AND LATER ARE NOT USING THIS METHOD, READ DOCS FOR FURTHER INFORMATION
    @GetMapping("/courses/code/{courseCode}")
    @JsonView(CourseViews.ExercisesView.class)
    public ResponseEntity<Course> getExercisesWithCode(HttpServletRequest request, @PathVariable String courseCode)
            throws CourseNotFoundException, NotInCourseException, UserNotFoundException {
        logger.info("Request to GET '/api/courses/code/{}' (deprecated API endpoint)", courseCode);
        return ResponseEntity.ok(courseService.joinCourseWithSharingCode(courseCode, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @GetMapping("/v2/courses/code/{courseCode}")
    @JsonView(CourseViews.CreatorView.class)
    public ResponseEntity<Course> getCourseInformationBySharingCode(@PathVariable String courseCode)
            throws CourseNotFoundException {
        logger.info("Request to GET '/api/v2/courses/code/{}'", courseCode);
        return ResponseEntity.ok(courseService.getCourseInformationWithSharingCode(courseCode));
    }

    @PutMapping("/courses/code/{courseCode}")
    @JsonView(CourseViews.ExercisesView.class)
    public ResponseEntity<Course> joinCourse(HttpServletRequest request, @PathVariable String courseCode)
            throws CourseNotFoundException, NotInCourseException, UserNotFoundException {
        logger.info("Request to PUT '/api/courses/code/{}'", courseCode);
        return ResponseEntity.ok(courseService.joinCourseWithSharingCode(courseCode, jwtTokenUtil.getUsernameFromToken(request)));
    }
}
