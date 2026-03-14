'use client';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle, BellRing, RadioTower, ToggleRight } from 'lucide-react';
import { useRecentActuationCommands } from '@/hooks/use-recent-actuation-commands';
import { ActuationCommand } from '@/types/actuator';
import { ClientModule } from '@/types/client-module';
import { DeviceSummary } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';

interface OperationalActivityPanelProps {
  clientId?: string;
  authToken?: string;
  devices: DeviceSummary[];
  clientModules: ClientModule[];
}

function isTemperatureOutOfRange(
  temperature: number | null,
  minTemperature: number | null,
  maxTemperature: number | null,
) {
  if (temperature == null) return false;
  if (minTemperature != null && temperature < minTemperature) return true;
  if (maxTemperature != null && temperature > maxTemperature) return true;
  return false;
}

function commandLabel(command: ActuationCommand) {
  return command.desiredState === 'on' ? 'Ligado' : 'Desligado';
}

export function OperationalActivityPanel({
  clientId,
  authToken,
  devices,
  clientModules,
}: OperationalActivityPanelProps) {
  const actuationEnabled =
    clientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'actuation')?.enabled ?? false;

  const { data, isLoading, isError, error } = useRecentActuationCommands(
    actuationEnabled ? clientId : undefined,
    6,
    authToken,
    actuationEnabled,
  );

  const devicesWithIssues = devices
    .filter(
      (device) =>
        device.isOffline ||
        isTemperatureOutOfRange(
          device.lastTemperature,
          device.minTemperature,
          device.maxTemperature,
        ),
    )
    .slice(0, 6);
  const commands = data ?? [];

  return (
    <Panel className="mt-6 p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Atividade operacional
          </p>
          <h2 className="mt-1 text-xl font-semibold">Ocorrencias recentes dos modulos</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Um resumo rapido do que merece atencao em temperatura e do que foi
            executado no acionamento para ajudar em operacao e demonstracao.
          </p>
        </div>
        <Badge>
          <RadioTower className="h-3.5 w-3.5 text-accent" />
          {clientId ? `tenant ${clientId}` : 'visao geral'}
        </Badge>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-bad" />
            <h3 className="text-sm font-semibold text-ink">Temperatura e conectividade</h3>
          </div>

          {devicesWithIssues.length > 0 ? (
            <div className="space-y-3">
              {devicesWithIssues.map((device) => {
                const outOfRange = isTemperatureOutOfRange(
                  device.lastTemperature,
                  device.minTemperature,
                  device.maxTemperature,
                );

                return (
                  <div
                    key={device.id}
                    className="rounded-2xl border border-line/70 bg-card/40 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {device.name ?? device.id}
                        </p>
                        <p className="text-xs text-muted">{device.id}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {device.isOffline ? (
                          <Badge variant="danger">Offline</Badge>
                        ) : null}
                        {outOfRange ? (
                          <Badge variant="danger">Fora da faixa</Badge>
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      {device.lastReadingAt
                        ? `Ultima leitura ${formatDistanceToNow(new Date(device.lastReadingAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })}.`
                        : 'Sem leitura recente.'}{' '}
                      {device.lastTemperature != null
                        ? `Temperatura atual: ${device.lastTemperature.toFixed(1)} C.`
                        : ''}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <Feedback>
              Nenhuma ocorrencia critica visivel agora. Isso ajuda bastante em
              demonstracao e onboarding do modulo de temperatura.
            </Feedback>
          )}
        </div>

        <div className="rounded-[24px] border border-line/70 bg-bg/30 p-4">
          <div className="mb-4 flex items-center gap-2">
            <ToggleRight className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            <h3 className="text-sm font-semibold text-ink">Comandos recentes do acionamento</h3>
          </div>

          {isLoading ? <Feedback>Carregando comandos recentes...</Feedback> : null}
          {isError ? (
            <Feedback variant="danger">
              {error?.message ?? 'Falha ao carregar comandos recentes.'}
            </Feedback>
          ) : null}

          {!isLoading && !isError && !actuationEnabled ? (
            <Feedback>
              O modulo `acionamento` nao esta contratado para este cliente.
            </Feedback>
          ) : null}

          {!isLoading && !isError && actuationEnabled && commands.length > 0 ? (
            <div className="space-y-3">
              {commands.map((command) => (
                <div
                  key={command.id}
                  className="rounded-2xl border border-line/70 bg-card/40 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {command.actuator?.name ?? command.actuatorId}
                      </p>
                      <p className="text-xs text-muted">{command.actuatorId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={command.desiredState === 'on' ? 'success' : 'neutral'}>
                        {commandLabel(command)}
                      </Badge>
                      {command.source ? (
                        <Badge>
                          <BellRing className="h-3.5 w-3.5 text-accent" />
                          {command.source}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    Executado{' '}
                    {formatDistanceToNow(new Date(command.executedAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                    {command.note ? `. Observacao: ${command.note}` : '.'}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && !isError && actuationEnabled && commands.length === 0 ? (
            <Feedback>
              Ainda nao ha comandos registrados. Use o painel de acionamento para
              ligar ou desligar um atuador e alimentar este historico.
            </Feedback>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
