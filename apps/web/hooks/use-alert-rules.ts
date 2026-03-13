'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchAlertRules } from '@/lib/api';

export function useAlertRules(clientId?: string, authToken?: string) {
  return useQuery({
    queryKey: ['alert-rules', clientId, authToken],
    queryFn: () => fetchAlertRules(clientId, authToken),
    enabled: Boolean(clientId && authToken),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
