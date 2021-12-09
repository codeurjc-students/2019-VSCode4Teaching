package com.vscode4teaching.vscode4teachingserver.model.repositories;

import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
}