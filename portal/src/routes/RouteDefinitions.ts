export function normalizePath(url: string): string {
  return url.replace(/\/{2,}/g, '/');
}

export interface UseRouteDefinitionsProps {
  toRoot(): string;
  toLogin(): string;
  toPasswordReset(): string;
  toGetStarted(): string;
  toIncidentDashboard(): string;
  toIncidentDetails(params: { incidentId: string }): string;
  toUsers(): string;
  toTeams(): string;
  toOrganizationSettings(): string;
}

export const paths: UseRouteDefinitionsProps = {
  toRoot: () => '/',
  toLogin: () => '/login',
  toPasswordReset: () => '/password-reset',
  toGetStarted: () => '/getting-started',
  toIncidentDashboard: () => '/incidents',
  toIncidentDetails: ({ incidentId }) => `/incidents/${incidentId}`,
  toUsers: () => '/users',
  toTeams: () => '/teams',
  toOrganizationSettings: () => '/settings/organization'
};

export interface IncidentDetailsPathProps {
  incidentId: string;
}
