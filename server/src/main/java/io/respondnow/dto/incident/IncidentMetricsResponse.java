package io.respondnow.dto.incident;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentMetricsResponse {
    
    // Overall counts
    private long totalIncidents;
    private long openIncidents;
    private long closedIncidents;
    private long acknowledgedIncidents;
    
    // Counts by status
    private Map<String, Long> countsByStatus;
    
    // Counts by severity
    private Map<String, Long> countsBySeverity;
    
    // Counts by type (if applicable)
    private Map<String, Long> countsByType;
    
    // Timeline data
    private List<TimelineDataPoint> timelineData;
    
    // Recent activity (last 24h, 7d, 30d)
    private ActivityMetrics last24Hours;
    private ActivityMetrics last7Days;
    private ActivityMetrics last30Days;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineDataPoint {
        private Long timestamp;
        private String date;
        private long count;
        private Map<String, Long> countsByStatus;
        private Map<String, Long> countsBySeverity;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityMetrics {
        private long created;
        private long acknowledged;
        private long resolved;
        private long closed;
        private double averageResolutionTimeMinutes;
    }
}
