package com.vscode4teaching.vscode4teachingserver.services;

import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.*;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.Min;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@Validated
public interface ExerciseZipFileService {
    Boolean existsExerciseFilesForUser(@Min(1) Long exerciseId, String requestUsername) throws ExerciseNotFoundException, NotInCourseException;

    Map<Exercise, List<File>> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername) throws ExerciseNotFoundException, NotInCourseException, NoTemplateException;

    Map<Exercise, List<File>> getExerciseTemplate(@Min(1) Long exerciseId, String requestUsername) throws ExerciseNotFoundException, NotInCourseException, NoTemplateException;

    Map<Exercise, List<File>> getExerciseSolution(@Min(1) Long exerciseId, String requestUsername) throws ExerciseNotFoundException, NotInCourseException, NoSolutionException;

    Map<Exercise, List<File>> saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile zip, String requestUsername) throws NotInCourseException, IOException, ExerciseFinishedException, NotFoundException;

    Map<Exercise, List<File>> saveExerciseTemplate(@Min(1) Long exerciseId, MultipartFile zip, String requestUsername) throws ExerciseNotFoundException, NotInCourseException, IOException;

    Map<Exercise, List<File>> saveExerciseSolution(@Min(1) Long exerciseId, MultipartFile zip, String requestUsername) throws ExerciseNotFoundException, NotInCourseException, IOException;

    Map<Exercise, List<File>> getAllStudentsFiles(@Min(1) Long exerciseId, String requestUsername) throws ExerciseNotFoundException, NotInCourseException;

    List<ExerciseFile> getFileIdsByExerciseAndId(@Min(1) Long exerciseId, String ownerUsername) throws NotFoundException;
}
