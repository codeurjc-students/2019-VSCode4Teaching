package com.vscode4teaching.vscode4teachingserver;

import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.RoleRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class DatabaseSuperuserInitializer implements CommandLineRunner {

    // Values in application.properties
    @Value("${superuser.username}")
    private String username;

    @Value("${superuser.password}")
    private String password;

    @Value("${superuser.email}")
    private String email;

    @Value("${superuser.name}")
    private String name;

    @Value("${superuser.lastname}")
    private String lastname;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    private void addRole(User user, String roleName) {
        Role role = roleRepository.findByRoleName(roleName);
        if (role == null) {
            role = roleRepository.save(new Role(roleName));
        }
        user.addRole(role);
    }

    private User saveUser(User user) {
        addRole(user, "ROLE_STUDENT");
        addRole(user, "ROLE_TEACHER");
        return userRepository.save(user);
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.findByEmail(email).isPresent()) {
            User superuser = new User(email, username, passwordEncoder.encode(password), name, lastname);
            saveUser(superuser);
        }
    }
}