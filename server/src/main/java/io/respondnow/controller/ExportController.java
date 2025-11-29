package io.respondnow.controller;

import io.respondnow.dto.incident.ExportRequest;
import io.respondnow.model.incident.Incident;
import io.respondnow.service.export.ExportService;
import io.respondnow.service.incident.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Export Controller", description = "APIs for exporting incidents")
@RestController
@RequestMapping("/incident/export")
public class ExportController {

  @Autowired private IncidentService incidentService;
  @Autowired private ExportService exportService;

  @Operation(summary = "Export incidents to CSV", description = "Export selected or filtered incidents to CSV format")
  @PostMapping("/csv")
  public ResponseEntity<byte[]> exportToCSV(
      @Parameter(
              name = "accountIdentifier",
              description = "Account identifier",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @Parameter(
              name = "orgIdentifier",
              description = "Organization identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String orgIdentifier,
      @Parameter(
              name = "projectIdentifier",
              description = "Project identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String projectIdentifier,
      @RequestBody ExportRequest request) {
    
    try {
      List<Incident> incidents = getIncidentsForExport(accountIdentifier, orgIdentifier, projectIdentifier, request);
      String csvContent = exportService.exportToCSV(incidents);
      
      String filename = generateFilename("incidents", "csv");
      
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.parseMediaType("text/csv"));
      headers.setContentDispositionFormData("attachment", filename);
      headers.set("X-Total-Count", String.valueOf(incidents.size()));
      
      return new ResponseEntity<>(csvContent.getBytes(), headers, HttpStatus.OK);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(("Error exporting incidents: " + e.getMessage()).getBytes());
    }
  }

  @Operation(summary = "Export incident to PDF", description = "Export a single incident to PDF format")
  @GetMapping("/pdf/{incidentIdentifier}")
  public ResponseEntity<byte[]> exportSingleToPDF(
      @Parameter(
              name = "incidentIdentifier",
              description = "Incident identifier",
              required = true,
              in = ParameterIn.PATH)
          @PathVariable
          String incidentIdentifier,
      @Parameter(
              name = "accountIdentifier",
              description = "Account identifier",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier) {
    
    try {
      Incident incident = incidentService.getIncidentByIdentifier(incidentIdentifier);
      if (incident == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body("Incident not found".getBytes());
      }
      
      byte[] pdfContent = exportService.exportToPDF(incident);
      String filename = generateFilename("incident_" + incidentIdentifier, "pdf");
      
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData("attachment", filename);
      headers.set("X-Content-Type-Options", "nosniff");
      
      return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(("Invalid request: " + e.getMessage()).getBytes());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(("Error exporting incident: " + e.getMessage()).getBytes());
    }
  }

  @Operation(summary = "Export multiple incidents to PDF", description = "Export selected or filtered incidents to PDF format")
  @PostMapping("/pdf")
  public ResponseEntity<byte[]> exportToPDF(
      @Parameter(
              name = "accountIdentifier",
              description = "Account identifier",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @Parameter(
              name = "orgIdentifier",
              description = "Organization identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String orgIdentifier,
      @Parameter(
              name = "projectIdentifier",
              description = "Project identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String projectIdentifier,
      @RequestBody ExportRequest request) {
    
    try {
      List<Incident> incidents = getIncidentsForExport(accountIdentifier, orgIdentifier, projectIdentifier, request);
      byte[] pdfContent = exportService.exportToPDF(incidents);
      String filename = generateFilename("incidents_export", "pdf");
      
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData("attachment", filename);
      headers.set("X-Content-Type-Options", "nosniff");
      
      return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(("Invalid request: " + e.getMessage()).getBytes());
    } catch (Exception e) {
      e.printStackTrace();
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(("Error exporting incidents: " + e.getMessage()).getBytes());
    }
  }

  @Operation(summary = "Get export count", description = "Get count of incidents that would be exported with the given filters")
  @PostMapping("/count")
  public ResponseEntity<Long> getExportCount(
      @Parameter(
              name = "accountIdentifier",
              description = "Account identifier",
              in = ParameterIn.QUERY,
              required = true)
          @RequestParam
          String accountIdentifier,
      @Parameter(
              name = "orgIdentifier",
              description = "Organization identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String orgIdentifier,
      @Parameter(
              name = "projectIdentifier",
              description = "Project identifier",
              in = ParameterIn.QUERY)
          @RequestParam(required = false)
          String projectIdentifier,
      @RequestBody ExportRequest request) {
    
    try {
      Query query = buildQuery(accountIdentifier, orgIdentifier, projectIdentifier, request);
      long count = incidentService.countIncidents(query);
      return ResponseEntity.ok(count);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
    }
  }

  private List<Incident> getIncidentsForExport(
      String accountIdentifier, String orgIdentifier, String projectIdentifier, ExportRequest request) {
    
    // If specific incident IDs are provided, fetch those
    if (request.getIncidentIds() != null && !request.getIncidentIds().isEmpty()) {
      return incidentService.getIncidentsByIds(request.getIncidentIds());
    }
    
    // Otherwise, build query from filters
    Query query = buildQuery(accountIdentifier, orgIdentifier, projectIdentifier, request);
    return incidentService.listIncidents(query);
  }

  private Query buildQuery(
      String accountIdentifier, String orgIdentifier, String projectIdentifier, ExportRequest request) {
    
    Criteria criteria = new Criteria();
    criteria.and("accountIdentifier").is(accountIdentifier);

    if (orgIdentifier != null && !orgIdentifier.isEmpty()) {
      criteria.and("orgIdentifier").is(orgIdentifier);
    }
    if (projectIdentifier != null && !projectIdentifier.isEmpty()) {
      criteria.and("projectIdentifier").is(projectIdentifier);
    }
    if (request.getType() != null) {
      criteria.and("type").is(request.getType());
    }
    if (request.getSeverity() != null) {
      criteria.and("severity").is(request.getSeverity());
    }
    if (request.getStatus() != null) {
      criteria.and("status").is(request.getStatus());
    }
    if (request.getActive() != null) {
      criteria.and("active").is(request.getActive());
    }
    if (request.getSearch() != null && !request.getSearch().isEmpty()) {
      criteria.orOperator(
          Criteria.where("name").regex(request.getSearch(), "i"),
          Criteria.where("tags").regex(request.getSearch(), "i"));
    }
    if (request.getStartDate() != null) {
      criteria.and("createdAt").gte(request.getStartDate());
    }
    if (request.getEndDate() != null) {
      criteria.and("createdAt").lte(request.getEndDate());
    }

    return new Query(criteria);
  }

  private String generateFilename(String prefix, String extension) {
    String timestamp = DateTimeFormatter.ofPattern("yyyy-MM-dd_HHmmss")
        .format(Instant.now().atZone(java.time.ZoneId.systemDefault()));
    return prefix + "_" + timestamp + "." + extension;
  }

  @Operation(summary = "Export incident with PDF and Evidence", 
             description = "Export a single incident as PDF with timeline and all evidence in a single ZIP file")
  @GetMapping("/combined/{incidentId}")
  public ResponseEntity<byte[]> exportIncidentWithEvidence(
      @PathVariable String incidentId,
      @Parameter(name = "accountIdentifier", description = "Account identifier", in = ParameterIn.QUERY, required = true)
      @RequestParam String accountIdentifier,
      @Parameter(name = "orgIdentifier", description = "Organization identifier", in = ParameterIn.QUERY)
      @RequestParam(required = false) String orgIdentifier,
      @Parameter(name = "projectIdentifier", description = "Project identifier", in = ParameterIn.QUERY)
      @RequestParam(required = false) String projectIdentifier) {
    
    try {
      Incident incident = incidentService.getIncidentByIdentifier(incidentId);
      
      if (incident == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(("Incident not found with ID: " + incidentId).getBytes());
      }

      // Generate combined export using ExportService
      byte[] combinedZip = exportService.exportIncidentWithEvidence(
          incident, 
          incident.getId()
      );

      String dateStr = DateTimeFormatter.ofPattern("yyyyMMdd")
          .format(Instant.ofEpochMilli(incident.getCreatedAt()).atZone(java.time.ZoneId.systemDefault()));
      String filename = String.format("incident-%s-%s-complete.zip", incident.getIdentifier(), dateStr);

      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
      headers.setContentDispositionFormData("attachment", filename);
      headers.set("X-Content-Type-Options", "nosniff");

      return new ResponseEntity<>(combinedZip, headers, HttpStatus.OK);
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(("Error exporting incident: " + e.getMessage()).getBytes());
    }
  }
}
