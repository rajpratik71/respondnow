package io.respondnow.model.user;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Represents a group of users with shared roles and permissions.
 * Groups allow for easier management of permissions for multiple users.
 */
@Data
@NoArgsConstructor
@Document(collection = "user_groups")
public class Group {

    @Id
    private String id;

    @NotBlank
    private String name; // Unique group name

    private String description;

    private String parentGroupId; // For nested groups (optional feature)

    private Set<String> userIds = new HashSet<>(); // Member user IDs

    private Set<String> roleNames = new HashSet<>(); // Roles assigned to this group

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private Boolean active = true;

    private Map<String, Object> metadata = new HashMap<>(); // Custom fields

    public Group(String name, String description) {
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.active = true;
    }

    /**
     * Add a user to this group.
     */
    public void addMember(String userId) {
        this.userIds.add(userId);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Remove a user from this group.
     */
    public void removeMember(String userId) {
        this.userIds.remove(userId);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Assign a role to this group.
     */
    public void assignRole(String roleName) {
        this.roleNames.add(roleName);
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Remove a role from this group.
     */
    public void removeRole(String roleName) {
        this.roleNames.remove(roleName);
        this.updatedAt = LocalDateTime.now();
    }
}
