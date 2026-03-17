'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDevice, deleteDevice, updateDevice } from '@/lib/api';
import { DeviceInput, DeviceSummary } from '@/types/device';

export function useDeviceMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  const invalidateDevices = () => {
    void queryClient.invalidateQueries({
      queryKey: ['devices'],
      refetchType: 'none',
    });
    void queryClient.invalidateQueries({
      queryKey: ['device-readings'],
      refetchType: 'none',
    });
  };

  const upsertDeviceInCaches = (device: DeviceSummary) => {
    queryClient.setQueriesData(
      { queryKey: ['devices'] },
      (current: DeviceSummary[] | undefined) => {
        if (!current) return current;

        const existingIndex = current.findIndex((row) => row.id === device.id);
        if (existingIndex === -1) {
          return [device, ...current];
        }

        const next = current.slice();
        next[existingIndex] = {
          ...next[existingIndex],
          ...device,
        };
        return next;
      },
    );
  };

  const removeDeviceFromCaches = (deviceId: string) => {
    queryClient.setQueriesData(
      { queryKey: ['devices'] },
      (current: DeviceSummary[] | undefined) =>
        current?.filter((row) => row.id !== deviceId) ?? current,
    );
  };

  const createMutation = useMutation({
    mutationFn: (payload: DeviceInput) => createDevice(payload, authToken),
    onSuccess: (device) => {
      upsertDeviceInCaches(device);
      invalidateDevices();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Omit<DeviceInput, 'id'>;
    }) => updateDevice(id, payload, clientId, authToken),
    onSuccess: (device) => {
      upsertDeviceInCaches(device);
      invalidateDevices();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDevice(id, clientId, authToken),
    onSuccess: (device) => {
      removeDeviceFromCaches(device.id);
      invalidateDevices();
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
