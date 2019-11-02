package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.UserDTO;
import com.vscode4teaching.vscode4teachingserver.controllertests.utils.MockAuthentication;
import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.views.UserViews;
import com.vscode4teaching.vscode4teachingserver.security.jwt.JWTTokenUtil;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.JWTUserDetailsService;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class JWTLoginControllerTests {
        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private JWTTokenUtil jwtTokenUtil;
        @MockBean
        private JWTUserDetailsService userService;
        @MockBean
        private AuthenticationManager authenticationManager;
        @Autowired
        private PasswordEncoder bEncoder;

        // Uses DatabaseInitializer for initializing users in database
        @Test
        public void login() throws Exception {
                List<GrantedAuthority> roles = new ArrayList<>();
                roles.add(new SimpleGrantedAuthority("ROLE_STUDENT"));
                roles.add(new SimpleGrantedAuthority("ROLE_TEACHER"));
                User expectedUser = new User("johndoe", "teacherpassword", roles);
                when(userService.loadUserByUsername(anyString())).thenReturn(expectedUser);
                when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                                .thenReturn(new MockAuthentication());
                when(jwtTokenUtil.generateToken(any(UserDetails.class))).thenReturn("mockToken");
                JWTRequest jwtRequest = new JWTRequest();
                jwtRequest.setUsername("johndoe");
                jwtRequest.setPassword("teacherpassword");

                mockMvc.perform(post("/api/login").contentType("application/json").with(csrf())
                                .content(objectMapper.writeValueAsString(jwtRequest))).andExpect(status().isOk())
                                .andExpect(jsonPath("$.jwtToken", equalTo("mockToken")));

                ArgumentCaptor<String> usernameCaptor = ArgumentCaptor.forClass(String.class);
                verify(userService, times(1)).loadUserByUsername(usernameCaptor.capture());
                assertThat(usernameCaptor.getValue()).isEqualTo("johndoe");
        }

        @Test
        public void register() throws Exception {
                Role studentRole = new Role("ROLE_STUDENT");
                studentRole.setId(2l);
                com.vscode4teaching.vscode4teachingserver.model.User expectedUser = new com.vscode4teaching.vscode4teachingserver.model.User(
                                "johndoe@gmail.com", "johndoe", bEncoder.encode("password"), "John", "Doe");
                expectedUser.setId(1l);
                expectedUser.setRoles(Arrays.asList(studentRole));
                UserDTO userDTO = new UserDTO();
                userDTO.setEmail("johndoe@gmail.com");
                userDTO.setUsername("johndoe");
                userDTO.setPassword("password");
                userDTO.setName("John");
                userDTO.setLastName("Doe");
                when(userService.save(any(com.vscode4teaching.vscode4teachingserver.model.User.class), eq(false)))
                                .thenReturn(expectedUser);

                MvcResult mvcResult = mockMvc
                                .perform(post("/api/register").contentType("application/json").with(csrf())
                                                .content(objectMapper.writeValueAsString(userDTO)))
                                .andExpect(status().isCreated()).andReturn();

                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(UserViews.GeneralView.class)
                                .writeValueAsString(expectedUser);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        }

        @Test
        @WithMockUser(roles = { "STUDENT", "TEACHER" })
        public void registerTeacher() throws Exception {
                Role studentRole = new Role("ROLE_STUDENT");
                studentRole.setId(2l);
                Role teacherRole = new Role("ROLE_TEACHER");
                teacherRole.setId(3l);
                com.vscode4teaching.vscode4teachingserver.model.User expectedUser = new com.vscode4teaching.vscode4teachingserver.model.User(
                                "johndoe@gmail.com", "johndoe", bEncoder.encode("password"), "John", "Doe");
                expectedUser.setId(1l);
                expectedUser.setRoles(Arrays.asList(studentRole, teacherRole));
                UserDTO userDTO = new UserDTO();
                userDTO.setEmail("johndoe@gmail.com");
                userDTO.setUsername("johndoe");
                userDTO.setPassword("password");
                userDTO.setName("John");
                userDTO.setLastName("Doe");
                when(userService.save(any(com.vscode4teaching.vscode4teachingserver.model.User.class), eq(true)))
                                .thenReturn(expectedUser);

                MvcResult mvcResult = mockMvc
                                .perform(post("/api/teachers/register").contentType("application/json").with(csrf())
                                                .content(objectMapper.writeValueAsString(userDTO)))
                                .andExpect(status().isCreated()).andReturn();

                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(UserViews.GeneralView.class)
                                .writeValueAsString(expectedUser);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        }

        @Test
        @WithMockUser(roles = { "STUDENT", "TEACHER" })
        public void getCurrentUser() throws Exception {

                Role studentRole = new Role("ROLE_STUDENT");
                studentRole.setId(2l);
                Role teacherRole = new Role("ROLE_TEACHER");
                teacherRole.setId(3l);
                com.vscode4teaching.vscode4teachingserver.model.User expectedUser = new com.vscode4teaching.vscode4teachingserver.model.User(
                                "johndoe@gmail.com", "johndoe", bEncoder.encode("password"), "John", "Doe");
                expectedUser.setId(1l);
                expectedUser.setRoles(Arrays.asList(studentRole, teacherRole));
                Course course = new Course("Spring Boot Course");
                course.addUserInCourse(expectedUser);
                course.setId(4l);
                expectedUser.addCourse(course);
                when(userService.findByUsername("johndoe")).thenReturn(expectedUser);
                when(jwtTokenUtil.getUsernameFromToken(any(HttpServletRequest.class))).thenReturn("johndoe");
                MvcResult mvcResult = mockMvc.perform(get("/api/currentuser").contentType("application/json").with(csrf()))
                                .andExpect(status().isOk()).andReturn();
                String actualResponseBody = mvcResult.getResponse().getContentAsString();
                String expectedResponseBody = objectMapper.writerWithView(UserViews.CourseView.class)
                                .writeValueAsString(expectedUser);
                assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
        }
}