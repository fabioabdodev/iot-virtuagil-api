'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDevices } from '@/lib/api';

export function useDevices(clientId?: string, limit = 50) {
  return useQuery({
    queryKey: ['devices', clientId, limit],
    queryFn: () => fetchDevices(clientId, limit),
  });
}
