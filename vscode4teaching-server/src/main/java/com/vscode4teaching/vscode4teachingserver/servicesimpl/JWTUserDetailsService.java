package com.vscode4teaching.vscode4teachingserver.servicesimpl;

import java.util.ArrayList;
import java.util.List;

import com.vscode4teaching.vscode4teachingserver.model.Role;
import com.vscode4teaching.vscode4teachingserver.model.User;
import com.vscode4teaching.vscode4teachingserver.model.repositories.RoleRepository;
import com.vscode4teaching.vscode4teachingserver.model.repositories.UserRepository;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class JWTUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public JWTUserDetailsService(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found with username: " + username);
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority(role.getRoleName()));
        }
        return new org.springframework.security.core.userdetails.User(user.getUsername(), user.getPassword(),
                authorities);
    }

    public User save(User user, boolean isTeacher) {
        addRole(user, "ROLE_STUDENT");
        if (isTeacher) {
            addRole(user, "ROLE_TEACHER");
        }
        return userRepository.save(user);
    }

    private void addRole(User user, String roleName) {
        Role role = roleRepository.findByRoleName(roleName);
        if (role == null) {
            role = roleRepository.save(new Role(roleName));
        }
        user.addRole(role);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}