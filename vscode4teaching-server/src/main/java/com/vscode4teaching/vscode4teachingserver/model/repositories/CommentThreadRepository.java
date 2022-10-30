package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommentThreadRepository extends JpaRepository<CommentThread, Long> {
    Optional<CommentThread> findByFile_Id(Long fileId);
}