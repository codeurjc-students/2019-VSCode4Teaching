package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseFileRepository extends JpaRepository<ExerciseFile, Long> {

    Optional<ExerciseFile> findByPath(String path);

}