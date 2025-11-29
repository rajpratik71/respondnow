package io.respondnow.model.user;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import javax.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "teams")
public class Team {

  @Id private String id;

  @NotBlank private String name;

  @NotBlank
  @Indexed(unique = true)
  private String identifier;

  private String description;

  // Multi-Tenancy
  @Indexed
  private String accountIdentifier;

  @Indexed
  private String orgIdentifier;

  private String organizationId;

  // Team Members
  private List<TeamMember> members = new ArrayList<>();

  // Team Permissions
  private Set<Permission> permissions = new HashSet<>();

  // Metadata
  private Long createdAt;

  private Long updatedAt;

  private String createdBy;

  private String updatedBy;

  private Boolean active;

  /**
   * Team member with role
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class TeamMember {
    private String userId;
    private TeamRole role;
    private Long joinedAt;
  }

  /**
   * Role within a team
   */
  public enum TeamRole {
    LEAD,     // Team lead with management permissions
    MEMBER    // Regular team member
  }

  /**
   * Add a member to the team
   */
  public void addMember(String userId, TeamRole role) {
    if (members == null) {
      members = new ArrayList<>();
    }
    TeamMember member = TeamMember.builder()
        .userId(userId)
        .role(role)
        .joinedAt(System.currentTimeMillis() / 1000)
        .build();
    members.add(member);
  }

  /**
   * Remove a member from the team
   */
  public void removeMember(String userId) {
    if (members != null) {
      members.removeIf(m -> m.getUserId().equals(userId));
    }
  }

  /**
   * Check if user is a member of the team
   */
  public boolean hasMember(String userId) {
    if (members == null) {
      return false;
    }
    return members.stream().anyMatch(m -> m.getUserId().equals(userId));
  }

  /**
   * Check if user is a team lead
   */
  public boolean isLead(String userId) {
    if (members == null) {
      return false;
    }
    return members.stream()
        .anyMatch(m -> m.getUserId().equals(userId) && m.getRole() == TeamRole.LEAD);
  }
}
