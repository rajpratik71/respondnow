package io.respondnow.repository;

import io.respondnow.model.audit.SecurityAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SecurityAuditLogRepository extends MongoRepository<SecurityAuditLog, String> {
    
    Page<SecurityAuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
    
    List<SecurityAuditLog> findByUsernameOrderByTimestampDesc(String username);
    
    List<SecurityAuditLog> findByEventTypeOrderByTimestampDesc(String eventType);
    
    List<SecurityAuditLog> findBySuccessOrderByTimestampDesc(boolean success);
    
    Page<SecurityAuditLog> findByUsernameOrderByTimestampDesc(String username, Pageable pageable);
    
    Page<SecurityAuditLog> findByEventTypeOrderByTimestampDesc(String eventType, Pageable pageable);
    
    Page<SecurityAuditLog> findByTimestampBetweenOrderByTimestampDesc(Long startTime, Long endTime, Pageable pageable);
    
    long countByEventTypeAndTimestampGreaterThan(String eventType, Long timestamp);
    
    long countBySuccessAndTimestampGreaterThan(boolean success, Long timestamp);
}
