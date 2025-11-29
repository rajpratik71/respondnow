import { useMemo } from 'react';
import { Permission, SystemRole, User } from '@types/rbac';

/**
 * Hook to check user permissions
 */
export function usePermissions(user?: User) {
  const hasPermission = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!user) return false;
      
      // Admin has all permissions
      if (user.systemRole === SystemRole.ADMIN) {
        return true;
      }
      
      // Check if user has the specific permission
      return user.permissions?.includes(permission) ?? false;
    };
  }, [user]);

  const hasAnyPermission = useMemo(() => {
    return (...permissions: Permission[]): boolean => {
      if (!user) return false;
      
      // Admin has all permissions
      if (user.systemRole === SystemRole.ADMIN) {
        return true;
      }
      
      // Check if user has any of the permissions
      return permissions.some(permission => user.permissions?.includes(permission));
    };
  }, [user]);

  const hasAllPermissions = useMemo(() => {
    return (...permissions: Permission[]): boolean => {
      if (!user) return false;
      
      // Admin has all permissions
      if (user.systemRole === SystemRole.ADMIN) {
        return true;
      }
      
      // Check if user has all of the permissions
      return permissions.every(permission => user.permissions?.includes(permission));
    };
  }, [user]);

  const isAdmin = useMemo(() => {
    return user?.systemRole === SystemRole.ADMIN;
  }, [user]);

  const isIncidentCommander = useMemo(() => {
    return user?.systemRole === SystemRole.INCIDENT_COMMANDER;
  }, [user]);

  const isResponder = useMemo(() => {
    return user?.systemRole === SystemRole.RESPONDER;
  }, [user]);

  const isObserver = useMemo(() => {
    return user?.systemRole === SystemRole.OBSERVER;
  }, [user]);

  const isReporter = useMemo(() => {
    return user?.systemRole === SystemRole.REPORTER;
  }, [user]);

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin,
    isIncidentCommander,
    isResponder,
    isObserver,
    isReporter
  };
}
