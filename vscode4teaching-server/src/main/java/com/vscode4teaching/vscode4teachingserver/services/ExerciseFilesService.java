package com.vscode4teaching.vscode4teachingserver.services;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

@Service
@Validated
public interface ExerciseFilesService {
    public Map<Exercise, List<File>> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException;

    public Map<Exercise, List<File>> saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile zip,
            String requestUsername) throws ExerciseNotFoundException, NotInCourseException, IOException;

    public Map<Exercise, List<File>> saveExerciseTemplate(@Min(1) Long exerciseId, MultipartFile zip,
            String requestUsername) throws ExerciseNotFoundException, NotInCourseException, IOException;

    public Map<Exercise, List<File>> getExerciseTemplate(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException;

    public Map<Exercise, List<File>> getAllStudentsFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException;

    public List<ExerciseFile> getFileIdsByExerciseAndOwner(@Min(1) Long exerciseId, String ownerUsername)
            throws ExerciseNotFoundException;
}