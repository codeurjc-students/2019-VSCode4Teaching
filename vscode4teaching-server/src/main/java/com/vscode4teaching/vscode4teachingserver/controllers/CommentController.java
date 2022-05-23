package com.vscode4teaching.vscode4teachingserver.controllers;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CommentDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CommentThreadDTO;
import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentThreadViews;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin
@Validated
public class CommentController {

    private final CommentService commentService;

    private final Logger logger = LoggerFactory.getLogger(CourseController.class);

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping("/files/{fileId}/comments")
    @JsonView(CommentThreadViews.CommentView.class)
    public ResponseEntity<CommentThread> saveCommentThread(@PathVariable @Min(1) Long fileId,
                                                           @Valid @RequestBody CommentThreadDTO commentThread) throws FileNotFoundException {
        logger.info("Request to POST '/api/files/{}/comments' with body '{}'", fileId, commentThread);
        CommentThread newCommentThread = new CommentThread(commentThread.getLine(), commentThread.getLineText());
        List<Comment> comments = commentThread.getComments().stream()
                .map((CommentDTO comment) -> new Comment(newCommentThread, comment.getBody(), comment.getAuthor()))
                .collect(Collectors.toList());
        newCommentThread.setComments(comments);
        CommentThread savedCommentThread = commentService.saveCommentThread(fileId, newCommentThread);
        return new ResponseEntity<>(savedCommentThread, HttpStatus.CREATED);
    }

    @GetMapping("files/{fileId}/comments")
    @JsonView(CommentThreadViews.CommentView.class)
    public ResponseEntity<List<CommentThread>> getCommentThreads(@PathVariable @Min(1) Long fileId)
            throws FileNotFoundException {
        logger.info("Request to GET '/api/files/{}/comments'", fileId);
        List<CommentThread> comments = commentService.getCommentThreadsByFile(fileId);
        return comments.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(comments);
    }

    @GetMapping("users/{username}/exercises/{exerciseId}/comments")
    @JsonView(FileViews.CommentView.class)
    public ResponseEntity<List<ExerciseFile>> getCommentsByUser(@PathVariable String username,
                                                                @PathVariable Long exerciseId) throws ExerciseNotFoundException {
        logger.info("Request to GET '/api/users/{}/exercises/{}/comments'", username, exerciseId);
        List<ExerciseFile> files = commentService.getFilesWithCommentsByUser(exerciseId, username);
        return files.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(files);
    }

    @PutMapping("comments/{commentThreadId}/lines")
    @JsonView(CommentThreadViews.GeneralView.class)
    public ResponseEntity<CommentThread> updateCommentThreadLine(@PathVariable Long commentThreadId,
                                                                 @Valid @RequestBody CommentThreadDTO commentThread) throws CommentNotFoundException {
        logger.info("Request to PUT '/api/comments/{}/lines' with body '{}'", commentThreadId, commentThread);
        CommentThread savedCommentThread = commentService.updateCommentThreadLine(commentThreadId, commentThread.getLine(), commentThread.getLineText());
        return new ResponseEntity<>(savedCommentThread, HttpStatus.OK);
    }
}