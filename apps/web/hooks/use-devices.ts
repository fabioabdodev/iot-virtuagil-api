'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDevices } from '@/lib/api';

const DEVICES_REFETCH_INTERVAL_MS = 120000;

export function useDevices(
  clientId?: string,
  limit = 50,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['devices', clientId, limit, authToken],
    queryFn: () => fetchDevices(clientId, limit, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 30000,
    refetchInterval: DEVICES_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
