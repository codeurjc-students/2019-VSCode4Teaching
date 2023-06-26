package com.vscode4teaching.vscode4teachingserver.services;

import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.Min;
import java.io.File;
import java.io.IOException;

@Service
@Validated
public interface ExerciseSingleFileService {
    File saveExerciseSingleFile(@Min(1) Long exerciseId, String requestUsername, MultipartFile file, String relativePath) throws NotFoundException, NotInCourseException, IOException, ExerciseFinishedException;

    Boolean deleteExerciseSingleFile(@Min(1) Long exerciseId, String requestUsername, String relativePath) throws NotFoundException, NotInCourseException;
}
