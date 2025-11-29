package io.respondnow.model.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "security_audit_logs")
public class SecurityAuditLog {
    
    @Id
    private String id;
    
    private String eventType;  // LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGE, USER_CREATED, etc.
    private String username;
    private String userId;
    private String ipAddress;
    private String userAgent;
    private boolean success;
    private String details;
    private String errorMessage;
    private Long timestamp;
    private String performedBy;  // Who performed the action (for admin actions)
    
    // Additional context
    private String resourceType;  // USER, GROUP, ROLE, etc.
    private String resourceId;
    private String action;  // CREATE, UPDATE, DELETE, VIEW, etc.
}
