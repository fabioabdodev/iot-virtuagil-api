'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRecentActuationCommands } from '@/lib/api';

export function useRecentActuationCommands(
  clientId?: string,
  limit = 8,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['recent-actuation-commands', clientId, limit, authToken],
    queryFn: () => fetchRecentActuationCommands(clientId, limit, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
    placeholderData: (previousData) => previousData,
  });
}
