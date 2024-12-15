package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.ExerciseFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseFileRepository extends JpaRepository<ExerciseFile, Long> {

    Optional<ExerciseFile> findByPath(String path);

}