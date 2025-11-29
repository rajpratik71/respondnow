import { useQuery } from '@tanstack/react-query';
import { fetcher } from '@services/fetcher';
import { IncidentMetrics } from '../types/IncidentMetrics';

export const useIncidentMetrics = (daysBack?: number) => {
  return useQuery<IncidentMetrics>({
    queryKey: ['incidentMetrics', daysBack],
    queryFn: () => fetcher<IncidentMetrics>({
      url: `/api/incident/metrics${daysBack ? `?daysBack=${daysBack}` : ''}`,
      method: 'GET'
    }),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000
  });
};
