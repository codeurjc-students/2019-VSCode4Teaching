package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.vscode4teaching.vscode4teachingserver.model.Course;
import com.vscode4teaching.vscode4teachingserver.model.Exercise;
import com.vscode4teaching.vscode4teachingserver.model.ExerciseUserInfo;
import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.ExerciseUserInfoRepository;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.ExerciseNotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotFoundException;
import com.vscode4teaching.vscode4teachingserver.services.exceptions.NotInCourseException;
import com.vscode4teaching.vscode4teachingserver.services.websockets.SocketHandler;
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

    @Mock
    private SocketHandler websocketHandler;

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
        eui.setStatus(1);
        Optional<ExerciseUserInfo> euiOpt = Optional.of(eui);
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)).thenReturn(euiOpt);

        ExerciseUserInfo savedEui = exerciseInfoService.getExerciseUserInfo(exerciseId, username);

        assertThat(savedEui.getExercise()).isEqualTo(exercise);
        assertThat(savedEui.getUser()).isEqualTo(user);
        assertThat(savedEui.getStatus() == 1).isTrue();
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
        eui.setStatus(0);
        eui.setLastModifiedFile("/old/file.txt");
        String newFilePath = "modified/file.txt";
        Optional<ExerciseUserInfo> euiOpt = Optional.of(eui);
        course.addUserInCourse(user);
        User creator = new User("creator@john.com", "creator", "creatorteacher", "creator", "Doe Sr", studentRole, new Role("ROLE_TEACHER"));
        User teacher = new User("johndoesr@john.com", "johndoesr", "johndoesrteacher", "John", "Doe Sr", studentRole, new Role("ROLE_TEACHER"));
        course.addUserInCourse(teacher);
        course.setCreator(creator);
        Set<User> teacherSet = new HashSet<>();
        teacherSet.add(teacher);
        teacherSet.add(creator);
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)).thenReturn(euiOpt);
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).then(returnsFirstArg());
        ExerciseUserInfo savedEui = exerciseInfoService.updateExerciseUserInfo(exerciseId, username, 1, newFilePath);

        assertThat(savedEui.getExercise()).isEqualTo(exercise);
        assertThat(savedEui.getUser()).isEqualTo(user);
        assertThat(savedEui.getStatus() == 1).isTrue();
        assertThat(savedEui.getLastModifiedFile()).isEqualTo(newFilePath);
        verify(exerciseUserInfoRepository, times(1)).findByExercise_IdAndUser_Username(exerciseId, username);
        verify(exerciseUserInfoRepository, times(1)).save(any(ExerciseUserInfo.class));
        verify(websocketHandler, times(1)).refreshExerciseDashboards(teacherSet);
    }

    @Test
    public void updateExerciseUserInfo_valid_no_file() throws NotFoundException {
        Course course = new Course("Spring Boot Course");
        Exercise exercise = new Exercise("Exercise 1", course);
        Long exerciseId = 2l;
        exercise.setId(exerciseId);
        String username = "johndoe";
        Role studentRole = new Role("ROLE_STUDENT");
        User user = new User("johndoe@john.com", username, "johndoeuser", "John", "Doe", studentRole);
        ExerciseUserInfo eui = new ExerciseUserInfo(exercise, user);
        eui.setStatus(0);
        String oldFilePath = "/old/file.txt";
        eui.setLastModifiedFile(oldFilePath);
        Optional<ExerciseUserInfo> euiOpt = Optional.of(eui);
        when(exerciseUserInfoRepository.findByExercise_IdAndUser_Username(exerciseId, username)).thenReturn(euiOpt);
        when(exerciseUserInfoRepository.save(any(ExerciseUserInfo.class))).then(returnsFirstArg());
        ExerciseUserInfo savedEui = exerciseInfoService.updateExerciseUserInfo(exerciseId, username, 0, null);

        assertThat(savedEui.getExercise()).isEqualTo(exercise);
        assertThat(savedEui.getUser()).isEqualTo(user);
        assertThat(savedEui.getStatus() == 0).isTrue();
        assertThat(savedEui.getLastModifiedFile()).isEqualTo(oldFilePath);
        verify(exerciseUserInfoRepository, times(1)).findByExercise_IdAndUser_Username(exerciseId, username);
        verify(exerciseUserInfoRepository, times(1)).save(any(ExerciseUserInfo.class));
    }

    @Test
    public void getStudentUserInfo() throws ExerciseNotFoundException, NotInCourseException {
        // Set up courses and exercises
        Course course = new Course("Spring Boot Course");
        Exercise exercise = new Exercise("Exercise 1", course);
        exercise.setId(10l);
        // Set up users
        User teacher = new User("johndoe@gmail.com", "johndoe", "pass", "John", "Doe");
        Role studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        Role teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3l);
        teacher.addRole(studentRole);
        teacher.addRole(teacherRole);
        teacher.addCourse(course);
        course.addUserInCourse(teacher);
        User student1 = new User("johndoejr@gmail.com", "johndoejr", "pass", "John", "Doe Jr 1");
        student1.addRole(studentRole);
        student1.addCourse(course);
        course.addUserInCourse(student1);
        User student2 = new User("johndoejr2@gmail.com", "johndoejr2", "pass", "John", "Doe Jr 2");
        student2.addRole(studentRole);
        student2.addCourse(course);
        course.addUserInCourse(student2);
        // Set up EUIs
        ExerciseUserInfo euiTeacher = new ExerciseUserInfo(exercise, teacher);
        ExerciseUserInfo euiStudent1 = new ExerciseUserInfo(exercise, student1);
        ExerciseUserInfo euiStudent2 = new ExerciseUserInfo(exercise, student2);
        euiStudent2.setStatus(1);
        List<ExerciseUserInfo> expectedList = new ArrayList<>(3);
        expectedList.add(euiTeacher);
        expectedList.add(euiStudent1);
        expectedList.add(euiStudent2);
        when(exerciseUserInfoRepository.findByExercise_Id(10l)).thenReturn(expectedList);

        List<ExerciseUserInfo> returnedEuis = exerciseInfoService.getAllStudentExerciseUserInfo(10l, "johndoe");

        verify(exerciseUserInfoRepository, times(1)).findByExercise_Id(10l);
        assertThat(returnedEuis).hasSize(2);
        assertThat(returnedEuis.contains(euiTeacher)).isFalse();
        assertThat(returnedEuis.get(0)).isEqualTo(euiStudent1);
        assertThat(returnedEuis.get(1)).isEqualTo(euiStudent2);
        assertThat(returnedEuis.get(0).getStatus() == 1).isFalse();
        assertThat(returnedEuis.get(1).getStatus() == 1).isTrue();
    }
}