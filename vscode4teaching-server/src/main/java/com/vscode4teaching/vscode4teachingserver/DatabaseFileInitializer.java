package com.vscode4teaching.vscode4teachingserver;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

import javax.transaction.Transactional;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CourseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(Ordered.LOWEST_PRECEDENCE)
@ConditionalOnProperty(value = "file.initialization", havingValue = "true", matchIfMissing = false)
@Transactional
public class DatabaseFileInitializer implements ApplicationRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseFileRepository fileRepository;

    @Value("${v4t.filedirectory}")
    private String rootPath;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        Files.walk(Paths.get(rootPath)).parallel().filter(Files::isRegularFile).forEach(filePath -> {
            // Find course, exercise and user
            String absolutePath = filePath.toAbsolutePath().toString();
            int i = absolutePath.lastIndexOf(rootPath);
            String[] parts = absolutePath.substring(i).split(Pattern.quote(File.separator));
            String[] courseParts = parts[1].split("_");
            long course_id = Long.valueOf(courseParts[courseParts.length - 1]);
            Optional<Course> courseOpt = courseRepository.findById(course_id);
            if (courseOpt.isPresent()) {
                Course course = courseOpt.get();
                List<Exercise> exercises = course.getExercises();
                String[] exerciseParts = parts[2].split("_");
                long exercise_id = Long.valueOf(exerciseParts[exerciseParts.length - 1]);
                Optional<Exercise> exerciseOpt = exercises.stream()
                        .filter(exercise -> exercise.getId().equals(exercise_id)).findFirst();
                if (exerciseOpt.isPresent()) {
                    Exercise exercise = exerciseOpt.get();
                    if (parts[3].equals("template")) {
                        // When everything is found, save file to database
                        ExerciseFile file = new ExerciseFile(absolutePath);
                        fileRepository.save(file);
                        exercise.addFileToTemplate(file);
                        exerciseRepository.save(exercise);
                    } else {
                        Optional<User> userOpt = course.getUsersInCourse().stream()
                                .filter(user -> user.getUsername().equals(parts[3])).findFirst();
                        if (userOpt.isPresent()) {
                            User user = userOpt.get();
                            // When everything is found, save file to database
                            ExerciseFile file = new ExerciseFile(absolutePath, user);
                            fileRepository.save(file);
                            exercise.addUserFile(file);
                            exerciseRepository.save(exercise);
                        }
                    }
                }
            }
        });
    }
}