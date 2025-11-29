import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';
import { SecurityAuditLog, AuditStatistics, PermissionMatrix } from '../types/Audit';

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Fetch paginated audit logs
export const useAuditLogs = (page: number = 0, size: number = 50) => {
  return useQuery<PagedResponse<SecurityAuditLog>>({
    queryKey: ['auditLogs', page, size],
    queryFn: () => fetcher<PagedResponse<SecurityAuditLog>>({
      url: `/api/audit/logs?page=${page}&size=${size}`,
      method: 'GET'
    }),
    keepPreviousData: true,
    staleTime: 10000 // 10 seconds
  });
};

// Fetch audit logs by username
export const useAuditLogsByUsername = (username: string) => {
  return useQuery<SecurityAuditLog[]>({
    queryKey: ['auditLogs', 'user', username],
    queryFn: () => fetcher<SecurityAuditLog[]>({
      url: `/api/audit/logs/user/${username}`,
      method: 'GET'
    }),
    enabled: !!username,
    staleTime: 10000
  });
};

// Fetch audit logs by event type
export const useAuditLogsByEventType = (eventType: string) => {
  return useQuery<SecurityAuditLog[]>({
    queryKey: ['auditLogs', 'event', eventType],
    queryFn: () => fetcher<SecurityAuditLog[]>({
      url: `/api/audit/logs/event/${eventType}`,
      method: 'GET'
    }),
    enabled: !!eventType,
    staleTime: 10000
  });
};

// Fetch audit statistics
export const useAuditStatistics = () => {
  return useQuery<AuditStatistics>({
    queryKey: ['auditStatistics'],
    queryFn: () => fetcher<AuditStatistics>({
      url: '/api/audit/statistics',
      method: 'GET'
    }),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 20000
  });
};

// Fetch permission matrix
export const usePermissionMatrix = () => {
  return useQuery<PermissionMatrix>({
    queryKey: ['permissionMatrix'],
    queryFn: () => fetcher<PermissionMatrix>({
      url: '/api/permissions/matrix',
      method: 'GET'
    }),
    staleTime: 60000 // 1 minute
  });
};
