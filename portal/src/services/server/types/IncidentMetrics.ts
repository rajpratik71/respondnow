export interface IncidentMetrics {
  totalIncidents: number;
  openIncidents: number;
  closedIncidents: number;
  acknowledgedIncidents: number;
  countsByStatus: Record<string, number>;
  countsBySeverity: Record<string, number>;
  countsByType: Record<string, number>;
  timelineData: TimelineDataPoint[];
  last24Hours: ActivityMetrics;
  last7Days: ActivityMetrics;
  last30Days: ActivityMetrics;
}

export interface TimelineDataPoint {
  timestamp: number;
  date: string;
  count: number;
  countsByStatus: Record<string, number>;
  countsBySeverity: Record<string, number>;
}

export interface ActivityMetrics {
  created: number;
  acknowledged: number;
  resolved: number;
  closed: number;
  averageResolutionTimeMinutes: number;
}
