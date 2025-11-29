package io.respondnow.service.export;

import io.respondnow.model.incident.Incident;
import java.util.List;

public interface ExportService {
  
  /**
   * Export incidents to CSV format
   * @param incidents List of incidents to export
   * @return CSV content as string
   */
  String exportToCSV(List<Incident> incidents);
  
  /**
   * Export a single incident to PDF format
   * @param incident The incident to export
   * @return PDF content as byte array
   */
  byte[] exportToPDF(Incident incident);
  
  /**
   * Export multiple incidents to PDF format
   * @param incidents List of incidents to export
   * @return PDF content as byte array
   */
  byte[] exportToPDF(List<Incident> incidents);
  
  /**
   * Export incident with PDF and all evidence in a single ZIP
   * @param incident The incident to export
   * @param incidentMongoId The MongoDB ID of the incident for evidence lookup
   * @return ZIP file containing PDF and evidence as byte array
   */
  byte[] exportIncidentWithEvidence(Incident incident, String incidentMongoId);
}
