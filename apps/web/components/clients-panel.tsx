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
  isValidCpfOrCnpj,
  isValidEmail,
  isValidPhone,
  normalizeDigits,
} from '@/lib/client-form';
import { buildUniqueTechnicalId } from '@/lib/technical-id';
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
  name: z.string().trim().min(2, 'Nome obrigatorio'),
  adminName: z.string().trim().min(2, 'Nome do contato principal obrigatorio'),
  alertContactName: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  document: z
    .string()
    .trim()
    .min(1, 'Documento obrigatorio')
    .refine((value) => isValidCpfOrCnpj(value), 'Informe um CPF ou CNPJ valido'),
  adminPhone: z
    .string()
    .trim()
    .min(1, 'WhatsApp do contato principal obrigatorio')
    .refine((value) => isValidPhone(value), 'WhatsApp do contato principal invalido'),
  alertPhone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => value == null || isValidPhone(value), 'WhatsApp de alerta invalido'),
  billingPhone: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined)
    .refine((value) => value == null || isValidPhone(value), 'Telefone financeiro invalido'),
  billingName: z.string().trim().optional().transform((value) => value || undefined),
  useSameBillingPhone: z.boolean().default(true),
  useSameAlertPhone: z.boolean().default(true),
  billingEmail: z
    .string()
    .trim()
    .min(1, 'Email financeiro obrigatorio')
    .refine((value) => isValidEmail(value), { message: 'Email invalido' }),
  monitoringIntervalSeconds: z
    .string()
    .trim()
    .min(1, 'Cadencia obrigatoria')
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 10 && value <= 86400, {
      message: 'Use entre 10 e 86400 segundos',
    }),
  offlineAlertDelayMinutes: z
    .string()
    .trim()
    .min(1, 'Tempo de alerta offline obrigatorio')
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 1 && value <= 10080, {
      message: 'Use entre 1 e 10080 minutos',
    }),
  preferredLayout: z.enum(['technical', 'client']).default('client'),
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

  if (!values.useSameAlertPhone && !values.alertContactName) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Nome do contato de alertas obrigatorio',
      path: ['alertContactName'],
    });
  }

  if (!values.useSameAlertPhone && !values.alertPhone) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'WhatsApp de alertas obrigatorio',
      path: ['alertPhone'],
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
  const clients = useMemo(() => data ?? [], [data]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      adminName: '',
      alertContactName: '',
      document: '',
      adminPhone: '',
      alertPhone: '',
      billingName: '',
      billingPhone: '',
      useSameBillingPhone: true,
      useSameAlertPhone: true,
      billingEmail: '',
      monitoringIntervalSeconds: '300',
      offlineAlertDelayMinutes: '15',
      preferredLayout: 'client',
      status: 'active',
      notes: '',
    },
  });
  const watchedUseSameBillingPhone = watch('useSameBillingPhone');
  const watchedUseSameAlertPhone = watch('useSameAlertPhone');
  const watchedName = watch('name');
  const duplicateClientIds = useMemo(() => new Set(clients.map((client) => client.id)), [clients]);
  const duplicateDocuments = useMemo(
    () => new Set(clients.map((client) => normalizeDigits(client.document ?? '')).filter(Boolean)),
    [clients],
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const generatedClientId = useMemo(
    () =>
      buildUniqueTechnicalId(watchedName ?? '', duplicateClientIds, {
        fallback: 'cliente',
      }),
    [watchedName, duplicateClientIds],
  );

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
              try {
                const values = rawValues;
                const normalizedDocument = normalizeDigits(values.document);
                const billingPhone = values.useSameBillingPhone
                  ? values.adminPhone
                  : values.billingPhone;
                const alertPhone = values.useSameAlertPhone
                  ? values.adminPhone
                  : (values.alertPhone ?? values.adminPhone);
                const alertContactName = (values.useSameAlertPhone
                  ? values.adminName
                  : values.alertContactName) ?? values.adminName;

                if (duplicateDocuments.has(normalizedDocument)) {
                  setFormError('Ja existe um cliente com este CPF ou CNPJ.');
                  setIsCreateOpen(true);
                  return;
                }

                const created = await createMutation.mutateAsync({
                  id: generatedClientId,
                  name: values.name,
                  adminName: values.adminName,
                  alertContactName,
                  document: values.document,
                  adminPhone: values.adminPhone,
                  alertPhone,
                  billingName: values.useSameBillingPhone
                    ? values.adminName
                    : values.billingName,
                  billingPhone: billingPhone ?? values.adminPhone,
                  billingEmail: values.billingEmail,
                  monitoringIntervalSeconds: Number(values.monitoringIntervalSeconds),
                  offlineAlertDelayMinutes: Number(values.offlineAlertDelayMinutes),
                  preferredLayout: values.preferredLayout,
                  status: values.status,
                  notes: values.notes,
                });
                reset();
                onSelectClient(created.id ?? generatedClientId);
                setSuccessMessage(`Cliente ${values.name} criado com sucesso.`);
                setIsCreateOpen(false);
              } catch (error) {
                setFormError(
                  error instanceof Error
                    ? error.message
                    : 'Falha ao criar cliente.',
                );
                setIsCreateOpen(true);
              }
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
                    <label className="mb-1 block text-xs text-muted">Nome do cliente *</label>
                    <Input {...register('name')} placeholder="Clinica Cuidare" />
                    <p className="mt-1 text-xs text-muted">
                      O identificador tecnico sera gerado automaticamente a partir do nome.
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      Identificador tecnico gerado: <strong>{generatedClientId}</strong>
                    </p>
                    {errors.name ? <p className="mt-1 text-xs text-bad">{errors.name.message}</p> : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      Nome do contato principal (administrador) *
                    </label>
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

                  <div>
                    <label className="mb-1 block text-xs text-muted">Layout padrao</label>
                    <Select {...register('preferredLayout')}>
                      <option value="client">Painel do cliente</option>
                      <option value="technical">Painel tecnico</option>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-line/70 bg-card/40 p-4 sm:col-span-2 lg:col-span-2">
                <p className="mb-3 text-xs uppercase tracking-[0.16em] text-muted">Contatos</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      WhatsApp do contato principal *
                    </label>
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
                        {...register('useSameAlertPhone')}
                      />
                      Usar o mesmo WhatsApp para alertas
                    </label>
                    <p className="text-xs text-muted">
                      Marcado: alertas e Jade usam o WhatsApp do contato principal.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      WhatsApp de alertas {watchedUseSameAlertPhone ? '' : '*'}
                    </label>
                    <Input
                      {...register('alertPhone')}
                      placeholder="(31) 99999-0001"
                      disabled={watchedUseSameAlertPhone}
                    />
                    {errors.alertPhone ? (
                      <p className="mt-1 text-xs text-bad">{errors.alertPhone.message}</p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-muted">
                      Nome do contato WhatsApp de alertas {watchedUseSameAlertPhone ? '' : '*'}
                    </label>
                    <Input
                      {...register('alertContactName')}
                      placeholder="Operacao Cadeia Fria"
                      disabled={watchedUseSameAlertPhone}
                    />
                    {errors.alertContactName ? (
                      <p className="mt-1 text-xs text-bad">{errors.alertContactName.message}</p>
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

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs text-muted">
                        Cadencia de monitoramento (segundos)
                      </label>
                      <Input
                        type="number"
                        min={10}
                        max={86400}
                        step={10}
                        {...register('monitoringIntervalSeconds')}
                        placeholder="300"
                      />
                      <p className="mt-1 text-xs text-muted">
                        Ex.: 30, 60, 300 ou 86400.
                      </p>
                      {errors.monitoringIntervalSeconds ? (
                        <p className="mt-1 text-xs text-bad">
                          {errors.monitoringIntervalSeconds.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-1 block text-xs text-muted">
                        Alerta offline (minutos)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={10080}
                        step={1}
                        {...register('offlineAlertDelayMinutes')}
                        placeholder="15"
                      />
                      <p className="mt-1 text-xs text-muted">
                        Ex.: 5, 15, 60 ou 1440.
                      </p>
                      {errors.offlineAlertDelayMinutes ? (
                        <p className="mt-1 text-xs text-bad">
                          {errors.offlineAlertDelayMinutes.message}
                        </p>
                      ) : null}
                    </div>
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
                        contato alertas: {client.alertContactName ?? client.adminName ?? 'Sem nome'}
                      </span>
                      <span className="text-xs">
                        financeiro: {client.billingName ?? client.adminName ?? 'Sem nome'} | {client.billingPhone ?? client.adminPhone ?? client.phone ?? 'Sem telefone'}
                      </span>
                      <span className="text-xs">
                        alertas: {client.alertPhone ?? client.adminPhone ?? client.phone ?? 'Sem WhatsApp'}
                      </span>
                      <span className="text-xs">
                        layout padrao: {client.preferredLayout === 'client' ? 'Painel do cliente' : 'Painel tecnico'}
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
