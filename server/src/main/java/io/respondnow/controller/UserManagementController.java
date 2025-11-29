package io.respondnow.controller;

import io.respondnow.dto.user.CreateUserRequest;
import io.respondnow.dto.user.UpdateUserRequest;
import io.respondnow.dto.user.UserResponse;
import io.respondnow.model.user.SystemRole;
import io.respondnow.service.user.UserManagementService;
import io.respondnow.util.JWTUtil;
import java.util.List;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

  @Autowired
  private UserManagementService userManagementService;

  @Autowired
  private JWTUtil jwtUtil;

  /**
   * List all users for the organization
   */
  @GetMapping
  public ResponseEntity<List<UserResponse>> listUsers(
      @RequestParam String accountIdentifier,
      @RequestParam(required = false) String orgIdentifier,
      @RequestParam(required = false) String role,
      @RequestParam(required = false) Boolean active,
      @RequestParam(required = false) String search,
      HttpServletRequest request) {

    String currentUser = getCurrentUser(request);
    String org = orgIdentifier != null ? orgIdentifier : getOrgFromToken(request);

    List<UserResponse> users;

    if (search != null && !search.isEmpty()) {
      users = userManagementService.searchUsers(accountIdentifier, org, search);
    } else if (role != null) {
      SystemRole systemRole = SystemRole.valueOf(role);
      users = userManagementService.getUsersByRole(accountIdentifier, org, systemRole);
    } else if (active != null) {
      users = userManagementService.getUsersByStatus(accountIdentifier, org, active);
    } else {
      users = userManagementService.listUsers(accountIdentifier, org);
    }

    return ResponseEntity.ok(users);
  }

  /**
   * Get a specific user
   */
  @GetMapping("/{userId}")
  public ResponseEntity<UserResponse> getUser(
      @PathVariable String userId,
      @RequestParam String accountIdentifier,
      HttpServletRequest request) {

    UserResponse user = userManagementService.getUserById(userId, accountIdentifier);
    return ResponseEntity.ok(user);
  }

  /**
   * Create a new user (Admin only)
   */
  @PostMapping
  public ResponseEntity<UserResponse> createUser(
      @Valid @RequestBody CreateUserRequest createRequest,
      @RequestParam String accountIdentifier,
      @RequestParam(required = false) String orgIdentifier,
      HttpServletRequest request) {

    String currentUser = getCurrentUser(request);
    String org = orgIdentifier != null ? orgIdentifier : getOrgFromToken(request);

    UserResponse user = userManagementService.createUser(
        createRequest, accountIdentifier, org, currentUser);

    return ResponseEntity.status(HttpStatus.CREATED).body(user);
  }

  /**
   * Update an existing user (Admin only)
   */
  @PutMapping("/{userId}")
  public ResponseEntity<UserResponse> updateUser(
      @PathVariable String userId,
      @Valid @RequestBody UpdateUserRequest updateRequest,
      @RequestParam String accountIdentifier,
      HttpServletRequest request) {

    String currentUser = getCurrentUser(request);

    UserResponse user = userManagementService.updateUser(
        userId, updateRequest, accountIdentifier, currentUser);

    return ResponseEntity.ok(user);
  }

  /**
   * Delete a user (Admin only)
   */
  @DeleteMapping("/{userId}")
  public ResponseEntity<Void> deleteUser(
      @PathVariable String userId,
      @RequestParam String accountIdentifier,
      HttpServletRequest request) {

    userManagementService.deleteUser(userId, accountIdentifier);
    return ResponseEntity.noContent().build();
  }

  /**
   * Get current user from JWT token
   */
  private String getCurrentUser(HttpServletRequest request) {
    String token = request.getHeader("Authorization");
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
      return jwtUtil.getUsernameFromToken(token);
    }
    return "system";
  }

  /**
   * Get organization from JWT token
   */
  private String getOrgFromToken(HttpServletRequest request) {
    String token = request.getHeader("Authorization");
    if (token != null && token.startsWith("Bearer ")) {
      token = token.substring(7);
      // Extract org from token if available
      // For now, return default
      return "default";
    }
    return "default";
  }
}
