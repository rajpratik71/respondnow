package io.respondnow.service.user;

import io.respondnow.dto.user.*;
import io.respondnow.model.user.*;
import io.respondnow.repository.UserRepository;
import io.respondnow.util.JWTUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleService roleService;
    private final GroupService groupService;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtil jwtUtil;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    public UserResponse getUserById(String id) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(id)
            .or(() -> userRepository.findByUserId(id))
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toResponse(user);
    }

    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.findByUserId(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists: " + request.getUsername());
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setUserId(request.getUsername());
        user.setName(request.getFirstName() + " " + request.getLastName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        user.setRemoved(false);
        user.setChangePasswordRequired(false);
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(System.currentTimeMillis());
        user.setUpdatedAt(System.currentTimeMillis());

        // Set roles and groups
        if (request.getRoleNames() != null) {
            user.setRoleNames(request.getRoleNames());
            log.info("Assigned roles to new user: {}", request.getRoleNames());
        }

        if (request.getGroupIds() != null) {
            user.setGroupIds(request.getGroupIds());
            log.info("Assigned groups to new user: {}", request.getGroupIds());
        }

        User saved = userRepository.save(user);
        log.info("Created user: {}", saved.getUserId());
        return toResponse(saved);
    }

    public UserResponse updateUser(String id, UpdateUserRequest request) {
        // Try to find by MongoDB ID first, then by userId (for backward compatibility)
        User user = userRepository.findById(id)
            .or(() -> userRepository.findByUserId(id))
            .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (request.getFirstName() != null && request.getLastName() != null) {
            user.setName(request.getFirstName() + " " + request.getLastName());
        }

        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }

        if (request.getStatus() != null) {
            user.setStatus(request.getStatus());
        }

        // Update roles if provided
        if (request.getRoleNames() != null) {
            user.setRoleNames(request.getRoleNames());
            log.info("Updated roles for user {}: {}", user.getUserId(), request.getRoleNames());
        }

        // Update groups if provided
        if (request.getGroupIds() != null) {
            user.setGroupIds(request.getGroupIds());
            log.info("Updated groups for user {}: {}", user.getUserId(), request.getGroupIds());
        }

        user.setUpdatedAt(System.currentTimeMillis());

        User updated = userRepository.save(user);
        log.info("Updated user: {}", updated.getUserId());
        return toResponse(updated);
    }

    public void deleteUser(String id) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(id)
            .or(() -> userRepository.findByUserId(id))
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        userRepository.delete(user);
        log.info("Permanently deleted user: {}", user.getUserId());
    }

    public void assignRole(String userId, String roleName) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(userId)
            .or(() -> userRepository.findByUserId(userId))
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        // Verify role exists
        roleService.getRoleByName(roleName);
        
        log.info("Assigned role {} to user {}", roleName, user.getUserId());
    }

    public void removeRole(String userId, String roleName) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(userId)
            .or(() -> userRepository.findByUserId(userId))
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        log.info("Removed role {} from user {}", roleName, user.getUserId());
    }

    public Set<Permission> getUserPermissions(String userId) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(userId)
            .or(() -> userRepository.findByUserId(userId))
            .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        
        Set<Permission> permissions = new HashSet<>();
        
        // Get permissions from user's direct roles
        // (In a full implementation, you'd track roles on the User entity)
        
        // Get permissions from user's groups
        List<String> userGroups = groupService.getUserGroups(userId);
        for (String groupName : userGroups) {
            // Aggregate group role permissions
        }
        
        return permissions;
    }

    public void updateUserStatus(String id, UserStatus status) {
        // Try to find by MongoDB ID first, then by userId
        User user = userRepository.findById(id)
            .or(() -> userRepository.findByUserId(id))
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        user.setStatus(status);
        user.setUpdatedAt(System.currentTimeMillis());
        userRepository.save(user);
        log.info("Updated user {} status to {}", user.getUserId(), status);
    }

    /**
     * Get all effective roles for a user including roles from groups
     */
    public Set<String> getEffectiveRoles(User user) {
        Set<String> allRoles = new HashSet<>();
        
        // Add direct user roles
        if (user.getRoleNames() != null) {
            allRoles.addAll(user.getRoleNames());
        }
        
        // Add roles from all groups the user belongs to
        if (user.getGroupIds() != null && !user.getGroupIds().isEmpty()) {
            List<Group> userGroups = groupService.getAllGroupsByIds(user.getGroupIds());
            for (Group group : userGroups) {
                if (group.getRoleNames() != null) {
                    allRoles.addAll(group.getRoleNames());
                }
            }
        }
        
        return allRoles;
    }

    private UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUserId());
        response.setEmail(user.getEmail());
        
        // Parse name
        String[] nameParts = user.getName() != null ? user.getName().split(" ", 2) : new String[]{"", ""};
        response.setFirstName(nameParts.length > 0 ? nameParts[0] : "");
        response.setLastName(nameParts.length > 1 ? nameParts[1] : "");
        response.setFullName(user.getName());
        
        // Use status field if available, otherwise fall back to active flag
        response.setStatus(user.getStatus() != null ? user.getStatus() : 
                          (user.getActive() != null && user.getActive() ? UserStatus.ACTIVE : UserStatus.INACTIVE));
        
        // Get all effective roles (direct + inherited from groups)
        Set<String> effectiveRoles = getEffectiveRoles(user);
        response.setRoleNames(effectiveRoles);
        response.setGroupIds(user.getGroupIds() != null ? user.getGroupIds() : new HashSet<>());
        
        // Populate group names for UI display
        Set<String> groupNames = new HashSet<>();
        if (user.getGroupIds() != null && !user.getGroupIds().isEmpty()) {
            List<Group> userGroups = groupService.getAllGroupsByIds(user.getGroupIds());
            for (Group group : userGroups) {
                groupNames.add(group.getName());
            }
        }
        response.setGroupNames(groupNames);
        
        log.debug("User {} response: groupIds={}, groupNames={}", user.getUserId(), user.getGroupIds(), groupNames);
        
        response.setEffectivePermissions(new HashSet<>());
        
        if (user.getCreatedAt() != null) {
            response.setCreatedAt(LocalDateTime.now()); // Convert from timestamp
        }
        if (user.getUpdatedAt() != null) {
            response.setUpdatedAt(LocalDateTime.now()); // Convert from timestamp
        }
        if (user.getLastLoginAt() != null) {
            response.setLastLoginAt(LocalDateTime.now()); // Convert from timestamp
        }
        
        return response;
    }

    /**
     * Extract user ID from JWT token
     */
    public String getUserIdFromToken(String token) {
        try {
            return jwtUtil.getUserIdFromToken(token);
        } catch (Exception e) {
            log.error("Failed to extract userId from token", e);
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }
}
