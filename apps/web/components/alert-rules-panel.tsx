'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAlertRuleMutations } from '@/hooks/use-alert-rule-mutations';
import { useAlertRules } from '@/hooks/use-alert-rules';
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
  authToken?: string;
  devices: DeviceSummary[];
  onCreateDevice?: () => void;
};

export function AlertRulesPanel({
  clientId,
  authToken,
  devices,
  onCreateDevice,
}: AlertRulesPanelProps) {
  const { data, isLoading, isError, error } = useAlertRules(
    clientId,
    authToken,
  );
  const { createMutation, deleteMutation } = useAlertRuleMutations(
    clientId,
    authToken,
  );
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [pendingRuleId, setPendingRuleId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
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

  async function handleRemove(id: string) {
    setDeletingRuleId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingRuleId(null);
      setPendingRuleId(null);
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
        <h2 className="text-lg font-semibold">Regras de alerta</h2>
        {!clientId ? (
          <Badge>
            Defina clientId para gerenciar regras
          </Badge>
        ) : null}
      </div>

      {clientId ? (
        <form
          onSubmit={handleSubmit(async (rawValues) => {
            const values = formSchema.parse(rawValues);
            await createMutation.mutateAsync({
              clientId,
              deviceId: values.deviceId,
              sensorType: values.sensorType,
              minValue: values.minValue,
              maxValue: values.maxValue,
              cooldownMinutes: values.cooldownMinutes,
              toleranceMinutes: values.toleranceMinutes,
              enabled: true,
            });
            reset();
          })}
          className=""
        >
          <Panel variant="strong" className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Sensor</label>
              <Input {...register('sensorType')} />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Device (opcional)
              </label>
              <Select {...register('deviceId')}>
                <option value="">Todos os devices do cliente</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name ?? device.id}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Min</label>
              <Input {...register('minValue')} placeholder="-20" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Max</label>
              <Input {...register('maxValue')} placeholder="-10" />
              {errors.maxValue ? (
                <p className="mt-1 text-xs text-bad">{errors.maxValue.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Cooldown (min)
              </label>
              <Input {...register('cooldownMinutes')} />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">
                Tolerancia (min)
              </label>
              <Input {...register('toleranceMinutes')} />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <Button
                type="submit"
                variant="primary"
                disabled={createMutation.isPending}
                loading={createMutation.isPending}
                className="min-w-[168px]"
              >
                {createMutation.isPending ? 'Salvando...' : 'Criar regra'}
              </Button>
            </div>
          </Panel>
        </form>
      ) : null}

      {createMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {createMutation.error?.message ?? 'Falha ao criar regra de alerta.'}
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

      {!isLoading && (data?.length ?? 0) > 0 ? (
        <DataTableWrapper className="rounded-[22px]">
          <DataTable>
            <thead>
              <tr>
                <th>Sensor</th>
                <th>Device</th>
                <th>Limites</th>
                <th>Cooldown</th>
                <th>Tolerancia</th>
                <th className="text-right">Acao</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((rule) => (
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
                  <td className="text-right">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && devices.length === 0 ? (
        <SetupGuideCard
          eyebrow="Regras de alerta"
          title="Cadastre um device antes da primeira regra"
          description="As regras ficam mais claras quando voce ja tem pelo menos um equipamento monitorado para vincular limites e historico."
          steps={[
            {
              title: 'Cadastrar o primeiro device',
              description: 'Crie um equipamento com faixa minima e maxima para habilitar monitoramento.',
            },
            {
              title: 'Simular ou enviar leituras',
              description: 'Movimente o historico para validar online, offline e temperatura fora da faixa.',
            },
            {
              title: 'Voltar aqui para criar a regra',
              description: 'Depois disso, configure cooldown e tolerancia do alerta.',
            },
          ]}
          primaryActionLabel={onCreateDevice ? 'Cadastrar primeiro device' : undefined}
          onPrimaryAction={onCreateDevice}
          secondaryHref="/lab"
          secondaryLabel="Abrir laboratorio"
        />
      ) : null}
      {!isLoading && !isError && (data?.length ?? 0) === 0 && devices.length > 0 ? (
        <Feedback>Sem regras cadastradas para este clientId.</Feedback>
      ) : null}
    </Panel>
  );
}
