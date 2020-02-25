package com.vscode4teaching.vscode4teachingserver.controllertests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTRequest;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.JWTResponse;
import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentThreadViews;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@TestPropertySource(locations = "classpath:test.properties")
@AutoConfigureMockMvc
public class CommentControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommentService commentService;

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

    @Test
    public void saveCommentThread() throws JsonProcessingException, Exception {
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1l);
        CommentThread commentThread = new CommentThread(demoFile, 0l, "Test line");
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0l, "Test line");
        expectedCommentThread.setId(2l);
        Comment c1 = new Comment(commentThread, "Test 1", "johndoe");
        Comment c2 = new Comment(commentThread, "Test 2", "johndoe");
        commentThread.addComment(c1);
        commentThread.addComment(c2);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3l);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4l);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("testPath");
        expectedFile.setId(1l);
        expectedFile.addCommentThread(expectedCommentThread);
        expectedCommentThread.setFile(expectedFile);
        when(commentService.saveCommentThread(anyLong(), any(CommentThread.class))).thenReturn(expectedCommentThread);

        MvcResult mvcResult = mockMvc
                .perform(
                        post("/api/files/1/comments").contentType("application/json")
                                .header("Authorization", "Bearer " + jwtToken.getJwtToken()).with(csrf())
                                .content(objectMapper.writerWithView(CommentThreadViews.CommentView.class)
                                        .writeValueAsString(commentThread)))
                .andExpect(status().isCreated()).andReturn();

        ArgumentCaptor<CommentThread> commentCaptor = ArgumentCaptor.forClass(CommentThread.class);
        verify(commentService, times(1)).saveCommentThread(anyLong(), commentCaptor.capture());
        CommentThread capturedCommentThread = commentCaptor.getValue();
        assertThat(capturedCommentThread.getLine()).isEqualTo(0l);
        List<Comment> capturedComments = capturedCommentThread.getComments();
        assertThat(capturedComments.get(0).getBody()).isEqualTo(expectedC1.getBody());
        assertThat(capturedComments.get(0).getAuthor()).isEqualTo(expectedC1.getAuthor());
        assertThat(capturedComments.get(1).getBody()).isEqualTo(expectedC2.getBody());
        assertThat(capturedComments.get(1).getAuthor()).isEqualTo(expectedC2.getAuthor());
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CommentThreadViews.CommentView.class)
                .writeValueAsString(expectedCommentThread);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);

    }

    @Test
    public void getCommentThreads() throws Exception {
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1l);
        CommentThread commentThread = new CommentThread(demoFile, 0l, "Test line");
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0l, "Test line");
        expectedCommentThread.setId(2l);
        Comment c1 = new Comment(commentThread, "Test 1", "johndoe");
        Comment c2 = new Comment(commentThread, "Test 2", "johndoe");
        commentThread.addComment(c1);
        commentThread.addComment(c2);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3l);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4l);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("testPath");
        expectedFile.setId(1l);
        expectedFile.addCommentThread(expectedCommentThread);
        expectedCommentThread.setFile(expectedFile);
        List<CommentThread> expectedCommentThreadList = new ArrayList<>();
        expectedCommentThreadList.add(expectedCommentThread);
        when(commentService.getCommentThreadsByFile(anyLong())).thenReturn(expectedCommentThreadList);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/files/1/comments").contentType("application/json")
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()).with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(commentService, times(1)).getCommentThreadsByFile(anyLong());
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(CommentThreadViews.CommentView.class)
                .writeValueAsString(expectedCommentThreadList);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }

    @Test
    public void getCommentsByUser() throws Exception {
        User user = new User("johndoe@johndoe.com", "johndoe", "johndoe", "johndoe", "johndoe");
        user.setId(10000l);
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1l);
        CommentThread commentThread = new CommentThread(demoFile, 0l, "Test line");
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0l, "Test line");
        expectedCommentThread.setId(2l);
        Comment c1 = new Comment(commentThread, "Test 1", "johndoe");
        Comment c2 = new Comment(commentThread, "Test 2", "johndoe");
        commentThread.addComment(c1);
        commentThread.addComment(c2);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3l);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4l);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("testPath");
        expectedFile.setId(1l);
        expectedFile.addCommentThread(expectedCommentThread);
        expectedCommentThread.setFile(expectedFile);
        List<CommentThread> expectedCommentThreadList = new ArrayList<>();
        expectedCommentThreadList.add(expectedCommentThread);
        Exercise ex = new Exercise("Test ex");
        ex.setId(1000l);
        ex.addUserFile(expectedFile);
        ExerciseFile expectedFile2 = new ExerciseFile("testPath2");
        expectedFile2.setId(555l);
        expectedFile2.setOwner(new User("johndoe2@johndoe.com", "johndoe2", "johndoe2", "johndoe2", "johndoe2"));
        ex.addUserFile(expectedFile2);
        List<ExerciseFile> expectedFiles = new ArrayList<>();
        expectedFiles.add(expectedFile);
        when(commentService.getFilesWithCommentsByUser(anyLong(), any(String.class))).thenReturn(expectedFiles);

        MvcResult mvcResult = mockMvc
                .perform(get("/api/users/johndoe/exercises/1000/comments").contentType("application/json")
                        .header("Authorization", "Bearer " + jwtToken.getJwtToken()).with(csrf()))
                .andExpect(status().isOk()).andReturn();

        verify(commentService, times(1)).getFilesWithCommentsByUser(anyLong(), any(String.class));
        String actualResponseBody = mvcResult.getResponse().getContentAsString();
        String expectedResponseBody = objectMapper.writerWithView(FileViews.CommentView.class)
                .writeValueAsString(expectedFiles);
        assertThat(expectedResponseBody).isEqualToIgnoringWhitespace(actualResponseBody);
    }
}