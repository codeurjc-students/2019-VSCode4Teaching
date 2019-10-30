package com.vscode4teaching.vscode4teachingserver.servicetests;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.util.Optional;

import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.RoleRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;
import com.vscode4teaching.vscode4teachingserver.servicesimpl.JWTUserDetailsService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
@TestPropertySource(locations = "classpath:test.properties")
public class UserServiceImplTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private JWTUserDetailsService userService;

    private User user;
    private Role studentRole;
    private Role teacherRole;

    @BeforeEach
    public void setup() {
        user = new User("johndoejr@gmail.com", "johndoe", "pass", "John", "Doe");
        user.setId(1l);
        studentRole = new Role("ROLE_STUDENT");
        studentRole.setId(2l);
        teacherRole = new Role("ROLE_TEACHER");
        teacherRole.setId(3l);
    }

    @Test
    public void loadUserByUsername() {
        Optional<User> userOpt = Optional.of(user);
        when(userRepository.findByUsername(anyString())).thenReturn(userOpt);
        UserDetails result = userService.loadUserByUsername("johndoe");
        assertThat("johndoe").isEqualTo(result.getUsername());
    }

    @Test
    public void loadUserByUsername_exception() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        assertThrows(UsernameNotFoundException.class, () -> userService.loadUserByUsername("johndoe"));
    }

    @Test
    public void save() {
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(roleRepository.findByRoleName(studentRole.getRoleName())).thenReturn(studentRole);
        User result = userService.save(user, false);
        assertThat("johndoe").isEqualTo(result.getUsername());
        assertThat(result.getRoles()).contains(studentRole);
    }

    @Test
    public void save_teacher() {
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(roleRepository.findByRoleName(anyString())).thenReturn(studentRole).thenReturn(teacherRole);
        User result = userService.save(user, true);
        assertThat("johndoe").isEqualTo(result.getUsername());
        assertThat(result.getRoles()).contains(studentRole, teacherRole);
    }
}