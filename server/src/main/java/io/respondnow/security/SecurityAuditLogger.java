package io.respondnow.security;

import io.respondnow.model.audit.SecurityAuditLog;
import io.respondnow.repository.SecurityAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Security audit logger for tracking authentication, authorization, and security-related events.
 * Logs to a separate security log file for compliance and audit purposes.
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class SecurityAuditLogger {
    
    private final SecurityAuditLogRepository auditLogRepository;

    /**
     * Log user login attempt
     */
    public void logLogin(String username, boolean success, String ip) {
        if (success) {
            log.info("SECURITY_AUDIT: Login successful - user: {}, ip: {}", username, ip);
        } else {
            log.warn("SECURITY_AUDIT: Login failed - user: {}, ip: {}", username, ip);
        }
        
        try {
            SecurityAuditLog auditLog = SecurityAuditLog.builder()
                    .eventType(success ? "LOGIN" : "LOGIN_FAILED")
                    .username(username)
                    .ipAddress(ip)
                    .success(success)
                    .timestamp(System.currentTimeMillis())
                    .build();
            SecurityAuditLog saved = auditLogRepository.save(auditLog);
            log.debug("Audit log saved to DB with ID: {}", saved.getId());
        } catch (Exception e) {
            log.error("Failed to save audit log to database", e);
        }
    }

    /**
     * Log user logout
     */
    public void logLogout(String username) {
        log.info("SECURITY_AUDIT: Logout - user: {}", username);
    }

    /**
     * Log access denied attempts
     */
    public void logAccessDenied(String username, String resource, String action) {
        log.warn("SECURITY_AUDIT: Access denied - user: {}, resource: {}, action: {}", 
                 username, resource, action);
        
        SecurityAuditLog auditLog = SecurityAuditLog.builder()
                .eventType("ACCESS_DENIED")
                .username(username)
                .resourceType(resource)
                .action(action)
                .success(false)
                .timestamp(System.currentTimeMillis())
                .build();
        auditLogRepository.save(auditLog);
    }

    /**
     * Log user creation
     */
    public void logUserCreated(String adminUser, String createdUserEmail, Set<String> roles) {
        log.info("SECURITY_AUDIT: User created - by: {}, email: {}, roles: {}", 
                 adminUser, createdUserEmail, roles);
        
        SecurityAuditLog auditLog = SecurityAuditLog.builder()
                .eventType("USER_CREATED")
                .username(createdUserEmail)
                .performedBy(adminUser)
                .resourceType("USER")
                .action("CREATE")
                .details("Roles: " + roles)
                .success(true)
                .timestamp(System.currentTimeMillis())
                .build();
        auditLogRepository.save(auditLog);
    }

    /**
     * Log user update
     */
    public void logUserUpdated(String adminUser, String updatedUserId, String operation) {
        log.info("SECURITY_AUDIT: User updated - by: {}, userId: {}, operation: {}", 
                 adminUser, updatedUserId, operation);
    }

    /**
     * Log user deletion
     */
    public void logUserDeleted(String adminUser, String deletedUserEmail) {
        log.info("SECURITY_AUDIT: User deleted - by: {}, email: {}", adminUser, deletedUserEmail);
        
        SecurityAuditLog auditLog = SecurityAuditLog.builder()
                .eventType("USER_DELETED")
                .username(deletedUserEmail)
                .performedBy(adminUser)
                .resourceType("USER")
                .action("DELETE")
                .success(true)
                .timestamp(System.currentTimeMillis())
                .build();
        auditLogRepository.save(auditLog);
    }

    /**
     * Log role changes
     */
    public void logRoleChange(String adminUser, String targetUserEmail, Set<String> oldRoles, Set<String> newRoles) {
        log.info("SECURITY_AUDIT: Role change - by: {}, user: {}, oldRoles: {}, newRoles: {}", 
                 adminUser, targetUserEmail, oldRoles, newRoles);
    }

    /**
     * Log group creation
     */
    public void logGroupCreated(String adminUser, String groupName, Set<String> roles) {
        log.info("SECURITY_AUDIT: Group created - by: {}, name: {}, roles: {}", 
                 adminUser, groupName, roles);
    }

    /**
     * Log group deletion
     */
    public void logGroupDeleted(String adminUser, String groupName) {
        log.info("SECURITY_AUDIT: Group deleted - by: {}, name: {}", adminUser, groupName);
    }

    /**
     * Log password change attempts
     */
    public void logPasswordChange(String username, boolean success) {
        if (success) {
            log.info("SECURITY_AUDIT: Password changed - user: {}", username);
        } else {
            log.warn("SECURITY_AUDIT: Password change failed - user: {}", username);
        }
        
        SecurityAuditLog auditLog = SecurityAuditLog.builder()
                .eventType("PASSWORD_CHANGE")
                .username(username)
                .success(success)
                .timestamp(System.currentTimeMillis())
                .build();
        auditLogRepository.save(auditLog);
    }

    /**
     * Log unauthorized access attempts
     */
    public void logUnauthorizedAttempt(String username, String endpoint, String method) {
        log.warn("SECURITY_AUDIT: Unauthorized attempt - user: {}, endpoint: {} {}", 
                 username, method, endpoint);
    }

    /**
     * Log forbidden operation attempts (role-based)
     */
    public void logForbiddenOperation(String username, String operation, String reason) {
        log.warn("SECURITY_AUDIT: Forbidden operation - user: {}, operation: {}, reason: {}", 
                 username, operation, reason);
    }

    /**
     * Log incident creation
     */
    public void logIncidentCreated(String username, String incidentId, String severity) {
        log.info("SECURITY_AUDIT: Incident created - by: {}, id: {}, severity: {}", 
                 username, incidentId, severity);
    }

    /**
     * Log incident deletion
     */
    public void logIncidentDeleted(String username, String incidentId) {
        log.info("SECURITY_AUDIT: Incident deleted - by: {}, id: {}", username, incidentId);
    }
}
