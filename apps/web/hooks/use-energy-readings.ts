'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchEnergyReadings } from '@/lib/api';
import type { EnergySensorType } from '@/types/energy';

const ENERGY_READINGS_REFETCH_INTERVAL_MS = 180000;

export function useEnergyReadings(
  deviceId?: string,
  clientId?: string,
  authToken?: string,
  sensor: EnergySensorType = 'consumo',
  enabled = true,
) {
  return useQuery({
    queryKey: ['energy-readings', deviceId, clientId, authToken, sensor],
    queryFn: () =>
      fetchEnergyReadings(
        deviceId as string,
        {
          clientId,
          sensor,
          limit: 48,
          resolution: '15m',
        },
        authToken,
      ),
    enabled: Boolean(deviceId && clientId && authToken && enabled),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: 60000,
    refetchInterval: ENERGY_READINGS_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
