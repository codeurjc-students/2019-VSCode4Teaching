package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentThreadRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.CommentServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(locations = "classpath:test.properties")
public class CommentServiceImplTests {

    @Mock
    private ExerciseFileRepository exerciseFileRepository;

    @Mock
    private CommentThreadRepository commentThreadRepository;

    @Mock
    private CommentRepository commentRepository;
    
    @InjectMocks
    private CommentServiceImpl commentServiceImpl;

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImplTests.class);

    @Test
    public void saveCommentThread() throws FileNotFoundException {
        logger.info("Start saveCommentThread");
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1l);
        CommentThread commentThread = new CommentThread(demoFile, 0l);
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0l);
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
        when(exerciseFileRepository.findById(1l)).thenReturn(Optional.of(demoFile));
        when(exerciseFileRepository.save(any(ExerciseFile.class))).thenReturn(expectedFile);
        when(commentThreadRepository.save(commentThread)).thenReturn(expectedCommentThread);
        when(commentRepository.save(any(Comment.class))).thenReturn(null);

        CommentThread savedCommentThread = commentServiceImpl.saveCommentThread(1l, commentThread);
        
        assertThat(savedCommentThread.getId()).isEqualTo(2l);
        assertThat(savedCommentThread.getLine()).isEqualTo(0);
        List<Comment> commentList = savedCommentThread.getComments();
        assertThat(commentList.size()).isEqualTo(2);
        for (int i = 0; i < commentList.size(); i++) {
            assertThat(commentList.get(i).getAuthor()).isEqualTo("johndoe");
            assertThat(commentList.get(i).getBody()).isEqualTo("Test " + (i + 1));
            assertThat(commentList.get(i).getThread()).isEqualTo(expectedCommentThread);
        }
        verify(exerciseFileRepository, times(1)).findById(1l);
        verify(exerciseFileRepository, times(1)).save(any(ExerciseFile.class));

        logger.info("End saveCommentThread");
    }

    @Test
    public void getCommentThreadByFile() throws FileNotFoundException {
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1l);
        CommentThread commentThread = new CommentThread(demoFile, 0l);
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0l);
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
        when(exerciseFileRepository.findById(1l)).thenReturn(Optional.of(expectedFile));

        List<CommentThread> savedCommentThread = commentServiceImpl.getCommentThreadsByFile(1l);

        assertThat(savedCommentThread.get(0).getId()).isEqualTo(2l);
        assertThat(savedCommentThread.get(0).getLine()).isEqualTo(0);
        List<Comment> commentList = savedCommentThread.get(0).getComments();
        assertThat(commentList.size()).isEqualTo(2);
        for (int i = 0; i < commentList.size(); i++) {
            assertThat(commentList.get(i).getAuthor()).isEqualTo("johndoe");
            assertThat(commentList.get(i).getBody()).isEqualTo("Test " + (i + 1));
            assertThat(commentList.get(i).getThread()).isEqualTo(expectedCommentThread);
        }
        verify(exerciseFileRepository, times(1)).findById(1l);
    }
}