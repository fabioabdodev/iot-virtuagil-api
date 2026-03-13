'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createUser, deleteUser, updateUser } from '@/lib/api';
import { UserInput, UserSummary } from '@/types/user';

export function useUserMutations(clientId?: string, authToken?: string) {
  const queryClient = useQueryClient();

  const invalidateUsers = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['users', clientId, authToken],
      refetchType: 'active',
    });
  };

  const createMutation = useMutation({
    mutationFn: (payload: UserInput) => createUser(payload, authToken),
    onSuccess: invalidateUsers,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UserInput }) =>
      updateUser(id, payload, authToken),
    onSuccess: invalidateUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id, authToken),
    onSuccess: async (deletedUser: UserSummary) => {
      queryClient.setQueriesData(
        { queryKey: ['users'] },
        (current: UserSummary[] | undefined) =>
          current?.filter((row) => row.id !== deletedUser.id) ?? current,
      );
      await invalidateUsers();
    },
  });

  return { createMutation, updateMutation, deleteMutation };
}
