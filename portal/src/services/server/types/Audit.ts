export interface SecurityAuditLog {
  id: string;
  eventType: string;
  username: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  details?: string;
  errorMessage?: string;
  timestamp: number;
  performedBy?: string;
  resourceType?: string;
  resourceId?: string;
  action?: string;
}

export interface AuditStatistics {
  totalLogs: number;
  loginAttempts24h: number;
  failedLogins24h: number;
  loginAttempts7d: number;
  failedLogins7d: number;
  successfulEvents24h: number;
  failedEvents24h: number;
}

export interface PermissionMatrix {
  roles: RolePermissionEntry[];
  users: UserPermissionEntry[];
  groups: GroupPermissionEntry[];
  permissionsByRole: Record<string, string[]>;
}

export interface RolePermissionEntry {
  roleName: string;
  roleType: string;
  permissions: string[];
  userCount: number;
  groupCount: number;
}

export interface UserPermissionEntry {
  userId: string;
  username: string;
  email: string;
  directRoles: string[];
  groupRoles: string[];
  effectiveRoles: string[];
  effectivePermissions: string[];
  groupNames: string[];
}

export interface GroupPermissionEntry {
  groupId: string;
  groupName: string;
  roles: string[];
  memberCount: number;
  effectivePermissions: string[];
}
