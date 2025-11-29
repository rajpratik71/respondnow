import React from 'react';
import { Permission } from '@types/rbac';
import { useCurrentUser } from '@hooks/useCurrentUser';
import { usePermissions } from '@hooks/usePermissions';

export interface PermissionGuardProps {
  /**
   * Required permission(s) to show children
   */
  permission?: Permission | Permission[];
  
  /**
   * If true, user needs ALL specified permissions. If false, user needs ANY permission.
   * Default: false (ANY)
   */
  requireAll?: boolean;
  
  /**
   * Content to show when user has permission
   */
  children: React.ReactNode;
  
  /**
   * Optional fallback content to show when user doesn't have permission
   */
  fallback?: React.ReactNode;
  
  /**
   * If true, renders nothing instead of fallback when no permission
   */
  hideOnNoPermission?: boolean;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * // Single permission
 * <PermissionGuard permission={Permission.CREATE_USER}>
 *   <Button>Create User</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (ANY)
 * <PermissionGuard permission={[Permission.UPDATE_USER, Permission.DELETE_USER]}>
 *   <Button>Manage User</Button>
 * </PermissionGuard>
 * 
 * @example
 * // Multiple permissions (ALL required)
 * <PermissionGuard 
 *   permission={[Permission.CREATE_TEAM, Permission.MANAGE_TEAM_MEMBERS]}
 *   requireAll
 * >
 *   <Button>Create & Manage Team</Button>
 * </PermissionGuard>
 * 
 * @example
 * // With fallback
 * <PermissionGuard 
 *   permission={Permission.VIEW_ANALYTICS}
 *   fallback={<Text>Upgrade to view analytics</Text>}
 * >
 *   <AnalyticsDashboard />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  children,
  fallback = null,
  hideOnNoPermission = false
}) => {
  const currentUser = useCurrentUser();
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions(currentUser);

  // If no permission specified, always show
  if (!permission) {
    return <>{children}</>;
  }

  // If no user, don't show
  if (!currentUser) {
    return hideOnNoPermission ? null : <>{fallback}</>;
  }

  let hasRequiredPermission = false;

  if (Array.isArray(permission)) {
    // Multiple permissions
    if (requireAll) {
      hasRequiredPermission = hasAllPermissions(...permission);
    } else {
      hasRequiredPermission = hasAnyPermission(...permission);
    }
  } else {
    // Single permission
    hasRequiredPermission = hasPermission(permission);
  }

  if (hasRequiredPermission) {
    return <>{children}</>;
  }

  return hideOnNoPermission ? null : <>{fallback}</>;
};

/**
 * Higher-order component version of PermissionGuard
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  requireAll = false
) {
  return (props: P) => (
    <PermissionGuard permission={permission} requireAll={requireAll} hideOnNoPermission>
      <Component {...props} />
    </PermissionGuard>
  );
}
