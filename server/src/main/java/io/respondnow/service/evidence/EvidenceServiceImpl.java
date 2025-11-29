package io.respondnow.service.evidence;

import com.mongodb.client.gridfs.model.GridFSFile;
import io.respondnow.dto.EvidenceDTO;
import io.respondnow.exception.InvalidEvidenceException;
import io.respondnow.model.incident.Evidence;
import io.respondnow.model.incident.EvidenceType;
import io.respondnow.model.user.UserDetails;
import io.respondnow.repository.EvidenceRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
public class EvidenceServiceImpl implements EvidenceService {

  private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private static final DateTimeFormatter DATE_FORMATTER = 
      DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(ZoneId.systemDefault());

  @Autowired
  private EvidenceRepository evidenceRepository;

  @Autowired
  private GridFsTemplate gridFsTemplate;

  @Override
  public Evidence uploadEvidence(String incidentId, MultipartFile file, String description,
                                 UserDetails currentUser, String accountIdentifier,
                                 String orgIdentifier, String projectIdentifier) throws IOException {
    
    validateFile(file);
    
    // Store file in GridFS
    ObjectId fileId = gridFsTemplate.store(
        file.getInputStream(),
        file.getOriginalFilename(),
        file.getContentType()
    );

    // Determine evidence type from content type
    EvidenceType evidenceType = determineEvidenceType(file.getContentType());

    // Create evidence metadata
    Evidence evidence = new Evidence(
        incidentId,
        file.getOriginalFilename(),
        file.getContentType(),
        file.getSize(),
        fileId.toString(),
        evidenceType
    );

    evidence.setDescription(description);
    evidence.setAccountIdentifier(accountIdentifier);
    evidence.setOrgIdentifier(orgIdentifier);
    evidence.setProjectIdentifier(projectIdentifier);
    evidence.setCreatedBy(currentUser);
    evidence.setCreatedAt(System.currentTimeMillis());

    return evidenceRepository.save(evidence);
  }

  @Override
  public Evidence addTextEvidence(String incidentId, String textContent, String filename,
                                  String description, UserDetails currentUser,
                                  String accountIdentifier, String orgIdentifier,
                                  String projectIdentifier) throws IOException {
    
    if (textContent == null || textContent.trim().isEmpty()) {
      throw new InvalidEvidenceException("Text content cannot be empty");
    }

    byte[] contentBytes = textContent.getBytes();
    InputStream inputStream = new ByteArrayInputStream(contentBytes);

    // Store text in GridFS
    ObjectId fileId = gridFsTemplate.store(
        inputStream,
        filename != null ? filename : "text-evidence-" + System.currentTimeMillis() + ".txt",
        "text/plain"
    );

    // Create evidence metadata
    Evidence evidence = new Evidence(
        incidentId,
        filename != null ? filename : "text-evidence.txt",
        "text/plain",
        (long) contentBytes.length,
        fileId.toString(),
        EvidenceType.TEXT
    );

    evidence.setDescription(description);
    evidence.setAccountIdentifier(accountIdentifier);
    evidence.setOrgIdentifier(orgIdentifier);
    evidence.setProjectIdentifier(projectIdentifier);
    evidence.setCreatedBy(currentUser);
    evidence.setCreatedAt(System.currentTimeMillis());

    return evidenceRepository.save(evidence);
  }

  @Override
  public List<EvidenceDTO> getEvidenceForIncident(String incidentId) {
    List<Evidence> evidenceList = evidenceRepository.findByIncidentIdAndRemovedFalse(incidentId);
    List<EvidenceDTO> dtoList = new ArrayList<>();

    for (Evidence evidence : evidenceList) {
      EvidenceDTO dto = new EvidenceDTO();
      BeanUtils.copyProperties(evidence, dto);
      dto.setDownloadUrl("/api/incident/evidence/" + evidence.getId() + "/download");
      dtoList.add(dto);
    }

    return dtoList;
  }

  @Override
  public Resource getEvidenceFile(String evidenceId) throws IOException {
    Evidence evidence = evidenceRepository.findById(evidenceId)
        .orElseThrow(() -> new InvalidEvidenceException("Evidence not found: " + evidenceId));

    if (evidence.getRemoved()) {
      throw new InvalidEvidenceException("Evidence has been deleted");
    }

    GridFSFile gridFSFile = gridFsTemplate.findOne(
        new Query(Criteria.where("_id").is(evidence.getGridFsFileId()))
    );

    if (gridFSFile == null) {
      throw new InvalidEvidenceException("Evidence file not found in storage");
    }

    GridFsResource resource = gridFsTemplate.getResource(gridFSFile);
    return new InputStreamResource(resource.getInputStream());
  }

