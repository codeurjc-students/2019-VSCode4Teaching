package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

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
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseController {

    private final CourseService courseService;
    private final JWTTokenUtil jwtTokenUtil;

    public ExerciseController(CourseService courseService, JWTTokenUtil jwtTokenUtil) {
        this.courseService = courseService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping("/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<List<Exercise>> getExercises(HttpServletRequest request, @PathVariable @Min(1) Long courseId)
            throws CourseNotFoundException, NotInCourseException {
        return ResponseEntity.ok(courseService.getExercises(courseId, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @PostMapping("/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> addExercise(HttpServletRequest request, @PathVariable @Min(1) Long courseId,
            @Valid @RequestBody ExerciseDTO exerciseDTO) throws CourseNotFoundException, NotInCourseException {
        Exercise exercise = new Exercise(exerciseDTO.name);
        Exercise savedExercise = courseService.addExerciseToCourse(courseId, exercise,
                jwtTokenUtil.getUsernameFromToken(request));
        return new ResponseEntity<>(savedExercise, HttpStatus.CREATED);
    }

    @PutMapping("/courses/{courseId}/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> updateExercise(@PathVariable @Min(1) Long courseId,
            @PathVariable @Min(1) Long exerciseId, @RequestBody ExerciseDTO exercoseDTO) {
        // TODO
        return null;
    }

    @DeleteMapping("/courses/{courseId}/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Void> deleteExercise(@PathVariable @Min(1) Long courseId,
            @PathVariable @Min(1) Long exerciseId) {
        // TODO
        return null;
    }
}