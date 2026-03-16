'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2,
  CircleCheckBig,
  ChevronDown,
  Filter,
  Lightbulb,
  MapPinned,
  Tags,
  Trash2,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useClients } from '@/hooks/use-clients';
import { useClientListMutations } from '@/hooks/use-client-list-mutations';
import {
  isValidClientId,
  isValidCpfOrCnpj,
  isValidEmail,
  isValidPhone,
  normalizeDigits,
} from '@/lib/client-form';
import { ClientStatus } from '@/types/client';
import { AuthUser } from '@/types/auth';
import { AccessNotice } from '@/components/ui/access-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

const formSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, 'ID obrigatorio')
    .max(50, 'ID muito longo')
    .refine((value) => isValidClientId(value), 'Use apenas letras, numeros, _ e -'),
  name: z.string().trim().min(2, 'Nome obrigatorio'),
  adminName: z.string().trim().min(2, 'Nome do administrador obrigatorio'),
  document: z
    .string()
    .trim()
    .min(1, 'Documento obrigatorio')
    .refine((value) => isValidCpfOrCnpj(value), 'Informe um CPF ou CNPJ valido'),
  adminPhone: z
    .string()
    .trim()
    .min(1, 'Contato do administrador obrigatorio')
    .refine((value) => isValidPhone(value), 'Telefone do administrador invalido'),
  billingPhone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => value == null || isValidPhone(value), 'Telefone financeiro invalido'),
  billingName: z.string().trim().optional().transform((value) => value || undefined),
  useSameBillingPhone: z.boolean().default(true),
  billingEmail: z
    .string()
    .trim()
    .min(1, 'Email financeiro obrigatorio')
    .refine((value) => isValidEmail(value), { message: 'Email invalido' }),
  status: z.enum(['active', 'inactive', 'delinquent']).default('active'),
  notes: z.string().trim().optional().transform((value) => value || undefined),
}).superRefine((values, context) => {
  if (!values.useSameBillingPhone && !values.billingPhone) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Contato financeiro obrigatorio',
      path: ['billingPhone'],
    });
  }
});

type FormValues = z.input<typeof formSchema>;

const statusLabel: Record<ClientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  delinquent: 'Pendente',
};

type ClientsPanelProps = {
  authToken?: string;
  currentUser: AuthUser | null;
  canManage: boolean;
  selectedClientId?: string;
  onSelectClient: (clientId: string) => void;
};

