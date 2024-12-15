package es.codeurjc.vscode4teaching.services;

import es.codeurjc.vscode4teaching.model.CommentThread;
import es.codeurjc.vscode4teaching.model.Exercise;
import es.codeurjc.vscode4teaching.model.ExerciseFile;
import es.codeurjc.vscode4teaching.model.repositories.CommentRepository;
import es.codeurjc.vscode4teaching.model.repositories.CommentThreadRepository;
import es.codeurjc.vscode4teaching.model.repositories.ExerciseFileRepository;
import es.codeurjc.vscode4teaching.model.repositories.ExerciseRepository;
import es.codeurjc.vscode4teaching.services.exceptions.CommentNotFoundException;
import es.codeurjc.vscode4teaching.services.exceptions.ExerciseNotFoundException;
import es.codeurjc.vscode4teaching.services.exceptions.FileNotFoundException;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
public class CommentService {

    private final ExerciseFileRepository exerciseFileRepository;
    private final CommentThreadRepository commentThreadRepository;
    private final CommentRepository commentRepository;
    private final ExerciseRepository exerciseRepository;

    private final Logger logger = LoggerFactory.getLogger(CommentService.class);

    public CommentService(ExerciseFileRepository exerciseFileRepository,
                          CommentThreadRepository commentThreadRepository, CommentRepository commentRepository,
                          ExerciseRepository exerciseRepository) {
        this.exerciseFileRepository = exerciseFileRepository;
        this.commentThreadRepository = commentThreadRepository;
        this.commentRepository = commentRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public CommentThread saveCommentThread(Long fileId, CommentThread commentThread) throws FileNotFoundException {
        logger.info("Called CommentServiceImpl.saveCommentThread({}, {})", fileId, commentThread);
        ExerciseFile file = exerciseFileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
        file.addCommentThread(commentThread);
        commentThread.setFile(file);
        commentThreadRepository.save(commentThread);
        commentRepository.saveAll(commentThread.getComments());
        ExerciseFile savedFile = exerciseFileRepository.save(file);
        return savedFile.getComments().get(savedFile.getComments().size() - 1);
    }

    public List<CommentThread> getCommentThreadsByFile(Long fileId) throws FileNotFoundException {
        logger.info("Called CommentServiceImpl.getCommentThreadsByFile({})", fileId);
        ExerciseFile file = exerciseFileRepository.findById(fileId)
                .orElseThrow(() -> new FileNotFoundException(Long.toString(fileId)));
        return file.getComments();
    }

    public List<ExerciseFile> getFilesWithCommentsByUser(Long exerciseId, String username)
            throws ExerciseNotFoundException {
        logger.info("Called CommentServiceImpl.getFilesWithCommentsByUser({}, {})", exerciseId, username);
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

    public CommentThread updateCommentThreadLine(@Min(1) Long commentThreadId, @Min(0) Long line, String lineText)
            throws CommentNotFoundException {
        logger.info("Called CommentServiceImpl.updateCommentThreadLine({}, {}, {})", commentThreadId, line, lineText);
        CommentThread commentThread = commentThreadRepository.findById(commentThreadId)
                .orElseThrow(() -> new CommentNotFoundException("Comment thread not found: " + commentThreadId));
        commentThread.setLine(line);
        commentThread.setLineText(lineText);
        return commentThreadRepository.save(commentThread);
    }

}