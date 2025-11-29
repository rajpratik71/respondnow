package io.respondnow.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Exception thrown when a user attempts an operation they don't have permission for.
 * Results in HTTP 403 Forbidden.
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
public class ForbiddenOperationException extends RuntimeException {
    
    public ForbiddenOperationException(String message) {
        super(message);
    }
    
    public ForbiddenOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
