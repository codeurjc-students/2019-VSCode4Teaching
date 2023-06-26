package com.vscode4teaching.vscode4teachingserver.controllers;

import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseSingleFileService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import io.swagger.models.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.util.Map;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseSingleFileController {
    private static final String templateFolderName = "template";
    private static final String solutionFolderName = "solution";

    private final ExerciseSingleFileService exerciseSingleFileService;
    private final JWTTokenUtil jwtTokenUtil;

    private final Logger logger = LoggerFactory.getLogger(ExerciseZipFileController.class);

    public ExerciseSingleFileController(ExerciseSingleFileService exerciseSingleFileService,
                                        JWTTokenUtil jwtTokenUtil) {
        this.exerciseSingleFileService = exerciseSingleFileService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @RequestMapping(value = "/exercises/{exerciseId}/file", method = {RequestMethod.POST, RequestMethod.PATCH})
    public ResponseEntity<UploadFileResponse> uploadSingleFile(@PathVariable Long exerciseId,
                                                               @RequestPart("relativePath") String relativePath,
                                                               @RequestPart("file") MultipartFile file,
                                                               HttpServletRequest request)
            throws NotInCourseException, NotFoundException, IOException, ExerciseFinishedException {
        logger.info("Request to {} '/api/exercises/{}/file' with relativePath {} and a file", request.getMethod(), exerciseId, relativePath);

        String username = jwtTokenUtil.getUsernameFromToken(request);

        File savedFile = exerciseSingleFileService.saveExerciseSingleFile(exerciseId, username, file, relativePath);
        return ResponseEntity.ok(new UploadFileResponse(savedFile.getName(), savedFile.toURI().toURL().openConnection().getContentType(), savedFile.length()));
    }

    @RequestMapping(value = "/exercises/{exerciseId}/file", method = {RequestMethod.DELETE})
    public ResponseEntity<Void> deleteSingleFile(@PathVariable Long exerciseId,
                                                 @RequestBody Map<String, String> requestBody,
                                                 HttpServletRequest request)
            throws NotInCourseException, NotFoundException {
        if (!requestBody.containsKey("relativePath")) {
            throw new NotFoundException("Relative path not included in request body");
        }
        String relativePath = requestBody.get("relativePath");

        logger.info("Request to DELETE '/api/exercises/{}/file' with relativePath {}", exerciseId, relativePath);

        String username = jwtTokenUtil.getUsernameFromToken(request);

        if (exerciseSingleFileService.deleteExerciseSingleFile(exerciseId, username, relativePath)) {
            return new ResponseEntity<>(HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
