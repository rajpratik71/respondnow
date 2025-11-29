package io.respondnow.service.evidence;

import io.respondnow.dto.EvidenceDTO;
import io.respondnow.model.incident.Evidence;
import io.respondnow.model.user.UserDetails;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Service interface for Evidence operations
 */
public interface EvidenceService {

  /**
   * Upload evidence file for an incident
   */
  Evidence uploadEvidence(String incidentId, MultipartFile file, String description, 
                          UserDetails currentUser, String accountIdentifier,
                          String orgIdentifier, String projectIdentifier) throws IOException;

  /**
   * Add text evidence for an incident
   */
  Evidence addTextEvidence(String incidentId, String textContent, String filename,
                           String description, UserDetails currentUser, 
                           String accountIdentifier, String orgIdentifier, 
                           String projectIdentifier) throws IOException;

  /**
   * Get all evidence for an incident
   */
  List<EvidenceDTO> getEvidenceForIncident(String incidentId);

  /**
   * Get evidence file content
   */
  Resource getEvidenceFile(String evidenceId) throws IOException;

  /**
   * Delete evidence (soft delete)
   */
  void deleteEvidence(String evidenceId, UserDetails currentUser);

  /**
   * Export all evidence for an incident as a ZIP file
   */
  byte[] exportEvidenceAsZip(String incidentId, String incidentIdentifier) throws IOException;
}
