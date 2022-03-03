package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.transaction.Transactional;
import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseUserInfoDTO;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseUserInfoViews;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CourseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
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
    private final ExerciseInfoService exerciseInfoService;
    private final JWTTokenUtil jwtTokenUtil;

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
        List<Exercise> exercises = courseService.getExercises(courseId, jwtTokenUtil.getUsernameFromToken(request));
        return exercises.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(exercises);
    }

    @Deprecated
    @PostMapping("/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    public ResponseEntity<Exercise> addExercise(HttpServletRequest request, @PathVariable @Min(1) Long courseId,
                                                @Valid @RequestBody ExerciseDTO exerciseDTO) throws CourseNotFoundException, NotInCourseException {
        Exercise exercise = new Exercise(exerciseDTO.name);
        Exercise savedExercise = courseService.addExerciseToCourse(courseId, exercise,
                jwtTokenUtil.getUsernameFromToken(request));
        return new ResponseEntity<>(savedExercise, HttpStatus.CREATED);
    }

    @PostMapping("/v2/courses/{courseId}/exercises")
    @JsonView(ExerciseViews.CourseView.class)
    @Transactional
    public ResponseEntity<List<Exercise>> addExercises(HttpServletRequest request, @PathVariable @Min(1) Long courseId,
                                                 @Valid @RequestBody ExerciseDTO[] exercisesDTO) throws CourseNotFoundException, NotInCourseException {
        ArrayList<Exercise> savedExercises = new ArrayList<>();
        for (ExerciseDTO exerciseDTO : exercisesDTO) {
            Exercise exercise = new Exercise(exerciseDTO.name);
            savedExercises.add(courseService.addExerciseToCourse(courseId, exercise, jwtTokenUtil.getUsernameFromToken(request)));
        }
        return new ResponseEntity<>(savedExercises, HttpStatus.CREATED);
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

    @GetMapping("/exercises/{exerciseId}/info")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<ExerciseUserInfo> getExerciseUserInfo(@PathVariable Long exerciseId,
            HttpServletRequest request) throws NotFoundException {
        return ResponseEntity
                .ok(exerciseInfoService.getExerciseUserInfo(exerciseId, jwtTokenUtil.getUsernameFromToken(request)));
    }

    @PutMapping("/exercises/{exerciseId}/info")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<ExerciseUserInfo> updateExerciseUserInfo(@PathVariable Long exerciseId,
                                                                   @RequestBody ExerciseUserInfoDTO exerciseUserInfoDTO, HttpServletRequest request) throws NotFoundException {
        return ResponseEntity.ok(exerciseInfoService.updateExerciseUserInfo(exerciseId,
                jwtTokenUtil.getUsernameFromToken(request), exerciseUserInfoDTO.getStatus(), exerciseUserInfoDTO.getModifiedFiles()));
    }

    @GetMapping("/exercises/{exerciseId}/info/teacher")
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    public ResponseEntity<List<ExerciseUserInfo>> getAllExerciseUserInfo(@PathVariable Long exerciseId,
            HttpServletRequest request) throws NotInCourseException, ExerciseNotFoundException {
        List<ExerciseUserInfo> euis = exerciseInfoService.getAllStudentExerciseUserInfo(exerciseId,
                jwtTokenUtil.getUsernameFromToken(request));
        return !euis.isEmpty() ? ResponseEntity.ok(euis) : ResponseEntity.noContent().build();
    }
}