package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UploadFileResponse;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;

import org.apache.tomcat.util.http.fileupload.FileUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class ExerciseFilesControllerTests {
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private ExerciseFilesService filesService;

        private JWTResponse jwtToken;
        private static final Logger logger = LoggerFactory.getLogger(ExerciseFilesControllerTests.class);

        @BeforeEach
        public void login() throws Exception {
                // Get token
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                MvcResult loginResult = mockMvc
                                .perform(post("/api/login").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(jwtRequest)))
                                .andExpect(status().isOk()).andReturn();
                jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), JWTResponse.class);
        }

        @AfterEach
        public void cleanup() throws IOException {
                // Cleanup
                FileUtils.deleteDirectory(Paths.get("v4t-course-test/").toFile());
                FileUtils.deleteDirectory(Paths.get("test-uploads/").toFile());
        }

        @Test
        public void downloadFilesFromExercise_exercise() throws Exception {
                List<File> files = new ArrayList<>();
                files.add(new File("v4t-course-test/spring-boot-course/johndoe/ej1.txt"));
                files.add(new File("v4t-course-test/spring-boot-course/johndoe/ej2.txt"));
                for (File file : files) {
                        file.getParentFile().mkdirs();
                        file.createNewFile();
                }
                when(filesService.getExerciseFiles(1l, "johndoe")).thenReturn(files);

                MvcResult result = mockMvc
                                .perform(get("/api/exercises/1/files").contentType("application/zip")
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();
                logger.info(result.toString());

                assertThat(result.getResponse().getHeader("Content-Disposition"))
                                .isEqualTo("attachment; filename=\"exercise-1-johndoe.zip\"");
                verify(filesService, times(1)).getExerciseFiles(anyLong(), anyString());
        }

        @Test
        public void downloadFilesFromExercise_template() throws Exception {
                List<File> files = new ArrayList<>();
                files.add(new File("v4t-course-test/spring-boot-course/template/ej1.txt"));
                files.add(new File("v4t-course-test/spring-boot-course/template/ej2.txt"));
                for (File file : files) {
                        file.getParentFile().mkdirs();
                        file.createNewFile();
                }
                when(filesService.getExerciseFiles(1l, "johndoe")).thenReturn(files);

                MvcResult result = mockMvc
                                .perform(get("/api/exercises/1/files").contentType("application/zip")
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();
                logger.info(result.toString());

                assertThat(result.getResponse().getHeader("Content-Disposition"))
                                .isEqualTo("attachment; filename=\"template-1.zip\"");
                verify(filesService, times(1)).getExerciseFiles(anyLong(), anyString());
        }

        @Test
        public void uploadFile() throws Exception {
                // Create files
                Files.createDirectories(Paths.get("test-uploads/"));
                Path file1 = Files.write(Paths.get("test-uploads/ex1.html"), "<html>Exercise 1</html>".getBytes());
                MockMultipartFile mockFile1 = new MockMultipartFile("file", file1.getFileName().toString(), "text/html",
                                new FileInputStream(file1.toFile()));

                MvcResult result = mockMvc
                                .perform(multipart("/api/exercises/1/files").file(mockFile1).header("Authorization",
                                                "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();

                UploadFileResponse expectedResponse = new UploadFileResponse(mockFile1.getOriginalFilename(),
                                mockFile1.getContentType(), mockFile1.getSize());
                assertThat(result.getResponse().getContentAsString())
                                .isEqualToIgnoringWhitespace(objectMapper.writeValueAsString(expectedResponse));
                verify(filesService, times(1)).saveExerciseFiles(anyLong(), any(MultipartFile[].class), anyString());
        }

        @Test
        public void uploadMultipleFiles() throws Exception {
                // Create files
                Files.createDirectories(Paths.get("test-uploads/"));
                Path file1 = Files.write(Paths.get("test-uploads/ex1.html"), "<html>Exercise 1</html>".getBytes());
                MockMultipartFile mockFile1 = new MockMultipartFile("files", file1.getFileName().toString(),
                                "text/html", new FileInputStream(file1.toFile()));
                Path file2 = Files.write(Paths.get("test-uploads/ex2.html"), "<html>Exercise 2</html>".getBytes());
                MockMultipartFile mockFile2 = new MockMultipartFile("files", file2.getFileName().toString(),
                                "text/html", new FileInputStream(file2.toFile()));

                MvcResult result = mockMvc
                                .perform(multipart("/api/exercises/1/files/multi").file(mockFile1).file(mockFile2)
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();

                UploadFileResponse expectedResponse1 = new UploadFileResponse(mockFile1.getOriginalFilename(),
                                mockFile1.getContentType(), mockFile1.getSize());
                UploadFileResponse expectedResponse2 = new UploadFileResponse(mockFile2.getOriginalFilename(),
                                mockFile2.getContentType(), mockFile2.getSize());
                assertThat(result.getResponse().getContentAsString()).isEqualToIgnoringWhitespace(
                                objectMapper.writeValueAsString(Arrays.asList(expectedResponse1, expectedResponse2)));
                verify(filesService, times(1)).saveExerciseFiles(anyLong(), any(MultipartFile[].class), anyString());
        }

        @Test
        public void uploadFile_noBody() throws Exception {
                mockMvc.perform(multipart("/api/exercises/1/files").header("Authorization",
                                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isBadRequest());

        }

        @Test
        public void uploadFile_noMultipart() throws Exception {

                mockMvc.perform(post("/api/exercises/1/files").header("Authorization",
                                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isBadRequest());
        }
}