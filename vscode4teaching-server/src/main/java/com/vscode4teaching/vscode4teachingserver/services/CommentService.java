package com.vscode4teaching.vscode4teachingserver.services;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CommentService {
    public CommentThread saveCommentThread(CommentThread commentThread);
    public CommentThread getCommentThreadByFile(Long fileId) throws CommentNotFoundException;
}