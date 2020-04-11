package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.ExerciseInfoServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.AdditionalAnswers.returnsFirstArg;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(locations = "classpath:test.properties")
public class ExerciseInfoServiceImplTests {
    @Mock
    private ExerciseUserInfoRepository exerciseUserInfoRepository;

    @InjectMocks
    private ExerciseInfoServiceImpl exerciseInfoService;

    @Test
    public void getExerciseUserInfo_existing() throws NotFoundException {
        Course course = new Course("Spring Boot Course");
        Exercise exercise = new Exercise("Exercise 1", course);
        Long exerciseId = 2l;
        exercise.setId(exerciseId);
        String username = "johndoe";
        Role studentRole = new Role("ROLE_STUDENT");
        User user = new User("johndoe@john.com", username, "johndoeuser", "John", "Doe", studentRole);
        ExerciseUserInfo eui = new ExerciseUserInfo(exercise, user);
        eui.setFinished(true);
        Optional<ExerciseUserInfo> euiOpt = Optional.of(eui);
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)).thenReturn(euiOpt);

        ExerciseUserInfo savedEui = exerciseInfoService.getExerciseUserInfo(exerciseId, username);

        assertThat(savedEui.getExercise()).isEqualTo(exercise);
        assertThat(savedEui.getUser()).isEqualTo(user);
        assertThat(savedEui.isFinished()).isTrue();
        verify(exerciseUserInfoRepository, times(1)).findByExercise_IdAndUser_Username(exerciseId, username);
    }

    @Test
    public void getExerciseUserInfo_exception() throws NotFoundException {
        Long exerciseId = 2l;
        String username = "johndoe";
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username))
                .thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> exerciseInfoService.getExerciseUserInfo(exerciseId, username));
        verify(exerciseUserInfoRepository, times(1)).findByExercise_IdAndUser_Username(exerciseId, username);
    }

    @Test
    public void updateExerciseUserInfo_valid() throws NotFoundException {
        Course course = new Course("Spring Boot Course");
        Exercise exercise = new Exercise("Exercise 1", course);
        Long exerciseId = 2l;
        exercise.setId(exerciseId);
        String username = "johndoe";
        Role studentRole = new Role("ROLE_STUDENT");
        User user = new User("johndoe@john.com", username, "johndoeuser", "John", "Doe", studentRole);
        ExerciseUserInfo eui = new ExerciseUserInfo(exercise, user);
        eui.setFinished(false);
        Optional<ExerciseUserInfo> euiOpt = Optional.of(eui);
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)).thenReturn(euiOpt);
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).then(returnsFirstArg());
        ExerciseUserInfo savedEui = exerciseInfoService.updateExerciseUserInfo(exerciseId, username, true);

        assertThat(savedEui.getExercise()).isEqualTo(exercise);
        assertThat(savedEui.getUser()).isEqualTo(user);
        assertThat(savedEui.isFinished()).isTrue();
        verify(exerciseUserInfoRepository, times(1)).findByExercise_IdAndUser_Username(exerciseId, username);
        verify(exerciseUserInfoRepository, times(1)).save(any(ExerciseUserInfo.class));
    }
}