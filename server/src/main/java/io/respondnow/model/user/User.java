package io.respondnow.model.user;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@Getter
@Setter
@Document(collection = "users")
public class User {

  @Id private String id;

  @NotBlank private String name;

  @NotBlank
  @Indexed(unique = true)
  private String userId;

  @Email
  @Indexed(unique = true)
  private String email;

  @NotBlank private String password;

  private Boolean active;

  private Boolean changePasswordRequired;

  // RBAC Fields
  private SystemRole systemRole;

  private Set<Permission> permissions = new HashSet<>();

  private List<String> teamIds = new ArrayList<>();

  private List<String> organizationIds = new ArrayList<>();

  // Multi-Tenancy Fields
  @Indexed
  private String accountIdentifier;

  @Indexed
  private String orgIdentifier;

  private String projectIdentifier;

  // Metadata
  private Long createdAt;

  private Long lastLoginAt;

  private Long removedAt;

  private Boolean removed;

  private String createdBy;

  private String updatedBy;

  private Long updatedAt;

  /**
   * Check if user has a specific permission
   */
  public boolean hasPermission(Permission permission) {
    if (systemRole == SystemRole.ADMIN) {
      return true; // Admin has all permissions
    }
    return permissions != null && permissions.contains(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  public boolean hasAnyPermission(Permission... requiredPermissions) {
    if (systemRole == SystemRole.ADMIN) {
      return true;
    }
    if (permissions == null) {
      return false;
    }
    for (Permission permission : requiredPermissions) {
      if (permissions.contains(permission)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Check if user has all of the specified permissions
   */
  public boolean hasAllPermissions(Permission... requiredPermissions) {
    if (systemRole == SystemRole.ADMIN) {
      return true;
    }
    if (permissions == null) {
      return false;
    }
    for (Permission permission : requiredPermissions) {
      if (!permissions.contains(permission)) {
        return false;
      }
    }
    return true;
  }
}
