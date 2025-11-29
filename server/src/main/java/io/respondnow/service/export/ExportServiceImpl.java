package io.respondnow.service.export;

import io.respondnow.model.incident.Evidence;
import io.respondnow.model.incident.Incident;
import io.respondnow.model.incident.Role;
import io.respondnow.model.incident.Timeline;
import io.respondnow.repository.EvidenceRepository;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Slf4j
@Service
public class ExportServiceImpl implements ExportService {

  @Autowired
  private EvidenceRepository evidenceRepository;
  
  @Autowired
  private GridFsTemplate gridFsTemplate;

  private static final DateTimeFormatter DATE_FORMATTER = 
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss").withZone(ZoneId.systemDefault());

  @Override
  public String exportToCSV(List<Incident> incidents) {
    if (incidents == null || incidents.isEmpty()) {
      return "";
    }

    StringBuilder csv = new StringBuilder();
    
    // CSV Header
    csv.append("ID,Name,Severity,Status,Type,Summary,Description,Created By,Created At,Updated At,Incident URL,Tags,Duration (minutes)\n");

    for (Incident incident : incidents) {
      csv.append(escapeCsvValue(incident.getIdentifier())).append(",");
      csv.append(escapeCsvValue(incident.getName())).append(",");
      csv.append(escapeCsvValue(incident.getSeverity() != null ? incident.getSeverity().toString() : "")).append(",");
      csv.append(escapeCsvValue(incident.getStatus() != null ? incident.getStatus().toString() : "")).append(",");
      csv.append(escapeCsvValue(incident.getType() != null ? incident.getType().toString() : "")).append(",");
      csv.append(escapeCsvValue(incident.getSummary())).append(",");
      csv.append(escapeCsvValue(incident.getDescription())).append(",");
      csv.append(escapeCsvValue(getCreatedByName(incident))).append(",");
      csv.append(escapeCsvValue(formatTimestamp(incident.getCreatedAt()))).append(",");
      csv.append(escapeCsvValue(formatTimestamp(incident.getUpdatedAt()))).append(",");
      csv.append(escapeCsvValue(incident.getIncidentUrl())).append(",");
      csv.append(escapeCsvValue(formatTags(incident.getTags()))).append(",");
      csv.append(calculateDuration(incident));
      csv.append("\n");
    }

    return csv.toString();
  }

  @Override
  public byte[] exportToPDF(Incident incident) {
    try (PDDocument document = new PDDocument()) {
      PDPage page = new PDPage(PDRectangle.A4);
      document.addPage(page);
      
      try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
        float margin = 50;
        float yPosition = page.getMediaBox().getHeight() - margin;
        float fontSize = 12;
        float leading = 1.5f * fontSize;
        
        // Title
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("INCIDENT DETAILS");
        contentStream.endText();
        yPosition -= leading * 2;
        
        // Content
        contentStream.setFont(PDType1Font.HELVETICA, fontSize);
        
        yPosition = writeTextLine(contentStream, "ID: " + nullSafe(incident.getIdentifier()), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Name: " + nullSafe(incident.getName()), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Severity: " + (incident.getSeverity() != null ? incident.getSeverity().toString() : "N/A"), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Status: " + (incident.getStatus() != null ? incident.getStatus().toString() : "N/A"), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Type: " + (incident.getType() != null ? incident.getType().toString() : "N/A"), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Summary: " + nullSafe(incident.getSummary()), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Created By: " + getCreatedByName(incident), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Created At: " + formatTimestamp(incident.getCreatedAt()), margin, yPosition, leading);
        yPosition = writeTextLine(contentStream, "Duration: " + calculateDuration(incident) + " minutes", margin, yPosition, leading);
        
        yPosition -= leading;
        
        // Key Members
        if (incident.getRoles() != null && !incident.getRoles().isEmpty()) {
          contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
          yPosition = writeTextLine(contentStream, "KEY MEMBERS:", margin, yPosition, leading);
          contentStream.setFont(PDType1Font.HELVETICA, fontSize);
          
          for (Role role : incident.getRoles()) {
            String memberName = role.getUserDetails() != null 
                ? (role.getUserDetails().getName() != null ? role.getUserDetails().getName() : role.getUserDetails().getUserName())
                : "Unknown";
            yPosition = writeTextLine(contentStream, "  - " + memberName + " (" + role.getRoleType() + ")", margin, yPosition, leading);
          }
          yPosition -= leading;
        }
        
        // Timeline
        if (incident.getTimelines() != null && !incident.getTimelines().isEmpty()) {
          contentStream.setFont(PDType1Font.HELVETICA_BOLD, fontSize);
          yPosition = writeTextLine(contentStream, "TIMELINE:", margin, yPosition, leading);
          contentStream.setFont(PDType1Font.HELVETICA, fontSize);
          
          int count = 0;
          for (Timeline timeline : incident.getTimelines()) {
            if (count >= 10) break; // Limit to first 10 timeline entries to fit on page
            String time = formatTimestamp(timeline.getCreatedAt());
            String type = timeline.getType() != null ? timeline.getType().toString().replace("_", " ") : "Event";
            yPosition = writeTextLine(contentStream, "  " + time + " - " + type, margin, yPosition, leading);
            count++;
          }
        }
      }
      
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      document.save(baos);
      return baos.toByteArray();
      
    } catch (IOException e) {
      throw new RuntimeException("Error generating PDF", e);
    }
  }
  
