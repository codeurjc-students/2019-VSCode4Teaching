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
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.UserNotFoundException;

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

    @PutMapping("/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> updateExercise(HttpServletRequest request, @PathVariable @Min(1) Long exerciseId,
            @RequestBody ExerciseDTO exerciseDTO) throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = new Exercise(exerciseDTO.getName());
        return ResponseEntity
                .ok(courseService.editExercise(exerciseId, exercise, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @DeleteMapping("/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Void> deleteExercise(HttpServletRequest request, @PathVariable @Min(1) Long exerciseId)
            throws ExerciseNotFoundException, NotInCourseException {
        courseService.deleteExercise(exerciseId, jwtTokenUtil.getUsernameFromToken(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exercises/{exerciseId}/code")
    public ResponseEntity<String> getCode(@PathVariable Long exerciseId, HttpServletRequest request)
            throws UserNotFoundException, ExerciseNotFoundException, NotInCourseException {
        return ResponseEntity.ok(courseService.getExerciseCode(exerciseId, jwtTokenUtil.getUsernameFromToken(request)));
    }
}