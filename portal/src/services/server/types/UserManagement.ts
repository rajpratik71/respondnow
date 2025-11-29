export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING'
}

export enum Permission {
  // Incident Permissions
  INCIDENT_VIEW = 'INCIDENT_VIEW',
  INCIDENT_CREATE = 'INCIDENT_CREATE',
  INCIDENT_UPDATE = 'INCIDENT_UPDATE',
  INCIDENT_DELETE = 'INCIDENT_DELETE',
  INCIDENT_EXPORT = 'INCIDENT_EXPORT',
  INCIDENT_ASSIGN = 'INCIDENT_ASSIGN',
  
  // User Permissions
  USER_VIEW = 'USER_VIEW',
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_MANAGE_ROLES = 'USER_MANAGE_ROLES',
  USER_RESET_PASSWORD = 'USER_RESET_PASSWORD',
  
  // Group Permissions
  GROUP_VIEW = 'GROUP_VIEW',
  GROUP_CREATE = 'GROUP_CREATE',
  GROUP_UPDATE = 'GROUP_UPDATE',
  GROUP_DELETE = 'GROUP_DELETE',
  GROUP_MANAGE_MEMBERS = 'GROUP_MANAGE_MEMBERS',
  GROUP_MANAGE_ROLES = 'GROUP_MANAGE_ROLES',
  
  // Evidence Permissions
  EVIDENCE_VIEW = 'EVIDENCE_VIEW',
  EVIDENCE_UPLOAD = 'EVIDENCE_UPLOAD',
  EVIDENCE_DELETE = 'EVIDENCE_DELETE',
  EVIDENCE_DOWNLOAD = 'EVIDENCE_DOWNLOAD',
  
  // Export Permissions
  EXPORT_CSV = 'EXPORT_CSV',
  EXPORT_PDF = 'EXPORT_PDF',
  EXPORT_COMBINED = 'EXPORT_COMBINED',
  
  // Role Permissions
  ROLE_VIEW = 'ROLE_VIEW',
  ROLE_CREATE = 'ROLE_CREATE',
  ROLE_UPDATE = 'ROLE_UPDATE',
  ROLE_DELETE = 'ROLE_DELETE',
  
  // System Permissions
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  SYSTEM_CONFIG = 'SYSTEM_CONFIG',
  SYSTEM_AUDIT = 'SYSTEM_AUDIT'
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  status: UserStatus;
  roleNames: string[];
  groupIds: string[];
  groupNames?: string[]; // Human-readable group names for UI
  effectivePermissions: Permission[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleNames?: string[];
  groupIds?: string[];
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  status?: UserStatus;
  roleNames?: string[];
  groupIds?: string[];
}

export interface Group {
  id: string;
  name: string;
  description: string;
  userIds: string[];
  usernames?: string[]; // Human-readable usernames for UI
  roleNames: string[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  userIds?: string[];
  roleNames?: string[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  type: 'SYSTEM' | 'CUSTOM';
  permissions: Permission[];
  userCount?: number;
}
