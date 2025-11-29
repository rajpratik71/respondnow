export function normalizePath(url: string): string {
  return url.replace(/\/{2,}/g, '/');
}

export interface UseRouteDefinitionsProps {
  toRoot(): string;
  toLogin(): string;
  toSignup(): string;
  toPasswordReset(): string;
  toDashboard(): string;
  toGetStarted(): string;
  toIncidentDashboard(): string;
  toIncidentDetails(params: { incidentId: string }): string;
  toUsers(): string;
  toGroups(): string;
  toRoles(): string;
  toPermissionMatrix(): string;
  toSecurityAuditLog(): string;
  toIncidentMetrics(): string;
}

export const paths: UseRouteDefinitionsProps = {
  toRoot: () => '/',
  toLogin: () => '/login',
  toSignup: () => '/signup',
  toPasswordReset: () => '/password-reset',
  toDashboard: () => '/dashboard',
  toGetStarted: () => '/getting-started',
  toIncidentDashboard: () => '/incidents',
  toIncidentDetails: ({ incidentId }) => `/incidents/${incidentId}`,
  toUsers: () => '/users',
  toGroups: () => '/groups',
  toRoles: () => '/roles',
  toPermissionMatrix: () => '/permissions/matrix',
  toSecurityAuditLog: () => '/audit/logs',
  toIncidentMetrics: () => '/incidents/metrics'
};

export interface IncidentDetailsPathProps {
  incidentId: string;
}
