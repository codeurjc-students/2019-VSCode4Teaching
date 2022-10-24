package com.vscode4teaching.vscode4teachingserver.controllers;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.*;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseFilesController {
    private static final String templateFolderName = "template";
    private static final String solutionFolderName = "solution";

    private final ExerciseFilesService filesService;
    private final JWTTokenUtil jwtTokenUtil;

    private final Logger logger = LoggerFactory.getLogger(ExerciseFilesController.class);

    public ExerciseFilesController(ExerciseFilesService filesService, JWTTokenUtil jwtTokenUtil) {
        this.filesService = filesService;
        this.jwtTokenUtil = jwtTokenUtil;
    }


    // GET endpoint

    @GetMapping(value = {"/exercises/{id}/files", "/exercises/{id}/files/{resourceType:template|solution}"}, produces = "application/zip")
    public void downloadFiles(@PathVariable Long id, @PathVariable(required = false) Optional<String> resourceType,
                              HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException, NoTemplateException, NoSolutionException {
        logger.info("Request to GET '/api/exercises/{}/files/{}'", id, resourceType);
        String username = jwtTokenUtil.getUsernameFromToken(request);

        // Stage 1: All the information required to execute the process is obtained and file paths are returned from
        // database using filesService specific methods. This process distinguishes between the different possible cases:
        // - Downloading individual files for each student's exercise
        // - Downloading an exercise template
        // - Downloading a proposed solution for an exercise (if exists)
        Map<Exercise, List<File>> filesMap;
        String zipName;
        String separator;
        if (resourceType.isPresent() && resourceType.get().equals("template")) {
            zipName = "template-" + id;
            separator = ExerciseFilesController.templateFolderName;
            filesMap = filesService.getExerciseTemplate(id, username);
        } else if (resourceType.isPresent() && resourceType.get().equals("solution")) {
            zipName = "solution-" + id;
            separator = ExerciseFilesController.solutionFolderName;
            filesMap = filesService.getExerciseSolution(id, username);
        } else {
            if (filesService.existsExerciseFilesForUser(id, username)) {
                zipName = "exercise-" + id + "-" + username;
                separator = "student_[0-9]*";
            } else {
                zipName = "template-" + id;
                separator = "template";
            }
            // Order matters here: if checked existence of files after generating them, this method will fail
            filesMap = filesService.getExerciseFiles(id, username);
        }

        // Stage 2: files from returned paths are zipped and sent as response to client (method exportToZip())
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.orElseGet(ArrayList::new);

        response.setStatus(HttpServletResponse.SC_OK);
        String[] header = headerFilename(zipName + ".zip");
        response.addHeader(header[0], header[1]);

        exportToZip(response, files, separator);
    }

    @GetMapping("/exercises/{id}/teachers/files")
    public void getAllStudentsFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        logger.info("Request to GET '/api/exercises/{}/teachers/files'", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getAllStudentsFiles(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.orElseGet(ArrayList::new);
        response.setStatus(HttpServletResponse.SC_OK);
        String[] header = headerFilename("exercise-" + id + "-files.zip");
        response.addHeader(header[0], header[1]);
        Optional<Exercise> exOpt = filesMap.keySet().stream().findFirst();
        String exerciseDirectory = exOpt.map(exercise -> exercise.getName().toLowerCase().replace(" ", "_") + "_" + id).orElse("");
        exportToZip(response, files, exerciseDirectory);
    }

    @JsonView(FileViews.GeneralView.class)
    @GetMapping("/users/{username}/exercises/{exerciseId}/files")
    public ResponseEntity<List<ExerciseFile>> getFileInfoByOwnerAndExercise(@PathVariable String username,
                                                                            @PathVariable Long exerciseId) throws NotFoundException {
        logger.info("Request to GET '/api/users/{}/exercises/{}/files'", username, exerciseId);
        List<ExerciseFile> files = filesService.getFileIdsByExerciseAndId(exerciseId, username);
        return files.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(files);
    }

    private String[] headerFilename(String filename) {
        String[] headerElements = new String[2];
        headerElements[0] = "Content-Disposition";
        headerElements[1] = "attachment; filename=\"" + filename + "\"";
        return headerElements;
    }

    private void exportToZip(HttpServletResponse response, List<File> files, String parentDirectory)
            throws IOException {
        ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());
        for (File file : files) {
            try {
                String[] filePath = file.getCanonicalPath().split(parentDirectory);
                String zipFilePath = filePath[filePath.length - 1].substring(1).replace('\\', '/');
                zipOutputStream.putNextEntry(new ZipEntry(zipFilePath));
                FileInputStream fileInputStream = new FileInputStream(file);

                IOUtils.copy(fileInputStream, zipOutputStream);
                fileInputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                zipOutputStream.closeEntry();
            }
        }
        zipOutputStream.close();
    }


    // POST endpoint

    @PostMapping(value = {"/exercises/{id}/files", "/exercises/{id}/files/{type:template|solution}"})
    public ResponseEntity<List<UploadFileResponse>> uploadFiles(@PathVariable Long id, @PathVariable(required = false) String type,
                                                                @RequestParam("file") MultipartFile zip, HttpServletRequest request)
            throws NotFoundException, NotInCourseException, IOException, ExerciseFinishedException {
        logger.info("Request to POST '/api/exercises/{}/files/{}' with a MultipartFile (ZIP) as body", id, type);

        // Stage 1: All the information necessary to execute the process is obtained and files are saved using
        // filesService specific methods. This process distinguishes between the different possible cases:
        // - Uploading of individual files for each student's exercise
        // - Uploading of an exercise template.
        // - Uploading of the proposed solution to an exercise (if existing).
        String username = jwtTokenUtil.getUsernameFromToken(request);

        Map<Exercise, List<File>> filesMap;
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String pattern;
        if (Objects.equals(type, "template")) {
            filesMap = filesService.saveExerciseTemplate(id, zip, username);
            pattern = fileSeparatorPattern + ExerciseFilesController.templateFolderName + fileSeparatorPattern;
        } else if (Objects.equals(type, "solution")) {
            filesMap = filesService.saveExerciseSolution(id, zip, username);
            pattern = fileSeparatorPattern + ExerciseFilesController.solutionFolderName + fileSeparatorPattern;
        } else {
            filesMap = filesService.saveExerciseFiles(id, zip, username);
            pattern = fileSeparatorPattern + "student_[0-9]*" + fileSeparatorPattern;
        }

        // Stage 2: saved files in previous stage are now collected and response is prepared and sent.
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.orElseGet(ArrayList::new);
        List<UploadFileResponse> uploadResponse = new ArrayList<>(files.size());
        for (File file : files) {
            String[] filePath = file.getCanonicalPath().split(pattern);
            uploadResponse.add(new UploadFileResponse(filePath[filePath.length - 1],
                    file.toURI().toURL().openConnection().getContentType(), file.length()));
        }
        return ResponseEntity.ok(uploadResponse);
    }
}
