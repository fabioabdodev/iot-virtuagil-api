'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertClientModule } from '@/lib/api';

export function useClientModuleMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      clientId: string;
      moduleKey: 'ambiental' | 'acionamento' | 'energia';
      itemKey?: string;
      enabled: boolean;
    }) => upsertClientModule(payload, authToken),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['client-modules', clientId, authToken],
        refetchType: 'active',
      });
    },
  });
}
