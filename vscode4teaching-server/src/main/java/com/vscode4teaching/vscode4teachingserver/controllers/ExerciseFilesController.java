package com.vscode4teaching.vscode4teachingserver.controllers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
            throws ExerciseNotFoundException, NotInCourseException, IOException, FileNotFoundException,
            NoTemplateException {
        String username = jwtTokenUtil.getUsernameFromToken(request);
        List<File> files = filesService.getExerciseFiles(id, username);
        String zipName = files.get(0).getParentFile().getName().equals("template") ? "template-" + id
                : "exercise-" + id + "-" + username;
        response.setStatus(HttpServletResponse.SC_OK);
        response.addHeader("Content-Disposition", "attachment; filename=\"" + zipName + ".zip\"");
        ZipOutputStream zipOutputStream = new ZipOutputStream(response.getOutputStream());
        for (File file : files) {
            zipOutputStream.putNextEntry(new ZipEntry(file.getName()));
            FileInputStream fileInputStream = new FileInputStream(file);

            IOUtils.copy(fileInputStream, zipOutputStream);

            fileInputStream.close();
            zipOutputStream.closeEntry();
        }
        zipOutputStream.close();
    }
}