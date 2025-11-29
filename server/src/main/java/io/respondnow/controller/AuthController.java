package io.respondnow.controller;

import static io.respondnow.util.constants.AppConstants.ApiPaths.AUTH_BASE;
import static io.respondnow.util.constants.AppConstants.ApiPaths.CHANGE_PASSWORD;
import static io.respondnow.util.constants.AppConstants.ApiPaths.LOGIN;
import static io.respondnow.util.constants.AppConstants.ApiPaths.SIGNUP;
import static io.respondnow.util.constants.AppConstants.ApiPaths.USER_MAPPING;

import io.respondnow.dto.auth.AddUserInput;
import io.respondnow.dto.auth.ChangePasswordInput;
import io.respondnow.dto.auth.ChangePasswordResponseDTO;
import io.respondnow.dto.auth.ChangePasswordResponseData;
import io.respondnow.dto.auth.GetUserMappingResponseDTO;
import io.respondnow.dto.auth.LoginResponseDTO;
import io.respondnow.dto.auth.LoginResponseData;
import io.respondnow.dto.auth.LoginUserInput;
import io.respondnow.dto.auth.SignupResponseDTO;
import io.respondnow.dto.auth.UserMappingData;
import io.respondnow.exception.EmailAlreadyExistsException;
import io.respondnow.exception.UserNotFoundException;
import io.respondnow.model.user.User;
import io.respondnow.service.auth.AuthService;
import io.respondnow.service.hierarchy.UserMappingService;
import io.respondnow.service.user.UserManagementService;
import io.respondnow.util.JWTUtil;
import io.respondnow.util.constants.AppConstants;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import java.util.Set;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(AUTH_BASE)
@Slf4j
public class AuthController {

  private final AuthService authService;
  private final UserMappingService userMappingService;
  private final UserManagementService userService;
  private final JWTUtil jwtUtil;

  @Autowired
  public AuthController(
      AuthService authService, UserMappingService userMappingService, 
      UserManagementService userService, JWTUtil jwtUtil) {
    this.authService = authService;
    this.userMappingService = userMappingService;
    this.userService = userService;
    this.jwtUtil = jwtUtil;
  }

