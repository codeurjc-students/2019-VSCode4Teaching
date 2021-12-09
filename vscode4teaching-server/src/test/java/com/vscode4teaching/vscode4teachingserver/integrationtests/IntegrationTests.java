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
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

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

        MvcResult loginResult = mockMvc.perform(post("/api/login").contentType("application/json").with(csrf())
                .content(objectMapper.writeValueAsString(jwtRequest))).andExpect(status().isOk()).andReturn();
        JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                JWTResponse.class);
        CourseDTO course = new CourseDTO();
        course.setName("Spring Boot Course");

        MvcResult mvcResult = mockMvc
                .perform(post("/api/courses").contentType("application/json").with(csrf())
                        .content(objectMapper.writeValueAsString(course))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isCreated()).andReturn();

        Course actualResponse = objectMapper.readValue(mvcResult.getResponse().getContentAsString(), Course.class);
        assertThat(actualResponse.getName()).isEqualTo(course.getName());
    }

    // Login, try to create course without body (fails with bad request) and token
    // doesn't get invalidated on error
    @Test
    public void expectError() throws Exception {
        JWTRequest jwtRequest = new JWTRequest();
        jwtRequest.setUsername("johndoe");
        jwtRequest.setPassword("teacherpassword");

        MvcResult loginResult = mockMvc.perform(post("/api/login").contentType("application/json").with(csrf())
                .content(objectMapper.writeValueAsString(jwtRequest))).andExpect(status().isOk()).andReturn();
        JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                JWTResponse.class);

        MvcResult mvcErrorResult = mockMvc.perform(post("/api/courses").contentType("application/json").with(csrf())
                .header("Authorization", "Bearer " + jwtToken.getJwtToken())).andExpect(status().isBadRequest())
                .andReturn();

        CourseDTO course = new CourseDTO();
        course.setName("Spring Boot Course");

        MvcResult mvcCorrectResult = mockMvc
                .perform(post("/api/courses").contentType("application/json").with(csrf())
                        .content(objectMapper.writeValueAsString(course))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isCreated()).andReturn();

        String actualErrorResponse = mvcErrorResult.getResponse().getContentAsString();
        assertThat(actualErrorResponse).isEqualTo("");
        Course actualCorrectResponse = objectMapper.readValue(mvcCorrectResult.getResponse().getContentAsString(),
                Course.class);
        assertThat(actualCorrectResponse.getName()).isEqualTo(course.getName());
    }

}