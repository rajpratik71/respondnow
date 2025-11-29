package io.respondnow.service.user;

import io.respondnow.dto.user.CreateUserRequest;
import io.respondnow.dto.user.UpdateUserRequest;
import io.respondnow.dto.user.UserResponse;
import io.respondnow.model.user.SystemRole;
import io.respondnow.model.user.User;
import io.respondnow.repository.UserRepository;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserManagementServiceImpl implements UserManagementService {

  @Autowired
  private UserRepository userRepository;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

  @Override
  public List<UserResponse> listUsers(String accountIdentifier, String orgIdentifier) {
    List<User> users = userRepository.findByAccountIdentifierAndOrgIdentifier(accountIdentifier, orgIdentifier);
    return users.stream()
        .filter(user -> user.getRemoved() == null || !user.getRemoved())
        .map(UserResponse::fromUser)
        .collect(Collectors.toList());
  }

  @Override
  public UserResponse getUserById(String userId, String accountIdentifier) {
    User user = userRepository.findByUserIdAndAccountIdentifier(userId, accountIdentifier)
        .orElseThrow(() -> new RuntimeException("User not found: " + userId));

    if (user.getRemoved() != null && user.getRemoved()) {
      throw new RuntimeException("User has been deleted: " + userId);
    }

    return UserResponse.fromUser(user);
  }

  @Override
  public UserResponse createUser(CreateUserRequest request, String accountIdentifier, String orgIdentifier, String createdBy) {
    // Check if user already exists
    if (userRepository.findByEmailAndAccountIdentifier(request.getEmail(), accountIdentifier).isPresent()) {
      throw new RuntimeException("User with email already exists: " + request.getEmail());
    }

    if (userRepository.findByUserIdAndAccountIdentifier(request.getUserId(), accountIdentifier).isPresent()) {
      throw new RuntimeException("User with userId already exists: " + request.getUserId());
    }

    // Create new user
    User user = new User();
    user.setName(request.getName());
    user.setUserId(request.getUserId());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setSystemRole(request.getSystemRole() != null ? request.getSystemRole() : SystemRole.OBSERVER);
    user.setPermissions(request.getPermissions() != null ? request.getPermissions() : new HashSet<>());
    user.setActive(request.getActive() != null ? request.getActive() : true);
    user.setAccountIdentifier(accountIdentifier);
    user.setOrgIdentifier(orgIdentifier);
    user.setCreatedAt(System.currentTimeMillis() / 1000);
    user.setCreatedBy(createdBy);
    user.setRemoved(false);

    User savedUser = userRepository.save(user);
    return UserResponse.fromUser(savedUser);
  }

  @Override
  public UserResponse updateUser(String userId, UpdateUserRequest request, String accountIdentifier, String updatedBy) {
    User user = userRepository.findByUserIdAndAccountIdentifier(userId, accountIdentifier)
        .orElseThrow(() -> new RuntimeException("User not found: " + userId));

    if (user.getRemoved() != null && user.getRemoved()) {
      throw new RuntimeException("Cannot update deleted user: " + userId);
    }

    // Update fields if provided
    if (request.getName() != null) {
      user.setName(request.getName());
    }
    if (request.getEmail() != null) {
      // Check if new email is already in use by another user
      userRepository.findByEmailAndAccountIdentifier(request.getEmail(), accountIdentifier)
          .ifPresent(existingUser -> {
            if (!existingUser.getId().equals(user.getId())) {
              throw new RuntimeException("Email already in use: " + request.getEmail());
            }
          });
      user.setEmail(request.getEmail());
    }
    if (request.getSystemRole() != null) {
      user.setSystemRole(request.getSystemRole());
    }
    if (request.getPermissions() != null) {
      user.setPermissions(request.getPermissions());
    }
    if (request.getTeamIds() != null) {
      user.setTeamIds(request.getTeamIds());
    }
    if (request.getActive() != null) {
      user.setActive(request.getActive());
    }

    user.setUpdatedAt(System.currentTimeMillis() / 1000);
    user.setUpdatedBy(updatedBy);

    User updatedUser = userRepository.save(user);
    return UserResponse.fromUser(updatedUser);
  }

  @Override
  public void deleteUser(String userId, String accountIdentifier) {
    User user = userRepository.findByUserIdAndAccountIdentifier(userId, accountIdentifier)
        .orElseThrow(() -> new RuntimeException("User not found: " + userId));

    // Soft delete
    user.setRemoved(true);
    user.setRemovedAt(System.currentTimeMillis() / 1000);
    user.setActive(false);

    userRepository.save(user);
  }

  @Override
  public List<UserResponse> getUsersByRole(String accountIdentifier, String orgIdentifier, SystemRole role) {
    List<User> users = userRepository.findByAccountIdentifierAndOrgIdentifierAndSystemRole(
        accountIdentifier, orgIdentifier, role);
    return users.stream()
        .filter(user -> user.getRemoved() == null || !user.getRemoved())
        .map(UserResponse::fromUser)
        .collect(Collectors.toList());
  }

  @Override
  public List<UserResponse> getUsersByStatus(String accountIdentifier, String orgIdentifier, Boolean active) {
    List<User> users = userRepository.findByAccountIdentifierAndOrgIdentifierAndActive(
        accountIdentifier, orgIdentifier, active);
    return users.stream()
        .filter(user -> user.getRemoved() == null || !user.getRemoved())
        .map(UserResponse::fromUser)
        .collect(Collectors.toList());
  }

  @Override
  public List<UserResponse> searchUsers(String accountIdentifier, String orgIdentifier, String searchText) {
    List<User> users = userRepository.searchUsers(accountIdentifier, orgIdentifier, searchText);
    return users.stream()
        .filter(user -> user.getRemoved() == null || !user.getRemoved())
        .map(UserResponse::fromUser)
        .collect(Collectors.toList());
  }
}
