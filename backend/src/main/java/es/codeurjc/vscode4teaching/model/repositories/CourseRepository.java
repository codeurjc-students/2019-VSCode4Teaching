package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findById(Long courseId);

    Optional<Course> findByNameIgnoreCase(String name);

    Optional<Course> findByUuid(String uuid);
}
