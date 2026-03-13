'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchClient } from '@/lib/api';

export function useClient(clientId?: string, authToken?: string, enabled = true) {
  return useQuery({
    queryKey: ['client', clientId, authToken],
    queryFn: () => fetchClient(clientId as string, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
