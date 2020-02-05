package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.CommentThread;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentThreadRepository extends JpaRepository<CommentThread, Long> {
}