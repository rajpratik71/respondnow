package io.respondnow.model.user;

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
@Document(collection = "organizations")
public class Organization {

  @Id private String id;

  @NotBlank private String name;

  @NotBlank
  @Indexed(unique = true)
  private String identifier;

  private String description;

  // Multi-Tenancy
  @Indexed
  private String accountIdentifier;

  // Organization Settings
  private Settings settings;

  // Resource Quotas
  private Quotas quotas;

  // Metadata
  private Long createdAt;

  private Long updatedAt;

  private String createdBy;

  private String updatedBy;

  private Boolean active;

  /**
   * Organization settings
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class Settings {
    private Boolean incidentAutoEscalation;
    private String defaultSeverity;
    private Integer escalationTimeoutMinutes;
    private Boolean requireIncidentApproval;
    private Boolean enableCustomFields;
    private Boolean enableTemplates;
    private Boolean enableSLA;
  }

  /**
   * Resource quotas for the organization
   */
  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class Quotas {
    private Integer maxUsers;
    private Integer maxTeams;
    private Integer maxIncidents;
    private Integer maxCustomFields;
    private Integer maxTemplates;
    private Long storageQuotaBytes;
  }

  /**
   * Check if a quota is exceeded
   */
  public boolean isQuotaExceeded(String quotaType, int currentValue) {
    if (quotas == null) {
      return false; // No quotas set, allow unlimited
    }

    if ("users".equals(quotaType)) {
      return quotas.getMaxUsers() != null && currentValue >= quotas.getMaxUsers();
    } else if ("teams".equals(quotaType)) {
      return quotas.getMaxTeams() != null && currentValue >= quotas.getMaxTeams();
    } else if ("incidents".equals(quotaType)) {
      return quotas.getMaxIncidents() != null && currentValue >= quotas.getMaxIncidents();
    } else if ("customFields".equals(quotaType)) {
      return quotas.getMaxCustomFields() != null && currentValue >= quotas.getMaxCustomFields();
    } else if ("templates".equals(quotaType)) {
      return quotas.getMaxTemplates() != null && currentValue >= quotas.getMaxTemplates();
    }
    return false;
  }
}
