package io.respondnow.model.incident;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import io.respondnow.model.user.UserDetails;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import javax.validation.constraints.NotNull;

/**
 * Evidence model for storing incident evidence/attachments with auditing support.
 * Files are stored in MongoDB GridFS and referenced here.
 */
@Data
@NoArgsConstructor
@Getter
@Setter
@Document(collection = "evidence")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Evidence {

  @Id
  private String id;

  @NotNull
  private String incidentId;

  private String accountIdentifier;
  private String orgIdentifier;
  private String projectIdentifier;

  @NotNull
  private String filename;

  private String description;

  @NotNull
  private String contentType;

  @NotNull
  private Long fileSize;

  /**
   * GridFS file ID for binary storage
   */
  @NotNull
  private String gridFsFileId;

  /**
   * Type of evidence: TEXT, IMAGE, DOCUMENT, VIDEO, AUDIO, OTHER
   */
  @NotNull
  private EvidenceType evidenceType;

  // Auditing fields
  private Long createdAt;
  private Long updatedAt;
  private UserDetails createdBy;
  private UserDetails updatedBy;
  private Boolean removed;
  private Long removedAt;

  public Evidence(String incidentId, String filename, String contentType, Long fileSize, 
                  String gridFsFileId, EvidenceType evidenceType) {
    this.incidentId = incidentId;
    this.filename = filename;
    this.contentType = contentType;
    this.fileSize = fileSize;
    this.gridFsFileId = gridFsFileId;
    this.evidenceType = evidenceType;
    this.removed = false;
    this.createdAt = System.currentTimeMillis();
  }
}
