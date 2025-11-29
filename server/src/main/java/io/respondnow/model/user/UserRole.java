package io.respondnow.model.user;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a role in the system with associated permissions.
 * Can be either a system-defined role or a custom role.
 */
@Data
@NoArgsConstructor
@Document(collection = "user_roles")
public class UserRole {

    @Id
    private String id;

    @NotBlank
    private String name; // Unique role name (e.g., "ADMIN", "MANAGER", "RESPONDER", "VIEWER")

    private String description;

    private UserRoleType type; // SYSTEM or CUSTOM

    private Set<Permission> permissions = new HashSet<>();

    private Set<String> parentRoles = new HashSet<>(); // For role inheritance

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    public UserRole(String name, String description, UserRoleType type, Set<Permission> permissions) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.permissions = permissions != null ? permissions : new HashSet<>();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
