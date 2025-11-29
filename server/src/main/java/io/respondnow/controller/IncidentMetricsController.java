package io.respondnow.controller;

import io.respondnow.dto.incident.IncidentMetricsResponse;
import io.respondnow.service.incident.IncidentMetricsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/incident/metrics")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class IncidentMetricsController {
    
    private final IncidentMetricsService incidentMetricsService;
    
    @GetMapping
    public ResponseEntity<IncidentMetricsResponse> getIncidentMetrics(
            @RequestParam(required = false) Integer daysBack) {
        log.info("GET /incident/metrics - daysBack: {}", daysBack);
        IncidentMetricsResponse metrics = incidentMetricsService.getIncidentMetrics(daysBack);
        return ResponseEntity.ok(metrics);
    }
}
