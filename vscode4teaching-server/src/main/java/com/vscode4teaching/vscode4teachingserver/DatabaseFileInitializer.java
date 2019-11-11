package com.vscode4teaching.vscode4teachingserver;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
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
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(value = "file.initialization", havingValue = "true", matchIfMissing = false)
@Transactional
@Order(1)
public class DatabaseFileInitializer implements CommandLineRunner {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseFileRepository fileRepository;

    @Value("${v4t.filedirectory}")
    private String rootPath;

    @Override
    public void run(String... args) throws Exception {
        if (Files.exists(Paths.get(rootPath))) {
            Files.walk(Paths.get(rootPath)).parallel().filter(Files::isRegularFile).forEach(filePath -> {
                // Find course, exercise and user
                String absolutePath = filePath.toAbsolutePath().toString();
                int i = absolutePath.lastIndexOf(rootPath);
                String[] parts = absolutePath.substring(i).split(Pattern.quote(File.separator));
                String[] courseParts = parts[1].split("_");
                long course_id = Long.valueOf(courseParts[courseParts.length - 1]);
                Optional<Course> courseOpt = courseRepository.findById(course_id);
                // If not found build course name and try to find it
                if (!courseOpt.isPresent()) {
                    List<String> coursePartsList = new ArrayList<>(Arrays.asList(courseParts));
                    coursePartsList.remove(courseParts[courseParts.length - 1]);
                    String courseName = String.join(" ", coursePartsList);
                    courseOpt = courseRepository.findByNameIgnoreCase(courseName);
                    if (courseOpt.isPresent()) {
                        File dir = Paths.get(rootPath + File.separator + parts[1]).toFile();
                        File renamedDir = new File(dir.getParent() + File.separator + String.join("_", coursePartsList)
                                + "_" + courseOpt.get().getId());
                        dir.renameTo(renamedDir);
                    }
                }
                if (courseOpt.isPresent()) {
                    Course course = courseOpt.get();
                    List<Exercise> exercises = course.getExercises();
                    String[] exerciseParts = parts[2].split("_");
                    long exercise_id = Long.valueOf(exerciseParts[exerciseParts.length - 1]);
                    List<String> exercisePartsList = new ArrayList<>(Arrays.asList(exerciseParts));
                    exercisePartsList.remove(exerciseParts[exerciseParts.length - 1]);
                    String exerciseName = String.join(" ", exercisePartsList);
                    Optional<Exercise> exerciseOpt = exercises.stream()
                            .filter(exercise -> exercise.getId().equals(exercise_id)
                                    && exercise.getName().equalsIgnoreCase(exerciseName))
                            .findFirst();
                    if (!exerciseOpt.isPresent()) {
                        exerciseOpt = exerciseRepository.findByCourseAndNameIgnoreCase(course, exerciseName);
                        if (exerciseOpt.isPresent()) {
                            Path dir = Paths.get(rootPath + File.separator + parts[1] + File.separator + parts[2]);
                            Path renamedDir = Paths.get(dir.getParent().toString() + File.separator
                                    + String.join("_", exercisePartsList) + "_" + exerciseOpt.get().getId());
                            try {
                                Files.move(dir, renamedDir);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }
                    }
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
}