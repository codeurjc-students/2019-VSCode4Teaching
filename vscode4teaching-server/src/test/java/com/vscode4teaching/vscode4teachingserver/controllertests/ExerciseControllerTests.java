package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.ExerciseUserInfoDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseUserInfoViews;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseViews;
import com.vscode4teaching.vscode4teachingserver.services.CourseService;
import com.vscode4teaching.vscode4teachingserver.services.ExerciseInfoService;

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

    @MockBean
    private ExerciseInfoService exerciseInfoService;

    private JWTResponse jwtToken;
    private final Logger logger = LoggerFactory.getLogger(ExerciseControllerTests.class);

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

    @Test
    public void addExercise_valid() throws Exception {
        logger.info("Test addExercise_valid() begins.");

        Course course = new Course("Spring Boot Course");
        Long courseId = 1l;
        course.setId(courseId);
        Exercise expectedExercise = new Exercise();
        expectedExercise.setName("Spring Boot Exercise 1");
        expectedExercise.setId(2l);
        expectedExercise.setCourse(course);
        ExerciseDTO exerciseDTO = new ExerciseDTO();
        exerciseDTO.setName("Spring Boot Exercise 1");
        when(courseService.addExerciseToCourse(any(Long.class), any(Exercise.class), anyString()))
                .thenReturn(expectedExercise);

        MvcResult mvcResult = mockMvc
                .perform(post("/api/courses/{courseId}/exercises", courseId).contentType("application/json")
                        .with(csrf()).content(objectMapper.writeValueAsString(exerciseDTO))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isCreated()).andReturn();

        ArgumentCaptor<Exercise> exerciseCaptor = ArgumentCaptor.forClass(Exercise.class);
        verify(courseService, times(1)).addExerciseToCourse(any(Long.class), exerciseCaptor.capture(), anyString());
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

        mockMvc.perform(post("/api/courses/{courseId}/exercises", courseId).contentType("application/json").with(csrf())
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
        Exercise exercise1 = new Exercise();
        exercise1.setName("Spring Boot Exercise 1");
        exercise1.setId(2l);
        exercise1.setCourse(course);
        Exercise exercise2 = new Exercise();
        exercise2.setName("Spring Boot Exercise 2");
        exercise2.setId(3l);
        exercise2.setCourse(course);
        course.addExercise(exercise1);
        course.addExercise(exercise2);
        List<Exercise> exercises = new ArrayList<>(Arrays.asList(exercise1, exercise2));
        when(courseService.getExercises(anyLong(), anyString())).thenReturn(exercises);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/courses/{courseId}/exercises", courseId).contentType("application/json").with(csrf())
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
        Exercise expectedExercise = new Exercise();
        expectedExercise.setName("Spring Boot Exercise 1 v2");
        expectedExercise.setId(1l);
        expectedExercise.setCourse(new Course("Spring Boot Course"));
        exercise.setName("Spring Boot Exercise 1 v2");
        when(courseService.editExercise(anyLong(), any(Exercise.class), anyString())).thenReturn(expectedExercise);
        MvcResult mvcResult = mockMvc
                .perform(put("/api/exercises/1").contentType("application/json").with(csrf())
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
        mockMvc.perform(delete("/api/exercises/1").contentType("application/json").with(csrf()).header("Authorization",
                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isNoContent());

        verify(courseService, times(1)).deleteExercise(anyLong(), anyString());

        logger.info("Test deleteExercise_valid() ends.");
    }

    @Test
    public void getCode_valid() throws Exception {
        Exercise ex = new Exercise("Spring Boot Exercise 1");
        ex.setId(1l);
        String code = ex.getUuid();

        when(courseService.getExerciseCode(1l, "johndoe")).thenReturn(code);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/exercises/1/code").contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getExerciseCode(1l, "johndoe");
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = code;
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void getExerciseInfo_valid() throws Exception {
        Exercise ex = new Exercise("Spring Boot Exercise 1");
        ex.setId(1l);
        Role studentRole = new Role("ROLE_STUDENT");
        Role teacherRole = new Role("ROLE_TEACHER");
        User user = new User("johndoe@john.com", "johndoe", "password", "John", "Doe", studentRole);
        user.setId(4l);
        User creator = new User("johndoesr@john.com", "johndoesr", "passwordsr", "John", "Doe Sr", studentRole, teacherRole);
        creator.setId(15l);
        Course course = new Course("Spring Boot Course");
        course.addExercise(ex);
        ex.setCourse(course);
        course.setCreator(creator);
        course.addUserInCourse(user);
        ExerciseUserInfo eui = new ExerciseUserInfo(ex, user);
        when(exerciseInfoService.getExerciseUserInfo(1l, "johndoe")).thenReturn(eui);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/exercises/1/info").contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(exerciseInfoService, times(1)).getExerciseUserInfo(1l, "johndoe");
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(ExerciseUserInfoViews.GeneralView.class)
                .writeValueAsString(eui);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void updateExerciseUserInfo_valid() throws Exception {
        Exercise ex = new Exercise("Spring Boot Exercise 1");
        ex.setId(1l);
        User user = new User("johndoe@john.com", "johndoe", "password", "John", "Doe");
        user.setId(4l);
        ExerciseUserInfoDTO euiDTO = new ExerciseUserInfoDTO();
        euiDTO.setStatus(1);
        euiDTO.setLastModifiedFile("/sample");
        ExerciseUserInfo updatedEui = new ExerciseUserInfo(ex, user);
        updatedEui.setStatus(1);
        when(exerciseInfoService.updateExerciseUserInfo(1l, "johndoe", 1, "/sample")).thenReturn(updatedEui);

        MvcResult mvcResult = mockMvc
                .perform(put("/api/exercises/1/info").contentType("application/json").with(csrf())
                        .content(objectMapper.writeValueAsString(euiDTO))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(ExerciseUserInfoViews.GeneralView.class)
                .writeValueAsString(updatedEui);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void getAllStudentExerciseUserInfo_valid() throws Exception {
        // Set up courses and exercises
        Course course = new Course("Spring Boot Course");
        Exercise exercise = new Exercise("Exercise 1", course);
        exercise.setId(10l);
        // Set up users
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        User student1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr 1");
        student1.addRole(studentRole);
        student1.addCourse(course);
        course.addUserInCourse(student1);
        User student2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        student2.addRole(studentRole);
        student2.addCourse(course);
        course.addUserInCourse(student2);
        // Set up EUIs
        ExerciseUserInfo euiStudent1 = new ExerciseUserInfo(exercise, student1);
        ExerciseUserInfo euiStudent2 = new ExerciseUserInfo(exercise, student2);
        euiStudent2.setStatus(1);
        List<ExerciseUserInfo> expectedList = new ArrayList<>(2);
        expectedList.add(euiStudent1);
        expectedList.add(euiStudent2);
        when(exerciseInfoService.getAllStudentExerciseUserInfo(10l, "johndoe")).thenReturn(expectedList);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/exercises/10/info/teacher").contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(ExerciseUserInfoViews.GeneralView.class)
                .writeValueAsString(expectedList);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }
}