  private float writeTextLine(PDPageContentStream contentStream, String text, float x, float y, float leading) throws IOException {
    contentStream.beginText();
    contentStream.newLineAtOffset(x, y);
    contentStream.showText(text);
    contentStream.endText();
    return y - leading;
  }

  @Override
  public byte[] exportToPDF(List<Incident> incidents) {
    try (PDDocument document = new PDDocument()) {
      float margin = 50;
      float fontSize = 10;
      float leading = 1.5f * fontSize;
      
      for (int i = 0; i < incidents.size(); i++) {
        PDPage page = new PDPage(PDRectangle.A4);
        document.addPage(page);
        Incident incident = incidents.get(i);
        
        try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
          float yPosition = page.getMediaBox().getHeight() - margin;
          
          // Page header
          contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
          contentStream.beginText();
          contentStream.newLineAtOffset(margin, yPosition);
          contentStream.showText("Incident " + (i + 1) + " of " + incidents.size());
          contentStream.endText();
          yPosition -= leading * 2;
          
          // Incident details
          contentStream.setFont(PDType1Font.HELVETICA, fontSize);
          yPosition = writeTextLine(contentStream, "ID: " + nullSafe(incident.getIdentifier()), margin, yPosition, leading);
          yPosition = writeTextLine(contentStream, "Name: " + nullSafe(incident.getName()), margin, yPosition, leading);
          yPosition = writeTextLine(contentStream, "Severity: " + (incident.getSeverity() != null ? incident.getSeverity().toString() : "N/A"), margin, yPosition, leading);
          yPosition = writeTextLine(contentStream, "Status: " + (incident.getStatus() != null ? incident.getStatus().toString() : "N/A"), margin, yPosition, leading);
          yPosition = writeTextLine(contentStream, "Created At: " + formatTimestamp(incident.getCreatedAt()), margin, yPosition, leading);
        }
      }
      
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      document.save(baos);
      return baos.toByteArray();
      
    } catch (IOException e) {
      throw new RuntimeException("Error generating PDF for incidents list", e);
    }
  }

  private String escapeCsvValue(String value) {
    if (value == null) {
      return "";
    }
    if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
      return "\"" + value.replace("\"", "\"\"") + "\"";
    }
    return value;
  }

  private String formatTimestamp(Long timestamp) {
    if (timestamp == null) {
      return "";
    }
    return DATE_FORMATTER.format(Instant.ofEpochSecond(timestamp));
  }

  private String getCreatedByName(Incident incident) {
    if (incident.getCreatedBy() == null) {
      return "";
    }
    if (incident.getCreatedBy().getName() != null) {
      return incident.getCreatedBy().getName();
    }
    return incident.getCreatedBy().getUserName() != null ? incident.getCreatedBy().getUserName() : "";
  }

  private String formatTags(List<String> tags) {
    if (tags == null || tags.isEmpty()) {
      return "";
    }
    return String.join("; ", tags);
  }

  private long calculateDuration(Incident incident) {
    if (incident.getCreatedAt() == null) {
      return 0;
    }
    long endTime = incident.getStatus() != null && "Resolved".equals(incident.getStatus().toString()) 
        ? (incident.getUpdatedAt() != null ? incident.getUpdatedAt() : Instant.now().getEpochSecond())
        : Instant.now().getEpochSecond();
    return (endTime - incident.getCreatedAt()) / 60;
  }

  private String nullSafe(String value) {
    return value != null ? value : "N/A";
  }

  @Override
  public byte[] exportIncidentWithEvidence(Incident incident, String incidentMongoId) {
    try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
         ZipOutputStream zos = new ZipOutputStream(baos)) {

      // 1. Add incident PDF
      byte[] pdfBytes = exportToPDF(incident);
      ZipEntry pdfEntry = new ZipEntry(String.format("incident-%s.pdf", incident.getIdentifier()));
      zos.putNextEntry(pdfEntry);
      zos.write(pdfBytes);
      zos.closeEntry();

      // 2. Fetch all evidence for the incident
      List<Evidence> evidenceList = evidenceRepository.findByIncidentIdAndRemovedFalse(incidentMongoId);

      if (evidenceList != null && !evidenceList.isEmpty()) {
        // 3. Add manifest file
        StringBuilder manifest = new StringBuilder();
        manifest.append("INCIDENT EVIDENCE MANIFEST\\n");
        manifest.append("========================\\n\\n");
        manifest.append("Incident ID: ").append(incident.getIdentifier()).append("\\n");
        manifest.append("Incident Name: ").append(nullSafe(incident.getName())).append("\\n");
        manifest.append("Export Date: ").append(DATE_FORMATTER.format(Instant.now())).append("\\n");
        manifest.append("Total Evidence Files: ").append(evidenceList.size()).append("\\n\\n");
        manifest.append("Evidence List:\\n");
        manifest.append("=============\\n\\n");

        int counter = 1;
        for (Evidence evidence : evidenceList) {
          String paddedNum = String.format("%03d", counter);
          String evidenceFilename = String.format("%s-%s", paddedNum, evidence.getFilename());
          
          manifest.append(counter).append(". ").append(evidence.getFilename()).append("\\n");
          manifest.append("   File: ").append(evidenceFilename).append("\\n");
          manifest.append("   Type: ").append(evidence.getEvidenceType()).append("\\n");
          manifest.append("   Size: ").append(evidence.getFileSize()).append(" bytes\\n");
          if (evidence.getDescription() != null && !evidence.getDescription().isEmpty()) {
            manifest.append("   Description: ").append(evidence.getDescription()).append("\\n");
          }
          manifest.append("   Created: ").append(formatTimestamp(evidence.getCreatedAt()))
              .append(" by ").append(getCreatorName(evidence)).append("\\n\\n");

          // 4. Add evidence file to ZIP
          try {
            com.mongodb.client.gridfs.model.GridFSFile gridFSFile = gridFsTemplate.findOne(
                new Query(Criteria.where("_id").is(evidence.getGridFsFileId()))
            );
            
            if (gridFSFile != null) {
              org.springframework.data.mongodb.gridfs.GridFsResource resource = gridFsTemplate.getResource(gridFSFile);
              
              ZipEntry evidenceEntry = new ZipEntry(evidenceFilename);
              zos.putNextEntry(evidenceEntry);
              
              try (InputStream inputStream = resource.getInputStream()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = inputStream.read(buffer)) != -1) {
                  zos.write(buffer, 0, bytesRead);
                }
              }
              
              zos.closeEntry();
            }
          } catch (Exception e) {
            log.error("Error adding evidence file to ZIP: " + evidence.getFilename(), e);
            manifest.append("   [ERROR: Could not include this file in export]\\n\\n");
          }

          counter++;
        }

        // Add manifest to ZIP
        ZipEntry manifestEntry = new ZipEntry("MANIFEST.txt");
        zos.putNextEntry(manifestEntry);
        zos.write(manifest.toString().getBytes());
        zos.closeEntry();
      }

      zos.finish();
      return baos.toByteArray();

    } catch (IOException e) {
      log.error("Error creating combined export ZIP", e);
      throw new RuntimeException("Failed to create combined export", e);
    }
  }

  private String getCreatorName(Evidence evidence) {
    if (evidence.getCreatedBy() == null) {
      return "Unknown";
    }
    if (evidence.getCreatedBy().getName() != null) {
      return evidence.getCreatedBy().getName();
    }
    if (evidence.getCreatedBy().getUserName() != null) {
      return evidence.getCreatedBy().getUserName();
    }
    return "Unknown";
  }
}
