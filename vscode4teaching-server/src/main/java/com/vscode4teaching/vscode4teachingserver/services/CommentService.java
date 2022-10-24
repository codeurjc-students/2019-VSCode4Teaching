package com.vscode4teaching.vscode4teachingserver.services;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import java.util.List;

@Service
@Validated
public interface CommentService {
    CommentThread saveCommentThread(@Min(1) Long fileId, @Valid CommentThread commentThread) throws FileNotFoundException;

    List<CommentThread> getCommentThreadsByFile(@Min(1) Long fileId) throws FileNotFoundException;

    List<ExerciseFile> getFilesWithCommentsByUser(Long exerciseId, String username) throws ExerciseNotFoundException;

    CommentThread updateCommentThreadLine(@Min(1) Long commentThreadId, @Min(0) Long line, String lineText) throws CommentNotFoundException;
}