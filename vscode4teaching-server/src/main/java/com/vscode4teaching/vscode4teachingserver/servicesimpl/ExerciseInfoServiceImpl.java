package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;

import org.springframework.stereotype.Service;

@Service
public class ExerciseInfoServiceImpl implements ExerciseInfoService {

    private final ExerciseUserInfoRepository exerciseUserInfoRepository;

    public ExerciseInfoServiceImpl(ExerciseUserInfoRepository exerciseUserInfoRepository) {
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
    }

    @Override
    public ExerciseUserInfo getExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        return this.getAndCheckExerciseUserInfo(exerciseId, username);
    }

    @Override
    public ExerciseUserInfo updateExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username, boolean finished)
            throws NotFoundException {
        ExerciseUserInfo eui = this.getAndCheckExerciseUserInfo(exerciseId, username);
        eui.setFinished(true);
        eui = exerciseUserInfoRepository.save(eui);
        return eui;
    }

    private ExerciseUserInfo getAndCheckExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        return exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)
                .orElseThrow(() -> new NotFoundException(
                        "Exercise user info not found for user: " + username + ". Exercise: " + exerciseId));
    }
}