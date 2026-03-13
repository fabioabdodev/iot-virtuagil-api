'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchClientModules } from '@/lib/api';

export function useClientModules(
  clientId?: string,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['client-modules', clientId, authToken],
    queryFn: () => fetchClientModules(clientId as string, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
