package es.codeurjc.vscode4teaching.services;

import es.codeurjc.vscode4teaching.model.Course;
import es.codeurjc.vscode4teaching.model.ExerciseStatus;
import es.codeurjc.vscode4teaching.model.ExerciseUserInfo;
import es.codeurjc.vscode4teaching.model.repositories.ExerciseUserInfoRepository;
import es.codeurjc.vscode4teaching.services.exceptions.ExerciseNotFoundException;
import es.codeurjc.vscode4teaching.services.exceptions.NotFoundException;
import es.codeurjc.vscode4teaching.services.exceptions.NotInCourseException;
import es.codeurjc.vscode4teaching.services.websockets.SocketHandler;
import es.codeurjc.vscode4teaching.servicesimpl.ExceptionUtil;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ExerciseInfoService {

    private final ExerciseUserInfoRepository exerciseUserInfoRepository;
    private final SocketHandler websocketHandler;
    private final Logger logger = LoggerFactory.getLogger(ExerciseInfoService.class);

    public ExerciseInfoService(ExerciseUserInfoRepository exerciseUserInfoRepository, SocketHandler websocketHandler) {
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
        this.websocketHandler = websocketHandler;
    }

    public ExerciseUserInfo getExerciseUserInfo(@Min(0) Long exerciseId, @NotEmpty String username)
            throws NotFoundException {
        logger.info("Called ExerciseInfoServiceImpl.getExerciseUserInfo({}, {})", exerciseId, username);
        return this.getAndCheckExerciseUserInfo(exerciseId, username);
    }

    public ExerciseUserInfo getExerciseUserInfo(@Min(1) Long euiId) throws NotFoundException {
        logger.info("Called ExerciseInfoServiceImpl.getExerciseUserInfo({})", euiId);
        Optional<ExerciseUserInfo> eui = exerciseUserInfoRepository.findById(euiId);
        return eui.orElseThrow(() -> new NotFoundException(euiId.toString()));
    }

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