package com.vscode4teaching.vscode4teachingserver.services;

import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseStatus;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface ExerciseInfoService {
    ExerciseUserInfo getExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException;

    ExerciseUserInfo getExerciseUserInfo(@Min(1) Long euiId) throws NotFoundException;

    ExerciseUserInfo updateExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username, ExerciseStatus status, List<String> modifiedFiles)
            throws NotFoundException;

    List<ExerciseUserInfo> getAllStudentExerciseUserInfo(@Min(0) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException;

}