package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.List;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

@Service
@Validated
public class CommentServiceImpl implements CommentService {

    private final ExerciseFileRepository exerciseFileRepository;
    
	public CommentServiceImpl(ExerciseFileRepository exerciseFileRepository) {
		this.exerciseFileRepository = exerciseFileRepository;
	}
    
	@Override
	public CommentThread saveCommentThread(@Min(1) Long fileId, CommentThread commentThread)
			throws FileNotFoundException {
		ExerciseFile file = exerciseFileRepository.findById(fileId)
			.orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
		for (CommentThread fileCommentThread : file.getComments()) {
			if (fileCommentThread.getLine().equals(commentThread.getLine())) {
				file.getComments().remove(fileCommentThread);
			}
		}
		file.addCommentThread(commentThread);
		ExerciseFile savedFile = exerciseFileRepository.save(file);
		CommentThread savedThread = savedFile.getComments().get(savedFile.getComments().size() - 1);
        return savedThread;
	}

	@Override
	public List<CommentThread> getCommentThreadsByFile(@Min(1) Long fileId) throws FileNotFoundException {
        ExerciseFile file = exerciseFileRepository.findById(fileId)
            .orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
        return file.getComments();
	}

    
}