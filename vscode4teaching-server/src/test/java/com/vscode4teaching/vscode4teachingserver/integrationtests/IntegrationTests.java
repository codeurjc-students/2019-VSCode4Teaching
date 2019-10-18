package com.vscode4teaching.vscode4teachingserver.integrationtests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.model.Course;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Databse is initialized in class DatabaseInitializer
@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class IntegrationTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void login_into_createCourse() throws Exception {
        JWTRequest jwtRequest = new JWTRequest();
        jwtRequest.setUsername("johndoe");
        jwtRequest.setPassword("teacherpassword");

        MvcResult loginResult = mockMvc.perform(
                post("/api/login").contentType("application/json").content(objectMapper.writeValueAsString(jwtRequest)))
                .andExpect(status().isOk()).andReturn();
        JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                JWTResponse.class);
        CourseDTO course = new CourseDTO();
        course.setName("Spring Boot Course");

        MvcResult mvcResult = mockMvc
                .perform(post("/api/courses").contentType("application/json")
                        .content(objectMapper.writeValueAsString(course))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isCreated()).andReturn();

        Course actualResponse = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Course.class);
        assertThat(actualResponse.getName()).isEqualTo(course.getName());
    }
}