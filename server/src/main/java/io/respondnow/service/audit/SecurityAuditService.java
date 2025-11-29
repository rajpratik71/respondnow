package io.respondnow.service.audit;

import io.respondnow.dto.audit.SecurityAuditLogResponse;
import io.respondnow.model.audit.SecurityAuditLog;
import io.respondnow.repository.SecurityAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityAuditService {
    
    private final SecurityAuditLogRepository auditLogRepository;
    
    public Page<SecurityAuditLogResponse> getAllAuditLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable)
                .map(this::toResponse);
    }
    
    public List<SecurityAuditLogResponse> getAuditLogsByUsername(String username) {
        return auditLogRepository.findByUsernameOrderByTimestampDesc(username)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public List<SecurityAuditLogResponse> getAuditLogsByEventType(String eventType) {
        return auditLogRepository.findByEventTypeOrderByTimestampDesc(eventType)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
    
    public Page<SecurityAuditLogResponse> getAuditLogsByDateRange(Long startTime, Long endTime, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startTime, endTime, pageable)
                .map(this::toResponse);
    }
    
    public Map<String, Object> getAuditStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        long now = System.currentTimeMillis();
        long last24Hours = now - (24 * 60 * 60 * 1000);
        long last7Days = now - (7 * 24 * 60 * 60 * 1000);
        
        stats.put("totalLogs", auditLogRepository.count());
        stats.put("loginAttempts24h", auditLogRepository.countByEventTypeAndTimestampGreaterThan("LOGIN", last24Hours));
        stats.put("failedLogins24h", auditLogRepository.countByEventTypeAndTimestampGreaterThan("LOGIN_FAILED", last24Hours));
        stats.put("loginAttempts7d", auditLogRepository.countByEventTypeAndTimestampGreaterThan("LOGIN", last7Days));
        stats.put("failedLogins7d", auditLogRepository.countByEventTypeAndTimestampGreaterThan("LOGIN_FAILED", last7Days));
        stats.put("successfulEvents24h", auditLogRepository.countBySuccessAndTimestampGreaterThan(true, last24Hours));
        stats.put("failedEvents24h", auditLogRepository.countBySuccessAndTimestampGreaterThan(false, last24Hours));
        
        return stats;
    }
    
    private SecurityAuditLogResponse toResponse(SecurityAuditLog log) {
        return SecurityAuditLogResponse.builder()
                .id(log.getId())
                .eventType(log.getEventType())
                .username(log.getUsername())
                .userId(log.getUserId())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .success(log.isSuccess())
                .details(log.getDetails())
                .errorMessage(log.getErrorMessage())
                .timestamp(log.getTimestamp())
                .performedBy(log.getPerformedBy())
                .resourceType(log.getResourceType())
                .resourceId(log.getResourceId())
                .action(log.getAction())
                .build();
    }
}
