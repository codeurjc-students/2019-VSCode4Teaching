package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.websockets.SocketHandler;

import org.springframework.stereotype.Service;

@Service
public class ExerciseInfoServiceImpl implements ExerciseInfoService {

    private final ExerciseUserInfoRepository exerciseUserInfoRepository;
    private final SocketHandler websocketHandler;

    public ExerciseInfoServiceImpl(ExerciseUserInfoRepository exerciseUserInfoRepository, SocketHandler websocketHandler) {
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
        this.websocketHandler = websocketHandler;
    }

    @Override
    public ExerciseUserInfo getExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        ExerciseUserInfo eui = this.getAndCheckExerciseUserInfo(exerciseId, username);
        //Changing status from not accessed to accessed but not finished
        if (eui.getStatus() == 0) {
            eui.setStatus(2);
            eui = exerciseUserInfoRepository.save(eui);
        }
        return eui;
    }

    @Override
    public ExerciseUserInfo updateExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username, int status, List<String> modifiedFiles)
            throws NotFoundException {
        ExerciseUserInfo eui = this.getAndCheckExerciseUserInfo(exerciseId, username);
        eui.setStatus(status);
        eui.addModifiedFiles(modifiedFiles);
        eui = exerciseUserInfoRepository.save(eui);
        this.websocketHandler.refreshExerciseDashboards(eui.getExercise().getCourse().getTeachers());
        return eui;
    }

    private ExerciseUserInfo getAndCheckExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        return exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)
                .orElseThrow(() -> new NotFoundException(
                        "Exercise user info not found for user: " + username + ". Exercise: " + exerciseId));
    }

    @Override
    public List<ExerciseUserInfo> getAllStudentExerciseUserInfo(@Min(0) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        List<ExerciseUserInfo> euis = exerciseUserInfoRepository.findByExercise_Id(exerciseId);
        if (euis.isEmpty()) {
            throw new ExerciseNotFoundException(exerciseId);
        }
        Course course = euis.get(0).getExercise().getCourse();
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, true);
        euis = euis.stream().filter(eui -> !eui.getUser().isTeacher()).collect(Collectors.toList());
        return euis;
    }
}