  @Override
  public void deleteEvidence(String evidenceId, UserDetails currentUser) {
    Evidence evidence = evidenceRepository.findById(evidenceId)
        .orElseThrow(() -> new InvalidEvidenceException("Evidence not found: " + evidenceId));

    // Soft delete
    evidence.setRemoved(true);
    evidence.setRemovedAt(System.currentTimeMillis());
    evidence.setUpdatedBy(currentUser);
    evidence.setUpdatedAt(System.currentTimeMillis());

    evidenceRepository.save(evidence);

    // Optionally: Delete from GridFS as well
    // gridFsTemplate.delete(new Query(Criteria.where("_id").is(evidence.getGridFsFileId())));
  }

  @Override
  public byte[] exportEvidenceAsZip(String incidentId, String incidentIdentifier) throws IOException {
    List<Evidence> evidenceList = evidenceRepository.findByIncidentIdAndRemovedFalse(incidentId);

    if (evidenceList.isEmpty()) {
      throw new InvalidEvidenceException("No evidence found for incident: " + incidentId);
    }

    ByteArrayOutputStream baos = new ByteArrayOutputStream();
    
    try (ZipOutputStream zos = new ZipOutputStream(baos)) {
      int counter = 1;
      
      for (Evidence evidence : evidenceList) {
        try {
          // Get file from GridFS
          GridFSFile gridFSFile = gridFsTemplate.findOne(
              new Query(Criteria.where("_id").is(evidence.getGridFsFileId()))
          );

          if (gridFSFile != null) {
            GridFsResource resource = gridFsTemplate.getResource(gridFSFile);
            
            // Create unique filename in ZIP
            String zipEntryName = String.format("%03d_%s", counter++, evidence.getFilename());
            
            ZipEntry zipEntry = new ZipEntry(zipEntryName);
            zipEntry.setSize(evidence.getFileSize());
            zos.putNextEntry(zipEntry);

            // Write file content to ZIP
            try (InputStream is = resource.getInputStream()) {
              byte[] buffer = new byte[8192];
              int bytesRead;
              while ((bytesRead = is.read(buffer)) != -1) {
                zos.write(buffer, 0, bytesRead);
              }
            }

            zos.closeEntry();
          }
        } catch (Exception e) {
          log.error("Error adding evidence to ZIP: " + evidence.getFilename(), e);
          // Continue with other files
        }
      }

      // Add manifest file with evidence details
      addManifestToZip(zos, evidenceList);
    }

    return baos.toByteArray();
  }

  private void addManifestToZip(ZipOutputStream zos, List<Evidence> evidenceList) throws IOException {
    StringBuilder manifest = new StringBuilder();
    manifest.append("Evidence Manifest\n");
    manifest.append("=================\n\n");

    int counter = 1;
    for (Evidence evidence : evidenceList) {
      manifest.append(String.format("%d. %s\n", counter, evidence.getFilename()));
      manifest.append(String.format("   Type: %s\n", evidence.getEvidenceType()));
      manifest.append(String.format("   Size: %d bytes\n", evidence.getFileSize()));
      manifest.append(String.format("   Description: %s\n", 
          evidence.getDescription() != null ? evidence.getDescription() : "N/A"));
      manifest.append(String.format("   Created: %s by %s\n", 
          formatTimestamp(evidence.getCreatedAt()),
          evidence.getCreatedBy() != null ? evidence.getCreatedBy().getName() : "Unknown"));
      manifest.append("\n");
      counter++;
    }

    ZipEntry manifestEntry = new ZipEntry("MANIFEST.txt");
    zos.putNextEntry(manifestEntry);
    zos.write(manifest.toString().getBytes());
    zos.closeEntry();
  }

  private void validateFile(MultipartFile file) {
    if (file.isEmpty()) {
      throw new InvalidEvidenceException("File is empty");
    }

    if (file.getSize() > MAX_FILE_SIZE) {
      throw new InvalidEvidenceException("File size exceeds maximum limit of 50MB");
    }

    if (file.getOriginalFilename() == null || file.getOriginalFilename().isEmpty()) {
      throw new InvalidEvidenceException("File name is required");
    }
  }

  private EvidenceType determineEvidenceType(String contentType) {
    if (contentType == null) {
      return EvidenceType.OTHER;
    }

    if (contentType.startsWith("image/")) {
      return EvidenceType.IMAGE;
    } else if (contentType.startsWith("video/")) {
      return EvidenceType.VIDEO;
    } else if (contentType.startsWith("audio/")) {
      return EvidenceType.AUDIO;
    } else if (contentType.startsWith("text/") || contentType.contains("text")) {
      return EvidenceType.TEXT;
    } else if (contentType.contains("pdf") || contentType.contains("document") || 
               contentType.contains("word") || contentType.contains("excel") ||
               contentType.contains("spreadsheet") || contentType.contains("presentation")) {
      return EvidenceType.DOCUMENT;
    }

    return EvidenceType.OTHER;
  }

  private String formatTimestamp(Long timestamp) {
    if (timestamp == null) {
      return "N/A";
    }
    return DATE_FORMATTER.format(Instant.ofEpochMilli(timestamp));
  }
}
