package es.codeurjc.vscode4teaching.controllers;

import com.fasterxml.jackson.annotation.JsonView;
import es.codeurjc.vscode4teaching.controllers.dtos.ExerciseDTO;
import es.codeurjc.vscode4teaching.controllers.dtos.ExerciseUserInfoDTO;
import es.codeurjc.vscode4teaching.model.Exercise;
import es.codeurjc.vscode4teaching.model.ExerciseUserInfo;
import es.codeurjc.vscode4teaching.model.views.ExerciseUserInfoViews;
import es.codeurjc.vscode4teaching.model.views.ExerciseViews;
import es.codeurjc.vscode4teaching.security.jwt.JWTTokenUtil;
import es.codeurjc.vscode4teaching.services.CourseService;
import es.codeurjc.vscode4teaching.services.ExerciseInfoService;
import es.codeurjc.vscode4teaching.services.exceptions.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;

import java.util.List;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseController {

    private final CourseService courseService;
    private final ExerciseInfoService exerciseInfoService;
    private final JWTTokenUtil jwtTokenUtil;

    private final Logger logger = LoggerFactory.getLogger(ExerciseController.class);

    public ExerciseController(CourseService courseService, ExerciseInfoService exerciseInfoService,
                              JWTTokenUtil jwtTokenUtil) {
        this.courseService = courseService;
        this.jwtTokenUtil = jwtTokenUtil;
        this.exerciseInfoService = exerciseInfoService;
    }

    @GetMapping("/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<List<Exercise>> getExercises(HttpServletRequest request, @PathVariable @Min(1) Long courseId)
            throws CourseNotFoundException, NotInCourseException {
        logger.info("Request to GET '/api/courses/{}/exercises'", courseId);
        List<Exercise> exercises = courseService.getExercises(courseId, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request));
        return exercises.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(exercises);
    }

    @PostMapping("/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> addExercise(HttpServletRequest request, @PathVariable @Min(1) Long courseId,
                                                @Valid @RequestBody ExerciseDTO exerciseDTO) throws CourseNotFoundException, NotInCourseException {
        logger.info("Request to POST '/api/courses/{}/exercises' with body '{}'", courseId, exerciseDTO);
        Exercise exercise = new Exercise(exerciseDTO.name);
        exercise.setIncludesTeacherSolution(exerciseDTO.includesTeacherSolution);
        exercise.setSolutionIsPublic(exerciseDTO.solutionIsPublic);
        exercise.setAllowEditionAfterSolutionDownloaded(exerciseDTO.allowEditionAfterSolutionDownloaded);
        exercise = courseService.addExerciseToCourse(courseId, exercise, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request));
        return new ResponseEntity<>(exercise, HttpStatus.CREATED);
    }

    @GetMapping("/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> getExercise(@PathVariable Long exerciseId) throws ExerciseNotFoundException {
        logger.info("Request to GET '/api/exercises/{}'", exerciseId);
        return ResponseEntity.ok(courseService.getExercise(exerciseId));
    }

    @PutMapping("/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> updateExercise(HttpServletRequest request, @PathVariable @Min(1) Long exerciseId,
                                                   @RequestBody ExerciseDTO exerciseDTO) throws ExerciseNotFoundException, NotInCourseException {
        logger.info("Request to PUT '/api/exercises/{}' with body '{}'", exerciseId, exerciseDTO);
        Exercise exercise = new Exercise(exerciseDTO.name);
        exercise.setIncludesTeacherSolution(exerciseDTO.includesTeacherSolution);
        exercise.setSolutionIsPublic(exerciseDTO.solutionIsPublic);
        exercise.setAllowEditionAfterSolutionDownloaded(exerciseDTO.allowEditionAfterSolutionDownloaded);
        return ResponseEntity.ok(courseService.editExercise(exerciseId, exercise, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request)));
    }

    @DeleteMapping("/exercises/{exerciseId}")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Void> deleteExercise(HttpServletRequest request, @PathVariable @Min(1) Long exerciseId)
            throws ExerciseNotFoundException, NotInCourseException {
        logger.info("Request to DELETE '/api/exercises/{}'", exerciseId);
        courseService.deleteExercise(exerciseId, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request));
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/exercises/{exerciseId}/info")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<ExerciseUserInfo> getExerciseUserInfo(@PathVariable Long exerciseId, HttpServletRequest request) throws NotFoundException {
        logger.info("Request to GET '/api/exercises/{}/info'", exerciseId);
        return ResponseEntity.ok(exerciseInfoService.getExerciseUserInfo(exerciseId, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request)));
    }

    @PutMapping("/exercises/{exerciseId}/info")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<ExerciseUserInfo> updateExerciseUserInfo(@PathVariable Long exerciseId, @RequestBody ExerciseUserInfoDTO exerciseUserInfoDTO, HttpServletRequest request) throws NotFoundException {
        logger.info("Request to PUT '/api/exercises/{}/info' with body '{}'", exerciseId, exerciseUserInfoDTO);
        return ResponseEntity.ok(exerciseInfoService.updateExerciseUserInfo(exerciseId, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request), exerciseUserInfoDTO.getStatus(), exerciseUserInfoDTO.getModifiedFiles()));
    }

    @GetMapping("/exercises/{exerciseId}/info/teacher")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<List<ExerciseUserInfo>> getAllExerciseUserInfo(@PathVariable Long exerciseId, HttpServletRequest request) throws NotInCourseException, ExerciseNotFoundException {
        logger.info("Request to GET '/api/exercises/{}/info/teacher", exerciseId);
        List<ExerciseUserInfo> euis = exerciseInfoService.getAllStudentExerciseUserInfo(exerciseId, jwtTokenUtil.getUsernameFromAuthenticatedRequest(request));
        return !euis.isEmpty() ? ResponseEntity.ok(euis) : ResponseEntity.noContent().build();
    }
}
