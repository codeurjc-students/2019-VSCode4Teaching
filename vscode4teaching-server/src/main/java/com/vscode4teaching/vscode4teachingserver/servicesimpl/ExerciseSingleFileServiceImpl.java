package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.*;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseSingleFileService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ExerciseSingleFileServiceImpl implements ExerciseSingleFileService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseFileRepository fileRepository;
    private final UserRepository userRepository;

    private final ExerciseInfoService exerciseInfoService;
    private final Logger logger = LoggerFactory.getLogger(ExerciseSingleFileServiceImpl.class);

    @Value("${v4t.filedirectory}")
    private String rootPath;

    public ExerciseSingleFileServiceImpl(ExerciseRepository exerciseRepository,
                                         ExerciseFileRepository fileRepository,
                                         UserRepository userRepository,
                                         ExerciseInfoService exerciseInfoService) {
        this.exerciseRepository = exerciseRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
        this.exerciseInfoService = exerciseInfoService;
    }

    @Override
    public File saveExerciseSingleFile(Long exerciseId, String requestUsername, MultipartFile file, String relativePath) throws NotFoundException, NotInCourseException, IOException, ExerciseFinishedException {
        logger.info("Called ExerciseSingleFilesServiceImpl.saveFileByExerciseUserRelativePath({}, {}, (file), {})", exerciseId, requestUsername, relativePath);

        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        Course course = exercise.getCourse();
        User user = userRepository.findByUsername(requestUsername).orElseThrow(() -> new NotInCourseException("User not in course: " + requestUsername));
        ExerciseUserInfo eui = exerciseInfoService.getExerciseUserInfo(exercise.getId(), user.getUsername());
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, false);

        // TODO ¿ESTE CONTROL NO DEBERÍA QUEDAR RELEGADO A OTRA PARTE?
        if (eui.getStatus() == ExerciseStatus.FINISHED) {
            throw new ExerciseFinishedException(exerciseId);
        }

        String rootPathServerFS = new StringBuilder()
                .append(rootPath)
                .append(File.separator)
                .append(course.getName().toLowerCase().replace(" ", "_")).append("_").append(course.getId()) // Course (name + _ + id)
                .append(File.separator)
                .append(exercise.getName().toLowerCase().replace(" ", "_")).append("_").append(exercise.getId()) // Exercise (name + _ + id)
                .append(File.separator)
                .append("student_").append(eui.getId()) // Student's folder (student + _ + id)
                .append(File.separator)
                .append(relativePath) // Specific file's relative path
                .toString();

        Path destinationAbsolutePath = Paths.get(rootPathServerFS).toAbsolutePath().normalize();
        if (!Files.exists(destinationAbsolutePath.getParent())) {
            Files.createDirectories(destinationAbsolutePath.getParent());
        }

        File fileFS = new File(destinationAbsolutePath.toUri());
        FileOutputStream fos = new FileOutputStream(fileFS);
        fos.write(file.getBytes());
        fos.close();

        ExerciseFile exFile = new ExerciseFile(fileFS.getCanonicalPath());
        if (fileRepository.findByPath(fileFS.getCanonicalPath()).isEmpty()) {
            exFile.setOwner(user);
            ExerciseFile savedFile = fileRepository.save(exFile);
            exercise.addUserFile(savedFile);
        }

        exerciseRepository.save(exercise);

        return fileFS;
    }

    @Override
    public Boolean deleteExerciseSingleFile(Long exerciseId, String requestUsername, String relativePath) throws NotFoundException, NotInCourseException {
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        Course course = exercise.getCourse();
        User user = userRepository.findByUsername(requestUsername).orElseThrow(() -> new NotInCourseException("User not in course: " + requestUsername));
        ExerciseUserInfo eui = exerciseInfoService.getExerciseUserInfo(exercise.getId(), user.getUsername());
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, (eui == null));

        String rootPathServerFS = new StringBuilder()
                .append(rootPath)
                .append(File.separator)
                .append(course.getName().toLowerCase().replace(" ", "_")).append("_").append(course.getId()) // Course (name + _ + i)
                .append(File.separator)
                .append(exercise.getName().toLowerCase().replace(" ", "_")).append("_").append(exercise.getId()) // Exercise (name + _ + i)
                .append(File.separator)
                .append("student_").append(eui.getId()) // Student's folder (student + _ + id)
                .append(File.separator)
                .append(relativePath)
                .toString();

        Path destinationAbsolutePath = Paths.get(rootPathServerFS).toAbsolutePath().normalize();
        File fileToBeDeleted = destinationAbsolutePath.toFile();
        if (!fileToBeDeleted.exists()) return true;
        return fileToBeDeleted.delete();
    }
}
