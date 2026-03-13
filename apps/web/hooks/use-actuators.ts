'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchActuators } from '@/lib/api';

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
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
}
