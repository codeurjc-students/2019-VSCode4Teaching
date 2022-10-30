package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);
}