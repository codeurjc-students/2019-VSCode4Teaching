package com.vscode4teaching.vscode4teachingserver.model.repositories;

import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExerciseUserInfoRepository extends JpaRepository<ExerciseUserInfo, Long> {
    Optional<ExerciseUserInfo> findByExercise_IdAndUser_Username(Long exerciseId, String username);

    void deleteByExercise_IdInAndUser_IdIn(List<Long> exerciseIds, List<Long> userIds);

    List<ExerciseUserInfo> findByExercise_Id(Long exerciseId);
}