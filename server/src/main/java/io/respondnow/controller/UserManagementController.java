package io.respondnow.controller;

import io.respondnow.dto.user.*;
import io.respondnow.model.user.UserStatus;
import io.respondnow.service.user.UserManagementService;
import io.respondnow.security.SecurityAuditLogger;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Tag(name = "User Management", description = "User management with RBAC")
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserManagementController {

    private final UserManagementService userService;
    private final SecurityAuditLogger auditLogger;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEWER', 'RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get all users", description = "Retrieve list of all users")
    public ResponseEntity<?> getAllUsers(HttpServletRequest request) {
        try {
            log.info("GET /users - Fetching all users");
            List<UserResponse> users = userService.getAllUsers();
            log.info("GET /users - Successfully fetched {} users", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("GET /users - Error fetching users", e);
            auditLogger.logAccessDenied("UNKNOWN", "GET /users", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch users", "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEWER', 'RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Create user", description = "Create a new user (MANAGER, ADMIN only)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserResponse user = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Update user", description = "Update an existing user (MANAGER, ADMIN only)")
    public ResponseEntity<?> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        try {
            log.info("PUT /users/{} - Updating user", id);
            UserResponse updated = userService.updateUser(id, request);
            log.info("PUT /users/{} - Successfully updated user", id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("PUT /users/{} - Error updating user", id, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Failed to update user", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("PUT /users/{} - Unexpected error", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update user", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user (ADMIN only)")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Assign role to user", description = "Assign a role to a user (MANAGER, ADMIN only)")
    public ResponseEntity<Void> assignRole(
            @PathVariable String id,
            @RequestParam String roleName) {
        userService.assignRole(id, roleName);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/roles/{roleName}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Remove role from user", description = "Remove a role from a user (MANAGER, ADMIN only)")
    public ResponseEntity<Void> removeRole(
            @PathVariable String id,
            @PathVariable String roleName) {
        userService.removeRole(id, roleName);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/permissions")
    @PreAuthorize("hasAnyAuthority('VIEWER', 'RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get user permissions", description = "Get all effective permissions for a user")
    public ResponseEntity<?> getUserPermissions(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserPermissions(id));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Update user status", description = "Update user status (MANAGER, ADMIN only)")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable String id,
            @RequestParam String status) {
        userService.updateUserStatus(id, UserStatus.valueOf(status.toUpperCase()));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update own profile", description = "Any authenticated user can update their own profile")
    public ResponseEntity<?> updateOwnProfile(
            @Valid @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Get current user from JWT token
            String authHeader = httpRequest.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.error("PUT /profile - No authorization header");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Unauthorized", "message", "Missing or invalid token"));
            }
            
            String token = authHeader.substring(7);
            String userId = userService.getUserIdFromToken(token);
            
            log.info("PUT /profile - User {} updating their profile", userId);
            UserResponse updated = userService.updateUser(userId, request);
            log.info("PUT /profile - Successfully updated profile for user {}", userId);
            auditLogger.logUserUpdated(userId, userId, "Self-update profile");
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("PUT /profile - Error updating profile", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Failed to update profile", "message", e.getMessage()));
        } catch (Exception e) {
            log.error("PUT /profile - Unexpected error", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update profile", "message", e.getMessage()));
        }
    }
}
