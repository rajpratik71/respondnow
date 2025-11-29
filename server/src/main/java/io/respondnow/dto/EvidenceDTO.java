package io.respondnow.dto;

import io.respondnow.model.incident.EvidenceType;
import io.respondnow.model.user.UserDetails;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for Evidence responses (without binary data)
 */
@Data
@NoArgsConstructor
public class EvidenceDTO {
  
  private String id;
  private String incidentId;
  private String filename;
  private String description;
  private String contentType;
  private Long fileSize;
  private EvidenceType evidenceType;
  private String downloadUrl;
  
  // Auditing fields
  private Long createdAt;
  private Long updatedAt;
  private UserDetails createdBy;
  private UserDetails updatedBy;
}
