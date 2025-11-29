package io.respondnow.controller;

import io.respondnow.dto.user.RoleResponse;
import io.respondnow.service.user.RoleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Role Management", description = "Role and permission management")
@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasAuthority('USER_VIEW') or hasAuthority('SYSTEM_ADMIN')")
    @Operation(summary = "Get all roles", description = "Retrieve list of all roles")
    public ResponseEntity<List<RoleResponse>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/{name}")
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasAuthority('USER_VIEW') or hasAuthority('SYSTEM_ADMIN')")
    @Operation(summary = "Get role by name", description = "Retrieve a specific role")
    public ResponseEntity<RoleResponse> getRoleByName(@PathVariable String name) {
        return ResponseEntity.ok(roleService.getRoleByName(name));
    }

    @GetMapping("/{name}/permissions")
    @PreAuthorize("hasAuthority('ROLE_VIEW') or hasAuthority('USER_VIEW') or hasAuthority('SYSTEM_ADMIN')")
    @Operation(summary = "Get role permissions", description = "Get all permissions for a role")
    public ResponseEntity<?> getRolePermissions(@PathVariable String name) {
        return ResponseEntity.ok(roleService.getRolePermissions(name));
    }
}
