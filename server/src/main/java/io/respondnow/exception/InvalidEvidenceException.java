package io.respondnow.exception;

/**
 * Exception thrown when evidence operations fail
 */
public class InvalidEvidenceException extends RuntimeException {
  
  public InvalidEvidenceException(String message) {
    super(message);
  }

  public InvalidEvidenceException(String message, Throwable cause) {
    super(message, cause);
  }
}
