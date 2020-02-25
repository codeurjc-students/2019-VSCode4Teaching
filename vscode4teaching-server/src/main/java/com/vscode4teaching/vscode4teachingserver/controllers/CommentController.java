package com.vscode4teaching.vscode4teachingserver.controllers;

import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CommentDTO;
import com.vscode4teaching.vscode4teachingserver.controllers.dtos.CommentThreadDTO;
import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentThreadViews;
import com.vscode4teaching.vscode4teachingserver.model.views.FileViews;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin
@Validated
public class CommentController {

	private final CommentService commentService;

	public CommentController(CommentService commentService) {
		this.commentService = commentService;
	}

	@PostMapping("/files/{fileId}/comments")
	@JsonView(CommentThreadViews.CommentView.class)
	public ResponseEntity<CommentThread> saveCommentThread(@PathVariable @Min(1) Long fileId,
			@Valid @RequestBody CommentThreadDTO commentThread) throws FileNotFoundException {
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
		List<CommentThread> comments = commentService.getCommentThreadsByFile(fileId);
		return comments.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(comments);
	}

	@GetMapping("users/{username}/exercises/{exerciseId}/comments")
	@JsonView(FileViews.CommentView.class)
	public ResponseEntity<List<ExerciseFile>> getCommentsByUser(@PathVariable String username,
			@PathVariable Long exerciseId) throws ExerciseNotFoundException {
		List<ExerciseFile> files = commentService.getFilesWithCommentsByUser(exerciseId, username);
		return files.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(files);
	}
}