  @Operation(summary = "Sign up a new user")
  @ApiResponses({
    @ApiResponse(responseCode = "201", description = "User signed up successfully"),
    @ApiResponse(responseCode = "400", description = "Bad Request"),
    @ApiResponse(responseCode = "409", description = "Conflict - Email already exists")
  })
  @PostMapping(SIGNUP)
  public ResponseEntity<SignupResponseDTO> signup(@RequestBody @Valid AddUserInput input) {
    try {
      log.info("POST /auth/signup - Signup request for email: {}, userId: {}", input.getEmail(), input.getUserId());
      
      User user = authService.signup(input);
      String token = jwtUtil.generateToken(user.getName(), user.getUserId(), user.getEmail());

      log.info("Signup successful for user: {}", user.getUserId());
      
      SignupResponseDTO response =
          new SignupResponseDTO(
              AppConstants.ResponseStatus.SUCCESS, "User registered successfully", token, user);
      return ResponseEntity.status(HttpStatus.CREATED).body(response);
    } catch (EmailAlreadyExistsException e) {
      log.error("POST /auth/signup - Signup failed: {}", e.getMessage());
      SignupResponseDTO response =
          new SignupResponseDTO(
              AppConstants.ResponseStatus.ERROR, "Email already exists", null, null);
      return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    } catch (Exception e) {
      log.error("POST /auth/signup - Unexpected error during signup", e);
      SignupResponseDTO response =
          new SignupResponseDTO(AppConstants.ResponseStatus.ERROR, "Signup failed: " + e.getMessage(), null, null);
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
  }

  @Operation(summary = "User login")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Login successful"),
    @ApiResponse(responseCode = "400", description = "Bad Request"),
    @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid credentials")
  })
  @PostMapping(LOGIN)
  public ResponseEntity<LoginResponseDTO> login(@RequestBody @Valid LoginUserInput input) {
    try {
      log.info("POST /auth/login - Login request for email: {}", input.getEmail());
      
      User user = authService.login(input);
      
      log.info("User authenticated: userId={}, email={}, active={}, changePasswordRequired={}", 
          user.getUserId(), user.getEmail(), user.getActive(), user.getChangePasswordRequired());
      
      // Get all effective roles including those inherited from groups
      Set<String> effectiveRoles = userService.getEffectiveRoles(user);
      
      log.info("Effective roles for user {}: directRoles={}, effectiveRoles={}, groupIds={}", 
          user.getUserId(), user.getRoleNames(), effectiveRoles, user.getGroupIds());
      
      String token = jwtUtil.generateToken(user.getName(), user.getUserId(), user.getEmail(), effectiveRoles);
      
      log.debug("JWT token generated for user: {}", user.getUserId());

      if (Boolean.TRUE.equals(user.getChangePasswordRequired())) {
        log.info("User {} requires password change", user.getUserId());
        LoginResponseData data = new LoginResponseData(token, user.getLastLoginAt(), true);
        LoginResponseDTO response =
            new LoginResponseDTO(
                AppConstants.ResponseStatus.ERROR, "Change Password is required", data);
        return ResponseEntity.ok(response);
      }

      log.info("Login successful for user: {}", user.getUserId());
      
      LoginResponseData data =
          new LoginResponseData(
              token, System.currentTimeMillis(), user.getChangePasswordRequired());
      LoginResponseDTO response =
          new LoginResponseDTO(AppConstants.ResponseStatus.SUCCESS, "Login successful", data);
      return ResponseEntity.ok(response);
    } catch (UserNotFoundException e) {
      log.error("POST /auth/login - Login failed: {}", e.getMessage());
      LoginResponseDTO response =
          new LoginResponseDTO(AppConstants.ResponseStatus.ERROR, e.getMessage(), null);
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    } catch (Exception e) {
      log.error("POST /auth/login - Unexpected error during login", e);
      LoginResponseDTO response =
          new LoginResponseDTO(AppConstants.ResponseStatus.ERROR, "Login failed: " + e.getMessage(), null);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  @Operation(summary = "Change user password")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Password changed successfully"),
    @ApiResponse(responseCode = "400", description = "Bad Request"),
    @ApiResponse(responseCode = "401", description = "Unauthorized - Invalid credentials"),
    @ApiResponse(responseCode = "404", description = "Not Found - User not found")
  })
  @PostMapping(CHANGE_PASSWORD)
  public ResponseEntity<ChangePasswordResponseDTO> changePassword(
      @RequestBody @Valid ChangePasswordInput input) {
    try {
      log.info("POST /auth/changePassword - Change password request for email: {}", input.getEmail());
      
      User user = authService.changePassword(input);
      
      // Get effective roles after password change
      Set<String> effectiveRoles = userService.getEffectiveRoles(user);
      String token = jwtUtil.generateToken(user.getName(), user.getUserId(), user.getEmail(), effectiveRoles);

      log.info("Password changed successfully for user: {}", user.getUserId());
      
      ChangePasswordResponseData data =
          new ChangePasswordResponseData(token, System.currentTimeMillis());
      ChangePasswordResponseDTO response =
          new ChangePasswordResponseDTO(
              AppConstants.ResponseStatus.SUCCESS, "Password changed successfully", data);
      return ResponseEntity.ok(response);
    } catch (UserNotFoundException e) {
      log.error("POST /auth/changePassword - Password change failed: {}", e.getMessage());
      ChangePasswordResponseDTO response =
          new ChangePasswordResponseDTO(AppConstants.ResponseStatus.ERROR, e.getMessage(), null);
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    } catch (Exception e) {
      log.error("POST /auth/changePassword - Unexpected error", e);
      ChangePasswordResponseDTO response =
          new ChangePasswordResponseDTO(AppConstants.ResponseStatus.ERROR, "Password change failed: " + e.getMessage(), null);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
  }

  @Operation(summary = "Get User Mappings")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "User mappings retrieved successfully",
            content = @Content(schema = @Schema(implementation = GetUserMappingResponseDTO.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input",
            content = @Content(schema = @Schema(implementation = GetUserMappingResponseDTO.class))),
        @ApiResponse(
            responseCode = "500",
            description = "Internal Server Error",
            content = @Content(schema = @Schema(implementation = GetUserMappingResponseDTO.class)))
      })
  @GetMapping(USER_MAPPING)
  public ResponseEntity<GetUserMappingResponseDTO> getUserMappings(
      @RequestParam(value = "correlationId", required = false) String correlationId,
      @RequestParam(value = "userId") String userId) {

    // Generate correlationId if not provided
    if (correlationId == null || correlationId.isEmpty()) {
      correlationId = UUID.randomUUID().toString();
    }
    GetUserMappingResponseDTO response = new GetUserMappingResponseDTO();
    response.setCorrelationId(correlationId);

    if (userId == null || userId.isEmpty()) {
      response.setMessage("userId is required in the query");
      response.setStatus(AppConstants.ResponseStatus.ERROR);
      return ResponseEntity.badRequest().body(response);
    }
    try {
      UserMappingData userMappingData = userMappingService.getUserMappings(correlationId, userId);
      response.setData(userMappingData);
      response.setMessage("User mappings retrieved successfully");
      response.setStatus(AppConstants.ResponseStatus.SUCCESS);
      return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
      response.setMessage("Error: " + e.getMessage());
      response.setStatus(AppConstants.ResponseStatus.ERROR);
      return ResponseEntity.internalServerError().body(response);
    }
  }
}
