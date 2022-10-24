package com.vscode4teaching.vscode4teachingserver.controllertests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;
import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledOnOs;
import org.junit.jupiter.api.condition.OS;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.zip.ZipInputStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class ExerciseFilesControllerTests {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseFilesControllerTests.class);
    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @MockBean
    private ExerciseFilesService filesService;
    private JWTResponse jwtToken;

    @BeforeEach
    public void login() throws Exception {
        // Get token
        JWTRequest jwtRequest = new JWTRequest();
        jwtRequest.setUsername("johndoe");
        jwtRequest.setPassword("teacherpassword");

        MvcResult loginResult = mockMvc.perform(post("/api/login").contentType("application/json").with(csrf())
                .content(objectMapper.writeValueAsString(jwtRequest))).andExpect(status().isOk()).andReturn();
        jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), JWTResponse.class);
    }

    @AfterEach
    public void cleanup() {
        // Cleanup
        try {
            FileUtils.deleteDirectory(Paths.get("v4t-course-test/").toFile());
            FileUtils.deleteDirectory(Paths.get("test-uploads/").toFile());
        } catch (IOException e) {
            logger.error(e.getMessage());
        }
    }

    @Test
    public void downloadFilesFromExercise_exercise() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_13/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_13/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getExerciseFiles(1L, "johndoe")).thenReturn(returnMap);
        when(filesService.existsExerciseFilesForUser(1L, "johndoe")).thenReturn(true);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/files").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"exercise-1-johndoe.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej2.txt");
        verify(filesService, times(1)).getExerciseFiles(anyLong(), anyString());
    }

    @Test
    public void downloadFilesFromExercise_template() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getExerciseFiles(1L, "johndoe")).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/files").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"template-1.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej2.txt");
        verify(filesService, times(1)).getExerciseFiles(anyLong(), anyString());
    }

    @Test
    public void downloadFilesFromExercise_solution() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/solution/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/solution/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getExerciseSolution(1L, "johndoe")).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/files/solution").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"solution-1.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej2.txt");
        verify(filesService, times(1)).getExerciseSolution(anyLong(), anyString());
    }

    @Test
    public void uploadFile() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        byte[] mock = null;
        MockMultipartFile mockMultiFile1 = new MockMultipartFile("file", "exs.zip", "application/zip", mock);
        Files.createDirectories(Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/ex3"));
        Path path1 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex1.html");
        Path path1Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/ex1.html");
        Files.copy(path1, path1Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path2 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex2.html");
        Path path2Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/ex2.html");
        Files.copy(path2, path2Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path3 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex3/ex3.html");
        Path path3Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/ex3/ex3.html");
        Files.copy(path3, path3Copy, StandardCopyOption.REPLACE_EXISTING);

        File mockFile1 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/", "ex1.html");
        File mockFile2 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/", "ex2.html");
        File mockFile3 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/student_13/", "ex3/ex3.html");
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, Arrays.asList(mockFile1, mockFile2, mockFile3));
        when(filesService.saveExerciseFiles(anyLong(), any(MultipartFile.class), anyString())).thenReturn(returnMap);

        MvcResult result = mockMvc.perform(multipart("/api/exercises/1/files").file(mockMultiFile1).with(csrf())
                .header("Authorization", "Bearer " + jwtToken.getJwtToken())).andExpect(status().isOk()).andReturn();

        List<UploadFileResponse> expectedResponse = new ArrayList<>();
        expectedResponse.add(new UploadFileResponse("ex1.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex2.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex3" + File.separator + "ex3.html", "text/html", 23L));

        assertThat(result.getResponse().getContentAsString())
                .isEqualToIgnoringWhitespace(objectMapper.writeValueAsString(expectedResponse));

        logger.info(result.getResponse().getContentAsString());
        verify(filesService, times(1)).saveExerciseFiles(anyLong(), any(MultipartFile.class), anyString());
    }

    @Test
    public void uploadFile_noBody() throws Exception {
        mockMvc.perform(multipart("/api/exercises/1/files").with(csrf()).header("Authorization",
                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isBadRequest());

    }

    @Test
    public void uploadFile_noMultipart() throws Exception {

        mockMvc.perform(
                        post("/api/exercises/1/files").with(csrf()).header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void uploadTemplate() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        byte[] mock = null;
        MockMultipartFile mockMultiFile1 = new MockMultipartFile("file", "exs.zip", "application/zip", mock);
        Files.createDirectories(Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/template/ex3"));
        Path path1 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex1.html");
        Path path1Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/template/ex1.html");
        Files.copy(path1, path1Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path2 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex2.html");
        Path path2Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/template/ex2.html");
        Files.copy(path2, path2Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path3 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex3/ex3.html");
        Path path3Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/template/ex3/ex3.html");
        Files.copy(path3, path3Copy, StandardCopyOption.REPLACE_EXISTING);

        File mockFile1 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/template/", "ex1.html");
        File mockFile2 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/template/", "ex2.html");
        File mockFile3 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/template/", "ex3/ex3.html");
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, Arrays.asList(mockFile1, mockFile2, mockFile3));
        when(filesService.saveExerciseTemplate(anyLong(), any(MultipartFile.class), anyString())).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(multipart("/api/exercises/1/files/template").file(mockMultiFile1).with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();

        List<UploadFileResponse> expectedResponse = new ArrayList<>();
        expectedResponse.add(new UploadFileResponse("ex1.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex2.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex3" + File.separator + "ex3.html", "text/html", 23L));

        assertThat(result.getResponse().getContentAsString())
                .isEqualToIgnoringWhitespace(objectMapper.writeValueAsString(expectedResponse));

        logger.info(result.getResponse().getContentAsString());
        verify(filesService, times(1)).saveExerciseTemplate(anyLong(), any(MultipartFile.class), anyString());
    }

    @Test
    public void uploadSolution() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        byte[] mock = null;
        MockMultipartFile mockMultiFile1 = new MockMultipartFile("file", "exs.zip", "application/zip", mock);
        Files.createDirectories(Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/ex3"));
        Path path1 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex1.html");
        Path path1Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/ex1.html");
        Files.copy(path1, path1Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path2 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex2.html");
        Path path2Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/ex2.html");
        Files.copy(path2, path2Copy, StandardCopyOption.REPLACE_EXISTING);
        Path path3 = Paths.get("src/test/java/com/vscode4teaching/vscode4teachingserver/files/ex3/ex3.html");
        Path path3Copy = Paths.get("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/ex3/ex3.html");
        Files.copy(path3, path3Copy, StandardCopyOption.REPLACE_EXISTING);

        File mockFile1 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/", "ex1.html");
        File mockFile2 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/", "ex2.html");
        File mockFile3 = new File("v4t-course-test/spring_boot_course_2/exercise_1_1/solution/", "ex3/ex3.html");
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, Arrays.asList(mockFile1, mockFile2, mockFile3));
        when(filesService.saveExerciseSolution(anyLong(), any(MultipartFile.class), anyString())).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(multipart("/api/exercises/1/files/solution").file(mockMultiFile1).with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();

        List<UploadFileResponse> expectedResponse = new ArrayList<>();
        expectedResponse.add(new UploadFileResponse("ex1.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex2.html", "text/html", 23L));
        expectedResponse.add(new UploadFileResponse("ex3" + File.separator + "ex3.html", "text/html", 23L));

        assertThat(result.getResponse().getContentAsString())
                .isEqualToIgnoringWhitespace(objectMapper.writeValueAsString(expectedResponse));

        logger.info(result.getResponse().getContentAsString());
        verify(filesService, times(1)).saveExerciseSolution(anyLong(), any(MultipartFile.class), anyString());
    }

    @Test
    public void getTemplate() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/template/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/template/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getExerciseTemplate(1L, "johndoe")).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/files/template").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"template-1.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("ej2.txt");
        verify(filesService, times(1)).getExerciseTemplate(anyLong(), anyString());
    }

    @Test
    public void getAllStudentFiles() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_13/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_13/ej2.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_14/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_14/ej2.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_15/ej1.txt"));
        files.add(new File("v4t-course-test/spring-boot-course/exercise_1_1/student_15/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getAllStudentsFiles(1L, "johndoe")).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/teachers/files").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"exercise-1-files.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_13/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_13/ej2.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_14/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_14/ej2.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_15/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_15/ej2.txt");
        verify(filesService, times(1)).getAllStudentsFiles(anyLong(), anyString());
    }

    @Test
    @EnabledOnOs({OS.WINDOWS})
    public void getAllStudentFilesWindows() throws Exception {
        Exercise exercise = new Exercise("Exercise 1");
        exercise.setId(1L);
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_13\\ej1.txt"));
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_13\\ej2.txt"));
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_14\\ej1.txt"));
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_14\\ej2.txt"));
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_15\\ej1.txt"));
        files.add(new File("v4t-course-test\\spring-boot-course\\exercise_1_1\\student_15\\ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        Map<Exercise, List<File>> returnMap = new HashMap<>();
        returnMap.put(exercise, files);
        when(filesService.getAllStudentsFiles(1L, "johndoe")).thenReturn(returnMap);

        MvcResult result = mockMvc
                .perform(get("/api/exercises/1/teachers/files").contentType("application/zip").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"exercise-1-files.zip\"");
        byte[] zipContent = result.getResponse().getContentAsByteArray();
        ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(zipContent));
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_13/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_13/ej2.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_14/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_14/ej2.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_15/ej1.txt");
        assertThat(zis.getNextEntry().getName()).isEqualTo("student_15/ej2.txt");
        verify(filesService, times(1)).getAllStudentsFiles(anyLong(), anyString());
    }

    @Test
    public void getFileInfo() throws Exception {
        ExerciseFile ex1 = new ExerciseFile("test1");
        List<ExerciseFile> exFiles = new ArrayList<>();
        exFiles.add(ex1);
        when(filesService.getFileIdsByExerciseAndId(anyLong(), any(String.class))).thenReturn(exFiles);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/users/johndoejr1/exercises/2/files").contentType("application/json")
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()).with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(filesService, times(1)).getFileIdsByExerciseAndId(anyLong(), any(String.class));
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(FileViews.GeneralView.class)
                .writeValueAsString(exFiles);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }
}
