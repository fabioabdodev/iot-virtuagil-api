'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useActuationSchedules } from '@/hooks/use-actuation-schedules';
import { useActuationScheduleMutations } from '@/hooks/use-actuation-schedule-mutations';
import { ActuationSchedule, ActuatorSummary } from '@/types/actuator';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Input, Select } from '@/components/ui/input';

const weekdayOptions = [
  { value: 'mon', label: 'Seg' },
  { value: 'tue', label: 'Ter' },
  { value: 'wed', label: 'Qua' },
  { value: 'thu', label: 'Qui' },
  { value: 'fri', label: 'Sex' },
  { value: 'sat', label: 'Sab' },
  { value: 'sun', label: 'Dom' },
] as const;

const formSchema = z
  .object({
    actuatorId: z.string().trim().min(1, 'Atuador obrigatorio'),
    name: z.string().trim().min(2, 'Nome obrigatorio'),
    weekdays: z.array(z.enum(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'])).min(1, 'Escolha ao menos um dia'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inicial invalida'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora final invalida'),
    timezone: z.string().trim().min(3, 'Timezone obrigatorio'),
  })
  .refine(
    (values) => values.startTime < values.endTime,
    {
      message: 'A hora inicial deve ser menor que a final',
      path: ['endTime'],
    },
  );

type FormValues = z.input<typeof formSchema>;

function toMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function fromMinutes(value: number) {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

type ActuationSchedulesPanelProps = {
  clientId?: string;
  authToken?: string;
  actuators: ActuatorSummary[];
  canManage: boolean;
};

export function ActuationSchedulesPanel({
  clientId,
  authToken,
  actuators,
  canManage,
}: ActuationSchedulesPanelProps) {
  const { data, isLoading, isError, error } = useActuationSchedules(
    clientId,
    authToken,
    Boolean(clientId),
  );
  const { createMutation, updateMutation, deleteMutation } =
    useActuationScheduleMutations(clientId, authToken);
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [pendingDeleteScheduleId, setPendingDeleteScheduleId] = useState<string | null>(null);
  const schedules = data ?? [];
  const editingSchedule = schedules.find((schedule) => schedule.id === editingScheduleId) ?? null;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      actuatorId: '',
      name: '',
      weekdays: ['mon', 'wed', 'fri'],
      startTime: '16:00',
      endTime: '20:00',
      timezone: 'America/Sao_Paulo',
    },
  });

  const selectedDays = watch('weekdays');

  useEffect(() => {
    if (!editingSchedule) {
      reset({
        actuatorId: '',
        name: '',
        weekdays: ['mon', 'wed', 'fri'],
        startTime: '16:00',
        endTime: '20:00',
        timezone: 'America/Sao_Paulo',
      });
      return;
    }

    reset({
      actuatorId: editingSchedule.actuatorId,
      name: editingSchedule.name,
      weekdays: editingSchedule.weekdays,
      startTime: fromMinutes(editingSchedule.startMinutes),
      endTime: fromMinutes(editingSchedule.endMinutes),
      timezone: editingSchedule.timezone,
    });
  }, [editingSchedule, reset]);

  async function handleDelete(id: string) {
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setPendingDeleteScheduleId(null);
    }
  }

  return (
    <Panel className="mt-6 p-5">
      <ConfirmDialog
        open={Boolean(pendingDeleteScheduleId)}
        title="Excluir rotina?"
        description="A rotina sera removida do agendamento automatico do atuador."
        confirmLabel="Excluir rotina"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteScheduleId(null)}
        onConfirm={() => {
          if (pendingDeleteScheduleId) {
            void handleDelete(pendingDeleteScheduleId);
          }
        }}
      />

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Rotinas de acionamento</h2>
          <p className="mt-1 text-sm text-muted">
            Agende janelas recorrentes para ligar e desligar atuadores automaticamente.
          </p>
        </div>
        <Badge>rotinas</Badge>
      </div>

      {!clientId ? <Feedback>Escolha um cliente para gerenciar rotinas.</Feedback> : null}

      {clientId && canManage ? (
        <form
          onSubmit={handleSubmit(async (values) => {
            const payload = {
              clientId,
              actuatorId: values.actuatorId,
              name: values.name,
              weekdays: values.weekdays,
              startMinutes: toMinutes(values.startTime),
              endMinutes: toMinutes(values.endTime),
              timezone: values.timezone,
              enabled: true,
            };

            if (editingSchedule) {
              await updateMutation.mutateAsync({
                id: editingSchedule.id,
                payload: {
                  ...payload,
                  enabled: editingSchedule.enabled,
                },
              });
              setEditingScheduleId(null);
            } else {
              await createMutation.mutateAsync(payload);
            }

            reset();
          })}
        >
          <Panel variant="strong" className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted">Atuador</label>
              <Select {...register('actuatorId')}>
                <option value="">Selecione</option>
                {actuators.map((actuator) => (
                  <option key={actuator.id} value={actuator.id}>
                    {actuator.name}
                  </option>
                ))}
              </Select>
              {errors.actuatorId ? <p className="mt-1 text-xs text-bad">{errors.actuatorId.message}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Nome</label>
              <Input {...register('name')} placeholder="Sauna seg/qua/sex" />
              {errors.name ? <p className="mt-1 text-xs text-bad">{errors.name.message}</p> : null}
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Timezone</label>
              <Input {...register('timezone')} placeholder="America/Sao_Paulo" />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Inicio</label>
              <Input type="time" {...register('startTime')} />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Fim</label>
              <Input type="time" {...register('endTime')} />
              {errors.endTime ? <p className="mt-1 text-xs text-bad">{errors.endTime.message}</p> : null}
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="mb-2 block text-xs text-muted">Dias da semana</label>
              <div className="flex flex-wrap gap-2">
                {weekdayOptions.map((option) => {
                  const isSelected = selectedDays.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-2xl border px-3 py-2 text-xs ${
                        isSelected
                          ? 'border-accent bg-accent/10 text-ink'
                          : 'border-line/70 bg-card/40 text-muted'
                      }`}
                      onClick={() => {
                        const next = isSelected
                          ? selectedDays.filter((day) => day !== option.value)
                          : [...selectedDays, option.value];
                        setValue('weekdays', next as FormValues['weekdays'], {
                          shouldValidate: true,
                        });
                      }}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {errors.weekdays ? <p className="mt-1 text-xs text-bad">{errors.weekdays.message}</p> : null}
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingSchedule ? 'Salvar rotina' : 'Criar rotina'}
                </Button>
                {editingSchedule ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingScheduleId(null)}
                  >
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </div>
          </Panel>
        </form>
      ) : null}

      {clientId && !canManage ? (
        <Feedback className="mb-3">
          Seu perfil pode monitorar as rotinas, mas nao pode altera-las.
        </Feedback>
      ) : null}

      {createMutation.isError || updateMutation.isError || deleteMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {createMutation.error?.message ??
            updateMutation.error?.message ??
            deleteMutation.error?.message ??
            'Falha ao salvar rotina de acionamento.'}
        </Feedback>
      ) : null}

      {isLoading ? <Feedback>Carregando rotinas...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Falha ao carregar rotinas.'}
        </Feedback>
      ) : null}

      {!isLoading && !isError && schedules.length > 0 ? (
        <DataTableWrapper className="rounded-[22px]">
          <DataTable>
            <thead>
              <tr>
                <th>Rotina</th>
                <th>Atuador</th>
                <th>Dias</th>
                <th>Janela</th>
                <th>Status</th>
                <th className="text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="font-medium">{schedule.name}</td>
                  <td>{schedule.actuatorId}</td>
                  <td className="text-muted">
                    {schedule.weekdays
                      .map((day) => weekdayOptions.find((option) => option.value === day)?.label ?? day)
                      .join(', ')}
                  </td>
                  <td>{fromMinutes(schedule.startMinutes)} - {fromMinutes(schedule.endMinutes)}</td>
                  <td>
                    <Badge variant={schedule.enabled ? 'success' : 'neutral'}>
                      {schedule.enabled ? 'Ativa' : 'Pausada'}
                    </Badge>
                  </td>
                  <td className="text-right">
                    {canManage ? (
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingScheduleId(schedule.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant={schedule.enabled ? 'secondary' : 'primary'}
                          size="sm"
                          loading={updateMutation.isPending}
                          disabled={updateMutation.isPending}
                          onClick={() => {
                            void updateMutation.mutateAsync({
                              id: schedule.id,
                              payload: { enabled: !schedule.enabled },
                            });
                          }}
                        >
                          {schedule.enabled ? 'Pausar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          loading={deleteMutation.isPending}
                          disabled={deleteMutation.isPending}
                          onClick={() => setPendingDeleteScheduleId(schedule.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">Somente leitura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </DataTableWrapper>
      ) : null}

      {!isLoading && !isError && schedules.length === 0 && clientId ? (
        <Feedback>Nenhuma rotina cadastrada para este cliente.</Feedback>
      ) : null}
    </Panel>
  );
}
