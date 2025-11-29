package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.UserRoleType;
import lombok.Data;

import java.util.Set;

@Data
public class RoleResponse {
    private String id;
    private String name;
    private String description;
    private UserRoleType type;
    private Set<Permission> permissions;
    private Integer userCount;
}
