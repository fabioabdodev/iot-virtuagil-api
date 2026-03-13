'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Power, RadioTower, ScrollText, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useActuatorCommands } from '@/hooks/use-actuator-commands';
import { useActuatorMutations } from '@/hooks/use-actuator-mutations';
import { useActuators } from '@/hooks/use-actuators';
import { ActuatorSummary } from '@/types/actuator';
import { DeviceSummary } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { SetupGuideCard } from '@/components/setup-guide-card';

const formSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, 'Id obrigatorio')
    .regex(/^[a-zA-Z0-9_-]{3,50}$/, 'Use apenas letras, numeros, _ ou -'),
  name: z.string().trim().min(1, 'Nome obrigatorio'),
  deviceId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
  location: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

type FormValues = z.input<typeof formSchema>;

type ActuationPanelProps = {
  clientId?: string;
  authToken?: string;
  devices: DeviceSummary[];
  onCreateDevice?: () => void;
};

function actuatorStateBadge(state: 'on' | 'off') {
  return state === 'on'
    ? 'bg-[hsl(var(--accent-2))/0.12] text-[hsl(var(--accent-2))] border-[hsl(var(--accent-2))/0.25]'
    : 'bg-card/60 text-muted border-line/70';
}

export function ActuationPanel({
  clientId,
  authToken,
  devices,
  onCreateDevice,
}: ActuationPanelProps) {
  const { data, isLoading, isError, error } = useActuators(clientId, authToken);
  const {
    createMutation,
    commandMutation,
    updateMutation,
    deleteMutation,
  } = useActuatorMutations(
    clientId,
    authToken,
  );
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingActuatorId, setEditingActuatorId] = useState<string | null>(null);
  const [selectedActuatorId, setSelectedActuatorId] = useState<string | null>(
    null,
  );
  const [commandingActuatorId, setCommandingActuatorId] = useState<string | null>(
    null,
  );
  const [pendingDeleteActuatorId, setPendingDeleteActuatorId] = useState<
    string | null
  >(null);
  const [deletingActuatorId, setDeletingActuatorId] = useState<string | null>(
    null,
  );

  const {
    data: commandHistory,
    isLoading: isLoadingHistory,
    isError: isErrorHistory,
    error: historyError,
  } = useActuatorCommands(selectedActuatorId, authToken);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: '',
      name: '',
      deviceId: '',
      location: '',
    },
  });

  const actuators = data ?? [];
  const editingActuator =
    actuators.find((actuator) => actuator.id === editingActuatorId) ?? null;

  useEffect(() => {
    if (formMode === 'edit' && editingActuator) {
      reset({
        id: editingActuator.id,
        name: editingActuator.name,
        deviceId: editingActuator.deviceId ?? '',
        location: editingActuator.location ?? '',
      });
      return;
    }

    reset({
      id: '',
      name: '',
      deviceId: '',
      location: '',
    });
  }, [editingActuator, formMode, reset]);

  async function handleCommand(actuatorId: string, desiredState: 'on' | 'off') {
    setCommandingActuatorId(actuatorId);
    try {
      await commandMutation.mutateAsync({
        actuatorId,
        payload: {
          desiredState,
          source: 'dashboard',
        },
      });
      setSelectedActuatorId(actuatorId);
    } finally {
      setCommandingActuatorId(null);
    }
  }

  async function handleDeleteActuator(actuatorId: string) {
    setDeletingActuatorId(actuatorId);
    try {
      await deleteMutation.mutateAsync(actuatorId);
      if (editingActuatorId === actuatorId) {
        setEditingActuatorId(null);
        setFormMode('create');
      }
      if (selectedActuatorId === actuatorId) {
        setSelectedActuatorId(null);
      }
    } finally {
      setDeletingActuatorId(null);
      setPendingDeleteActuatorId(null);
    }
  }

  function beginEditing(actuator: ActuatorSummary) {
    setEditingActuatorId(actuator.id);
    setFormMode('edit');
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:300ms]">
      <ConfirmDialog
        open={Boolean(pendingDeleteActuatorId)}
        title="Excluir atuador?"
        description={
          <>
            O atuador <strong>{pendingDeleteActuatorId}</strong> sera removido do
            modulo de acionamento.
          </>
        }
        confirmLabel="Excluir atuador"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteActuatorId(null)}
        onConfirm={() => {
          if (pendingDeleteActuatorId) {
            void handleDeleteActuator(pendingDeleteActuatorId);
          }
        }}
      />

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Acionamento
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Controle manual e historico rapido
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Cadastre cargas como sauna, exaustor ou rele de potencia e acione
            o estado manualmente pelo dashboard.
          </p>
        </div>

        <Badge>
          <Power className="h-3.5 w-3.5 text-[hsl(var(--accent-2))]" />
          Modulo inicial
        </Badge>
      </div>

      {!clientId ? (
        <Feedback>Defina um `clientId` para gerenciar atuadores.</Feedback>
      ) : (
        <>
          <form
            onSubmit={handleSubmit(async (rawValues) => {
              const values = formSchema.parse(rawValues);
              if (formMode === 'edit' && editingActuator) {
                await updateMutation.mutateAsync({
                  id: editingActuator.id,
                  payload: {
                    clientId,
                    deviceId: values.deviceId,
                    name: values.name,
                    location: values.location,
                  },
                });
                setEditingActuatorId(null);
                setFormMode('create');
              } else {
                await createMutation.mutateAsync({
                  id: values.id,
                  clientId,
                  deviceId: values.deviceId,
                  name: values.name,
                  location: values.location,
                });
              }
              reset();
            })}
          >
            <Panel
              variant="strong"
              className="mb-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Id do atuador
                </label>
                <Input
                  {...register('id')}
                  placeholder="sauna_main"
                  disabled={formMode === 'edit'}
                />
                {errors.id ? (
                  <p className="mt-1 text-xs text-bad">{errors.id.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">Nome</label>
                <Input {...register('name')} placeholder="Sauna principal" />
                {errors.name ? (
                  <p className="mt-1 text-xs text-bad">{errors.name.message}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">
                  Device (opcional)
                </label>
                <Select {...register('deviceId')}>
                  <option value="">Sem device vinculado</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name ?? device.id}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-xs text-muted">Local</label>
                <Input {...register('location')} placeholder="Area molhada" />
              </div>

              <div className="sm:col-span-2 lg:col-span-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={
                      formMode === 'edit'
                        ? updateMutation.isPending
                        : createMutation.isPending
                    }
                    className="min-w-[180px]"
                  >
                    {formMode === 'edit'
                      ? updateMutation.isPending
                        ? 'Salvando...'
                        : 'Salvar alteracoes'
                      : createMutation.isPending
                        ? 'Criando...'
                        : 'Cadastrar atuador'}
                  </Button>
                  {formMode === 'edit' ? (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingActuatorId(null);
                        setFormMode('create');
                      }}
                    >
                      Cancelar edicao
                    </Button>
                  ) : null}
                </div>
              </div>
            </Panel>
          </form>

          {createMutation.isError || updateMutation.isError ? (
            <Feedback variant="danger" className="mb-3">
              {createMutation.error?.message ??
                updateMutation.error?.message ??
                'Falha ao salvar atuador.'}
            </Feedback>
          ) : null}
          {commandMutation.isError ? (
            <Feedback variant="danger" className="mb-3">
              {commandMutation.error?.message ?? 'Falha ao enviar comando.'}
            </Feedback>
          ) : null}
          {deleteMutation.isError ? (
            <Feedback variant="danger" className="mb-3">
              {deleteMutation.error?.message ?? 'Falha ao remover atuador.'}
            </Feedback>
          ) : null}

          {isLoading ? <Feedback>Carregando atuadores...</Feedback> : null}
          {isError && actuators.length === 0 ? (
            <Feedback variant="danger">
              {error?.message ?? 'Erro ao carregar atuadores.'}
            </Feedback>
          ) : null}

          {!isLoading && actuators.length > 0 ? (
            <div className="space-y-4">
              <DataTableWrapper className="rounded-[22px]">
                <DataTable>
                  <thead>
                    <tr>
                      <th>Atuador</th>
                      <th>Estado</th>
                      <th>Vinculo</th>
                      <th>Ultimo comando</th>
                      <th className="text-right">Cadastro</th>
                      <th className="text-right">Controle</th>
                      <th className="text-right">Historico</th>
                    </tr>
                  </thead>
                  <tbody>
                    {actuators.map((actuator) => (
                      <tr key={actuator.id}>
                        <td className="font-medium">
                          <div className="flex flex-col">
                            <span>{actuator.name}</span>
                            <span className="text-xs text-muted">
                              {actuator.id}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs ${actuatorStateBadge(actuator.currentState)}`}
                          >
                            {actuator.currentState === 'on' ? 'Ligado' : 'Desligado'}
                          </span>
                        </td>
                        <td className="text-muted">
                          <div className="flex flex-col">
                            <span>{actuator.deviceId ?? 'Sem device'}</span>
                            <span className="text-xs">
                              {actuator.location ?? 'Sem local'}
                            </span>
                          </div>
                        </td>
                        <td className="text-muted">
                          {actuator.lastCommandAt ? (
                            <div className="flex flex-col">
                              <span>
                                {formatDistanceToNow(
                                  new Date(actuator.lastCommandAt),
                                  {
                                    addSuffix: true,
                                    locale: ptBR,
                                  },
                                )}
                              </span>
                              <span className="text-xs">
                                por {actuator.lastCommandBy ?? 'manual'}
                              </span>
                            </div>
                          ) : (
                            'Sem comando'
                          )}
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                beginEditing(actuator);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              loading={deletingActuatorId === actuator.id}
                              disabled={
                                deleteMutation.isPending &&
                                deletingActuatorId !== actuator.id
                              }
                              onClick={() => {
                                setPendingDeleteActuatorId(actuator.id);
                              }}
                            >
                              {deletingActuatorId === actuator.id
                                ? 'Excluindo...'
                                : 'Excluir'}
                            </Button>
                          </div>
                        </td>
                        <td className="text-right">
                          <div className="inline-flex items-center gap-2">
                            <Button
                              variant="primary"
                              size="sm"
                              loading={
                                commandingActuatorId === actuator.id &&
                                commandMutation.isPending
                              }
                              disabled={
                                commandMutation.isPending &&
                                commandingActuatorId !== actuator.id
                              }
                              onClick={() => {
                                void handleCommand(actuator.id, 'on');
                              }}
                            >
                              <Zap className="h-3.5 w-3.5" />
                              Ligar
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={
                                commandMutation.isPending &&
                                commandingActuatorId !== actuator.id
                              }
                              onClick={() => {
                                void handleCommand(actuator.id, 'off');
                              }}
                            >
                              Desligar
                            </Button>
                          </div>
                        </td>
                        <td className="text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedActuatorId((current) =>
                                current === actuator.id ? null : actuator.id,
                              );
                            }}
                          >
                            {selectedActuatorId === actuator.id
                              ? 'Fechar'
                              : 'Ver log'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </DataTable>
              </DataTableWrapper>

              {selectedActuatorId ? (
                <Panel variant="strong" className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold">
                        Historico recente
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        Ultimos comandos emitidos para {selectedActuatorId}.
                      </p>
                    </div>
                    <Badge>
                      <ScrollText className="h-3.5 w-3.5 text-accent" />
                      comandos
                    </Badge>
                  </div>

                  {isLoadingHistory ? (
                    <Feedback>Carregando historico...</Feedback>
                  ) : null}
                  {isErrorHistory ? (
                    <Feedback variant="danger">
                      {historyError?.message ??
                        'Falha ao carregar historico do atuador.'}
                    </Feedback>
                  ) : null}
                  {!isLoadingHistory &&
                  !isErrorHistory &&
                  (commandHistory?.length ?? 0) > 0 ? (
                    <div className="space-y-2">
                      {(commandHistory ?? []).map((command) => (
                        <div
                          key={command.id}
                          className="flex flex-col gap-2 rounded-2xl border border-line/70 bg-bg/30 p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs ${actuatorStateBadge(command.desiredState)}`}
                            >
                              {command.desiredState === 'on' ? 'Ligar' : 'Desligar'}
                            </span>
                            <div>
                              <p className="text-sm font-medium">
                                {command.source ?? 'manual'}
                              </p>
                              <p className="text-xs text-muted">
                                {command.note ?? 'Sem observacao'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted">
                            <RadioTower className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(command.executedAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {!isLoadingHistory &&
                  !isErrorHistory &&
                  (commandHistory?.length ?? 0) === 0 ? (
                    <Feedback>Sem comandos para este atuador.</Feedback>
                  ) : null}
                </Panel>
              ) : null}
            </div>
          ) : null}

          {!isLoading && !isError && actuators.length === 0 ? (
            <SetupGuideCard
              eyebrow="Acionamento"
              title="Configure o primeiro atuador deste cliente"
              description="Mesmo sem hardware fisico, voce ja pode cadastrar a carga, emitir comandos on/off e validar o historico operacional pelo dashboard."
              steps={[
                {
                  title: 'Cadastrar o atuador',
                  description: 'Use um identificador como `sauna_main` ou `exaustor_01`.',
                },
                {
                  title: devices.length > 0 ? 'Vincular a um device' : 'Opcionalmente vincular a um device',
                  description: devices.length > 0
                    ? 'Escolha um equipamento da lista para contextualizar a carga dentro do cliente.'
                    : 'Quando houver devices cadastrados, voce podera relacionar o atuador ao equipamento monitorado.',
                },
                {
                  title: 'Emitir comandos pelo dashboard',
                  description: 'Teste ligar, desligar e acompanhe o log recente sem depender de rele fisico.',
                },
              ]}
              secondaryHref="/lab"
              secondaryLabel="Abrir laboratorio"
              primaryActionLabel={!devices.length && onCreateDevice ? 'Cadastrar device primeiro' : undefined}
              onPrimaryAction={!devices.length ? onCreateDevice : undefined}
            />
          ) : null}
        </>
      )}
    </Panel>
  );
}
