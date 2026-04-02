'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Copy, KeyRound } from 'lucide-react';
import { useUserMutations } from '@/hooks/use-user-mutations';
import { useUsers } from '@/hooks/use-users';
import { createUserPasswordSetupLink } from '@/lib/api';
import { isValidPhone } from '@/lib/client-form';
import { AuthUser } from '@/types/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { AccessNotice } from '@/components/ui/access-notice';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { formatRelativeDateTime } from '@/lib/date';

const formSchema = z.object({
  name: z.string().trim().min(2, 'Nome obrigatorio'),
  email: z.string().trim().email('Email invalido'),
  phone: z
    .string()
    .trim()
    .min(1, 'Telefone obrigatorio')
    .refine((value) => isValidPhone(value), 'Telefone invalido'),
  role: z.enum(['admin', 'operator']),
  preferredLayout: z.enum(['inherit', 'technical', 'client']),
  isActive: z
    .union([z.enum(['true', 'false']), z.boolean()])
    .transform((value) => value === true || value === 'true'),
});

type FormValues = z.input<typeof formSchema>;

type UsersPanelProps = {
  clientId?: string;
  authToken?: string;
  currentUser: AuthUser | null;
  canManage: boolean;
  blockedReason?: string;
};

const layoutLabels: Record<
  'inherit' | 'technical' | 'client',
  string
> = {
  inherit: 'Herdar do cliente',
  technical: 'Painel tecnico',
  client: 'Painel do cliente',
};

