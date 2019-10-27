package com.vscode4teaching.vscode4teachingserver.services;

import java.io.File;
import java.io.IOException;
import java.util.List;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

@Service
@Validated
public interface ExerciseFilesService {
    public List<File> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException;

    public void saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile[] files, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, IOException;
}