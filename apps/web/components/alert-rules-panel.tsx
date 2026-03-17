'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { BellRing, ChevronDown, Thermometer, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAlertRuleMutations } from '@/hooks/use-alert-rule-mutations';
import { useAlertRules } from '@/hooks/use-alert-rules';
import { createAlertRule, updateAlertRule } from '@/lib/api';
import { ClientSummary } from '@/types/client';
import { DeviceSummary } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { SetupGuideCard } from '@/components/setup-guide-card';

const formSchema = z
  .object({
    sensorType: z.string().trim().min(1, 'Sensor obrigatorio'),
    deviceId: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value ? value : undefined)),
    minValue: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine((value) => value == null || Number.isFinite(value), {
        message: 'Min invalido',
      }),
    maxValue: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : undefined))
      .refine((value) => value == null || Number.isFinite(value), {
        message: 'Max invalido',
      }),
    cooldownMinutes: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : 15))
      .refine((value) => Number.isFinite(value) && value >= 1, {
        message: 'Cooldown minimo: 1',
      }),
    toleranceMinutes: z
      .string()
      .optional()
      .transform((value) => (value?.trim() ? Number(value) : 0))
      .refine((value) => Number.isFinite(value) && value >= 0, {
        message: 'Tolerancia minima: 0',
      }),
  })
  .refine(
    (values) =>
      values.minValue == null ||
      values.maxValue == null ||
      values.minValue <= values.maxValue,
    {
      message: 'Min deve ser menor ou igual ao max',
      path: ['maxValue'],
    },
  );

type FormValues = z.input<typeof formSchema>;

type AlertRulesPanelProps = {
  clientId?: string;
  client?: ClientSummary;
  authToken?: string;
  devices: DeviceSummary[];
  onCreateDevice?: () => void;
  canManageRules?: boolean;
  blockedReason?: string;
};

