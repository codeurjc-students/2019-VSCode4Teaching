package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.io.File;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.stereotype.Service;

@Service
public class ExerciseFilesServiceImpl implements ExerciseFilesService {

    private final ExerciseRepository exerciseRepository;

    public ExerciseFilesServiceImpl(ExerciseRepository exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
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
                return template.stream().map(file -> new File(file.getPath())).collect(Collectors.toList());
            }
        }
        List<File> files = exerciseFiles.stream().map(file -> new File(file.getPath())).collect(Collectors.toList());
        return files;
    }
}