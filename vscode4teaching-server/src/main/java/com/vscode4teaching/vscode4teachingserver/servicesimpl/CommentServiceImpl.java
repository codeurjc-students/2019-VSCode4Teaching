package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

import javax.validation.constraints.Min;

import com.vscode4teaching.vscode4teachingserver.model.Comment;
import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.CommentThreadRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseFileRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseRepository;
import com.vscode4teaching.vscode4teachingserver.services.CommentService;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.CommentNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.FileNotFoundException;

import org.springframework.stereotype.Service;

@Service
public class CommentServiceImpl implements CommentService {

	private final ExerciseFileRepository exerciseFileRepository;
	private final CommentThreadRepository commentThreadRepository;
	private final CommentRepository commentRepository;
	private final ExerciseRepository exerciseRepository;

	public CommentServiceImpl(ExerciseFileRepository exerciseFileRepository,
			CommentThreadRepository commentThreadRepository, CommentRepository commentRepository,
			ExerciseRepository exerciseRepository) {
		this.exerciseFileRepository = exerciseFileRepository;
		this.commentThreadRepository = commentThreadRepository;
		this.commentRepository = commentRepository;
		this.exerciseRepository = exerciseRepository;
	}

	@Override
	public CommentThread saveCommentThread(Long fileId, CommentThread commentThread) throws FileNotFoundException {
		ExerciseFile file = exerciseFileRepository.findById(fileId)
				.orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
		file.addCommentThread(commentThread);
		commentThread.setFile(file);
		commentThreadRepository.save(commentThread);
		for (Comment comment : commentThread.getComments()) {
			commentRepository.save(comment);
		}
		ExerciseFile savedFile = exerciseFileRepository.save(file);
		return savedFile.getComments().get(savedFile.getComments().size() - 1);
	}

	@Override
	public List<CommentThread> getCommentThreadsByFile(Long fileId) throws FileNotFoundException {
		ExerciseFile file = exerciseFileRepository.findById(fileId)
				.orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
		return file.getComments();
	}

	@Override
	public List<ExerciseFile> getFilesWithCommentsByUser(Long exerciseId, String username)
			throws ExerciseNotFoundException {
		Exercise ex = exerciseRepository.findById(exerciseId)
				.orElseThrow(() -> new ExerciseNotFoundException(exerciseId));
		List<ExerciseFile> files = new ArrayList<>(ex.getFilesByOwner(username));
		files.removeIf(file -> file.getComments().isEmpty());
		// Change paths to be relative to username
		files.forEach((ExerciseFile file) -> {
			String separator = File.separator;
			if (File.separator.contains("\\")) {
				separator = "\\" + File.separator;
			}
			file.setPath(file.getPath().split(username + separator)[1]);
		});
		return files;
	}

	@Override
	public CommentThread updateCommentThreadLine(@Min(1) Long commentThreadId, @Min(0) Long line, String lineText)
			throws CommentNotFoundException {
		CommentThread commentThread = commentThreadRepository.findById(commentThreadId)
				.orElseThrow(() -> new CommentNotFoundException("Comment thread not found: " + commentThreadId));
		commentThread.setLine(line);
		commentThread.setLineText(lineText);
		return commentThreadRepository.save(commentThread);
	}

}