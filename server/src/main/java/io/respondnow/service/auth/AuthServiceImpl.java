package io.respondnow.service.auth;

import io.respondnow.dto.auth.AddUserInput;
import io.respondnow.dto.auth.ChangePasswordInput;
import io.respondnow.dto.auth.LoginUserInput;
import io.respondnow.exception.EmailAlreadyExistsException;
import io.respondnow.exception.UserNotFoundException;
import io.respondnow.model.user.User;
import io.respondnow.model.user.UserStatus;
import io.respondnow.repository.UserRepository;
import io.respondnow.util.JWTUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AuthServiceImpl implements AuthService {

  @Autowired private UserRepository userRepository;

  @Autowired private BCryptPasswordEncoder passwordEncoder;

  @Autowired private JWTUtil jwtUtil;

  @Override
  public User login(LoginUserInput input) {
    log.info("Login attempt for email: {}", input.getEmail());
    
    User user =
        userRepository
            .findByEmail(input.getEmail())
            .orElseThrow(() -> {
              log.error("Login failed - User not found: {}", input.getEmail());
              return new UserNotFoundException("User not found");
            });

    log.debug("User found: userId={}, active={}, status={}, removed={}, changePasswordRequired={}", 
        user.getUserId(), user.getActive(), user.getStatus(), user.getRemoved(), user.getChangePasswordRequired());

    // Check if user is removed
    if (Boolean.TRUE.equals(user.getRemoved())) {
      log.error("Login failed - User account is removed: {}", input.getEmail());
      throw new UserNotFoundException("User account has been removed");
    }

    // Check if user is active - must be explicitly TRUE
    if (!Boolean.TRUE.equals(user.getActive())) {
      log.error("Login failed - User account is not active (active={}): {}", user.getActive(), input.getEmail());
      throw new UserNotFoundException("User account is not active. Please contact administrator for activation.");
    }

    // Verify password
    if (!passwordEncoder.matches(input.getPassword(), user.getPassword())) {
      log.error("Login failed - Invalid credentials for: {}", input.getEmail());
      throw new UserNotFoundException("Invalid credentials");
    }

    log.info("Login successful for user: {} ({})", user.getUserId(), input.getEmail());
    
    // Update last login time
    user.setLastLoginAt(System.currentTimeMillis());
    return userRepository.save(user);
  }

  @Override
  public User changePassword(ChangePasswordInput input) {
    log.info("Change password attempt for email: {}", input.getEmail());
    
    User user =
        userRepository
            .findByEmail(input.getEmail())
            .orElseThrow(() -> {
              log.error("Change password failed - User not found: {}", input.getEmail());
              return new UserNotFoundException("User not found");
            });

    user.setPassword(passwordEncoder.encode(input.getNewPassword()));
    user.setChangePasswordRequired(false);
    user.setActive(true);
    user.setUpdatedAt(System.currentTimeMillis());
    
    User savedUser = userRepository.save(user);
    log.info("Password changed successfully for user: {}", savedUser.getUserId());
    
    return savedUser;
  }

  @Override
  public User signup(AddUserInput input) {
    log.info("Signup attempt for email: {}, userId: {}", input.getEmail(), input.getUserId());
    
    // Check if the email already exists
    if (userRepository.existsByEmail(input.getEmail())) {
      log.error("Signup failed - Email already exists: {}", input.getEmail());
      throw new EmailAlreadyExistsException("User email already exists");
    }
    
    User user = new User();
    user.setEmail(input.getEmail());
    user.setPassword(passwordEncoder.encode(input.getPassword()));
    user.setName(input.getName());
    user.setUserId(input.getUserId());
    user.setActive(false);
    user.setStatus(UserStatus.PENDING);
    user.setChangePasswordRequired(true);
    user.setCreatedAt(System.currentTimeMillis());
    user.setUpdatedAt(System.currentTimeMillis());
    user.setRemoved(false);
    
    User savedUser = userRepository.save(user);
    log.info("Signup successful for user: {} ({})", savedUser.getUserId(), savedUser.getEmail());
    
    return savedUser;
  }

  @Retryable(
      value = Exception.class,
      maxAttempts = 3,
      backoff = @Backoff(delay = 2000, multiplier = 1.5))
  public User signupWithRetry(AddUserInput input) {
    // Check if the email already exists
    if (userRepository.existsByEmail(input.getEmail())) {
      throw new EmailAlreadyExistsException("User email already exists");
    }
    User user = new User();
    user.setEmail(input.getEmail());
    user.setPassword(passwordEncoder.encode(input.getPassword()));
    user.setName(input.getName());
    user.setUserId(input.getUserId());
    user.setActive(false);
    user.setStatus(UserStatus.PENDING);
    user.setChangePasswordRequired(true);
    user.setCreatedAt(System.currentTimeMillis());
    user.setUpdatedAt(System.currentTimeMillis());
    return userRepository.save(user);
  }
}