export function ClientsPanel({
  authToken,
  currentUser,
  canManage,
  selectedClientId,
  onSelectClient,
}: ClientsPanelProps) {
  const { data, isLoading, isError, error } = useClients(authToken, canManage);
  const { createMutation, deleteMutation } = useClientListMutations(authToken);
  const [pendingDeleteClientId, setPendingDeleteClientId] = useState<string | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const clients = data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      adminName: '',
      document: '',
      adminPhone: '',
      billingName: '',
      billingPhone: '',
      useSameBillingPhone: true,
      billingEmail: '',
      status: 'active',
      notes: '',
    },
  });
  const watchedUseSameBillingPhone = watch('useSameBillingPhone');
  const duplicateClientIds = useMemo(() => new Set(clients.map((client) => client.id)), [clients]);
  const duplicateDocuments = useMemo(
    () => new Set(clients.map((client) => normalizeDigits(client.document ?? '')).filter(Boolean)),
    [clients],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleDeleteClient(id: string) {
    setDeletingClientId(id);
    setSuccessMessage(null);
    try {
      await deleteMutation.mutateAsync(id);
      if (selectedClientId === id && clients.length > 1) {
        const fallback = clients.find((client) => client.id !== id);
        if (fallback) onSelectClient(fallback.id);
      }
    } finally {
      setDeletingClientId(null);
      setPendingDeleteClientId(null);
    }
  }

  if (!canManage) {
    return (
      <AccessNotice
        title="Clientes da plataforma"
        description="A gestao de clientes fica disponivel apenas para o administrador global da plataforma."
        badge={currentUser?.role ?? 'sem sessao'}
        hint="Use o login global para criar clientes e trocar rapidamente a conta em foco."
      />
    );
  }

  return (
    <Panel className="mb-6 p-5">
      <ConfirmDialog
        open={Boolean(pendingDeleteClientId)}
        title="Excluir cliente?"
        description={
          <>
            O cliente <strong>{pendingDeleteClientId}</strong> sera removido da plataforma.
          </>
        }
        confirmLabel="Excluir cliente"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteClientId(null)}
        onConfirm={() => {
          if (pendingDeleteClientId) {
            void handleDeleteClient(pendingDeleteClientId);
          }
        }}
      />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Plataforma
          </p>
          <h2 className="mt-1 text-xl font-semibold">Clientes</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Crie novos clientes e troque o foco operacional do painel sem sair da tela principal.
          </p>
        </div>
        <Badge>
          <Building2 className="h-3.5 w-3.5 text-accent" />
          admin global
        </Badge>
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel variant="strong" className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Tags className="h-4 w-4 text-accent" />
            <h3 className="text-base font-semibold">Padrao de identificacao</h3>
          </div>
          <p className="text-sm text-muted">
            Use este bloco quando estiver simulando a chegada a um cliente real e
            quiser padronizar o onboarding sem inventar nomes no improviso.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Name</p>
              <p className="mt-2 text-sm font-medium text-ink">Cuidare</p>
              <p className="mt-1 text-xs text-muted">
                Nome comercial exibido ao cliente.
              </p>
            </div>

            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">Codigo interno</p>
              <p className="mt-2 text-sm font-medium text-ink">cuidare-vacinas</p>
              <p className="mt-1 text-xs text-muted">
                Identificador tecnico unico e estavel.
              </p>
            </div>

            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">deviceId</p>
              <p className="mt-2 text-sm font-medium text-ink">freezer_vacinas_01</p>
              <p className="mt-1 text-xs text-muted">
                Nome objetivo para o primeiro equipamento.
              </p>
            </div>
          </div>
        </Panel>

        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            <h3 className="text-base font-semibold">Primeiro fluxo sugerido</h3>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <div className="flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-accent" />
                <p className="text-sm font-medium text-ink">1. Criar o cliente</p>
              </div>
              <p className="mt-2 text-xs leading-6 text-muted">
                Cadastre o cliente com codigo interno consistente e dados
                minimos do responsavel.
              </p>
            </div>

            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-sm font-medium text-ink">2. Abrir o painel do cliente</p>
              <p className="mt-2 text-xs leading-6 text-muted">
                Use o botao de selecao para entrar na conta logo apos o cadastro
                e revisar a narrativa comercial da tela principal.
              </p>
            </div>

            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-sm font-medium text-ink">3. Estruturar o primeiro equipamento</p>
              <p className="mt-2 text-xs leading-6 text-muted">
                Depois do cliente criado, avance para cadastro do equipamento,
                regra de alerta e simulacao do fluxo real.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Panel variant="strong" className="mb-4 overflow-hidden p-0">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/5"
          onClick={() => {
            setSuccessMessage(null);
            setIsCreateOpen((current) => !current);
          }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Cadastro</p>
            <h3 className="mt-1 text-base font-semibold">Novo cliente</h3>
            <p className="mt-1 text-sm text-muted">
              Abra este formulario quando precisar cadastrar uma nova conta na plataforma.
            </p>
          </div>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted transition ${isCreateOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isCreateOpen ? (
          <form
            className="border-t border-line/70 px-4 py-4"
            onSubmit={handleSubmit(async (rawValues) => {
              setFormError(null);
              setSuccessMessage(null);
              const values = formSchema.parse(rawValues);
              const normalizedDocument = normalizeDigits(values.document);
              const billingPhone = values.useSameBillingPhone
                ? values.adminPhone
                : values.billingPhone;

              if (duplicateClientIds.has(values.id)) {
                setFormError('Ja existe um cliente com este identificador tecnico.');
                setIsCreateOpen(true);
                return;
              }

              if (duplicateDocuments.has(normalizedDocument)) {
                setFormError('Ja existe um cliente com este CPF ou CNPJ.');
                setIsCreateOpen(true);
                return;
              }

              await createMutation.mutateAsync({
                id: values.id,
                name: values.name,
                adminName: values.adminName,
                document: values.document,
                adminPhone: values.adminPhone,
                billingName: values.useSameBillingPhone
                  ? values.adminName
                  : values.billingName,
                billingPhone: billingPhone ?? values.adminPhone,
                billingEmail: values.billingEmail,
                status: values.status,
                notes: values.notes,
              });
              reset();
              onSelectClient(values.id);
              setSuccessMessage(`Cliente ${values.name} criado com sucesso.`);
              setIsCreateOpen(false);
            })}
          >
            <div className="mb-3">
              <p className="text-xs text-muted">
                Campos com <strong>*</strong> sao obrigatorios.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-line/70 bg-card/40 p-4 sm:col-span-2 lg:col-span-4">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Dados principais</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Identificador tecnico *</label>
                    <Input {...register('id')} placeholder="cuidare-vacinas" />
                    <p className="mt-1 text-xs text-muted">
                      Use um identificador unico, sem espacos. Ex.: `cuidare-vacinas`
                    </p>
                    {errors.id ? <p className="mt-1 text-xs text-bad">{errors.id.message}</p> : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">Nome do cliente *</label>
                    <Input {...register('name')} placeholder="Clinica Cuidare" />
                    {errors.name ? <p className="mt-1 text-xs text-bad">{errors.name.message}</p> : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">Nome do administrador *</label>
                    <Input {...register('adminName')} placeholder="Fabio Abdo" />
                    {errors.adminName ? (
                      <p className="mt-1 text-xs text-bad">{errors.adminName.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">CPF ou CNPJ *</label>
                    <Input {...register('document')} placeholder="00.000.000/0000-00" />
                    {errors.document ? (
                      <p className="mt-1 text-xs text-bad">{errors.document.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">Status</label>
                    <Select {...register('status')}>
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="delinquent">Pendente</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line/70 bg-card/40 p-4 sm:col-span-2 lg:col-span-2">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Contatos</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Contato do administrador *</label>
                    <Input {...register('adminPhone')} placeholder="(31) 99999-0000" />
                    {errors.adminPhone ? (
                      <p className="mt-1 text-xs text-bad">{errors.adminPhone.message}</p>
                    ) : null}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 flex items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-line/70"
                        {...register('useSameBillingPhone')}
                      />
                      Usar o mesmo telefone para financeiro
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">Nome do financeiro</label>
                    <Input
                      {...register('billingName')}
                      placeholder="Financeiro Cuidare"
                      disabled={watchedUseSameBillingPhone}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      Contato financeiro {watchedUseSameBillingPhone ? '' : '*'}
                    </label>
                    <Input
                      {...register('billingPhone')}
                      placeholder="(31) 3333-0000"
                      disabled={watchedUseSameBillingPhone}
                    />
                    {errors.billingPhone ? (
                      <p className="mt-1 text-xs text-bad">{errors.billingPhone.message}</p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line/70 bg-card/40 p-4 sm:col-span-2 lg:col-span-2">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Financeiro e observacoes</p>
                <div className="grid gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-muted">Email financeiro *</label>
                    <Input {...register('billingEmail')} placeholder="financeiro@cuidare.com.br" />
                    {errors.billingEmail ? (
                      <p className="mt-1 text-xs text-bad">{errors.billingEmail.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">Observacoes</label>
                    <Input
                      {...register('notes')}
                      placeholder="Contexto comercial, unidade e observacoes iniciais"
                    />
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <Button
                  type="submit"
                  variant="primary"
                  loading={createMutation.isPending}
                  className="min-w-[180px]"
                >
                  Criar cliente
                </Button>
              </div>
            </div>
          </form>
        ) : null}
      </Panel>

      {createMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {createMutation.error?.message ?? 'Falha ao criar cliente.'}
        </Feedback>
      ) : null}
      {successMessage ? (
        <Feedback variant="success" className="mb-3">
          {successMessage}
        </Feedback>
      ) : null}
      {formError ? (
        <Feedback variant="danger" className="mb-3">
          {formError}
        </Feedback>
      ) : null}
      {deleteMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {deleteMutation.error?.message ?? 'Falha ao excluir cliente.'}
        </Feedback>
      ) : null}
      {isLoading ? <Feedback>Carregando clientes...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Falha ao carregar clientes.'}
        </Feedback>
      ) : null}

      {!isLoading && !isError && clients.length > 0 ? (
        <DataTableWrapper className="rounded-[22px]">
          <DataTable>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Status</th>
                <th>Contato</th>
                <th>Selecao</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const isSelected = selectedClientId === client.id;

                return (
                <tr
                  key={client.id}
                  className={isSelected ? 'bg-ok/5' : undefined}
                >
                  <td className="font-medium">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span>{client.name}</span>
                        {isSelected ? <Badge variant="success">ativo</Badge> : null}
                      </div>
                      <span className="text-xs text-muted">{client.id}</span>
                    </div>
                  </td>
                  <td>{statusLabel[client.status]}</td>
                  <td className="text-muted">
                    <div className="flex flex-col">
                      <span>{client.billingEmail ?? 'Sem email financeiro'}</span>
                      <span className="text-xs">
                        admin: {client.adminName ?? 'Sem nome'} | {client.adminPhone ?? client.phone ?? 'Sem telefone'}
                      </span>
                      <span className="text-xs">
                        financeiro: {client.billingName ?? client.adminName ?? 'Sem nome'} | {client.billingPhone ?? client.adminPhone ?? client.phone ?? 'Sem telefone'}
                      </span>
                    </div>
                  </td>
                  <td>
                    {isSelected ? (
                      <Badge variant="success">
                        <CircleCheckBig className="h-3.5 w-3.5" />
                        ativo no painel
                      </Badge>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onSelectClient(client.id)}
                      >
                        <Filter className="h-3.5 w-3.5" />
                        Abrir
                      </Button>
                    )}
                  </td>
                  <td className="text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      loading={deletingClientId === client.id}
                      disabled={deleteMutation.isPending && deletingClientId !== client.id}
                      onClick={() => setPendingDeleteClientId(client.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </td>
                </tr>
              )})}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}

      {!isLoading && !isError && clients.length === 0 ? (
        <Feedback>Nenhum cliente cadastrado ainda.</Feedback>
      ) : null}
    </Panel>
  );
}
