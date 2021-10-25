package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseFinishedException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NoTemplateException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExerciseFilesServiceImpl implements ExerciseFilesService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseFileRepository fileRepository;
    private final ExerciseUserInfoRepository exerciseUserInfoRepository;
    private final UserRepository userRepository;

    @Value("${v4t.filedirectory}")
    private String rootPath;

    public ExerciseFilesServiceImpl(ExerciseRepository exerciseRepository, ExerciseFileRepository fileRepository,
                                    ExerciseUserInfoRepository exerciseUserInfoRepository, UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.fileRepository = fileRepository;
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Map<Exercise, List<File>> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername)
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
                Map<Exercise, List<File>> returnMap = new HashMap<>();
                returnMap.put(exercise,
                        template.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
                return returnMap;
            }
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise,
                exerciseFiles.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
        return returnMap;
    }

    @Override
    public Map<Exercise, List<File>> saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile file,
                                                       String requestUsername)
            throws NotFoundException, NotInCourseException, IOException, ExerciseFinishedException {
        ExerciseUserInfo eui = exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, requestUsername)
                .orElseThrow(() -> new NotFoundException(
                        "Exercise user info not found for user: " + requestUsername + ". Exercise: " + exerciseId));
        if (eui.getStatus() == 1) {
            throw new ExerciseFinishedException(exerciseId);
        }
        return saveFiles(exerciseId, file, requestUsername, false);
    }

    @Override
    public Map<Exercise, List<File>> saveExerciseTemplate(@Min(1) Long exerciseId, MultipartFile file,
                                                          String requestUsername) throws ExerciseNotFoundException, NotInCourseException, IOException {
        return saveFiles(exerciseId, file, requestUsername, true);
    }

    private Map<Exercise, List<File>> saveFiles(Long exerciseId, MultipartFile file, String requestUsername,
                                                boolean isTemplate) throws ExerciseNotFoundException, NotInCourseException, IOException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        Course course = exercise.getCourse();
        User user = userRepository.findByUsername(requestUsername)
                .orElseThrow(() -> new NotInCourseException("User not in course: " + requestUsername));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, isTemplate);
        String lastFolderPath = isTemplate ? "template" : requestUsername;
        // For example, for root path "v4t_courses", a course "Course 1" with id 34, an exercise "Exercise 1" with id 77
        // and a user "john.doe" the final directory path would be
        // v4t_courses/course_1_34/exercise_1_77/john.doe
        Path targetDirectory = Paths.get(rootPath + File.separator + course.getName().toLowerCase().replace(" ", "_")
                + "_" + course.getId() + File.separator + exercise.getName().toLowerCase().replace(" ", "_") + "_"
                + exercise.getId() + File.separator + lastFolderPath).toAbsolutePath().normalize();
        if (!Files.exists(targetDirectory)) {
            Files.createDirectories(targetDirectory);
        }
        byte[] buffer = new byte[1024];
        ZipInputStream zis = new ZipInputStream(file.getInputStream());
        ZipEntry zipEntry = zis.getNextEntry();
        List<File> files = new ArrayList<>();
        while (zipEntry != null) {
            File destFile = newFile(targetDirectory.toFile(), zipEntry);
            if (zipEntry.isDirectory()) {
                if (!destFile.isDirectory() && !destFile.mkdirs()) {
                    throw new IOException("Failed to create directory " + destFile);
                }
            } else {
                // fix for Windows-created archives
                File parent = destFile.getParentFile();
                if (!parent.isDirectory() && !parent.mkdirs()) {
                    throw new IOException("Failed to create directory " + parent);
                }
                files.add(destFile);
                FileOutputStream fos = new FileOutputStream(destFile);
                int len;
                while ((len = zis.read(buffer)) > 0) {
                    fos.write(buffer, 0, len);
                }
                fos.close();
                Optional<ExerciseFile> previousFileOpt = fileRepository.findByPath(destFile.getCanonicalPath());
                if (!previousFileOpt.isPresent()) {
                    ExerciseFile exFile = new ExerciseFile(destFile.getCanonicalPath());
                    if (isTemplate) {
                        ExerciseFile savedFile = fileRepository.save(exFile);
                        exercise.addFileToTemplate(savedFile);
                    } else {
                        exFile.setOwner(user);
                        ExerciseFile savedFile = fileRepository.save(exFile);
                        exercise.addUserFile(savedFile);
                    }
                }
            }
            zipEntry = zis.getNextEntry();
        }
        zis.closeEntry();
        zis.close();
        Exercise savedExercise = exerciseRepository.save(exercise);
        Map<Exercise, List<File>> filesMap = new HashMap<>();
        filesMap.put(savedExercise, files);
        return filesMap;
    }

    private File newFile(File destinationDir, ZipEntry zipEntry) throws IOException {
        File destFile = new File(destinationDir, zipEntry.getName());

        String destDirPath = destinationDir.getCanonicalPath();
        String destFilePath = destFile.getCanonicalPath();

        if (!destFilePath.startsWith(destDirPath + File.separator)) {
            throw new IOException("Entry is outside of the target dir: " + zipEntry.getName());
        }
        return destFile;
    }

    @Override
    public Map<Exercise, List<File>> getExerciseTemplate(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, false);
        List<ExerciseFile> template = exercise.getTemplate();
        if (exercise.getTemplate().isEmpty()) {
            throw new NoTemplateException(exerciseId);
        } else {
            Map<Exercise, List<File>> filesMap = new HashMap<>();
            filesMap.put(exercise,
                    template.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
            return filesMap;
        }
    }

    @Override
    public Map<Exercise, List<File>> getAllStudentsFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, false);
        List<ExerciseFile> files = exercise.getStudentOnlyFiles();
        Map<Exercise, List<File>> filesMap = new HashMap<>();
        filesMap.put(exercise,
                files.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
        return filesMap;
    }

    @Override
    public List<ExerciseFile> getFileIdsByExerciseAndOwner(@Min(1) Long exerciseId, String ownerUsername)
            throws ExerciseNotFoundException {
        Exercise ex = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        List<ExerciseFile> files = ex.getFilesByOwner(ownerUsername);
        if (!files.isEmpty()) {
            String username = files.get(0).getOwner().getUsername();
            List<ExerciseFile> copyFiles = new ArrayList<>(files);

            // Change paths to be relative to username
            copyFiles.forEach((ExerciseFile file) -> {
                String separator = File.separator;
                if (File.separator.contains("\\")) {
                    separator = "\\" + File.separator;
                }
                file.setPath(file.getPath().split(username + separator)[1]);
            });
            return copyFiles;
        } else {
            return files;
        }

    }
}