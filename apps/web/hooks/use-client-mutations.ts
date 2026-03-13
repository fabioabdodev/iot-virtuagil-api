'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient } from '@/lib/api';
import { ClientInput } from '@/types/client';

export function useClientMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  const invalidateClient = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['client', clientId, authToken],
      refetchType: 'active',
    });
  };

  const updateMutation = useMutation({
    mutationFn: (payload: ClientInput) =>
      updateClient(clientId as string, payload, authToken),
    onSuccess: async (client) => {
      queryClient.setQueryData(['client', clientId, authToken], client);
      await invalidateClient();
    },
  });

  return { updateMutation };
}
