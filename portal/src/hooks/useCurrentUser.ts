import { useMemo } from 'react';
import jwtDecode from 'jwt-decode';
import { User, SystemRole, Permission } from '@types/rbac';

interface TokenPayload {
  role: string;
  uid: string;
  username: string;
  name?: string;
  email?: string;
  exp: number;
  iat: number;
  // RBAC fields (if included in token)
  systemRole?: SystemRole;
  permissions?: Permission[];
  accountIdentifier?: string;
  orgIdentifier?: string;
  projectIdentifier?: string;
}

/**
 * Hook to get the current authenticated user from JWT token
 * Returns user object with RBAC information
 */
export function useCurrentUser(): User | null {
  const user = useMemo(() => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return null;
      }

      const decoded = jwtDecode<TokenPayload>(token);
      
      // Map token payload to User type
      const currentUser: User = {
        id: decoded.uid,
        userId: decoded.username,
        name: decoded.name || decoded.username,
        email: decoded.email || '',
        active: true,
        systemRole: decoded.systemRole || SystemRole.OBSERVER, // Default to observer
        permissions: decoded.permissions || [],
        accountIdentifier: decoded.accountIdentifier,
        orgIdentifier: decoded.orgIdentifier,
        projectIdentifier: decoded.projectIdentifier
      };

      return currentUser;
    } catch (error) {
      console.error('Failed to decode user token:', error);
      return null;
    }
  }, []);

  return user;
}

/**
 * Get user details from localStorage token
 */
export function getUserFromToken(): User | null {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return null;
    }

    const decoded = jwtDecode<TokenPayload>(token);
    
    return {
      id: decoded.uid,
      userId: decoded.username,
      name: decoded.name || decoded.username,
      email: decoded.email || '',
      active: true,
      systemRole: decoded.systemRole || SystemRole.OBSERVER,
      permissions: decoded.permissions || [],
      accountIdentifier: decoded.accountIdentifier,
      orgIdentifier: decoded.orgIdentifier,
      projectIdentifier: decoded.projectIdentifier
    };
  } catch (error) {
    return null;
  }
}
