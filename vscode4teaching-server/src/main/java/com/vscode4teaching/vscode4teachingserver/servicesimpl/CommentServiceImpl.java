package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentThreadRepository;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class CommentServiceImpl implements CommentService {

    private final CommentThreadRepository commentThreadRepository;

    
	public CommentServiceImpl(CommentThreadRepository commentThreadRepository) {
		this.commentThreadRepository = commentThreadRepository;
	}
    
	@Override
	public CommentThread saveCommentThread(CommentThread commentThread) {
        CommentThread savedThread = commentThreadRepository.save(commentThread);
        return savedThread;
	}

	@Override
	public CommentThread getCommentThreadByFile(Long fileId) throws CommentNotFoundException {
        CommentThread thread = commentThreadRepository.findByFile_Id(fileId)
            .orElseThrow(() -> new CommentNotFoundException(Long.toString(fileId)));
        return thread;
	}

    
}