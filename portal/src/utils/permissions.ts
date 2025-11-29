/**
 * Role-Based Access Control (RBAC) Permission Utilities
 */

export type Role = 'VIEWER' | 'RESPONDER' | 'MANAGER' | 'ADMIN' | 'SYSTEM_ADMIN';

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(userRoles: string[], allowedRoles: Role[]): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  return userRoles.some(role => allowedRoles.includes(role as Role));
}

/**
 * Check if user has specific role
 */
export function hasRole(userRoles: string[], role: Role): boolean {
  if (!userRoles || userRoles.length === 0) {
    return false;
  }
  return userRoles.includes(role);
}

/**
 * Check if user is admin (ADMIN or SYSTEM_ADMIN)
 */
export function isAdmin(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['ADMIN', 'SYSTEM_ADMIN']);
}

/**
 * Check if user is manager or above
 */
export function isManagerOrAbove(userRoles: string[]): boolean {
  return hasAnyRole(userRoles, ['MANAGER', 'ADMIN', 'SYSTEM_ADMIN']);
}

/**
 * User Management Permissions
 */
export const UserPermissions = {
  /**
   * Can view users list and details
   * Roles: All authenticated users
   */
  canView: (userRoles: string[]): boolean => {
    return userRoles && userRoles.length > 0;
  },

  /**
   * Can create new users
   * Roles: MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canCreate: (userRoles: string[]): boolean => {
    return isManagerOrAbove(userRoles);
  },

  /**
   * Can update existing users
   * Roles: MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canUpdate: (userRoles: string[]): boolean => {
    return isManagerOrAbove(userRoles);
  },

  /**
   * Can delete users
   * Roles: ADMIN, SYSTEM_ADMIN only
   */
  canDelete: (userRoles: string[]): boolean => {
    return isAdmin(userRoles);
  }
};

/**
 * Group Management Permissions
 */
export const GroupPermissions = {
  /**
   * Can view groups list and details
   * Roles: All authenticated users
   */
  canView: (userRoles: string[]): boolean => {
    return userRoles && userRoles.length > 0;
  },

  /**
   * Can create new groups
   * Roles: MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canCreate: (userRoles: string[]): boolean => {
    return isManagerOrAbove(userRoles);
  },

  /**
   * Can update existing groups
   * Roles: MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canUpdate: (userRoles: string[]): boolean => {
    return isManagerOrAbove(userRoles);
  },

  /**
   * Can delete groups
   * Roles: ADMIN, SYSTEM_ADMIN only
   */
  canDelete: (userRoles: string[]): boolean => {
    return isAdmin(userRoles);
  },

  /**
   * Can manage group members
   * Roles: MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canManageMembers: (userRoles: string[]): boolean => {
    return isManagerOrAbove(userRoles);
  }
};

/**
 * Incident Management Permissions
 */
export const IncidentPermissions = {
  /**
   * Can view incidents
   * Roles: All authenticated users
   */
  canView: (userRoles: string[]): boolean => {
    return userRoles && userRoles.length > 0;
  },

  /**
   * Can create incidents
   * Roles: RESPONDER, MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canCreate: (userRoles: string[]): boolean => {
    return hasAnyRole(userRoles, ['RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN']);
  },

  /**
   * Can update incidents
   * Roles: RESPONDER, MANAGER, ADMIN, SYSTEM_ADMIN
   */
  canUpdate: (userRoles: string[]): boolean => {
    return hasAnyRole(userRoles, ['RESPONDER', 'MANAGER', 'ADMIN', 'SYSTEM_ADMIN']);
  },

  /**
   * Can delete incidents
   * Roles: ADMIN, SYSTEM_ADMIN only
   */
  canDelete: (userRoles: string[]): boolean => {
    return isAdmin(userRoles);
  }
};
