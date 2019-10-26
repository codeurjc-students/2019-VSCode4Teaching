package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseFilesService;

import org.assertj.core.util.Files;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

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

        MvcResult loginResult = mockMvc.perform(
                post("/api/login").contentType("application/json").content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isOk()).andReturn();
        jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(), JWTResponse.class);
    }

    @AfterEach
    public void cleanup() {
        // Cleanup
        Files.delete(new File("v4t-courses-test/"));
    }

    @Test
    public void downloadFilesFromExercise_exercise() throws Exception {
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-courses-test/spring-boot-course/johndoe/ej1.txt"));
        files.add(new File("v4t-courses-test/spring-boot-course/johndoe/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        when(filesService.getExerciseFiles(1l, "johndoe")).thenReturn(files);

        MvcResult result = mockMvc.perform(get("/api/exercises/1/files").contentType("application/zip")
                .header("Authorization", "Bearer " + jwtToken.getJwtToken())).andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"exercise-1-johndoe.zip\"");
    }

    @Test
    public void downloadFilesFromExercise_template() throws Exception {
        List<File> files = new ArrayList<>();
        files.add(new File("v4t-courses-test/spring-boot-course/template/ej1.txt"));
        files.add(new File("v4t-courses-test/spring-boot-course/template/ej2.txt"));
        for (File file : files) {
            file.getParentFile().mkdirs();
            file.createNewFile();
        }
        when(filesService.getExerciseFiles(1l, "johndoe")).thenReturn(files);

        MvcResult result = mockMvc.perform(get("/api/exercises/1/files").contentType("application/zip")
                .header("Authorization", "Bearer " + jwtToken.getJwtToken())).andExpect(status().isOk()).andReturn();
        logger.info(result.toString());

        assertThat(result.getResponse().getHeader("Content-Disposition"))
                .isEqualTo("attachment; filename=\"template-1.zip\"");
    }
}