package com.vscode4teaching.vscode4teachingserver.model.repositories;

import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByCourseAndNameIgnoreCase(Course course, String name);
}