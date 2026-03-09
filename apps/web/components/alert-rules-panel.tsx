'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAlertRuleMutations } from '@/hooks/use-alert-rule-mutations';
import { useAlertRules } from '@/hooks/use-alert-rules';
import { DeviceSummary } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

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
};

export function AlertRulesPanel({
  clientId,
  authToken,
  devices,
}: AlertRulesPanelProps) {
  const { data, isLoading, isError } = useAlertRules(clientId, authToken);
  const { createMutation, deleteMutation } = useAlertRuleMutations(
    clientId,
    authToken,
  );

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
    const confirmed = window.confirm('Remover regra de alerta?');
    if (!confirmed) return;
    await deleteMutation.mutateAsync(id);
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:280ms]">
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
                className="min-w-[168px]"
              >
                {createMutation.isPending ? 'Salvando...' : 'Criar regra'}
              </Button>
            </div>
          </Panel>
        </form>
      ) : null}

      {isLoading ? (
        <Feedback>Carregando regras...</Feedback>
      ) : null}
      {isError ? (
        <Feedback variant="danger">Erro ao carregar regras.</Feedback>
      ) : null}

      {!isLoading && !isError ? (
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
                        void handleRemove(rule.id);
                      }}
                      variant="danger"
                      size="sm"
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}
    </Panel>
  );
}
