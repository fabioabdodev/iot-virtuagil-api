'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchActuators } from '@/lib/api';

const ACTUATORS_REFETCH_INTERVAL_MS = 120000;

export function useActuators(
  clientId?: string,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['actuators', clientId, authToken],
    queryFn: () => fetchActuators(clientId, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: ACTUATORS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
