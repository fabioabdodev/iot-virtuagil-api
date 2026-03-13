'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/lib/api';

export function useUsers(
  clientId?: string,
  authToken?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['users', clientId, authToken],
    queryFn: () => fetchUsers(clientId, authToken),
    enabled: Boolean(clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
}
