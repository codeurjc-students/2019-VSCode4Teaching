package com.vscode4teaching.vscode4teachingserver.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
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
        List<File> files = filesService.getExerciseFiles(id, username);
        String zipName = files.get(0).getParentFile().getName().equals("template") ? "template-" + id
                : "exercise-" + id + "-" + username;
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"" + zipName + ".zip\"");
        exportToZip(response, files, username);
    }

    @PostMapping("/exercises/{id}/files")
    public ResponseEntity<List<UploadFileResponse>> uploadZip(@PathVariable Long id,
            @RequestParam("file") MultipartFile zip, HttpServletRequest request)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        List<File> files = filesService.saveExerciseFiles(id, zip, username);
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
        List<File> files = filesService.saveExerciseTemplate(id, zip, username);
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
        List<File> files = filesService.getExerciseTemplate(id, username);
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"template-" + id + ".zip\"");
        exportToZip(response, files, username);
    }

    @GetMapping("/exercises/{id}/teachers/files")
    public void getAllStudentsFiles(@PathVariable Long id, HttpServletRequest request, HttpServletResponse response)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        List<File> files = filesService.getAllStudentsFiles(id, username);
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"exercise-" + id + "-files.zip\"");
        exportToZip(response, files, username);
    }

    private void exportToZip(HttpServletResponse response, List<File> files, String username) throws IOException {
        ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());
        for (File file : files) {
            String fileSeparatorPattern = Pattern.quote(File.separator);
            String pattern = fileSeparatorPattern + "template" + fileSeparatorPattern;
            String[] filePath = file.getCanonicalPath().split(pattern);
            if (filePath.length < 2) {
                pattern = fileSeparatorPattern + username + fileSeparatorPattern;
                filePath = file.getCanonicalPath().split(pattern);
            }
            zipOutputStream.putNextEntry(new ZipEntry(filePath[filePath.length - 1]));
            FileInputStream fileInputStream = new FileInputStream(file);

            IOUtils.copy(fileInputStream, zipOutputStream);

            fileInputStream.close();
            zipOutputStream.closeEntry();
        }
        zipOutputStream.close();
    }
}