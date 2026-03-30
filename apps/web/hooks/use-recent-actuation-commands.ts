'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchRecentActuationCommands } from '@/lib/api';

const RECENT_COMMANDS_REFETCH_INTERVAL_MS = 120000;

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
    staleTime: 30000,
    refetchInterval: RECENT_COMMANDS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
