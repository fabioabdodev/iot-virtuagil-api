'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUserMutations } from '@/hooks/use-user-mutations';
import { useUsers } from '@/hooks/use-users';
import { AuthUser } from '@/types/auth';
import { UserSummary } from '@/types/user';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatorio'),
  email: z.string().trim().email('Email invalido'),
  password: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined))
    .refine((value) => value == null || value.length >= 6, {
      message: 'Senha minima: 6 caracteres',
    }),
  phone: z
    .string()
    .optional()
    .transform((value) => (value?.trim() ? value : undefined)),
  role: z.enum(['admin', 'operator']),
  isActive: z.enum(['true', 'false']).transform((value) => value === 'true'),
});

type FormValues = z.input<typeof formSchema>;

type UsersPanelProps = {
  clientId?: string;
  authToken?: string;
  currentUser: AuthUser | null;
};

export function UsersPanel({
  clientId,
  authToken,
  currentUser,
}: UsersPanelProps) {
  const { data, isLoading, isError, error } = useUsers(clientId, authToken);
  const { createMutation, updateMutation, deleteMutation } = useUserMutations(
    clientId,
    authToken,
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const users = data ?? [];
  const editingUser = users.find((row) => row.id === editingUserId) ?? null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'operator',
      isActive: 'true',
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        password: '',
        phone: editingUser.phone ?? '',
        role: editingUser.role,
        isActive: editingUser.isActive ? 'true' : 'false',
      });
      return;
    }

    reset({
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'operator',
      isActive: 'true',
    });
  }, [editingUser, reset]);

  async function handleDeleteUser(id: string) {
    setDeletingUserId(id);
    try {
      await deleteMutation.mutateAsync(id);
      if (editingUserId === id) setEditingUserId(null);
    } finally {
      setDeletingUserId(null);
      setPendingDeleteUserId(null);
    }
  }

  if (!clientId) {
    return (
      <Panel className="animate-fade-up p-5 [animation-delay:340ms]">
        <Feedback>Defina um `clientId` para gerenciar usuarios.</Feedback>
      </Panel>
    );
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:340ms]">
      <ConfirmDialog
        open={Boolean(pendingDeleteUserId)}
        title="Excluir usuario?"
        description={
          <>
            O usuario <strong>{pendingDeleteUserId}</strong> sera removido deste cliente.
          </>
        }
        confirmLabel="Excluir usuario"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteUserId(null)}
        onConfirm={() => {
          if (pendingDeleteUserId) void handleDeleteUser(pendingDeleteUserId);
        }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Usuarios</h2>
          <p className="mt-1 text-sm text-muted">
            Gestao inicial de acessos do cliente.
          </p>
        </div>
        <Badge>{currentUser?.role ?? 'sem sessao'}</Badge>
      </div>

      <form
        onSubmit={handleSubmit(async (rawValues) => {
          const values = formSchema.parse(rawValues);
          if (editingUser) {
            await updateMutation.mutateAsync({
              id: editingUser.id,
              payload: {
                clientId,
                name: values.name,
                email: values.email,
                password: values.password,
                phone: values.phone,
                role: values.role,
                isActive: values.isActive,
              },
            });
            setEditingUserId(null);
          } else {
            await createMutation.mutateAsync({
              clientId,
              name: values.name,
              email: values.email,
              password: values.password,
              phone: values.phone,
              role: values.role,
              isActive: values.isActive,
            });
          }
        })}
      >
        <Panel variant="strong" className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs text-muted">Nome</label>
            <Input {...register('name')} placeholder="Operador Virtuagil" />
            {errors.name ? <p className="mt-1 text-xs text-bad">{errors.name.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Email</label>
            <Input {...register('email')} placeholder="usuario@empresa.com.br" />
            {errors.email ? <p className="mt-1 text-xs text-bad">{errors.email.message}</p> : null}
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">
              {editingUser ? 'Nova senha (opcional)' : 'Senha'}
            </label>
            <Input type="password" {...register('password')} placeholder="minimo 6 caracteres" />
            {errors.password ? (
              <p className="mt-1 text-xs text-bad">{errors.password.message}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Telefone</label>
            <Input {...register('phone')} placeholder="31999999999" />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Papel</label>
            <Select {...register('role')}>
              <option value="operator">Operator</option>
              <option value="admin">Admin</option>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted">Status</label>
            <Select {...register('isActive')}>
              <option value="true">Ativo</option>
              <option value="false">Inativo</option>
            </Select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="submit"
                variant="primary"
                loading={createMutation.isPending || updateMutation.isPending}
                className="min-w-[168px]"
              >
                {editingUser ? 'Salvar usuario' : 'Criar usuario'}
              </Button>
              {editingUser ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingUserId(null)}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>
        </Panel>
      </form>

      {createMutation.isError || updateMutation.isError || deleteMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {createMutation.error?.message ??
            updateMutation.error?.message ??
            deleteMutation.error?.message ??
            'Falha ao salvar usuario.'}
        </Feedback>
      ) : null}

      {isLoading ? <Feedback>Carregando usuarios...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Erro ao carregar usuarios.'}
        </Feedback>
      ) : null}

      {!isLoading && !isError && users.length > 0 ? (
        <DataTableWrapper className="rounded-[22px]">
          <DataTable>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Papel</th>
                <th>Status</th>
                <th>Ultimo login</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs text-muted">{user.email}</span>
                    </div>
                  </td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs ${
                        user.isActive
                          ? 'border-ok/30 bg-ok/10 text-ok'
                          : 'border-line/70 bg-card/50 text-muted'
                      }`}
                    >
                      {user.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="text-muted">
                    {user.lastLoginAt
                      ? formatDistanceToNow(new Date(user.lastLoginAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })
                      : 'Sem login'}
                  </td>
                  <td className="text-right">
                    <div className="inline-flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingUserId(user.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={deletingUserId === user.id}
                        disabled={deleteMutation.isPending && deletingUserId !== user.id}
                        onClick={() => setPendingDeleteUserId(user.id)}
                      >
                        {deletingUserId === user.id ? 'Excluindo...' : 'Excluir'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}

      {!isLoading && !isError && users.length === 0 ? (
        <Feedback>Sem usuarios cadastrados para este clientId.</Feedback>
      ) : null}
    </Panel>
  );
}
