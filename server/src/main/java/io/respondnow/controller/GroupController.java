package io.respondnow.controller;

import io.respondnow.dto.user.CreateGroupRequest;
import io.respondnow.dto.user.GroupResponse;
import io.respondnow.service.user.GroupService;
import io.respondnow.util.JWTUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@Tag(name = "Group Management", description = "Group management operations")
@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
@Slf4j
public class GroupController {

    private final GroupService groupService;
    private final JWTUtil jwtUtil;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('VIEWER', 'RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get all groups", description = "Retrieve list of all groups")
    public ResponseEntity<?> getAllGroups() {
        try {
            log.info("GET /groups - Fetching all groups");
            List<GroupResponse> groups = groupService.getAllGroups();
            log.info("GET /groups - Successfully fetched {} groups", groups.size());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            log.error("GET /groups - Error fetching groups", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to fetch groups", "message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('VIEWER', 'RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Get group by ID", description = "Retrieve a specific group")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable String id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Create group", description = "Create a new group")
    public ResponseEntity<GroupResponse> createGroup(
            @Valid @RequestBody CreateGroupRequest request,
            HttpServletRequest httpRequest) {
        String currentUser = getCurrentUser(httpRequest);
        GroupResponse group = groupService.createGroup(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(group);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Update group", description = "Update an existing group")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable String id,
            @Valid @RequestBody CreateGroupRequest request,
            HttpServletRequest httpRequest) {
        String currentUser = getCurrentUser(httpRequest);
        return ResponseEntity.ok(groupService.updateGroup(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Delete group", description = "Delete a group")
    public ResponseEntity<Void> deleteGroup(@PathVariable String id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Add member to group", description = "Add a user to a group")
    public ResponseEntity<Void> addMember(
            @PathVariable String id,
            @RequestParam String userId,
            HttpServletRequest httpRequest) {
        String currentUser = getCurrentUser(httpRequest);
        groupService.addMember(id, userId, currentUser);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/members/{userId}")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Remove member from group", description = "Remove a user from a group")
    public ResponseEntity<Void> removeMember(
            @PathVariable String id,
            @PathVariable String userId,
            HttpServletRequest httpRequest) {
        String currentUser = getCurrentUser(httpRequest);
        groupService.removeMember(id, userId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/roles")
    @PreAuthorize("hasAnyAuthority('MANAGER', 'ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Assign role to group", description = "Assign a role to a group")
    public ResponseEntity<Void> assignRole(
            @PathVariable String id,
            @RequestParam String roleName,
            HttpServletRequest httpRequest) {
        String currentUser = getCurrentUser(httpRequest);
        groupService.assignRole(id, roleName, currentUser);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sync-memberships")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'SYSTEM_ADMIN')")
    @Operation(summary = "Sync group memberships", 
               description = "Synchronize bidirectional group-user relationships. Run once after deployment to fix existing data.")
    public ResponseEntity<?> syncGroupMemberships() {
        try {
            log.info("POST /groups/sync-memberships - Starting group membership sync");
            groupService.syncGroupMemberships();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Group memberships synchronized successfully. Check logs for details."
            ));
        } catch (Exception e) {
            log.error("POST /groups/sync-memberships - Error during sync", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Sync failed", "message", e.getMessage()));
        }
    }

    private String getCurrentUser(HttpServletRequest request) {
        try {
            return jwtUtil.getCurrentUser(request);
        } catch (Exception e) {
            return "system";
        }
    }
}
