package com.vscode4teaching.vscode4teachingserver.controllertests;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;

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

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class CourseControllerTests {
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private CourseService courseService;

        private static final Logger logger = LoggerFactory.getLogger(CourseControllerTests.class);

        @Test
        public void getAllCourses_withContent() throws Exception {
                logger.info("Test getAllCourses_withContent() begins.");

                List<Course> courses = new ArrayList<>();
                Course c0 = new Course("Spring Boot Course");
                Course c1 = new Course("Angular Course");
                Course c2 = new Course("VS Code API Course");

                courses.add(c0);
                courses.add(c1);
                courses.add(c2);
                when(courseService.getAllCourses()).thenReturn(courses);

                MvcResult mvcResult = mockMvc.perform(get("/api/courses").contentType("application/json"))
                                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

                verify(courseService, times(1)).getAllCourses();
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(CourseViews.GeneralView.class)
                                .writeValueAsString(courses);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test getAllCourses_withContent() ends.");
        }

        @Test
        public void getAllCourses_empty() throws Exception {
                logger.info("Test getAllCourses_empty() begins.");

                List<Course> courses = new ArrayList<>();
                when(courseService.getAllCourses()).thenReturn(courses);

                MvcResult mvcResult = mockMvc.perform(get("/api/courses").contentType("application/json"))
                                .andDo(MockMvcResultHandlers.print()).andExpect(status().isNoContent()).andReturn();

                verify(courseService, times(1)).getAllCourses();
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = "";
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test getAllCourses_empty() ends.");
        }

        @Test
        public void postCourse_valid() throws Exception {
                logger.info("Test postCourse_valid() begins.");

                CourseDTO course = new CourseDTO();
                course.setName("Spring Boot Course");
                Course expectedCourse = new Course("Spring Boot Course");
                expectedCourse.setId(1l);
                when(courseService.registerNewCourse(any(Course.class), anyLong(), anyString()))
                                .thenReturn(expectedCourse);
                // Get token
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                MvcResult loginResult = mockMvc
                                .perform(post("/api/login").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(jwtRequest)))
                                .andExpect(status().isOk()).andReturn();
                JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                                JWTResponse.class);

                MvcResult mvcResult = mockMvc
                                .perform(post("/api/teachers/20/courses").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(course))
                                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andExpect(status().isCreated()).andReturn();

                ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);
                verify(courseService, times(1)).registerNewCourse(courseCaptor.capture(), anyLong(), anyString());
                assertThat(courseCaptor.getValue().getName()).isEqualTo("Spring Boot Course");
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(CourseViews.GeneralView.class)
                                .writeValueAsString(expectedCourse);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

                logger.info("Test postCourse_valid() ends.");
        }

        @Test
        public void postCourse_invalid() throws Exception {
                logger.info("Test postCourse_invalid() begins.");

                CourseDTO course = new CourseDTO();
                // Get token
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                MvcResult loginResult = mockMvc
                                .perform(post("/api/login").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(jwtRequest)))
                                .andExpect(status().isOk()).andReturn();
                JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                                JWTResponse.class);
                mockMvc.perform(post("/api/teachers/20/courses").contentType("application/json").header("Authorization", "Bearer " + jwtToken.getJwtToken())
                                .content(objectMapper.writeValueAsString(course))).andExpect(status().isBadRequest());

                // Business logic should not be called.
                verify(courseService, times(0)).registerNewCourse(any(Course.class), anyLong(), anyString());

                logger.info("Test postCourse_invalid() ends.");
        }

        @Test
        public void addExercise_valid() throws Exception {
                logger.info("Test addExercise_valid() begins.");

                Course course = new Course("Spring Boot Course");
                Long courseId = 1l;
                course.setId(courseId);
                Exercise exercise = new Exercise("Spring Boot Exercise 1");
                Course expectedCourse = new Course("Spring Boot Course");
                expectedCourse.setId(courseId);
                expectedCourse.addExercise(exercise);
                ExerciseDTO exerciseDTO = new ExerciseDTO();
                exerciseDTO.setName("Spring Boot Exercise 1");
                when(courseService.addExerciseToCourse(any(Long.class), any(Exercise.class), anyString()))
                                .thenReturn(expectedCourse);
                // Get token
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                MvcResult loginResult = mockMvc
                                .perform(post("/api/login").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(jwtRequest)))
                                .andExpect(status().isOk()).andReturn();
                JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                                JWTResponse.class);
                MvcResult mvcResult = mockMvc.perform(post("/api/courses/{courseId}/exercises", courseId)
                                .contentType("application/json").content(objectMapper.writeValueAsString(exerciseDTO))
                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                                .andDo(MockMvcResultHandlers.print()).andExpect(status().isCreated()).andReturn();

                ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
                verify(courseService, times(1)).addExerciseToCourse(any(Long.class), exerciseCaptor.capture(),
                                anyString());
                assertThat(exerciseCaptor.getValue().getName()).isEqualTo("Spring Boot Exercise 1");
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(CourseViews.ExercisesView.class)
                                .writeValueAsString(expectedCourse);
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
                // Get token
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                MvcResult loginResult = mockMvc
                                .perform(post("/api/login").contentType("application/json")
                                                .content(objectMapper.writeValueAsString(jwtRequest)))
                                .andExpect(status().isOk()).andReturn();
                JWTResponse jwtToken = objectMapper.readValue(loginResult.getResponse().getContentAsString(),
                                JWTResponse.class);
                mockMvc.perform(post("/api/courses/{courseId}/exercises", courseId).contentType("application/json").header("Authorization", "Bearer " + jwtToken.getJwtToken())
                                .content(objectMapper.writeValueAsString(exercise))).andExpect(status().isBadRequest());

                verify(courseService, times(0)).addExerciseToCourse(any(Long.class), any(Exercise.class), anyString());

                logger.info("Test addExercise_invalid() ends.");
        }

}