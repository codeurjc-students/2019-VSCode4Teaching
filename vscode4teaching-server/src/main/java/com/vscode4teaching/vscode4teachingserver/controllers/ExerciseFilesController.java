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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseFilesController {
    private static final String templateFolderName = "template";
    private final ExerciseFilesService filesService;
    private final JWTTokenUtil jwtTokenUtil;

    private final Logger logger = LoggerFactory.getLogger(ExerciseFilesController.class);

    public ExerciseFilesController(ExerciseFilesService filesService, JWTTokenUtil jwtTokenUtil) {
        this.filesService = filesService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping(value = "/exercises/{id}/files", produces = "application/zip")
    public void downloadExerciseFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException, NoTemplateException {
        logger.debug("Request to GET '/api/exercises/{}/files'", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getExerciseFiles(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.orElseGet(ArrayList::new);
        String zipName = files.get(0).getParentFile().getName().equals(ExerciseFilesController.templateFolderName)
                ? "template-" + id
                : "exercise-" + id + "-" + username;
        response.setStatus(HttpServletResponse.SC_OK);
        String[] header = headerFilename(zipName + ".zip");
        response.addHeader(header[0], header[1]);
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String separator = files.get(0).getAbsolutePath().split(
                fileSeparatorPattern + ExerciseFilesController.templateFolderName + fileSeparatorPattern).length > 1
                ? ExerciseFilesController.templateFolderName
                : "student_[0-9]*";
        exportToZip(response, files, separator);
    }

    @PostMapping("/exercises/{id}/files")
    public ResponseEntity<List<UploadFileResponse>> uploadZip(@PathVariable Long id,
                                                              @RequestParam("file") MultipartFile zip, HttpServletRequest request)
            throws NotInCourseException, IOException, ExerciseFinishedException, NotFoundException {
        logger.debug("Request to POST '/api/exercises/{}/files' with a MultipartFile (ZIP) as body", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.saveExerciseFiles(id, zip, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        List<UploadFileResponse> uploadResponse = new ArrayList<>(files.size());
        String pattern = "student_[0-9]*" + File.separator;
        for (File file : files) {
            String[] filePath = file.getCanonicalPath().split(pattern);
            uploadResponse.add(new UploadFileResponse(filePath[filePath.length - 1],
                    file.toURI().toURL().openConnection().getContentType(), file.length()));
        }
        return ResponseEntity.ok(uploadResponse);
    }

    @PostMapping("/exercises/{id}/files/template")
    public ResponseEntity<List<UploadFileResponse>> uploadTemplate(@PathVariable Long id,
                                                                   @RequestParam("file") MultipartFile zip, HttpServletRequest request)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        logger.debug("Request to POST '/api/exercises/{}/files/template' with a MultipartFile (ZIP) as body", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.saveExerciseTemplate(id, zip, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        List<UploadFileResponse> uploadResponse = new ArrayList<>(files.size());
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String pattern = fileSeparatorPattern + ExerciseFilesController.templateFolderName + fileSeparatorPattern;
        for (File file : files) {
            String[] filePath = file.getCanonicalPath().split(pattern);
            uploadResponse.add(new UploadFileResponse(filePath[filePath.length - 1],
                    file.toURI().toURL().openConnection().getContentType(), file.length()));
        }
        return ResponseEntity.ok(uploadResponse);
    }

    @GetMapping("/exercises/{id}/files/template")
    public void getTemplate(@PathVariable Long id, HttpServletResponse response, HttpServletRequest request)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException, IOException {
        logger.debug("Request to GET '/api/exercises/{}/files/template'", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getExerciseTemplate(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        response.setStatus(HttpServletResponse.SC_OK);
        String[] header = headerFilename("template-" + id + ".zip");
        response.addHeader(header[0], header[1]);
        exportToZip(response, files, ExerciseFilesController.templateFolderName);
    }

    @GetMapping("/exercises/{id}/teachers/files")
    public void getAllStudentsFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        logger.debug("Request to GET '/api/exercises/{}/teachers/files'", id);
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getAllStudentsFiles(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        response.setStatus(HttpServletResponse.SC_OK);
        String[] header = headerFilename("exercise-" + id + "-files.zip");
        response.addHeader(header[0], header[1]);
        Optional<Exercise> exOpt = filesMap.keySet().stream().findFirst();
        String exerciseDirectory = exOpt.isPresent() ? exOpt.get().getName().toLowerCase().replace(" ", "_") + "_" + id
                : "";
        exportToZip(response, files, exerciseDirectory);
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
                String pattern = parentDirectory + File.separator;
                String[] filePath = file.getCanonicalPath().split(pattern);
                String zipFilePath = filePath[filePath.length - 1].replace('\\', '/');
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

    @JsonView(FileViews.GeneralView.class)
    @GetMapping("/users/{username}/exercises/{exerciseId}/files")
    public ResponseEntity<List<ExerciseFile>> getFileInfoByOwnerAndExercise(@PathVariable String username,
                                                                            @PathVariable Long exerciseId) throws ExerciseNotFoundException {
        logger.debug("Request to GET '/api/users/{}/exercises/{}/files'", username, exerciseId);
        List<ExerciseFile> files = filesService.getFileIdsByExerciseAndOwner(exerciseId, username);
        return files.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(files);
    }
}