/**
 * RBAC and Multi-Tenancy Types
 */

export enum SystemRole {
  ADMIN = 'ADMIN',
  INCIDENT_COMMANDER = 'INCIDENT_COMMANDER',
  RESPONDER = 'RESPONDER',
  OBSERVER = 'OBSERVER',
  REPORTER = 'REPORTER'
}

export enum Permission {
  // Incident Permissions
  READ_INCIDENT = 'READ_INCIDENT',
  CREATE_INCIDENT = 'CREATE_INCIDENT',
  UPDATE_INCIDENT = 'UPDATE_INCIDENT',
  DELETE_INCIDENT = 'DELETE_INCIDENT',
  EXPORT_INCIDENT = 'EXPORT_INCIDENT',
  ACKNOWLEDGE_INCIDENT = 'ACKNOWLEDGE_INCIDENT',
  RESOLVE_INCIDENT = 'RESOLVE_INCIDENT',

  // User Management Permissions
  READ_USER = 'READ_USER',
  CREATE_USER = 'CREATE_USER',
  UPDATE_USER = 'UPDATE_USER',
  DELETE_USER = 'DELETE_USER',
  ASSIGN_ROLE = 'ASSIGN_ROLE',

  // Team Management Permissions
  READ_TEAM = 'READ_TEAM',
  CREATE_TEAM = 'CREATE_TEAM',
  UPDATE_TEAM = 'UPDATE_TEAM',
  DELETE_TEAM = 'DELETE_TEAM',
  MANAGE_TEAM_MEMBERS = 'MANAGE_TEAM_MEMBERS',

  // Organization Management Permissions
  READ_ORGANIZATION = 'READ_ORGANIZATION',
  UPDATE_ORGANIZATION = 'UPDATE_ORGANIZATION',
  MANAGE_ORGANIZATION_SETTINGS = 'MANAGE_ORGANIZATION_SETTINGS',

  // Advanced Features
  MANAGE_CUSTOM_FIELDS = 'MANAGE_CUSTOM_FIELDS',
  MANAGE_TEMPLATES = 'MANAGE_TEMPLATES',
  VIEW_ANALYTICS = 'VIEW_ANALYTICS',
  BULK_OPERATIONS = 'BULK_OPERATIONS',
  MANAGE_SLA = 'MANAGE_SLA',

  // System Administration
  SYSTEM_ADMIN = 'SYSTEM_ADMIN'
}

export enum TeamRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  name: string;
  userId: string;
  email: string;
  active: boolean;
  systemRole?: SystemRole;
  permissions?: Permission[];
  teamIds?: string[];
  organizationIds?: string[];
  accountIdentifier?: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
  createdAt?: number;
  lastLoginAt?: number;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: number;
}

export interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: number;
}

export interface Team {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  accountIdentifier: string;
  orgIdentifier: string;
  organizationId?: string;
  members: TeamMember[];
  permissions: Permission[];
  createdAt: number;
  updatedAt?: number;
  createdBy: string;
  updatedBy?: string;
  active: boolean;
}

export interface OrganizationSettings {
  incidentAutoEscalation?: boolean;
  defaultSeverity?: string;
  escalationTimeoutMinutes?: number;
  requireIncidentApproval?: boolean;
  enableCustomFields?: boolean;
  enableTemplates?: boolean;
  enableSLA?: boolean;
}

export interface OrganizationQuotas {
  maxUsers?: number;
  maxTeams?: number;
  maxIncidents?: number;
  maxCustomFields?: number;
  maxTemplates?: number;
  storageQuotaBytes?: number;
}

export interface Organization {
  id: string;
  name: string;
  identifier: string;
  description?: string;
  accountIdentifier: string;
  settings?: OrganizationSettings;
  quotas?: OrganizationQuotas;
  createdAt: number;
  updatedAt?: number;
  createdBy: string;
  updatedBy?: string;
  active: boolean;
}

export const ROLE_LABELS: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Administrator',
  [SystemRole.INCIDENT_COMMANDER]: 'Incident Commander',
  [SystemRole.RESPONDER]: 'Responder',
  [SystemRole.OBSERVER]: 'Observer',
  [SystemRole.REPORTER]: 'Reporter'
};

export const ROLE_DESCRIPTIONS: Record<SystemRole, string> = {
  [SystemRole.ADMIN]: 'Full system access with all permissions',
  [SystemRole.INCIDENT_COMMANDER]: 'Manage incidents and assign roles, but cannot manage users',
  [SystemRole.RESPONDER]: 'Create and update incidents, participate in response',
  [SystemRole.OBSERVER]: 'Read-only access to view incidents and analytics',
  [SystemRole.REPORTER]: 'Can create incidents but limited update access'
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  [Permission.READ_INCIDENT]: 'Read Incidents',
  [Permission.CREATE_INCIDENT]: 'Create Incidents',
  [Permission.UPDATE_INCIDENT]: 'Update Incidents',
  [Permission.DELETE_INCIDENT]: 'Delete Incidents',
  [Permission.EXPORT_INCIDENT]: 'Export Incidents',
  [Permission.ACKNOWLEDGE_INCIDENT]: 'Acknowledge Incidents',
  [Permission.RESOLVE_INCIDENT]: 'Resolve Incidents',
  [Permission.READ_USER]: 'Read Users',
  [Permission.CREATE_USER]: 'Create Users',
  [Permission.UPDATE_USER]: 'Update Users',
  [Permission.DELETE_USER]: 'Delete Users',
  [Permission.ASSIGN_ROLE]: 'Assign Roles',
  [Permission.READ_TEAM]: 'Read Teams',
  [Permission.CREATE_TEAM]: 'Create Teams',
  [Permission.UPDATE_TEAM]: 'Update Teams',
  [Permission.DELETE_TEAM]: 'Delete Teams',
  [Permission.MANAGE_TEAM_MEMBERS]: 'Manage Team Members',
  [Permission.READ_ORGANIZATION]: 'Read Organization',
  [Permission.UPDATE_ORGANIZATION]: 'Update Organization',
  [Permission.MANAGE_ORGANIZATION_SETTINGS]: 'Manage Organization Settings',
  [Permission.MANAGE_CUSTOM_FIELDS]: 'Manage Custom Fields',
  [Permission.MANAGE_TEMPLATES]: 'Manage Templates',
  [Permission.VIEW_ANALYTICS]: 'View Analytics',
  [Permission.BULK_OPERATIONS]: 'Bulk Operations',
  [Permission.MANAGE_SLA]: 'Manage SLA',
  [Permission.SYSTEM_ADMIN]: 'System Administration'
};
