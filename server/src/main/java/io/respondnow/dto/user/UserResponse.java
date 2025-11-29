package io.respondnow.dto.user;

import io.respondnow.model.user.Permission;
import io.respondnow.model.user.SystemRole;
import io.respondnow.model.user.User;
import java.util.List;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

  private String id;
  private String name;
  private String userId;
  private String email;
  private Boolean active;
  private SystemRole systemRole;
  private Set<Permission> permissions;
  private List<String> teamIds;
  private List<String> organizationIds;
  private String accountIdentifier;
  private String orgIdentifier;
  private String projectIdentifier;
  private Long createdAt;
  private Long lastLoginAt;
  private Long updatedAt;

  /**
   * Convert User entity to UserResponse DTO
   */
  public static UserResponse fromUser(User user) {
    return UserResponse.builder()
        .id(user.getId())
        .name(user.getName())
        .userId(user.getUserId())
        .email(user.getEmail())
        .active(user.getActive())
        .systemRole(user.getSystemRole())
        .permissions(user.getPermissions())
        .teamIds(user.getTeamIds())
        .organizationIds(user.getOrganizationIds())
        .accountIdentifier(user.getAccountIdentifier())
        .orgIdentifier(user.getOrgIdentifier())
        .projectIdentifier(user.getProjectIdentifier())
        .createdAt(user.getCreatedAt())
        .lastLoginAt(user.getLastLoginAt())
        .updatedAt(user.getUpdatedAt())
        .build();
  }
}
