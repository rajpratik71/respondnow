package io.respondnow.model.user;

/**
 * Enum representing the type of role in the system.
 * SYSTEM roles are predefined and cannot be deleted.
 * CUSTOM roles are created by administrators and can be modified/deleted.
 */
public enum UserRoleType {
    /**
     * System-defined roles that come with the application.
     * Examples: ADMIN, MANAGER, RESPONDER, VIEWER
     * These roles cannot be deleted but can have their permissions adjusted.
     */
    SYSTEM,
    
    /**
     * Custom roles created by administrators.
     * These can be fully customized and deleted.
     */
    CUSTOM
}
