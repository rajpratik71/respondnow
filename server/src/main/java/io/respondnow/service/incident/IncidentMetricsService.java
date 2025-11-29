package io.respondnow.service.incident;

import io.respondnow.dto.incident.IncidentMetricsResponse;
import io.respondnow.model.incident.Incident;
import io.respondnow.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentMetricsService {
    
    private final IncidentRepository incidentRepository;
    
    public IncidentMetricsResponse getIncidentMetrics(Integer daysBack) {
        log.info("Calculating incident metrics for last {} days", daysBack);
        
        List<Incident> allIncidents = incidentRepository.findAll();
        
        // Filter incidents based on days back
        long cutoffTimestamp = 0;
        if (daysBack != null && daysBack > 0) {
            cutoffTimestamp = System.currentTimeMillis() - (daysBack * 24L * 60 * 60 * 1000);
            long finalCutoffTimestamp = cutoffTimestamp;
            allIncidents = allIncidents.stream()
                    .filter(i -> i.getCreatedAt() != null && i.getCreatedAt() >= finalCutoffTimestamp)
                    .collect(Collectors.toList());
        }
        
        // Overall counts
        long totalIncidents = allIncidents.size();
        long openIncidents = allIncidents.stream()
                .filter(i -> "OPEN".equals(i.getStatus().toString()))
                .count();
        long closedIncidents = allIncidents.stream()
                .filter(i -> "CLOSED".equals(i.getStatus().toString()))
                .count();
        long acknowledgedIncidents = allIncidents.stream()
                .filter(i -> "ACKNOWLEDGED".equals(i.getStatus().toString()))
                .count();
        
        // Counts by status
        Map<String, Long> countsByStatus = allIncidents.stream()
                .filter(i -> i.getStatus() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getStatus().toString(),
                        Collectors.counting()
                ));
        
        // Counts by severity
        Map<String, Long> countsBySeverity = allIncidents.stream()
                .filter(i -> i.getSeverity() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getSeverity().toString(),
                        Collectors.counting()
                ));
        
        // Counts by type
        Map<String, Long> countsByType = allIncidents.stream()
                .filter(i -> i.getType() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getType().toString(),
                        Collectors.counting()
                ));
        
        // Timeline data (group by day)
        List<IncidentMetricsResponse.TimelineDataPoint> timelineData = buildTimelineData(allIncidents);
        
        // Activity metrics
        long now = System.currentTimeMillis();
        IncidentMetricsResponse.ActivityMetrics last24Hours = calculateActivityMetrics(allIncidents, now - (24 * 60 * 60 * 1000), now);
        IncidentMetricsResponse.ActivityMetrics last7Days = calculateActivityMetrics(allIncidents, now - (7 * 24 * 60 * 60 * 1000), now);
        IncidentMetricsResponse.ActivityMetrics last30Days = calculateActivityMetrics(allIncidents, now - (30 * 24 * 60 * 60 * 1000), now);
        
        return IncidentMetricsResponse.builder()
                .totalIncidents(totalIncidents)
                .openIncidents(openIncidents)
                .closedIncidents(closedIncidents)
                .acknowledgedIncidents(acknowledgedIncidents)
                .countsByStatus(countsByStatus)
                .countsBySeverity(countsBySeverity)
                .countsByType(countsByType)
                .timelineData(timelineData)
                .last24Hours(last24Hours)
                .last7Days(last7Days)
                .last30Days(last30Days)
                .build();
    }
    
    private List<IncidentMetricsResponse.TimelineDataPoint> buildTimelineData(List<Incident> incidents) {
        Map<String, List<Incident>> incidentsByDate = incidents.stream()
                .filter(i -> i.getCreatedAt() != null)
                .collect(Collectors.groupingBy(incident -> {
                    LocalDate date = Instant.ofEpochMilli(incident.getCreatedAt())
                            .atZone(ZoneId.systemDefault())
                            .toLocalDate();
                    return date.format(DateTimeFormatter.ISO_LOCAL_DATE);
                }));
        
        return incidentsByDate.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    String date = entry.getKey();
                    List<Incident> dayIncidents = entry.getValue();
                    
                    // Get first timestamp of the day for sorting
                    Long timestamp = dayIncidents.stream()
                            .map(Incident::getCreatedAt)
                            .min(Long::compareTo)
                            .orElse(0L);
                    
                    Map<String, Long> statusCounts = dayIncidents.stream()
                            .filter(i -> i.getStatus() != null)
                            .collect(Collectors.groupingBy(
                                    i -> i.getStatus().toString(),
                                    Collectors.counting()
                            ));
                    
                    Map<String, Long> severityCounts = dayIncidents.stream()
                            .filter(i -> i.getSeverity() != null)
                            .collect(Collectors.groupingBy(
                                    i -> i.getSeverity().toString(),
                                    Collectors.counting()
                            ));
                    
                    return IncidentMetricsResponse.TimelineDataPoint.builder()
                            .timestamp(timestamp)
                            .date(date)
                            .count(dayIncidents.size())
                            .countsByStatus(statusCounts)
                            .countsBySeverity(severityCounts)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    private IncidentMetricsResponse.ActivityMetrics calculateActivityMetrics(
            List<Incident> allIncidents, long startTime, long endTime) {
        
        List<Incident> periodIncidents = allIncidents.stream()
                .filter(i -> i.getCreatedAt() != null && 
                             i.getCreatedAt() >= startTime && 
                             i.getCreatedAt() <= endTime)
                .collect(Collectors.toList());
        
        long created = periodIncidents.size();
        long acknowledged = periodIncidents.stream()
                .filter(i -> "ACKNOWLEDGED".equals(i.getStatus().toString()))
                .count();
        long resolved = periodIncidents.stream()
                .filter(i -> "RESOLVED".equals(i.getStatus().toString()))
                .count();
        long closed = periodIncidents.stream()
                .filter(i -> "CLOSED".equals(i.getStatus().toString()))
                .count();
        
        // Calculate average resolution time for closed incidents
        double avgResolutionTime = periodIncidents.stream()
                .filter(i -> "CLOSED".equals(i.getStatus().toString()) && 
                             i.getCreatedAt() != null && 
                             i.getUpdatedAt() != null)
                .mapToLong(i -> i.getUpdatedAt() - i.getCreatedAt())
                .average()
                .orElse(0.0);
        
        double avgResolutionMinutes = avgResolutionTime / (60 * 1000); // Convert ms to minutes
        
        return IncidentMetricsResponse.ActivityMetrics.builder()
                .created(created)
                .acknowledged(acknowledged)
                .resolved(resolved)
                .closed(closed)
                .averageResolutionTimeMinutes(avgResolutionMinutes)
                .build();
    }
}
