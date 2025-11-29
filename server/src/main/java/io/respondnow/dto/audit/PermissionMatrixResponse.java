package io.respondnow.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionMatrixResponse {
    private List<RolePermissionEntry> roles;
    private List<UserPermissionEntry> users;
    private List<GroupPermissionEntry> groups;
    private Map<String, Set<String>> permissionsByRole;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RolePermissionEntry {
        private String roleName;
        private String roleType;  // SYSTEM or CUSTOM
        private Set<String> permissions;
        private int userCount;
        private int groupCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserPermissionEntry {
        private String userId;
        private String username;
        private String email;
        private Set<String> directRoles;
        private Set<String> groupRoles;
        private Set<String> effectiveRoles;
        private Set<String> effectivePermissions;
        private List<String> groupNames;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupPermissionEntry {
        private String groupId;
        private String groupName;
        private Set<String> roles;
        private int memberCount;
        private Set<String> effectivePermissions;
    }
}
