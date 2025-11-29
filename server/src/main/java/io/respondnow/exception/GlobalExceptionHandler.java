package io.respondnow.exception;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(
      ResourceNotFoundException ex, WebRequest request) {
    log.error("Resource not found: {} | URI: {}", ex.getMessage(), request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Resource Not Found");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("status", HttpStatus.NOT_FOUND.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
  }

  @ExceptionHandler(BadRequestException.class)
  public ResponseEntity<Map<String, Object>> handleBadRequestException(
      BadRequestException ex, WebRequest request) {
    log.error("Bad request: {} | URI: {}", ex.getMessage(), request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Bad Request");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(MalformedJwtException.class)
  public ResponseEntity<Map<String, Object>> handleMalformedJwtException(
      MalformedJwtException ex, WebRequest request) {
    log.error("Malformed JWT token: {} | URI: {}", ex.getMessage(), request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Invalid Token");
    errorResponse.put("message", "The authentication token is malformed or invalid. Please log in again.");
    errorResponse.put("details", ex.getMessage());
    errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(ExpiredJwtException.class)
  public ResponseEntity<Map<String, Object>> handleExpiredJwtException(
      ExpiredJwtException ex, WebRequest request) {
    log.error("Expired JWT token | URI: {}", request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Token Expired");
    errorResponse.put("message", "Your authentication token has expired. Please log in again.");
    errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(SignatureException.class)
  public ResponseEntity<Map<String, Object>> handleSignatureException(
      SignatureException ex, WebRequest request) {
    log.error("Invalid JWT signature | URI: {}", request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Invalid Token Signature");
    errorResponse.put("message", "The authentication token signature is invalid. Please log in again.");
    errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<Map<String, Object>> handleAccessDeniedException(
      AccessDeniedException ex, WebRequest request) {
    log.error("Access denied: {} | URI: {}", ex.getMessage(), request.getDescription(false));
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Access Denied");
    errorResponse.put("message", "You do not have permission to access this resource.");
    errorResponse.put("status", HttpStatus.FORBIDDEN.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<Map<String, Object>> handleBadCredentialsException(
      BadCredentialsException ex, WebRequest request) {
    log.error("Bad credentials | URI: {}", request.getDescription(false));
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Authentication Failed");
    errorResponse.put("message", "Invalid username or password.");
    errorResponse.put("status", HttpStatus.UNAUTHORIZED.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<Map<String, Object>> handleValidationException(
      MethodArgumentNotValidException ex, WebRequest request) {
    log.error("Validation failed | URI: {}", request.getDescription(false));
    
    Map<String, String> validationErrors = new HashMap<>();
    ex.getBindingResult().getFieldErrors().forEach(error -> 
        validationErrors.put(error.getField(), error.getDefaultMessage())
    );
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Validation Failed");
    errorResponse.put("message", "Input validation failed. Please check your request.");
    errorResponse.put("validationErrors", validationErrors);
    errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }

  @ExceptionHandler(RuntimeException.class)
  public ResponseEntity<Map<String, Object>> handleRuntimeException(
      RuntimeException ex, WebRequest request) {
    log.error("Runtime exception: {} | URI: {}", ex.getMessage(), request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Internal Server Error");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<Map<String, Object>> handleGeneralException(
      Exception ex, WebRequest request) {
    log.error("Unexpected exception: {} | URI: {} | Type: {}", 
        ex.getMessage(), request.getDescription(false), ex.getClass().getName(), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Internal Server Error");
    errorResponse.put("message", "An unexpected error occurred. Please try again later.");
    errorResponse.put("details", ex.getMessage());
    errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  @ExceptionHandler(UserNotFoundException.class)
  public ResponseEntity<Map<String, Object>> handleUserNotFoundException(
      UserNotFoundException ex, WebRequest request) {
    log.error("User not found: {} | URI: {}", ex.getMessage(), request.getDescription(false), ex);
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "User Not Found");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("status", HttpStatus.NOT_FOUND.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
  }

  @ExceptionHandler(ForbiddenOperationException.class)
  public ResponseEntity<Map<String, Object>> handleForbiddenOperationException(
      ForbiddenOperationException ex, WebRequest request) {
    log.error("Forbidden operation: {} | URI: {}", ex.getMessage(), request.getDescription(false));
    
    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("error", "Forbidden Operation");
    errorResponse.put("message", ex.getMessage());
    errorResponse.put("status", HttpStatus.FORBIDDEN.value());
    errorResponse.put("timestamp", System.currentTimeMillis());
    
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorResponse);
  }
}
