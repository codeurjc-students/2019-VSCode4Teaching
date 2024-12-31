package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.Course;
import es.codeurjc.vscode4teaching.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    Optional<Exercise> findByCourseAndNameIgnoreCase(Course course, String name);
}