package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentThreadRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CommentServiceImpl implements CommentService {

	private final ExerciseFileRepository exerciseFileRepository;
	private final CommentThreadRepository commentThreadRepository;
	private final CommentRepository commentRepository;

	public CommentServiceImpl(ExerciseFileRepository exerciseFileRepository,
			CommentThreadRepository commentThreadRepository, CommentRepository commentRepository) {
		this.exerciseFileRepository = exerciseFileRepository;
		this.commentThreadRepository = commentThreadRepository;
		this.commentRepository = commentRepository;
	}

	@Override
	public CommentThread saveCommentThread(Long fileId, CommentThread commentThread) throws FileNotFoundException {
		ExerciseFile file = exerciseFileRepository.findById(fileId)
				.orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
		for (CommentThread fileCommentThread : file.getComments()) {
			if (fileCommentThread.getLine().equals(commentThread.getLine())) {
				file.getComments().remove(fileCommentThread);
				commentThreadRepository.delete(fileCommentThread);
			}
		}
		commentThread.setFile(file);
		commentThreadRepository.save(commentThread);
		for (Comment comment : commentThread.getComments()) {
			commentRepository.save(comment);
		}
		file.addCommentThread(commentThread);
		ExerciseFile savedFile = exerciseFileRepository.save(file);
		CommentThread savedThread = savedFile.getComments().get(savedFile.getComments().size() - 1);
		return savedThread;
	}

	@Override
	public List<CommentThread> getCommentThreadsByFile(Long fileId) throws FileNotFoundException {
		ExerciseFile file = exerciseFileRepository.findById(fileId)
				.orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
		return file.getComments();
	}

}