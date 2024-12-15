package es.codeurjc.vscode4teaching.servicesimpl;

import es.codeurjc.vscode4teaching.model.Role;
import es.codeurjc.vscode4teaching.model.User;
import es.codeurjc.vscode4teaching.model.repositories.RoleRepository;
import es.codeurjc.vscode4teaching.model.repositories.UserRepository;
import es.codeurjc.vscode4teaching.services.exceptions.NotFoundException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

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
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException(username));
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

    public User findByUsername(String username) throws NotFoundException {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("User '" + username + "' not found"));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }
}