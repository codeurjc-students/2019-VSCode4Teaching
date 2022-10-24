package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseStatus;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.websockets.SocketHandler;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExerciseInfoServiceImpl implements ExerciseInfoService {

    private final ExerciseUserInfoRepository exerciseUserInfoRepository;
    private final SocketHandler websocketHandler;
    private final Logger logger = LoggerFactory.getLogger(ExerciseInfoServiceImpl.class);

    public ExerciseInfoServiceImpl(ExerciseUserInfoRepository exerciseUserInfoRepository, SocketHandler websocketHandler) {
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
        this.websocketHandler = websocketHandler;
    }

    @Override
    public ExerciseUserInfo getExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        logger.info("Called ExerciseInfoServiceImpl.getExerciseUserInfo({}, {})", exerciseId, username);
        return this.getAndCheckExerciseUserInfo(exerciseId, username);
    }

    @Override
    public ExerciseUserInfo getExerciseUserInfo(@Min(1) Long euiId) throws NotFoundException {
        logger.info("Called ExerciseInfoServiceImpl.getExerciseUserInfo({})", euiId);
        Optional<ExerciseUserInfo> eui = exerciseUserInfoRepository.findById(euiId);
        return eui.orElseThrow(() -> new NotFoundException(euiId.toString()));
    }

    @Override
    public ExerciseUserInfo updateExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username, ExerciseStatus status, List<String> modifiedFiles)
            throws NotFoundException {
        logger.info("Called ExerciseInfoServiceImpl.updateExerciseUserInfo({}, {}, {}, {})", exerciseId, username, status, modifiedFiles);
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
        logger.info("Called ExerciseInfoServiceImpl.getAllStudentExerciseUserInfo({}, {})", exerciseId, requestUsername);
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