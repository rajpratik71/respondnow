package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.UserStatus;
import lombok.Data;

import java.util.Set;

@Data
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private UserStatus status;
    private Boolean active;
    private Boolean changePasswordRequired;
    private Boolean removed;
    private Set<String> roleNames;
    private Set<String> groupIds;
    private Set<String> groupNames; // Human-readable group names for UI
    private Set<Permission> effectivePermissions;
    private Long createdAt;
    private Long updatedAt;
    private Long lastLoginAt;
    private String createdBy;
    private String updatedBy;
}
