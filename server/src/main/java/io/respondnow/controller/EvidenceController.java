package io.respondnow.controller;

import io.respondnow.dto.EvidenceDTO;
import io.respondnow.model.incident.ChannelSource;
import io.respondnow.model.incident.Evidence;
import io.respondnow.model.user.UserDetails;
import io.respondnow.service.evidence.EvidenceService;
import io.respondnow.util.JWTUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * REST Controller for Evidence management
 */
@Slf4j
@RestController
@RequestMapping("/incident/evidence")
public class EvidenceController {

  private static final DateTimeFormatter DATE_FORMATTER = 
      DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneId.systemDefault());

  @Autowired
  private EvidenceService evidenceService;

  @Autowired
  private JWTUtil jwtUtil;

  private UserDetails getCurrentUser(HttpServletRequest request) {
    String token = extractToken(request);
    if (token == null) {
      return null;
    }
    UserDetails userDetails = new UserDetails();
    userDetails.setUserId(jwtUtil.getUserIdFromToken(token));
    userDetails.setEmail(jwtUtil.getEmailFromToken(token));
    userDetails.setName(jwtUtil.getNameFromToken(token));
    userDetails.setUserName(jwtUtil.getUsernameFromToken(token));
    
    String userAgent = request.getHeader("User-Agent");
    if (userAgent != null && userAgent.toLowerCase().contains("mozilla")) {
      userDetails.setSource(ChannelSource.Web);
    } else {
      userDetails.setSource(ChannelSource.API);
    }
    
    return userDetails;
  }

  private String extractToken(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }

  /**
   * Upload evidence file for an incident
   */
  @PostMapping("/{incidentId}/upload")
  public ResponseEntity<Evidence> uploadEvidence(
      @PathVariable String incidentId,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "description", required = false) String description,
      @RequestParam("accountIdentifier") String accountIdentifier,
      @RequestParam(value = "orgIdentifier", required = false) String orgIdentifier,
      @RequestParam(value = "projectIdentifier", required = false) String projectIdentifier,
      HttpServletRequest httpRequest) {
    
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      
      Evidence evidence = evidenceService.uploadEvidence(
          incidentId, file, description, currentUser,
          accountIdentifier, orgIdentifier, projectIdentifier
      );

      return ResponseEntity.ok(evidence);
    } catch (Exception e) {
      log.error("Error uploading evidence for incident: " + incidentId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Add text evidence for an incident
   */
  @PostMapping("/{incidentId}/text")
  public ResponseEntity<Evidence> addTextEvidence(
      @PathVariable String incidentId,
      @RequestParam("textContent") String textContent,
      @RequestParam(value = "filename", required = false) String filename,
      @RequestParam(value = "description", required = false) String description,
      @RequestParam("accountIdentifier") String accountIdentifier,
      @RequestParam(value = "orgIdentifier", required = false) String orgIdentifier,
      @RequestParam(value = "projectIdentifier", required = false) String projectIdentifier,
      HttpServletRequest httpRequest) {
    
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      
      Evidence evidence = evidenceService.addTextEvidence(
          incidentId, textContent, filename, description, currentUser,
          accountIdentifier, orgIdentifier, projectIdentifier
      );

      return ResponseEntity.ok(evidence);
    } catch (Exception e) {
      log.error("Error adding text evidence for incident: " + incidentId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Get all evidence for an incident
   */
  @GetMapping("/{incidentId}")
  public ResponseEntity<List<EvidenceDTO>> getEvidenceForIncident(@PathVariable String incidentId) {
    try {
      List<EvidenceDTO> evidence = evidenceService.getEvidenceForIncident(incidentId);
      return ResponseEntity.ok(evidence);
    } catch (Exception e) {
      log.error("Error retrieving evidence for incident: " + incidentId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Download a specific evidence file
   */
  @GetMapping("/{evidenceId}/download")
  public ResponseEntity<Resource> downloadEvidence(@PathVariable String evidenceId) {
    try {
      Resource resource = evidenceService.getEvidenceFile(evidenceId);
      
      // Get evidence details for headers
      List<EvidenceDTO> allEvidence = evidenceService.getEvidenceForIncident("");
      EvidenceDTO evidence = allEvidence.stream()
          .filter(e -> e.getId().equals(evidenceId))
          .findFirst()
          .orElse(null);

      HttpHeaders headers = new HttpHeaders();
      if (evidence != null) {
        headers.setContentType(MediaType.parseMediaType(evidence.getContentType()));
        headers.setContentDispositionFormData("attachment", evidence.getFilename());
      } else {
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
      }

      return new ResponseEntity<>(resource, headers, HttpStatus.OK);
    } catch (Exception e) {
      log.error("Error downloading evidence: " + evidenceId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Delete evidence (soft delete)
   */
  @DeleteMapping("/{evidenceId}")
  public ResponseEntity<Void> deleteEvidence(@PathVariable String evidenceId, HttpServletRequest httpRequest) {
    try {
      UserDetails currentUser = getCurrentUser(httpRequest);
      evidenceService.deleteEvidence(evidenceId, currentUser);
      return ResponseEntity.ok().build();
    } catch (Exception e) {
      log.error("Error deleting evidence: " + evidenceId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Export all evidence for an incident as a ZIP file
   */
  @GetMapping("/{incidentId}/export")
  public ResponseEntity<byte[]> exportEvidenceAsZip(
      @PathVariable String incidentId,
      @RequestParam("incidentIdentifier") String incidentIdentifier) {
    
    try {
      byte[] zipContent = evidenceService.exportEvidenceAsZip(incidentId, incidentIdentifier);
      
      String dateStr = DATE_FORMATTER.format(Instant.now());
      String filename = String.format("incident-%s-%s-evidence.zip", incidentIdentifier, dateStr);

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
      headers.setContentDispositionFormData("attachment", filename);
      headers.set("X-Content-Type-Options", "nosniff");

      return new ResponseEntity<>(zipContent, headers, HttpStatus.OK);
    } catch (Exception e) {
      log.error("Error exporting evidence for incident: " + incidentId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(("Error exporting evidence: " + e.getMessage()).getBytes());
    }
  }
}
