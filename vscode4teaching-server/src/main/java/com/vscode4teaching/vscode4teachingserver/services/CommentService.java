package com.vscode4teaching.vscode4teachingserver.services;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CommentService {
    public CommentThread getCommentThread();
}