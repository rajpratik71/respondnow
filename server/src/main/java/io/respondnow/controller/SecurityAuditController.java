package io.respondnow.controller;

import io.respondnow.dto.audit.SecurityAuditLogResponse;
import io.respondnow.service.audit.SecurityAuditService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SecurityAuditController {
    
    private final SecurityAuditService auditService;
    
    @GetMapping("/logs")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Page<SecurityAuditLogResponse>> getAllAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("GET /api/audit/logs - page: {}, size: {}", page, size);
        Page<SecurityAuditLogResponse> logs = auditService.getAllAuditLogs(page, size);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/logs/user/{username}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<SecurityAuditLogResponse>> getAuditLogsByUsername(
            @PathVariable String username) {
        log.info("GET /api/audit/logs/user/{}", username);
        List<SecurityAuditLogResponse> logs = auditService.getAuditLogsByUsername(username);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/logs/event/{eventType}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<List<SecurityAuditLogResponse>> getAuditLogsByEventType(
            @PathVariable String eventType) {
        log.info("GET /api/audit/logs/event/{}", eventType);
        List<SecurityAuditLogResponse> logs = auditService.getAuditLogsByEventType(eventType);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/logs/daterange")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Page<SecurityAuditLogResponse>> getAuditLogsByDateRange(
            @RequestParam Long startTime,
            @RequestParam Long endTime,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        log.info("GET /api/audit/logs/daterange - start: {}, end: {}", startTime, endTime);
        Page<SecurityAuditLogResponse> logs = auditService.getAuditLogsByDateRange(startTime, endTime, page, size);
        return ResponseEntity.ok(logs);
    }
    
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAuditStatistics() {
        log.info("GET /api/audit/statistics");
        Map<String, Object> stats = auditService.getAuditStatistics();
        return ResponseEntity.ok(stats);
    }
}
