package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class ExerciseControllerTests {
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private CourseService courseService;

        private JWTResponse jwtToken;
        private final Logger logger = LoggerFactory.getLogger(ExerciseControllerTests.class);

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

        @Test
        public void addExercise_valid() throws Exception {
                logger.info("Test addExercise_valid() begins.");

                Course course = new Course("Spring Boot Course");
                Long courseId = 1l;
                course.setId(courseId);
                Exercise expectedExercise = new Exercise("Spring Boot Exercise 1");
                expectedExercise.setId(2l);
                expectedExercise.setCourse(course);
                ExerciseDTO exerciseDTO = new ExerciseDTO();
                exerciseDTO.setName("Spring Boot Exercise 1");
                when(courseService.addExerciseToCourse(any(Long.class), any(Exercise.class), anyString()))
                                .thenReturn(expectedExercise);

                MvcResult mvcResult = mockMvc.perform(post("/api/courses/{courseId}/exercises", courseId)
                                .contentType("application/json").content(objectMapper.writeValueAsString(exerciseDTO))
                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andDo(MockMvcResultHandlers.print()).andExpect(status().isCreated()).andReturn();

                ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
                verify(courseService, times(1)).addExerciseToCourse(any(Long.class), exerciseCaptor.capture(),
                                anyString());
                assertThat(exerciseCaptor.getValue().getName()).isEqualTo("Spring Boot Exercise 1");
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(ExerciseViews.CourseView.class)
                                .writeValueAsString(expectedExercise);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test addExercise_valid() ends.");
        }

        @Test
        public void addExercise_invalid() throws Exception {
                logger.info("Test addExercise_invalid() begins.");

                Course course = new Course("Spring Boot Course");
                Long courseId = 1l;
                course.setId(courseId);
                ExerciseDTO exercise = new ExerciseDTO();

                mockMvc.perform(post("/api/courses/{courseId}/exercises", courseId).contentType("application/json")
                                .header("Authorization", "Bearer " + jwtToken.getJwtToken())
                                .content(objectMapper.writeValueAsString(exercise))).andExpect(status().isBadRequest());

                verify(courseService, times(0)).addExerciseToCourse(any(Long.class), any(Exercise.class), anyString());

                logger.info("Test addExercise_invalid() ends.");
        }

        @Test
        public void getExercises_valid() throws Exception {
                logger.info("Test getExercises_valid() begins.");

                Course course = new Course("Spring Boot Course");
                Long courseId = 1l;
                course.setId(courseId);
                Exercise exercise1 = new Exercise("Spring Boot Exercise 1");
                exercise1.setId(2l);
                exercise1.setCourse(course);
                Exercise exercise2 = new Exercise("Spring Boot Exercise 2");
                exercise2.setId(3l);
                exercise2.setCourse(course);
                course.addExercise(exercise1);
                course.addExercise(exercise2);
                List<Exercise> exercises = new ArrayList<>(Arrays.asList(exercise1, exercise2));
                when(courseService.getExercises(anyLong(), anyString())).thenReturn(exercises);

                MvcResult mvcResult = mockMvc
                                .perform(get("/api/courses/{courseId}/exercises", courseId)
                                                .contentType("application/json")
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();

                verify(courseService, times(1)).getExercises(any(Long.class), anyString());
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(ExerciseViews.CourseView.class)
                                .writeValueAsString(exercises);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test getExercises_valid() ends.");
        }

        @Test
        public void editExercise_valid() throws JsonProcessingException, Exception {
                logger.info("Test editCourse_valid() begins.");

                ExerciseDTO exercise = new ExerciseDTO();
                Exercise expectedExercise = new Exercise("Spring Boot Exercise 1 v2");
                expectedExercise.setId(1l);
                expectedExercise.setCourse(new Course("Spring Boot Course"));
                exercise.setName("Spring Boot Exercise 1 v2");
                when(courseService.editExercise(anyLong(), any(Exercise.class), anyString()))
                                .thenReturn(expectedExercise);
                MvcResult mvcResult = mockMvc
                                .perform(put("/api/exercises/1").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(exercise))
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isOk()).andReturn();

                ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
                verify(courseService, times(1)).editExercise(anyLong(), exerciseCaptor.capture(), anyString());
                assertThat(exerciseCaptor.getValue().getName()).isEqualTo("Spring Boot Exercise 1 v2");
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(ExerciseViews.CourseView.class)
                                .writeValueAsString(expectedExercise);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test editCourse_valid() ends.");
        }

        @Test
        public void deleteExercise_valid() throws Exception {
                logger.info("Test deleteExercise_valid() begins.");
                mockMvc.perform(delete("/api/exercises/1").contentType("application/json").header("Authorization",
                                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isNoContent());

                verify(courseService, times(1)).deleteExercise(anyLong(), anyString());

                logger.info("Test deleteExercise_valid() ends.");
        }
}