package io.respondnow.service.user;

import io.respondnow.dto.user.CreateUserRequest;
import io.respondnow.dto.user.UpdateUserRequest;
import io.respondnow.dto.user.UserResponse;
import io.respondnow.model.user.SystemRole;
import java.util.List;

public interface UserManagementService {

  /**
   * Get all users for a tenant
   */
  List<UserResponse> listUsers(String accountIdentifier, String orgIdentifier);

  /**
   * Get a specific user by ID
   */
  UserResponse getUserById(String userId, String accountIdentifier);

  /**
   * Create a new user
   */
  UserResponse createUser(CreateUserRequest request, String accountIdentifier, String orgIdentifier, String createdBy);

  /**
   * Update an existing user
   */
  UserResponse updateUser(String userId, UpdateUserRequest request, String accountIdentifier, String updatedBy);

  /**
   * Delete a user (soft delete)
   */
  void deleteUser(String userId, String accountIdentifier);

  /**
   * Filter users by role
   */
  List<UserResponse> getUsersByRole(String accountIdentifier, String orgIdentifier, SystemRole role);

  /**
   * Filter users by active status
   */
  List<UserResponse> getUsersByStatus(String accountIdentifier, String orgIdentifier, Boolean active);

  /**
   * Search users by name, email, or userId
   */
  List<UserResponse> searchUsers(String accountIdentifier, String orgIdentifier, String searchText);
}
