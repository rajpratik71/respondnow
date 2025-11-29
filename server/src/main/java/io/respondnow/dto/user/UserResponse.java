package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.UserStatus;
import lombok.Data;

import java.time.LocalDateTime;
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
    private Set<String> roleNames;
    private Set<String> groupIds;
    private Set<String> groupNames; // Human-readable group names for UI
    private Set<Permission> effectivePermissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
}
