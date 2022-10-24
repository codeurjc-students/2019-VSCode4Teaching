package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.File;
import java.util.List;
import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentThreadRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
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

    @Mock
    private ExerciseRepository exerciseRepository;

    @InjectMocks
    private CommentServiceImpl commentServiceImpl;

    private static final Logger logger = LoggerFactory.getLogger(CommentServiceImplTests.class);

    @Test
    public void saveCommentThread() throws FileNotFoundException {
        logger.info("Start saveCommentThread");
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1L);
        CommentThread commentThread = new CommentThread(demoFile, 0L, "Test line");
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0L, "Test line");
        expectedCommentThread.setId(2L);
        Comment c1 = new Comment(commentThread, "Test 1", "johndoe");
        Comment c2 = new Comment(commentThread, "Test 2", "johndoe");
        commentThread.addComment(c1);
        commentThread.addComment(c2);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3L);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4L);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("testPath");
        expectedFile.setId(1L);
        expectedFile.addCommentThread(expectedCommentThread);
        when(exerciseFileRepository.findById(1L)).thenReturn(Optional.of(demoFile));
        when(exerciseFileRepository.save(any(ExerciseFile.class))).thenReturn(expectedFile);
        when(commentThreadRepository.save(commentThread)).thenReturn(expectedCommentThread);
        when(commentRepository.save(any(Comment.class))).thenReturn(null);

        CommentThread savedCommentThread = commentServiceImpl.saveCommentThread(1L, commentThread);

        assertThat(savedCommentThread.getId()).isEqualTo(2L);
        assertThat(savedCommentThread.getLine()).isEqualTo(0);
        List<Comment> commentList = savedCommentThread.getComments();
        assertThat(commentList.size()).isEqualTo(2);
        for (int i = 0; i < commentList.size(); i++) {
            assertThat(commentList.get(i).getAuthor()).isEqualTo("johndoe");
            assertThat(commentList.get(i).getBody()).isEqualTo("Test " + (i + 1));
            assertThat(commentList.get(i).getThread()).isEqualTo(expectedCommentThread);
        }
        verify(exerciseFileRepository, times(1)).findById(1L);
        verify(exerciseFileRepository, times(1)).save(any(ExerciseFile.class));

        logger.info("End saveCommentThread");
    }

    @Test
    public void getCommentThreadByFile() throws FileNotFoundException {
        ExerciseFile demoFile = new ExerciseFile("testPath");
        demoFile.setId(1L);
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0L, "Test line");
        expectedCommentThread.setId(2L);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3L);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4L);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("testPath");
        expectedFile.setId(1L);
        expectedFile.addCommentThread(expectedCommentThread);
        when(exerciseFileRepository.findById(1L)).thenReturn(Optional.of(expectedFile));

        List<CommentThread> savedCommentThread = commentServiceImpl.getCommentThreadsByFile(1L);

        assertThat(savedCommentThread.get(0).getId()).isEqualTo(2L);
        assertThat(savedCommentThread.get(0).getLine()).isEqualTo(0);
        List<Comment> commentList = savedCommentThread.get(0).getComments();
        assertThat(commentList.size()).isEqualTo(2);
        for (int i = 0; i < commentList.size(); i++) {
            assertThat(commentList.get(i).getAuthor()).isEqualTo("johndoe");
            assertThat(commentList.get(i).getBody()).isEqualTo("Test " + (i + 1));
            assertThat(commentList.get(i).getThread()).isEqualTo(expectedCommentThread);
        }
        verify(exerciseFileRepository, times(1)).findById(1L);
    }

    @Test
    public void getFilesWithCommentsByUser() throws ExerciseNotFoundException {
        ExerciseFile demoFile = new ExerciseFile("johndoe" + File.separator + "testPath");
        demoFile.setOwner(new User("johndoe@johndoe.com", "johndoe", "johndoe", "johndoe", "johndoe"));
        demoFile.setId(1L);
        CommentThread expectedCommentThread = new CommentThread(demoFile, 0L, "Test line");
        expectedCommentThread.setId(2L);
        Comment expectedC1 = new Comment(expectedCommentThread, "Test 1", "johndoe");
        expectedC1.setId(3L);
        Comment expectedC2 = new Comment(expectedCommentThread, "Test 2", "johndoe");
        expectedC2.setId(4L);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        ExerciseFile expectedFile = new ExerciseFile("johndoe" + File.separator + "testPath");
        expectedFile.setId(1L);
        expectedFile.addCommentThread(expectedCommentThread);
        expectedFile.setOwner(new User("johndoe@johndoe.com", "johndoe", "johndoe", "johndoe", "johndoe"));
        Exercise ex = new Exercise("Test ex");
        ex.setId(1000L);
        ex.addUserFile(expectedFile);
        ExerciseFile expectedFile2 = new ExerciseFile("johndoe2" + File.separator + "testPath2");
        expectedFile2.setId(555L);
        expectedFile2.setOwner(new User("johndoe2@johndoe.com", "johndoe2", "johndoe2", "johndoe2", "johndoe2"));
        ex.addUserFile(expectedFile2);
        when(exerciseRepository.findById(1000L)).thenReturn(Optional.of(ex));

        List<ExerciseFile> johndoeFiles = commentServiceImpl.getFilesWithCommentsByUser(1000L, "johndoe");
        List<ExerciseFile> johndoe2Files = commentServiceImpl.getFilesWithCommentsByUser(1000L, "johndoe2");

        verify(exerciseRepository, times(2)).findById(1000L);
        assertThat(johndoeFiles.size()).isEqualTo(1);
        assertThat(johndoeFiles.get(0).getComments().size()).isEqualTo(1);
        assertThat(johndoeFiles.get(0).getComments().get(0).getComments().size()).isEqualTo(2);
        assertThat(johndoe2Files.size()).isEqualTo(0);

    }

    @Test
    public void updateThreadLine() throws CommentNotFoundException {
        ExerciseFile demoFile = new ExerciseFile("johndoe" + File.separator + "testPath");
        demoFile.setOwner(new User("johndoe@johndoe.com", "johndoe", "johndoe", "johndoe", "johndoe"));
        demoFile.setId(1L);
        CommentThread commentThread = new CommentThread(demoFile, 0L, "Test line");
        commentThread.setId(2L);
        Comment expectedC1 = new Comment(commentThread, "Test 1", "johndoe");
        expectedC1.setId(3L);
        Comment expectedC2 = new Comment(commentThread, "Test 2", "johndoe");
        expectedC2.setId(4L);
        commentThread.addComment(expectedC1);
        commentThread.addComment(expectedC2);
        CommentThread expectedCommentThread = new CommentThread(demoFile, 5L, "Test line 5");
        commentThread.setId(2L);
        expectedCommentThread.addComment(expectedC1);
        expectedCommentThread.addComment(expectedC2);
        when(commentThreadRepository.findById(2L)).thenReturn(Optional.of(commentThread));
        when(commentThreadRepository.save(commentThread)).thenReturn(expectedCommentThread);

        CommentThread savedCommentThread = commentServiceImpl.updateCommentThreadLine(2L, 5L, "Test line 5");

        verify(commentThreadRepository, times(1)).findById(2L);
        verify(commentThreadRepository, times(1)).save(commentThread);
        assertThat(savedCommentThread.getLine()).isEqualTo(5L);
        assertThat(savedCommentThread.getLineText()).isEqualToIgnoringWhitespace("Test line 5");
        assertThat(commentThread.getLine()).isEqualTo(5L);
        assertThat(commentThread.getLineText()).isEqualToIgnoringWhitespace("Test line 5");

    }
}
