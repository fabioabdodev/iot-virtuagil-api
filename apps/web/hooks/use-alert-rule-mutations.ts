'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAlertRule, deleteAlertRule, updateAlertRule } from '@/lib/api';
import { AlertRuleInput } from '@/types/alert-rule';

export function useAlertRuleMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['alert-rules', clientId],
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: AlertRuleInput) =>
      createAlertRule(payload, authToken),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAlertRule(id, authToken),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<AlertRuleInput>;
    }) => updateAlertRule(id, payload, authToken),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation };
}
