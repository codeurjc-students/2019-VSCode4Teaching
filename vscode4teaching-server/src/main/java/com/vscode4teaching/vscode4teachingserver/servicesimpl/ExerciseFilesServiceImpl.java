package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.*;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.*;
import org.hibernate.exception.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.Min;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ExerciseFilesServiceImpl implements ExerciseFilesService {

    private final ExerciseRepository exerciseRepository;
    private final ExerciseFileRepository fileRepository;
    private final ExerciseUserInfoRepository exerciseUserInfoRepository;
    private final UserRepository userRepository;

    private final ExerciseInfoService exerciseInfoService;
    private final JWTUserDetailsService userService;
    private final Logger logger = LoggerFactory.getLogger(ExerciseFilesServiceImpl.class);

    @Value("${v4t.filedirectory}")
    private String rootPath;

    public ExerciseFilesServiceImpl(ExerciseRepository exerciseRepository, ExerciseFileRepository fileRepository,
                                    ExerciseUserInfoRepository exerciseUserInfoRepository, UserRepository userRepository,
                                    ExerciseInfoService exerciseInfoService, JWTUserDetailsService userService) {
        this.exerciseRepository = exerciseRepository;
        this.fileRepository = fileRepository;
        this.exerciseUserInfoRepository = exerciseUserInfoRepository;
        this.userRepository = userRepository;
        this.exerciseInfoService = exerciseInfoService;
        this.userService = userService;
    }

    @Override
    public Boolean existsExerciseFilesForUser(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        logger.info("Called ExerciseFilesServiceImpl.existsExerciseFilesForUser({}, {})", exerciseId, requestUsername);
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, false);
        return !exercise.getFilesByOwner(requestUsername).isEmpty();
    }

    @Override
    public Map<Exercise, List<File>> getExerciseFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoTemplateException {
        logger.info("Called ExerciseFilesServiceImpl.getExerciseFiles({}, {})", exerciseId, requestUsername);
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
        returnMap.put(exercise, exerciseFiles.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
        return returnMap;
    }

    @Override
    public Map<Exercise, List<File>> saveExerciseFiles(@Min(1) Long exerciseId, MultipartFile file, String requestUsername)
            throws NotFoundException, NotInCourseException, IOException, ExerciseFinishedException {
        logger.info("Called ExerciseFilesServiceImpl.saveExerciseFiles({}, (file), {})", exerciseId, requestUsername);
        ExerciseUserInfo eui = exerciseUserInfoRepository
                .findByExercise_IdAndUser_Username(exerciseId, requestUsername)
                .orElseThrow(() ->
                        new NotFoundException(
                                "Exercise user info not found for user: " + requestUsername + ". Exercise: " + exerciseId));
        if (eui.getStatus() == ExerciseStatus.FINISHED) {
            throw new ExerciseFinishedException(exerciseId);
        }
        return saveFiles(file, exerciseId, requestUsername, eui, false, false);
    }

    @Override
    public Map<Exercise, List<File>> saveExerciseTemplate(@Min(1) Long exerciseId, MultipartFile file, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        return saveFiles(file, exerciseId, requestUsername, null, true, false);
    }

    @Override
    public Map<Exercise, List<File>> saveExerciseSolution(@Min(1) Long exerciseId, MultipartFile file, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        return saveFiles(file, exerciseId, requestUsername, null, false, true);
    }

    private Map<Exercise, List<File>> saveFiles(MultipartFile zippedFile, Long exerciseId, String requestUsername,
                                                ExerciseUserInfo eui, boolean isTemplate, boolean isSolution)
            throws ExerciseNotFoundException, NotInCourseException, IOException {
        logger.info("Called ExerciseFilesServiceImpl.saveFiles({}, (file), {}, {}, {}, {})", exerciseId, requestUsername, eui, isTemplate, isSolution);

        // Stage 1: all the information necessary to execute the process is obtained from function parameters.
        Exercise exercise = exerciseRepository.findById(exerciseId).orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        Course course = exercise.getCourse();
        User user = userRepository.findByUsername(requestUsername).orElseThrow(() -> new NotInCourseException("User not in course: " + requestUsername));
        ExceptionUtil.throwExceptionIfNotInCourse(course, requestUsername, (eui == null));

        // Stage 2: the path where the provided resources will be saved is dynamically generated.
        // To do this, it is necessary to detect what type of upload is being performed:
        // - Upload of an answer to an exercise (created by a student) -> eui parameter is not null and booleans are false.
        // - Upload of an exercise template -> eui is null, isTemplate is true and isSolution is false.
        // - Upload of an exercise solution (proposed by teacher) -> eui is null, isTemplate is false and isSolution is true.
        // According to this information, the necessary directories are generated.
        // The first part of the generated path is always the same: root path (specified in application properties) + course + exercise.
        StringBuilder destinationPath = new StringBuilder()
                .append(rootPath)
                .append(File.separator)
                .append(course.getName().toLowerCase().replace(" ", "_")).append("_").append(course.getId()) // Course (name + _ + i)
                .append(File.separator)
                .append(exercise.getName().toLowerCase().replace(" ", "_")).append("_").append(exercise.getId()) // Exercise (name + _ + i)
                .append(File.separator);
        if (eui != null) {
            destinationPath.append("student_").append(eui.getId());
        } else if (isTemplate) {
            destinationPath.append("template");
        } else if (isSolution) {
            destinationPath.append("solution");
        }
        Path destinationAbsolutePath = Paths.get(destinationPath.toString()).toAbsolutePath().normalize();
        if (!Files.exists(destinationAbsolutePath)) {
            Files.createDirectories(destinationAbsolutePath);
        }

        // Stage 3: the ZIP file sent is decompressed and inserted into the directory generated in previous stage.
        // The new information available on the added exercise is also persisted during this process.
        byte[] buffer = new byte[1024];
        ZipInputStream zis = new ZipInputStream(zippedFile.getInputStream());
        ZipEntry zipEntry = zis.getNextEntry();
        List<File> files = new ArrayList<>();
        while (zipEntry != null) {
            File destFile = newFile(destinationAbsolutePath.toFile(), zipEntry);
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
                ExerciseFile exFile = new ExerciseFile(destFile.getCanonicalPath());
                try {
                    if (fileRepository.findByPath(destFile.getCanonicalPath()).isEmpty()) {
                        if (eui != null) {
                            exFile.setOwner(user);
                            ExerciseFile savedFile = fileRepository.save(exFile);
                            exercise.addUserFile(savedFile);
                        } else if (isTemplate) {
                            ExerciseFile savedFile = fileRepository.save(exFile);
                            exercise.addFileToTemplate(savedFile);
                        } else if (isSolution) {
                            ExerciseFile savedFile = fileRepository.save(exFile);
                            exercise.addFileToSolution(savedFile);
                        }
                    }
                } catch (ConstraintViolationException ex) {
                    logger.error(ex.getMessage());
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
        logger.info("Called ExerciseFilesServiceImpl.getExerciseTemplate({}, {})", exerciseId, requestUsername);
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
    public Map<Exercise, List<File>> getExerciseSolution(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException, NoSolutionException {
        logger.info("Called ExerciseFilesServiceImpl.getExerciseSolution({}, {})", exerciseId, requestUsername);
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
        ExceptionUtil.throwExceptionIfNotInCourse(exercise.getCourse(), requestUsername, false);
        List<ExerciseFile> solution = exercise.getSolution();
        if (exercise.getSolution().isEmpty()) {
            throw new NoSolutionException(exerciseId);
        } else {
            Map<Exercise, List<File>> filesMap = new HashMap<>();
            filesMap.put(exercise,
                    solution.stream().map(file -> Paths.get(file.getPath()).toFile()).collect(Collectors.toList()));
            return filesMap;
        }
    }

    @Override
    public Map<Exercise, List<File>> getAllStudentsFiles(@Min(1) Long exerciseId, String requestUsername)
            throws ExerciseNotFoundException, NotInCourseException {
        logger.info("Called ExerciseFilesServiceImpl.getAllStudentsFiles({}, {})", exerciseId, requestUsername);
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
    public List<ExerciseFile> getFileIdsByExerciseAndId(@Min(1) Long exerciseId, String id)
            throws NotFoundException {
        logger.info("Called ExerciseFilesServiceImpl.getFileIdsByExerciseAndId({}, {})", exerciseId, id);
        Exercise ex = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new ExerciseNotFoundException(exerciseId));

        // This identificator can be:
        // - A student username (if called from getSingleStudentExerciseFiles() from extension)
        // - A EUI identificator (like "student_XX", if called from getMultipleStudentExerciseFiles() from extension)
        User user;
        if (id.startsWith("student_")) {
            Long parsedEuiId = Long.parseLong(id.split("student_")[1]);
            user = exerciseInfoService.getExerciseUserInfo(parsedEuiId).getUser();
        } else {
            user = userService.findByUsername(id);
        }

        List<ExerciseFile> files = ex.getFilesByOwner(user.getUsername());
        if (!files.isEmpty()) {
            List<ExerciseFile> copyFiles = new ArrayList<>(files);

            // Change paths to be relative to student's folder (named "student_{number}")
            copyFiles.forEach((ExerciseFile file) -> {
                String separator = File.separator;
                if (File.separator.contains("\\")) {
                    separator = "\\" + File.separator;
                }
                file.setPath(file.getPath().split("student_[0-9]*" + separator)[1]);
            });
            return copyFiles;
        } else {
            return files;
        }

    }
}
