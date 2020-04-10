package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.Optional;

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
        Optional<ExerciseUserInfo> euiOpt = exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId,
                username);
        if (!euiOpt.isPresent()) {
            throw new NotFoundException(
                    "Exercise user info not found for user: " + username + ". Exercise: " + exerciseId);
        }
        return euiOpt.get();
    }

}