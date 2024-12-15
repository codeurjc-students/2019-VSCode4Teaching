package es.codeurjc.vscode4teaching.model.repositories;

import es.codeurjc.vscode4teaching.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByRoleName(String roleName);
}