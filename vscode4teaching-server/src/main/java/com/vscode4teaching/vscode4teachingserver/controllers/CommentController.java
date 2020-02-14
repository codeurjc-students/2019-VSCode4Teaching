package com.vscode4teaching.vscode4teachingserver.controllers;

import com.vscode4teaching.vscode4teachingserver.services.CommentService;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
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

    //@PostMapping("/")
}