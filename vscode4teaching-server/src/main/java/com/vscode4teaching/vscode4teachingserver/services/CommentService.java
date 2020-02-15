package com.vscode4teaching.vscode4teachingserver.services;

import java.util.List;

import javax.validation.Valid;
import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public interface CommentService {
    public CommentThread saveCommentThread(@Min(1) Long fileId, @Valid CommentThread commentThread) throws FileNotFoundException;
    public List<CommentThread> getCommentThreadsByFile(@Min(1) Long fileId) throws FileNotFoundException;
}