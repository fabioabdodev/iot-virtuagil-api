'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEnergySummary } from '@/lib/api';

const ENERGY_SUMMARY_REFETCH_INTERVAL_MS = 180000;

export function useEnergySummary(
  clientId?: string,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['energy-summary', clientId, authToken],
    queryFn: () =>
      fetchEnergySummary(
        {
          clientId: clientId as string,
          sensors: ['consumo', 'corrente', 'tensao'],
          recentHours: 24,
        },
        authToken,
      ),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    refetchInterval: ENERGY_SUMMARY_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
