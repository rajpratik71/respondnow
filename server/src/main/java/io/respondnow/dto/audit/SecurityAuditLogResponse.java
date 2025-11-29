package io.respondnow.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAuditLogResponse {
    private String id;
    private String eventType;
    private String username;
    private String userId;
    private String ipAddress;
    private String userAgent;
    private boolean success;
    private String details;
    private String errorMessage;
    private Long timestamp;
    private String performedBy;
    private String resourceType;
    private String resourceId;
    private String action;
}