export function UsersPanel({
  clientId,
  authToken,
  currentUser,
  canManage,
  blockedReason,
}: UsersPanelProps) {
  const { data, isLoading, isError, error } = useUsers(
    clientId,
    authToken,
    canManage,
  );
  const { createMutation, updateMutation, deleteMutation } = useUserMutations(
    clientId,
    authToken,
  );
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [pendingDeleteUserId, setPendingDeleteUserId] = useState<string | null>(
    null,
  );
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [generatedSetupLink, setGeneratedSetupLink] = useState<{
    email: string;
    setupUrl: string;
    expiresAt: string;
  } | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isCopyingSetupLink, setIsCopyingSetupLink] = useState(false);
  const [linkActionUserId, setLinkActionUserId] = useState<string | null>(null);

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
      phone: '',
      role: 'operator',
      preferredLayout: 'inherit',
      isActive: 'true',
    },
  });

  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone ?? '',
        role: editingUser.role,
        preferredLayout: editingUser.preferredLayout,
        isActive: editingUser.isActive ? 'true' : 'false',
      });
      return;
    }

    reset({
      name: '',
      email: '',
      phone: '',
      role: 'operator',
      preferredLayout: 'inherit',
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

  async function generateSetupLink(userId: string) {
    setLinkActionUserId(userId);
    try {
      const result = await createUserPasswordSetupLink(userId, authToken);
      setGeneratedSetupLink({
        email: result.email,
        setupUrl: result.setupUrl,
        expiresAt: result.expiresAt,
      });
    } finally {
      setLinkActionUserId(null);
    }
  }

  async function copySetupLink() {
    if (!generatedSetupLink) return;

    try {
      await navigator.clipboard.writeText(generatedSetupLink.setupUrl);
      setIsCopyingSetupLink(true);
      window.setTimeout(() => setIsCopyingSetupLink(false), 1600);
    } catch {
      setIsCopyingSetupLink(false);
    }
  }

  if (!clientId) {
    return <AccessNotice title="Gestao de usuarios" description="Selecione um cliente para liberar o cadastro e a manutencao de usuarios." badge="cliente obrigatorio" hint="Esse bloco trabalha por conta. Escolha o cliente no topo do painel para continuar." />;
  }

  if (!canManage) {
    return (
      <AccessNotice
        title="Gestao de usuarios"
        description="A administracao de usuarios fica restrita a perfis admin do cliente ou da plataforma."
        badge={currentUser?.role ?? 'sem permissao'}
        tone="warning"
        hint={blockedReason ?? 'Use um usuario admin para criar, editar ou desativar acessos.'}
      />
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
            Gestao inicial de acessos do cliente (admin e funcionario/operator).
          </p>
        </div>
        <Badge>{currentUser?.role ?? 'sem sessao'}</Badge>
      </div>

      <form
        onSubmit={handleSubmit(async (rawValues) => {
          const values = formSchema.parse(rawValues);
          setLocalError(null);
          setSuccessMessage(null);
          setGeneratedSetupLink(null);
          if (editingUser) {
            try {
              await updateMutation.mutateAsync({
                id: editingUser.id,
                payload: {
                  clientId,
                  name: values.name,
                  email: values.email,
                  phone: values.phone,
                  role: values.role,
                  preferredLayout: values.preferredLayout,
                  isActive: values.isActive,
                },
              });
              setEditingUserId(null);
              setSuccessMessage(`Usuario ${values.name} atualizado com sucesso.`);
            } catch (error) {
              setLocalError(
                error instanceof Error ? error.message : 'Falha ao atualizar usuario.',
              );
            }
          } else {
            try {
              await createMutation.mutateAsync({
                clientId,
                name: values.name,
                email: values.email,
                phone: values.phone,
                role: values.role,
                preferredLayout: values.preferredLayout,
                isActive: values.isActive,
              });

              reset({
                name: '',
                email: '',
                phone: '',
                role: 'operator',
                preferredLayout: 'inherit',
                isActive: 'true',
              });
              setSuccessMessage(
                `Usuario ${values.name} criado com sucesso. Agora voce pode usar o botao "Primeiro acesso" na lista para gerar o link.`,
              );
            } catch (error) {
              setLocalError(
                error instanceof Error ? error.message : 'Falha ao criar usuario.',
              );
            }
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
            <label className="mb-1 block text-xs text-muted">Telefone</label>
            <Input {...register('phone')} placeholder="31999999999" />
            {errors.phone ? <p className="mt-1 text-xs text-bad">{errors.phone.message}</p> : null}
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

          <div>
            <label className="mb-1 block text-xs text-muted">Layout inicial</label>
            <Select {...register('preferredLayout')}>
              <option value="inherit">Herdar do cliente</option>
              <option value="client">Painel do cliente</option>
              <option value="technical">Painel tecnico</option>
            </Select>
            <p className="mt-1 text-xs text-muted">
              O usuario pode herdar o padrao da conta ou usar um painel proprio.
            </p>
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

      {generatedSetupLink ? (
        <Panel className="mb-4 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
            <KeyRound className="h-4 w-4 text-accent" />
            Link de primeiro acesso gerado para {generatedSetupLink.email}
          </div>
          <p className="text-xs text-muted">
            Expira em {formatRelativeDateTime(generatedSetupLink.expiresAt)}.
          </p>
          <div className="mt-3 rounded-2xl border border-line/70 bg-bg/40 p-3 font-mono text-xs text-ink">
            {generatedSetupLink.setupUrl}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => void copySetupLink()}>
              <Copy className="mr-2 h-3.5 w-3.5" />
              Copiar link
            </Button>
            {isCopyingSetupLink ? (
              <span className="text-xs text-ok">Link copiado.</span>
            ) : (
              <span className="text-xs text-muted">
                Envie este link ao usuario para ele definir ou recuperar a propria senha.
              </span>
            )}
          </div>
        </Panel>
      ) : null}

      {localError ? (
        <Feedback variant="danger" className="mb-3">
          {localError}
        </Feedback>
      ) : null}

      {successMessage ? (
        <Feedback variant="success" className="mb-3">
          {successMessage}
        </Feedback>
      ) : null}

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
                <th>Layout</th>
                <th>Status</th>
                <th>Ultimo login</th>
                <th>Acesso</th>
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
                  <td>{layoutLabels[user.preferredLayout]}</td>
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
                      ? formatRelativeDateTime(user.lastLoginAt)
                      : 'Sem login'}
                  </td>
                  <td>
                    <Button
                      variant="secondary"
                      size="sm"
                      loading={linkActionUserId === user.id}
                      onClick={() => {
                        void generateSetupLink(user.id);
                      }}
                    >
                      {user.lastLoginAt ? 'Reenviar link' : 'Primeiro acesso'}
                    </Button>
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
        <Feedback>Sem usuarios cadastrados para este cliente.</Feedback>
      ) : null}
    </Panel>
  );
}
