'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDeviceReadings } from '@/lib/api';

const LIVE_READINGS_REFETCH_INTERVAL_MS = 60000;

export function useDeviceReadings(
  deviceId?: string,
  clientId?: string,
  limit = 48,
  authToken?: string,
  live = false,
  sensorType = 'temperature',
) {
  return useQuery({
    queryKey: ['device-readings', deviceId, clientId, limit, authToken, sensorType],
    queryFn: () =>
      fetchDeviceReadings(deviceId as string, clientId, limit, authToken, sensorType),
    enabled: Boolean(deviceId),
    retry: 2,
    refetchOnWindowFocus: false,
    staleTime: live ? 15000 : 60000,
    refetchInterval: live ? LIVE_READINGS_REFETCH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) => previousData,
  });
}
