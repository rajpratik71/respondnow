package io.respondnow.service.audit;

import io.respondnow.dto.audit.PermissionMatrixResponse;
import io.respondnow.model.user.Group;
import io.respondnow.model.user.User;
import io.respondnow.repository.GroupRepository;
import io.respondnow.repository.UserRepository;
import io.respondnow.service.user.GroupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionMatrixService {
    
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GroupService groupService;
    
    // Predefined role-permission mapping
    private static final Map<String, Set<String>> ROLE_PERMISSIONS = new HashMap<>();
    
    static {
        ROLE_PERMISSIONS.put("VIEWER", Set.of(
            "INCIDENT_VIEW", "EVIDENCE_VIEW", "USER_VIEW", "GROUP_VIEW", "ROLE_VIEW"
        ));
        
        ROLE_PERMISSIONS.put("RESPONDER", Set.of(
            "INCIDENT_VIEW", "INCIDENT_CREATE", "INCIDENT_UPDATE", "INCIDENT_ASSIGN",
            "EVIDENCE_VIEW", "EVIDENCE_UPLOAD", "EVIDENCE_DOWNLOAD",
            "USER_VIEW", "GROUP_VIEW", "ROLE_VIEW"
        ));
        
        ROLE_PERMISSIONS.put("MANAGER", Set.of(
            "INCIDENT_VIEW", "INCIDENT_CREATE", "INCIDENT_UPDATE", "INCIDENT_DELETE", 
            "INCIDENT_EXPORT", "INCIDENT_ASSIGN",
            "EVIDENCE_VIEW", "EVIDENCE_UPLOAD", "EVIDENCE_DELETE", "EVIDENCE_DOWNLOAD",
            "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_MANAGE_ROLES",
            "GROUP_VIEW", "GROUP_CREATE", "GROUP_UPDATE", "GROUP_MANAGE_MEMBERS",
            "ROLE_VIEW", "EXPORT_CSV", "EXPORT_PDF", "EXPORT_COMBINED"
        ));
        
        ROLE_PERMISSIONS.put("ADMIN", Set.of(
            "INCIDENT_VIEW", "INCIDENT_CREATE", "INCIDENT_UPDATE", "INCIDENT_DELETE", 
            "INCIDENT_EXPORT", "INCIDENT_ASSIGN",
            "EVIDENCE_VIEW", "EVIDENCE_UPLOAD", "EVIDENCE_DELETE", "EVIDENCE_DOWNLOAD",
            "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE", 
            "USER_MANAGE_ROLES", "USER_RESET_PASSWORD",
            "GROUP_VIEW", "GROUP_CREATE", "GROUP_UPDATE", "GROUP_DELETE", 
            "GROUP_MANAGE_MEMBERS", "GROUP_MANAGE_ROLES",
            "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
            "EXPORT_CSV", "EXPORT_PDF", "EXPORT_COMBINED",
            "SYSTEM_CONFIG", "SYSTEM_AUDIT"
        ));
        
        ROLE_PERMISSIONS.put("SYSTEM_ADMIN", Set.of(
            "INCIDENT_VIEW", "INCIDENT_CREATE", "INCIDENT_UPDATE", "INCIDENT_DELETE", 
            "INCIDENT_EXPORT", "INCIDENT_ASSIGN",
            "EVIDENCE_VIEW", "EVIDENCE_UPLOAD", "EVIDENCE_DELETE", "EVIDENCE_DOWNLOAD",
            "USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DELETE", 
            "USER_MANAGE_ROLES", "USER_RESET_PASSWORD",
            "GROUP_VIEW", "GROUP_CREATE", "GROUP_UPDATE", "GROUP_DELETE", 
            "GROUP_MANAGE_MEMBERS", "GROUP_MANAGE_ROLES",
            "ROLE_VIEW", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE",
            "EXPORT_CSV", "EXPORT_PDF", "EXPORT_COMBINED",
            "SYSTEM_ADMIN", "SYSTEM_CONFIG", "SYSTEM_AUDIT"
        ));
    }
    
    public PermissionMatrixResponse getPermissionMatrix() {
        log.info("Generating permission matrix");
        
        List<User> allUsers = userRepository.findAll();
        List<Group> allGroups = groupRepository.findAll();
        
        // Build role entries
        List<PermissionMatrixResponse.RolePermissionEntry> roleEntries = buildRoleEntries(allUsers, allGroups);
        
        // Build user entries
        List<PermissionMatrixResponse.UserPermissionEntry> userEntries = buildUserEntries(allUsers, allGroups);
        
        // Build group entries
        List<PermissionMatrixResponse.GroupPermissionEntry> groupEntries = buildGroupEntries(allGroups);
        
        return PermissionMatrixResponse.builder()
                .roles(roleEntries)
                .users(userEntries)
                .groups(groupEntries)
                .permissionsByRole(ROLE_PERMISSIONS)
                .build();
    }
    
    private List<PermissionMatrixResponse.RolePermissionEntry> buildRoleEntries(
            List<User> users, List<Group> groups) {
        
        Map<String, Integer> roleUserCount = new HashMap<>();
        Map<String, Integer> roleGroupCount = new HashMap<>();
        
        // Count users per role
        for (User user : users) {
            if (user.getRoleNames() != null) {
                for (String role : user.getRoleNames()) {
                    roleUserCount.merge(role, 1, Integer::sum);
                }
            }
        }
        
        // Count groups per role
        for (Group group : groups) {
            if (group.getRoleNames() != null) {
                for (String role : group.getRoleNames()) {
                    roleGroupCount.merge(role, 1, Integer::sum);
                }
            }
        }
        
        return ROLE_PERMISSIONS.entrySet().stream()
                .map(entry -> PermissionMatrixResponse.RolePermissionEntry.builder()
                        .roleName(entry.getKey())
                        .roleType("SYSTEM")
                        .permissions(entry.getValue())
                        .userCount(roleUserCount.getOrDefault(entry.getKey(), 0))
                        .groupCount(roleGroupCount.getOrDefault(entry.getKey(), 0))
                        .build())
                .collect(Collectors.toList());
    }
    
    private List<PermissionMatrixResponse.UserPermissionEntry> buildUserEntries(
            List<User> users, List<Group> allGroups) {
        
        return users.stream()
                .map(user -> {
                    Set<String> directRoles = user.getRoleNames() != null ? 
                            new HashSet<>(user.getRoleNames()) : new HashSet<>();
                    
                    // Get group roles
                    Set<String> groupRoles = new HashSet<>();
                    List<String> groupNames = new ArrayList<>();
                    
                    if (user.getGroupIds() != null) {
                        List<Group> userGroups = groupService.getAllGroupsByIds(
                                new ArrayList<>(user.getGroupIds()));
                        for (Group group : userGroups) {
                            if (group.getRoleNames() != null) {
                                groupRoles.addAll(group.getRoleNames());
                            }
                            groupNames.add(group.getName());
                        }
                    }
                    
                    // Effective roles = direct + group
                    Set<String> effectiveRoles = new HashSet<>();
                    effectiveRoles.addAll(directRoles);
                    effectiveRoles.addAll(groupRoles);
                    
                    // Effective permissions
                    Set<String> effectivePermissions = new HashSet<>();
                    for (String role : effectiveRoles) {
                        effectivePermissions.addAll(ROLE_PERMISSIONS.getOrDefault(role, Collections.emptySet()));
                    }
                    
                    return PermissionMatrixResponse.UserPermissionEntry.builder()
                            .userId(user.getId())
                            .username(user.getUserId())
                            .email(user.getEmail())
                            .directRoles(directRoles)
                            .groupRoles(groupRoles)
                            .effectiveRoles(effectiveRoles)
                            .effectivePermissions(effectivePermissions)
                            .groupNames(groupNames)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    private List<PermissionMatrixResponse.GroupPermissionEntry> buildGroupEntries(List<Group> groups) {
        return groups.stream()
                .map(group -> {
                    Set<String> roles = group.getRoleNames() != null ? 
                            new HashSet<>(group.getRoleNames()) : new HashSet<>();
                    
                    Set<String> effectivePermissions = new HashSet<>();
                    for (String role : roles) {
                        effectivePermissions.addAll(ROLE_PERMISSIONS.getOrDefault(role, Collections.emptySet()));
                    }
                    
                    return PermissionMatrixResponse.GroupPermissionEntry.builder()
                            .groupId(group.getId())
                            .groupName(group.getName())
                            .roles(roles)
                            .memberCount(group.getUserIds() != null ? group.getUserIds().size() : 0)
                            .effectivePermissions(effectivePermissions)
                            .build();
                })
                .collect(Collectors.toList());
    }
}
