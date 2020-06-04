package com.vscode4teaching.vscode4teachingserver.controllers;

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

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin
@Validated
@RequestMapping("/api")
public class ExerciseFilesController {
    private final ExerciseFilesService filesService;
    private final JWTTokenUtil jwtTokenUtil;

    public ExerciseFilesController(ExerciseFilesService filesService, JWTTokenUtil jwtTokenUtil) {
        this.filesService = filesService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    @GetMapping(value = "/exercises/{id}/files", produces = "application/zip")
    public void downloadExerciseFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException, NoTemplateException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getExerciseFiles(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        String zipName = files.get(0).getParentFile().getName().equals("template") ? "template-" + id
                : "exercise-" + id + "-" + username;
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"" + zipName + ".zip\"");
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String separator = files.get(0).getAbsolutePath()
                .split(fileSeparatorPattern + "template" + fileSeparatorPattern).length > 1 ? "template" : username;
        exportToZip(response, files, separator);
    }

    @PostMapping("/exercises/{id}/files")
    public ResponseEntity<List<UploadFileResponse>> uploadZip(@PathVariable Long id,
            @RequestParam("file") MultipartFile zip, HttpServletRequest request)
            throws NotInCourseException, IOException, ExerciseFinishedException, NotFoundException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.saveExerciseFiles(id, zip, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        List<UploadFileResponse> uploadResponse = new ArrayList<>(files.size());
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String pattern = fileSeparatorPattern + username + fileSeparatorPattern;
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
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.saveExerciseTemplate(id, zip, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        List<UploadFileResponse> uploadResponse = new ArrayList<>(files.size());
        String fileSeparatorPattern = Pattern.quote(File.separator);
        String pattern = fileSeparatorPattern + "template" + fileSeparatorPattern;
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
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getExerciseTemplate(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"template-" + id + ".zip\"");
        exportToZip(response, files, "template");
    }

    @GetMapping("/exercises/{id}/teachers/files")
    public void getAllStudentsFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        Map<Exercise, List<File>> filesMap = filesService.getAllStudentsFiles(id, username);
        Optional<List<File>> optFiles = filesMap.values().stream().findFirst();
        List<File> files = optFiles.isPresent() ? optFiles.get() : new ArrayList<>();
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"exercise-" + id + "-files.zip\"");
        Optional<Exercise> exOpt = filesMap.keySet().stream().findFirst();
        String exerciseDirectory = exOpt.isPresent() ? exOpt.get().getName().toLowerCase().replace(" ", "_") + "_" + id
                : "";
        exportToZip(response, files, exerciseDirectory);
    }

    private void exportToZip(HttpServletResponse response, List<File> files, String parentDirectory)
            throws IOException {
        ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());
        for (File file : files) {
            String fileSeparatorPattern = Pattern.quote(File.separator);
            String pattern = null;
            String[] filePath = null;
            pattern = fileSeparatorPattern + parentDirectory + fileSeparatorPattern;
            filePath = file.getCanonicalPath().split(pattern);
            String zipFilePath = filePath[filePath.length - 1].replace('\\', '/');
            zipOutputStream.putNextEntry(new ZipEntry(zipFilePath));
            FileInputStream fileInputStream = new FileInputStream(file);

            IOUtils.copy(fileInputStream, zipOutputStream);

            fileInputStream.close();
            zipOutputStream.closeEntry();
        }
        zipOutputStream.close();
    }

    @JsonView(FileViews.GeneralView.class)
    @GetMapping("/users/{username}/exercises/{exerciseId}/files")
    public ResponseEntity<List<ExerciseFile>> getFileInfoByOwnerAndExercise(@PathVariable String username,
            @PathVariable Long exerciseId) throws ExerciseNotFoundException {
        List<ExerciseFile> files = filesService.getFileIdsByExerciseAndOwner(exerciseId, username);
        return files.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(files);
    }
}