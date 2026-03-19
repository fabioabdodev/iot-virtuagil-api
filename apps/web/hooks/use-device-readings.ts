'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchDeviceReadings } from '@/lib/api';

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
    refetchInterval: live ? 15000 : false,
    refetchIntervalInBackground: live,
    placeholderData: (previousData) => previousData,
  });
}
