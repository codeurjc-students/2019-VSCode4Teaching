package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.CommentThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentThreadRepository extends JpaRepository<CommentThread, Long> {
    Optional<CommentThread> findByFile_Id(Long fileId);
}