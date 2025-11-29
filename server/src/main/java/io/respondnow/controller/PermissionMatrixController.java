package io.respondnow.controller;

import io.respondnow.dto.audit.PermissionMatrixResponse;
import io.respondnow.service.audit.PermissionMatrixService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PermissionMatrixController {
    
    private final PermissionMatrixService permissionMatrixService;
    
    @GetMapping("/matrix")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'MANAGER', 'SYSTEM_ADMIN')")
    public ResponseEntity<PermissionMatrixResponse> getPermissionMatrix() {
        log.info("GET /api/permissions/matrix");
        PermissionMatrixResponse matrix = permissionMatrixService.getPermissionMatrix();
        return ResponseEntity.ok(matrix);
    }
}
