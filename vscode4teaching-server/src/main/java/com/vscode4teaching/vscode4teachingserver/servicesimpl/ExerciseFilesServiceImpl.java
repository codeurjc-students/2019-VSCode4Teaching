package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExerciseFilesServiceImpl implements ExerciseFilesService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseFileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${v4t.filedirectory}")
    private String rootPath;

    public ExerciseFilesServiceImpl(ExerciseRepository exerciseRepository, ExerciseFileRepository fileRepository,
            UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<File> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, false);
        List<ExerciseFile> exerciseFiles = exercise.getFilesByOwner(requestUsername);
        if (exerciseFiles.isEmpty()) {
            List<ExerciseFile> template = exercise.getTemplate();
            if (exercise.getTemplate().isEmpty()) {
                throw new NoTemplateException(exerciseId);
            } else {
                return template.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList());
            }
        }
        List<File> files = exerciseFiles.stream().map(file -> Paths.get(file.getPath()).toFile())
                .collect(Collectors.toList());
        return files;
    }

    @Override
    public void saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile[] files, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        Course course = exercise.getCourse();
        User user = userRepository.findByUsername(requestUsername)
                .orElseThrow(() -> new NotInCourseException("User not in course: " + requestUsername));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, false);
        Path targetDirectory = Paths.get(rootPath + "/" + course.getName().toLowerCase().replace(" ", "_") + "_"
                + course.getId() + "/" + requestUsername).toAbsolutePath().normalize();
        if (!Files.exists(targetDirectory)) {
            Files.createDirectories(targetDirectory);
        }
        for (MultipartFile file : files) {
            String fileName = StringUtils.cleanPath(file.getOriginalFilename());
            Path targetLocation = targetDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            ExerciseFile exFile = new ExerciseFile(targetLocation.toString());
            exFile.setOwner(user);
            ExerciseFile savedFile = fileRepository.save(exFile);
            exercise.addUserFile(savedFile);
        }
        exerciseRepository.save(exercise);
    }
}