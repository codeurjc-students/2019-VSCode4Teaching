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

import java.util.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CourseDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UserRequest;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.views.CourseViews;
import com.vscode4teaching.vscode4teachingserver.model.views.UserViews;
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
public class CourseControllerTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CourseService courseService;

    private JWTResponse jwtToken;
    private static final Logger logger = LoggerFactory.getLogger(CourseControllerTests.class);

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
    public void getCourse() throws Exception {
        logger.info("Test getCourse() begins.");

        Course course = new Course("Spring Boot Course");

        when(courseService.getCourseById(1L)).thenReturn(Optional.of(course));

        MvcResult mvcResult = mockMvc.perform(get("/api/courses/1").contentType("application/json").with(csrf())
                .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getCourseById(1L);
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(course);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test getCourse() ends.");
    }

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

        MvcResult mvcResult = mockMvc.perform(get("/api/courses").contentType("application/json").with(csrf()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getAllCourses();
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(courses);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test getAllCourses_withContent() ends.");
    }

    @Test
    public void getAllCourses_empty() throws Exception {
        logger.info("Test getAllCourses_empty() begins.");

        List<Course> courses = new ArrayList<>();
        when(courseService.getAllCourses()).thenReturn(courses);

        MvcResult mvcResult = mockMvc.perform(get("/api/courses").contentType("application/json").with(csrf()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isNoContent()).andReturn();

        verify(courseService, times(1)).getAllCourses();
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = "";
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test getAllCourses_empty() ends.");
    }

    @Test
    public void getCreator_valid() throws Exception {
        logger.info("Test getCreator_valid() begins.");

        User user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        when(courseService.getCreator(anyLong())).thenReturn(user);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/courses/1/creator").contentType("application/json")
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()).with(csrf()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getCreator(anyLong());
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(UserViews.GeneralView.class).writeValueAsString(user);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test getCreator_valid() ends.");
    }

    @Test
    public void postCourse_valid() throws Exception {
        logger.info("Test postCourse_valid() begins.");

        CourseDTO course = new CourseDTO();
        course.setName("Spring Boot Course");
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1L);
        when(courseService.registerNewCourse(any(Course.class), anyString())).thenReturn(expectedCourse);

        MvcResult mvcResult = mockMvc
                .perform(post("/api/courses").contentType("application/json").with(csrf())
                        .content(objectMapper.writeValueAsString(course))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isCreated()).andReturn();

        ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);
        verify(courseService, times(1)).registerNewCourse(courseCaptor.capture(), anyString());
        assertThat(courseCaptor.getValue().getName()).isEqualTo("Spring Boot Course");
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(expectedCourse);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test postCourse_valid() ends.");
    }

    @Test
    public void postCourse_invalid() throws Exception {
        logger.info("Test postCourse_invalid() begins.");

        CourseDTO course = new CourseDTO();
        mockMvc.perform(post("/api/courses").contentType("application/json").with(csrf())
                .header("Authorization", "Bearer " + jwtToken.getJwtToken())
                .content(objectMapper.writeValueAsString(course))).andExpect(status().isBadRequest());

        // Business logic should not be called.
        verify(courseService, times(0)).registerNewCourse(any(Course.class), anyString());

        logger.info("Test postCourse_invalid() ends.");
    }

    @Test
    public void editCourse_valid() throws Exception {
        logger.info("Test editCourse_valid() begins.");

        CourseDTO course = new CourseDTO();
        Course expectedCourse = new Course("Spring Boot Course v2");
        course.setName("Spring Boot Course v2");
        when(courseService.editCourse(anyLong(), any(Course.class), anyString())).thenReturn(expectedCourse);
        MvcResult mvcResult = mockMvc
                .perform(put("/api/courses/1").contentType("application/json").with(csrf())
                        .content(objectMapper.writeValueAsString(course))
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();

        ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);
        verify(courseService, times(1)).editCourse(anyLong(), courseCaptor.capture(), anyString());
        assertThat(courseCaptor.getValue().getName()).isEqualTo("Spring Boot Course v2");
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(expectedCourse);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

        logger.info("Test editCourse_valid() ends.");
    }

    @Test
    public void deleteCourse_valid() throws Exception {
        logger.info("Test deleteCourse_valid() begins.");
        mockMvc.perform(delete("/api/courses/1").contentType("application/json").with(csrf()).header("Authorization",
                "Bearer " + jwtToken.getJwtToken())).andExpect(status().isNoContent());

        verify(courseService, times(1)).deleteCourse(anyLong(), anyString());

        logger.info("Test deleteCourse_valid() ends.");
    }

    @Test
    public void getUserCourses_valid() throws Exception {
        logger.info("Test getUserCourses_valid() begins.");
        List<Course> courses = new ArrayList<>();
        Course c0 = new Course("Spring Boot Course");
        Course c1 = new Course("Angular Course");
        Course c2 = new Course("VS Code API Course");

        courses.add(c0);
        courses.add(c1);
        courses.add(c2);
        User user = new User("johndoe@john.com", "johndoejr", "password", "John", "Doe");
        user.setCourses(courses);
        user.setId(4L);
        when(courseService.getUserCourses(4L)).thenReturn(courses);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/users/4/courses").contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andExpect(status().isOk()).andReturn();

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(courses);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        verify(courseService, times(1)).getUserCourses(anyLong());

        logger.info("Test getUserCourses_valid() ends.");
    }

    @Test
    public void addUserToCourse_valid() throws Exception {
        logger.info("Test addUserToCourse_valid() begins.");

        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Set<User> expectedUsers = new HashSet<>();
        expectedUsers.add(newUser1);
        expectedUsers.add(newUser2);
        expectedUsers.add(teacher);

        UserRequest request = new UserRequest();
        Long[] ids = {1L, 5L};
        request.setIds(ids);
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1L);
        expectedCourse.addUserInCourse(teacher);
        expectedCourse.addUserInCourse(newUser1);
        expectedCourse.addUserInCourse(newUser2);
        when(courseService.addUsersToCourse(anyLong(), any(Long[].class), anyString())).thenReturn(expectedCourse);
        String requestString = objectMapper.writeValueAsString(request);

        MvcResult mvcResult = mockMvc
                .perform(post("/api/courses/1/users").contentType("application/json").with(csrf())
                        .content(requestString).header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.UsersView.class)
                .writeValueAsString(expectedCourse);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        verify(courseService, times(1)).addUsersToCourse(anyLong(), any(Long[].class), anyString());

        logger.info("Test addUserToCourse_valid() ends.");
    }

    @Test
    public void getUsersInCourse_valid() throws Exception {
        logger.info("Test getUsersInCourse_valid() begins.");

        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Set<User> expectedUsers = new HashSet<>();
        expectedUsers.add(newUser1);
        expectedUsers.add(newUser2);
        expectedUsers.add(teacher);
        when(courseService.getUsersInCourse(anyLong(), anyString())).thenReturn(expectedUsers);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/courses/1/users").contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(UserViews.GeneralView.class)
                .writeValueAsString(expectedUsers);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        verify(courseService, times(1)).getUsersInCourse(anyLong(), anyString());

        logger.info("Test getUsersInCourse_valid() ends.");
    }

    @Test
    public void removeUsersFromCourse_valid() throws Exception {
        logger.info("Test removeUsersFromCourse_valid() begins.");

        User newUser1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr");
        newUser1.setId(1L);
        User newUser2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        newUser2.setId(5L);
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2L);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3L);
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe ");
        teacher.setId(4L);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        newUser1.addRole(studentRole);
        newUser2.addRole(studentRole);
        Set<User> expectedUsers = new HashSet<>();
        expectedUsers.add(newUser1);
        expectedUsers.add(newUser2);
        expectedUsers.add(teacher);

        UserRequest request = new UserRequest();
        Long[] ids = {1L, 5L};
        request.setIds(ids);
        Course expectedCourse = new Course("Spring Boot Course");
        expectedCourse.setId(1L);
        expectedCourse.addUserInCourse(teacher);
        when(courseService.removeUsersFromCourse(anyLong(), any(Long[].class), anyString())).thenReturn(expectedCourse);
        String requestString = objectMapper.writeValueAsString(request);

        MvcResult mvcResult = mockMvc
                .perform(delete("/api/courses/1/users").contentType("application/json").with(csrf())
                        .content(requestString).header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.UsersView.class)
                .writeValueAsString(expectedCourse);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        verify(courseService, times(1)).removeUsersFromCourse(anyLong(), any(Long[].class), anyString());

        logger.info("Test removeUsersFromCourse_valid() ends.");
    }

    @Test
    public void getCode_valid() throws Exception {
        Course c0 = new Course("Spring Boot Course");
        c0.setId(1L);
        String code = c0.getUuid();
        User user = new User("johndoe@john.com", "johndoejr", "password", "John", "Doe");
        user.addCourse(c0);
        user.setId(4L);

        when(courseService.getCourseCode(1L, "johndoe")).thenReturn(code);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/courses/1/code").contentType("application/json").with(csrf()).header("Authorization",
                        "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getCourseCode(1L, "johndoe");
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        assertThat(code).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void getCourseInformationBySharingCode_valid() throws Exception {
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        String courseUuid = course.getUuid();
        User user = new User("johndoe@john.com", "johndoejr", "password", "John", "Doe");
        user.addCourse(course);
        user.setId(4L);

        when(courseService.getCourseInformationWithSharingCode(courseUuid)).thenReturn(course);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/v2/courses/code/" + courseUuid).contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).getCourseInformationWithSharingCode(courseUuid);

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.CreatorView.class)
                .writeValueAsString(course);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void joinCourse_valid() throws Exception {
        Course course = new Course("Spring Boot Course");
        course.setId(1L);
        String courseUuid = course.getUuid();

        when(courseService.joinCourseWithSharingCode(courseUuid, "johndoe")).thenReturn(course);

        MvcResult mvcResult = mockMvc
                .perform(put("/api/courses/code/" + courseUuid).contentType("application/json").with(csrf())
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()))
                .andDo(MockMvcResultHandlers.print()).andExpect(status().isOk()).andReturn();

        verify(courseService, times(1)).joinCourseWithSharingCode(courseUuid, "johndoe");

        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CourseViews.ExercisesView.class)
                .writeValueAsString(course);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }
}
