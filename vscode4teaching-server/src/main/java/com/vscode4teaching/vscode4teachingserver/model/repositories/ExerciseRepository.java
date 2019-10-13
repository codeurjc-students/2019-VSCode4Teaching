package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.Exercise;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

}