export function AlertRulesPanel({
  clientId,
  client,
  authToken,
  devices,
  onCreateDevice,
  canManageRules = false,
  blockedReason,
}: AlertRulesPanelProps) {
  const { data, isLoading, isError, error, refetch } = useAlertRules(
    clientId,
    authToken,
  );
  const { updateMutation, deleteMutation } = useAlertRuleMutations(
    clientId,
    authToken,
  );
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmittingRule, setIsSubmittingRule] = useState(false);
  const rules = data ?? [];
  const editingRule = rules.find((rule) => rule.id === editingRuleId) ?? null;

  const {
    register,
    getValues,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sensorType: 'temperature',
      deviceId: '',
      minValue: '',
      maxValue: '',
      cooldownMinutes: '15',
      toleranceMinutes: '0',
    },
  });

  useEffect(() => {
    if (!editingRule) {
      reset({
        sensorType: 'temperature',
        deviceId: '',
        minValue: '',
        maxValue: '',
        cooldownMinutes: '15',
        toleranceMinutes: '0',
      });
      return;
    }

    setIsCreateOpen(true);

    reset({
      sensorType: editingRule.sensorType,
      deviceId: editingRule.deviceId ?? '',
      minValue:
        editingRule.minValue != null ? String(editingRule.minValue) : '',
      maxValue:
        editingRule.maxValue != null ? String(editingRule.maxValue) : '',
      cooldownMinutes: String(editingRule.cooldownMinutes),
      toleranceMinutes: String(editingRule.toleranceMinutes),
    });
  }, [editingRule, reset]);

  async function handleRemove(id: string) {
    setDeletingRuleId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingRuleId(null);
      setPendingRuleId(null);
    }
  }

  async function handleToggleRule(ruleId: string, enabled: boolean) {
    await updateMutation.mutateAsync({
      id: ruleId,
      payload: { enabled },
    });
  }

  async function handleSubmitRule() {
    if (!clientId) return;

    const result = formSchema.safeParse(getValues());

    if (!result.success) {
      clearErrors();
      for (const issue of result.error.issues) {
        const fieldName = issue.path[0];
        if (typeof fieldName === 'string') {
          setError(fieldName as keyof FormValues, {
            type: 'manual',
            message: issue.message,
          });
        }
      }
      setFormError('Revise os campos destacados antes de continuar.');
      setSuccessMessage(null);
      return;
    }

    clearErrors();
    setFormError(null);
    setSuccessMessage(null);
    setIsSubmittingRule(true);

    try {
      const values = result.data;
      const payload = {
        clientId,
        deviceId: values.deviceId,
        sensorType: values.sensorType,
        minValue: values.minValue,
        maxValue: values.maxValue,
        cooldownMinutes: values.cooldownMinutes,
        toleranceMinutes: values.toleranceMinutes,
        enabled: editingRule ? editingRule.enabled : true,
      };

      if (editingRule) {
        await updateAlertRule(editingRule.id, payload, authToken);
        await refetch();
        setSuccessMessage('Regra atualizada com sucesso.');
        setEditingRuleId(null);
      } else {
        await createAlertRule(payload, authToken);
        await refetch();
        setSuccessMessage('Regra criada com sucesso.');
      }

      reset({
        sensorType: 'temperature',
        deviceId: '',
        minValue: '',
        maxValue: '',
        cooldownMinutes: '15',
        toleranceMinutes: '0',
      });
      setIsCreateOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'Falha ao salvar regra de alerta.',
      );
    } finally {
      setIsSubmittingRule(false);
    }
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:280ms]">
      <ConfirmDialog
        open={Boolean(pendingRuleId)}
        title="Excluir regra?"
        description="A regra sera removida imediatamente da lista deste cliente."
        confirmLabel="Excluir regra"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingRuleId(null)}
        onConfirm={() => {
          if (pendingRuleId) {
            void handleRemove(pendingRuleId);
          }
        }}
      />

      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Regras de alerta</h2>
          {client?.name ? (
            <p className="mt-1 text-sm text-muted">
              Parametros operacionais da conta {client.name}.
            </p>
          ) : null}
        </div>
        {!clientId ? (
          <Badge>
            Escolha um cliente para gerenciar regras
          </Badge>
        ) : client?.id ? (
          <Badge>codigo interno: {client.id}</Badge>
        ) : null}
      </div>

      {clientId && canManageRules ? (
        <Panel variant="strong" className="mb-4 overflow-hidden p-0">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-white/5"
            onClick={() => {
              setFormError(null);
              setSuccessMessage(null);
              setIsCreateOpen((current) => !current);
              if (!isCreateOpen && !editingRule) {
                reset({
                  sensorType: 'temperature',
                  deviceId: '',
                  minValue: '',
                  maxValue: '',
                  cooldownMinutes: '15',
                  toleranceMinutes: '0',
                });
              }
            }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Cadastro</p>
              <h3 className="mt-1 text-base font-semibold">
                {editingRule ? 'Editar regra' : 'Nova regra de alerta'}
              </h3>
              <p className="mt-1 text-sm text-muted">
                {editingRule
                  ? 'Ajuste limites, cooldown e tolerancia da regra selecionada.'
                  : 'Abra este formulario para cadastrar a primeira regra da conta.'}
              </p>
            </div>
            <ChevronDown
              className={`h-5 w-5 shrink-0 text-muted transition ${isCreateOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isCreateOpen ? (
            <div className="border-t border-line/70 px-4 py-4">
            <div className="mb-4 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
                <div className="flex items-center gap-2">
                  <BellRing className="h-4 w-4 text-accent" />
                  <p className="text-sm font-medium text-ink">
                    Regra inicial
                  </p>
                </div>
                <p className="mt-2 text-xs leading-6 text-muted">
                  Comece com uma regra simples para o equipamento principal.
                </p>
                {client?.adminName ? (
                  <p className="mt-2 text-xs text-muted">
                    Responsavel mapeado na conta: {client.adminName}.
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Sensor
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">temperature</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Cooldown
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">15 min</p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Tolerancia
                  </p>
                  <p className="mt-2 text-sm font-medium text-ink">0 min</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Sensor</label>
              <Input
                {...register('sensorType')}
                placeholder="temperature"
                className="bg-card/80"
              />
              {errors.sensorType ? (
                <p className="mt-1 text-xs text-bad">{errors.sensorType.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Equipamento (opcional)
              </label>
              <Select {...register('deviceId')} className="bg-card/80">
                <option value="">Todos os equipamentos do cliente</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name ?? device.id}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Min</label>
              <Input
                {...register('minValue')}
                placeholder="-20"
                className="bg-card/80"
              />
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <Thermometer className="h-3.5 w-3.5" />
                Limite minimo esperado para o equipamento.
              </div>
              {errors.minValue ? (
                <p className="mt-1 text-xs text-bad">{errors.minValue.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Max</label>
              <Input
                {...register('maxValue')}
                placeholder="-10"
                className="bg-card/80"
              />
              <div className="mt-1 flex items-center gap-1 text-xs text-muted">
                <TriangleAlert className="h-3.5 w-3.5" />
                Acima deste valor o alerta pode ser disparado.
              </div>
              {errors.maxValue ? (
                <p className="mt-1 text-xs text-bad">{errors.maxValue.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Cooldown (min)
              </label>
              <Input
                {...register('cooldownMinutes')}
                placeholder="15"
                className="bg-card/80"
              />
              {errors.cooldownMinutes ? (
                <p className="mt-1 text-xs text-bad">{errors.cooldownMinutes.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Tolerancia (min)
              </label>
              <Input
                {...register('toleranceMinutes')}
                placeholder="0"
                className="bg-card/80"
              />
              {errors.toleranceMinutes ? (
                <p className="mt-1 text-xs text-bad">{errors.toleranceMinutes.message}</p>
              ) : null}
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-2">
              <Button
                type="button"
                variant="primary"
                disabled={isSubmittingRule}
                loading={isSubmittingRule}
                className="min-w-[168px]"
                onClick={() => {
                  void handleSubmitRule();
                }}
              >
                {isSubmittingRule
                  ? 'Salvando...'
                  : editingRule
                    ? 'Salvar regra'
                    : 'Criar regra'}
              </Button>
              {editingRule ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setEditingRuleId(null);
                    setFormError(null);
                    setSuccessMessage(null);
                    reset({
                      sensorType: 'temperature',
                      deviceId: '',
                      minValue: '',
                      maxValue: '',
                      cooldownMinutes: '15',
                      toleranceMinutes: '0',
                    });
                    setIsCreateOpen(false);
                  }}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
            </div>
            </div>
          ) : null}
        </Panel>
      ) : null}
      {clientId && !canManageRules ? (
        <Feedback className="mb-3">
          {blockedReason ??
            'Seu perfil pode monitorar regras, mas nao pode altera-las.'}
        </Feedback>
      ) : null}

      {formError ? (
        <Feedback variant="danger" className="mb-3">
          {formError}
        </Feedback>
      ) : null}
      {successMessage ? (
        <Feedback variant="success" className="mb-3">
          {successMessage}
        </Feedback>
      ) : null}
      {deleteMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {deleteMutation.error?.message ??
            'Falha ao remover regra de alerta.'}
        </Feedback>
      ) : null}

      {isLoading ? <Feedback>Carregando regras...</Feedback> : null}
      {isError && (data?.length ?? 0) === 0 ? (
        <Feedback variant="danger">
          {error?.message ?? 'Erro ao carregar regras.'}
        </Feedback>
      ) : null}
      {isError && (data?.length ?? 0) > 0 ? (
        <Feedback className="mb-3">
          Falha momentanea ao atualizar regras. Exibindo os ultimos dados
          carregados.
        </Feedback>
      ) : null}

      {!isLoading && rules.length > 0 ? (
        <DataTableWrapper className="rounded-[22px]">
          <DataTable>
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Equipamento</th>
                <th>Limites</th>
                <th>Cooldown</th>
                <th>Tolerancia</th>
                <th>Status</th>
                <th className="text-right">Acao</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.sensorType}</td>
                  <td className="text-muted">
                    {rule.deviceId ?? 'Todos'}
                  </td>
                  <td>
                    {rule.minValue ?? '-'} / {rule.maxValue ?? '-'}
                  </td>
                  <td>{rule.cooldownMinutes} min</td>
                  <td>{rule.toleranceMinutes} min</td>
                  <td>
                    <Badge variant={rule.enabled ? 'success' : 'neutral'}>
                      {rule.enabled ? 'Ativa' : 'Pausada'}
                    </Badge>
                  </td>
                  <td className="text-right">
                    {canManageRules ? (
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setFormError(null);
                            setSuccessMessage(null);
                            setEditingRuleId(rule.id);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant={rule.enabled ? 'secondary' : 'primary'}
                          size="sm"
                          loading={updateMutation.isPending && editingRuleId !== rule.id}
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            void handleToggleRule(rule.id, !rule.enabled);
                          }}
                        >
                          {rule.enabled ? 'Pausar' : 'Ativar'}
                        </Button>
                        <Button
                          onClick={() => {
                            setPendingRuleId(rule.id);
                          }}
                          variant="danger"
                          size="sm"
                          loading={deletingRuleId === rule.id}
                          disabled={
                            deleteMutation.isPending && deletingRuleId !== rule.id
                          }
                        >
                          {deletingRuleId === rule.id ? 'Excluindo...' : 'Excluir'}
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Acompanhamento apenas</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}
      {!isLoading &&
      !isError &&
      canManageRules &&
      (data?.length ?? 0) === 0 &&
      devices.length === 0 ? (
        <SetupGuideCard
          eyebrow="Regras de alerta"
          title="Cadastre um equipamento antes de criar regras"
          description="Sem equipamento, a regra nao tem onde ser aplicada."
          steps={[
            {
              title: '1. Cadastrar equipamento',
              description: 'Crie o primeiro equipamento da conta.',
            },
            {
              title: '2. Ajustar faixa',
              description: 'Preencha temperatura minima e maxima.',
            },
            {
              title: '3. Criar regra',
              description: 'Depois volte aqui para configurar o alerta.',
            },
          ]}
          primaryActionLabel={onCreateDevice ? 'Cadastrar primeiro equipamento' : undefined}
          onPrimaryAction={onCreateDevice}
          secondaryHref="/lab"
          secondaryLabel="Abrir laboratorio"
        />
      ) : null}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && devices.length > 0 ? (
        <SetupGuideCard
          eyebrow="Primeira regra"
          title="Crie a primeira regra de alerta"
          description="Defina o alerta principal do equipamento."
          steps={[
            {
              title: '1. Escolher equipamento',
              description: 'Selecione o equipamento principal.',
            },
            {
              title: '2. Definir limites',
              description: 'Preencha faixa, cooldown e tolerancia.',
            },
            {
              title: '3. Testar depois',
              description: 'Depois use o laboratorio para validar a regra.',
            },
          ]}
        />
      ) : null}
    </Panel>
  );
}
