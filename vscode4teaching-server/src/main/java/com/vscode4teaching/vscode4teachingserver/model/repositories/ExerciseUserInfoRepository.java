package com.vscode4teaching.vscode4teachingserver.model.repositories;

import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseUserInfoRepository extends JpaRepository<ExerciseUserInfo, Long> {
    public Optional<ExerciseUserInfo> findByExercise_IdAndUser_Username(Long exerciseId, String username);
}