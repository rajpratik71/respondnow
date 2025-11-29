package io.respondnow.model.user;

/**
 * Enum representing the status of a user account.
 */
public enum UserStatus {
    /**
     * User account is active and can log in.
     */
    ACTIVE,
    
    /**
     * User account is temporarily inactive.
     * User cannot log in but account is preserved.
     */
    INACTIVE,
    
    /**
     * User account is suspended due to policy violations or security concerns.
     * User cannot log in and may require admin intervention.
     */
    SUSPENDED,
    
    /**
     * User account is pending activation (e.g., email verification).
     */
    PENDING
}
