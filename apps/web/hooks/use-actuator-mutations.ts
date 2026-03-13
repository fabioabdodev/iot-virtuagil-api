'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createActuator,
  deleteActuator,
  issueActuatorCommand,
  updateActuator,
} from '@/lib/api';
import {
  ActuationCommand,
  ActuationCommandInput,
  ActuatorInput,
  ActuatorSummary,
} from '@/types/actuator';

export function useActuatorMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  const invalidateActuators = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['actuators'],
      refetchType: 'active',
    });
    await queryClient.invalidateQueries({
      queryKey: ['actuator-commands'],
      refetchType: 'active',
    });
  };

  const upsertActuatorInCaches = (actuator: ActuatorSummary) => {
    queryClient.setQueriesData(
      { queryKey: ['actuators'] },
      (current: ActuatorSummary[] | undefined) => {
        if (!current) return current;

        const existingIndex = current.findIndex((row) => row.id === actuator.id);
        if (existingIndex === -1) return [actuator, ...current];

        const next = current.slice();
        next[existingIndex] = {
          ...next[existingIndex],
          ...actuator,
        };
        return next;
      },
    );
  };

  const prependCommandInCaches = (command: ActuationCommand) => {
    queryClient.setQueriesData(
      { queryKey: ['actuator-commands', command.actuatorId] },
      (current: ActuationCommand[] | undefined) =>
        current ? [command, ...current] : current,
    );
  };

  const removeActuatorFromCaches = (actuatorId: string) => {
    queryClient.setQueriesData(
      { queryKey: ['actuators'] },
      (current: ActuatorSummary[] | undefined) =>
        current?.filter((row) => row.id !== actuatorId) ?? current,
    );
  };

  const createMutation = useMutation({
    mutationFn: (payload: ActuatorInput) => createActuator(payload, authToken),
    onSuccess: async (actuator) => {
      upsertActuatorInCaches(actuator);
      await invalidateActuators();
    },
  });

  const commandMutation = useMutation({
    mutationFn: ({
      actuatorId,
      payload,
    }: {
      actuatorId: string;
      payload: ActuationCommandInput;
    }) => issueActuatorCommand(actuatorId, payload, authToken),
    onSuccess: async (command) => {
      if (command.actuator) {
        upsertActuatorInCaches(command.actuator);
      }
      prependCommandInCaches(command);
      await invalidateActuators();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Omit<ActuatorInput, 'id'>;
    }) => updateActuator(id, payload, authToken),
    onSuccess: async (actuator) => {
      upsertActuatorInCaches(actuator);
      await invalidateActuators();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteActuator(id, authToken),
    onSuccess: async (actuator) => {
      removeActuatorFromCaches(actuator.id);
      await invalidateActuators();
    },
  });

  return {
    createMutation,
    commandMutation,
    updateMutation,
    deleteMutation,
    scopedClientId: clientId,
  };
}
