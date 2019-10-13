package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.Course;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

}