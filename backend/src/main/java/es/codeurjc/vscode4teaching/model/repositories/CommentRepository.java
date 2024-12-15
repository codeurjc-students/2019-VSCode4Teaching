package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {
}