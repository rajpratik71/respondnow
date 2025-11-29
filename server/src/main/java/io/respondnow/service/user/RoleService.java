package io.respondnow.service.user;

import io.respondnow.dto.user.RoleResponse;
import io.respondnow.model.user.*;
import io.respondnow.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleService {

    private final UserRoleRepository roleRepository;

    /**
     * Initialize system roles on application startup.
     */
    @PostConstruct
    public void initializeSystemRoles() {
        log.info("Initializing system roles...");
        
        createSystemRoleIfNotExists("ADMIN", "Administrator with full system access", 
            new HashSet<>(Arrays.asList(Permission.values())));
        
        createSystemRoleIfNotExists("MANAGER", "Manager with incident management capabilities", 
            new HashSet<>(Arrays.asList(
                Permission.INCIDENT_VIEW, Permission.INCIDENT_CREATE,
                Permission.INCIDENT_UPDATE, Permission.INCIDENT_ASSIGN,
                Permission.INCIDENT_EXPORT, Permission.USER_VIEW,
                Permission.GROUP_VIEW, Permission.EVIDENCE_VIEW,
                Permission.EVIDENCE_UPLOAD, Permission.EVIDENCE_DOWNLOAD,
                Permission.EXPORT_CSV, Permission.EXPORT_PDF, Permission.EXPORT_COMBINED
            )));
        
        createSystemRoleIfNotExists("RESPONDER", "Incident responder",
            new HashSet<>(Arrays.asList(
                Permission.INCIDENT_VIEW, Permission.INCIDENT_UPDATE,
                Permission.EVIDENCE_VIEW, Permission.EVIDENCE_UPLOAD,
                Permission.EVIDENCE_DOWNLOAD
            )));
        
        createSystemRoleIfNotExists("VIEWER", "Read-only viewer",
            new HashSet<>(Arrays.asList(
                Permission.INCIDENT_VIEW, Permission.EVIDENCE_VIEW
            )));
        
        log.info("System roles initialized successfully");
    }

    private void createSystemRoleIfNotExists(String name, String description, Set<Permission> permissions) {
        if (!roleRepository.existsByName(name)) {
            UserRole role = new UserRole(name, description, UserRoleType.SYSTEM, permissions);
            roleRepository.save(role);
            log.info("Created system role: {}", name);
        }
    }

    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public RoleResponse getRoleByName(String name) {
        UserRole role = roleRepository.findByName(name)
            .orElseThrow(() -> new RuntimeException("Role not found: " + name));
        return toResponse(role);
    }

    public Set<Permission> getRolePermissions(String roleName) {
        UserRole role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new RuntimeException("Role not found: " + roleName));
        return role.getPermissions();
    }

    public Set<Permission> aggregatePermissions(Set<String> roleNames) {
        Set<Permission> permissions = new HashSet<>();
        for (String roleName : roleNames) {
            Optional<UserRole> role = roleRepository.findByName(roleName);
            role.ifPresent(r -> permissions.addAll(r.getPermissions()));
        }
        return permissions;
    }

    private RoleResponse toResponse(UserRole role) {
        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setDescription(role.getDescription());
        response.setType(role.getType());
        response.setPermissions(role.getPermissions());
        return response;
    }
}
