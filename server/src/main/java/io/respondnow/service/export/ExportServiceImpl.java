package io.respondnow.service.export;

import io.respondnow.model.incident.Incident;
import io.respondnow.model.incident.Role;
import io.respondnow.model.incident.Timeline;
import java.io.ByteArrayOutputStream;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class ExportServiceImpl implements ExportService {

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
    // Simple text-based PDF generation
    // For production, consider using Apache PDFBox or iText
    StringBuilder content = new StringBuilder();
    
    content.append("INCIDENT REPORT\n");
    content.append("===============\n\n");
    content.append("Generated: ").append(DATE_FORMATTER.format(Instant.now())).append("\n\n");
    
    content.append("INCIDENT DETAILS\n");
    content.append("----------------\n");
    content.append("ID: ").append(nullSafe(incident.getIdentifier())).append("\n");
    content.append("Name: ").append(nullSafe(incident.getName())).append("\n");
    content.append("Severity: ").append(incident.getSeverity() != null ? incident.getSeverity().toString() : "N/A").append("\n");
    content.append("Status: ").append(incident.getStatus() != null ? incident.getStatus().toString() : "N/A").append("\n");
    content.append("Type: ").append(incident.getType() != null ? incident.getType().toString() : "N/A").append("\n");
    content.append("Summary: ").append(nullSafe(incident.getSummary())).append("\n");
    content.append("Description: ").append(nullSafe(incident.getDescription())).append("\n");
    content.append("Created By: ").append(getCreatedByName(incident)).append("\n");
    content.append("Created At: ").append(formatTimestamp(incident.getCreatedAt())).append("\n");
    content.append("Updated At: ").append(formatTimestamp(incident.getUpdatedAt())).append("\n");
    content.append("Incident URL: ").append(nullSafe(incident.getIncidentUrl())).append("\n");
    content.append("Tags: ").append(formatTags(incident.getTags())).append("\n");
    content.append("Duration: ").append(calculateDuration(incident)).append(" minutes\n\n");

    // Key Members
    if (incident.getRoles() != null && !incident.getRoles().isEmpty()) {
      content.append("KEY MEMBERS\n");
      content.append("-----------\n");
      for (Role role : incident.getRoles()) {
        String memberName = role.getUserDetails() != null 
            ? (role.getUserDetails().getName() != null ? role.getUserDetails().getName() : role.getUserDetails().getUserName())
            : "Unknown";
        content.append("- ").append(memberName).append(" (").append(role.getRoleType()).append(")\n");
      }
      content.append("\n");
    }

    // Timeline
    if (incident.getTimelines() != null && !incident.getTimelines().isEmpty()) {
      content.append("TIMELINE\n");
      content.append("--------\n");
      for (Timeline timeline : incident.getTimelines()) {
        String time = formatTimestamp(timeline.getCreatedAt());
        String type = timeline.getType() != null ? timeline.getType().toString().replace("_", " ") : "Event";
        String user = timeline.getUserDetails() != null 
            ? (timeline.getUserDetails().getName() != null ? timeline.getUserDetails().getName() : "System")
            : "System";
        content.append(time).append(" - ").append(type).append(" by ").append(user).append("\n");
      }
    }

    return content.toString().getBytes();
  }

  @Override
  public byte[] exportToPDF(List<Incident> incidents) {
    StringBuilder content = new StringBuilder();
    
    content.append("INCIDENTS REPORT\n");
    content.append("================\n\n");
    content.append("Generated: ").append(DATE_FORMATTER.format(Instant.now())).append("\n");
    content.append("Total Incidents: ").append(incidents.size()).append("\n\n");

    for (int i = 0; i < incidents.size(); i++) {
      Incident incident = incidents.get(i);
      content.append("--- Incident ").append(i + 1).append(" of ").append(incidents.size()).append(" ---\n\n");
      content.append(new String(exportToPDF(incident)));
      content.append("\n\n");
    }

    return content.toString().getBytes();
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
}
