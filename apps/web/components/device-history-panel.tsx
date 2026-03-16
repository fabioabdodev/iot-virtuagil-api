'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Activity, AlertTriangle } from 'lucide-react';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useDeviceReadings } from '@/hooks/use-device-readings';
import { DeviceSummary } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';

type DeviceHistoryPanelProps = {
  device: DeviceSummary;
  clientId?: string;
  authToken?: string;
};

export function DeviceHistoryPanel({
  device,
  clientId,
  authToken,
}: DeviceHistoryPanelProps) {
  const { data, isLoading, isError } = useDeviceReadings(
    device.id,
    clientId,
    48,
    authToken,
    true,
  );

  const points = (data ?? []).map((item) => ({
    temperature: item.temperature,
    isOutOfRange:
      (device.minTemperature != null && item.temperature < device.minTemperature) ||
      (device.maxTemperature != null && item.temperature > device.maxTemperature),
    label: format(new Date(item.createdAt), 'HH:mm'),
    fullLabel: format(new Date(item.createdAt), 'dd/MM HH:mm', {
      locale: ptBR,
    }),
  }));
  const pointsOutOfRange = points.filter((point) => point.isOutOfRange).length;
  const latestPoint = points[points.length - 1];
  const historyStatusLabel =
    pointsOutOfRange > 0 ? 'Com desvios recentes' : 'Operacao estavel';

  return (
    <Panel className="mt-6 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wide">
          Historico - {device.name ?? device.id}
        </h3>
        <div className="flex items-center gap-2">
          {device.minTemperature != null || device.maxTemperature != null ? (
            <Badge>
              Faixa {device.minTemperature ?? '-'} / {device.maxTemperature ?? '-'}
            </Badge>
          ) : null}
          <Badge>Ultimos 48 pontos</Badge>
        </div>
      </div>

      {!isLoading && !isError && points.length > 0 ? (
        <div className="mb-4 grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Leitura atual
            </p>
            <p className="mt-2 text-lg font-semibold text-ink">
              {latestPoint?.temperature.toFixed(1)} C
            </p>
            <p className="mt-1 text-xs text-muted">
              Ultimo ponto registrado no historico visivel.
            </p>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Leitura da visita
            </p>
            <div className="mt-2 flex items-center gap-2">
              {pointsOutOfRange > 0 ? (
                <AlertTriangle className="h-4 w-4 text-bad" />
              ) : (
                <Activity className="h-4 w-4 text-ok" />
              )}
              <p
                className={
                  pointsOutOfRange > 0
                    ? 'text-sm font-semibold text-bad'
                    : 'text-sm font-semibold text-ok'
                }
              >
                {historyStatusLabel}
              </p>
            </div>
            <p className="mt-1 text-xs text-muted">
              {pointsOutOfRange > 0
                ? `${pointsOutOfRange} ponto(s) fora da faixa nesta janela.`
                : 'Sem desvios aparentes na janela atual.'}
            </p>
          </div>

          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              Como apresentar
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              Use este bloco para mostrar tendencia, estabilidade e resposta a
              desvio sem depender de explicacao tecnica sobre a API.
            </p>
          </div>
        </div>
      ) : null}

      {isLoading ? <Feedback>Carregando historico...</Feedback> : null}
      {isError && points.length === 0 ? (
        <Feedback variant="danger">
          Erro ao carregar historico do device.
        </Feedback>
      ) : null}
      {isError && points.length > 0 ? (
        <Feedback className="mb-3">
          Falha momentanea ao atualizar o historico. Exibindo os ultimos dados
          carregados.
        </Feedback>
      ) : null}

      {!isLoading && !isError && points.length === 0 ? (
        <Feedback>
          Sem dados de temperatura para este device.
        </Feedback>
      ) : null}

      {!isLoading && !isError && points.length > 0 ? (
        <div className="space-y-4">
          <div className="h-72 w-full rounded-[22px] border border-line/70 bg-bg/30 p-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={points}>
                <XAxis
                  dataKey="label"
                  minTickGap={28}
                  stroke="hsl(var(--muted))"
                />
                <YAxis stroke="hsl(var(--muted))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(7, 11, 22, 0.95)',
                    border: '1px solid rgba(69, 88, 123, 0.5)',
                    borderRadius: '10px',
                    color: '#f3f8ff',
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(1)} C`,
                    'Temperatura',
                  ]}
                  labelFormatter={(label) => `Horario: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke={
                    points.some((point) => point.isOutOfRange)
                      ? 'hsl(var(--bad))'
                      : 'hsl(var(--accent))'
                  }
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: points.some((point) => point.isOutOfRange)
                      ? 'hsl(var(--bad))'
                      : 'hsl(var(--accent))',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <DataTableWrapper className="max-h-52 overflow-auto rounded-[22px] bg-bg/20">
            <DataTable className="text-xs">
              <thead>
                <tr className="text-left text-muted">
                  <th className="px-3 py-2">Horario</th>
                  <th className="px-3 py-2">Temperatura</th>
                </tr>
              </thead>
              <tbody>
                {points
                  .slice()
                  .reverse()
                  .map((row, index) => (
                    <tr
                      key={`${device.id}-${row.fullLabel}-${index}`}
                      className={
                        row.isOutOfRange
                          ? 'border-t border-bad/20 bg-bad/5'
                          : 'border-t border-line/60'
                      }
                    >
                      <td className="px-3 py-2 text-muted">{row.fullLabel}</td>
                      <td
                        className={
                          row.isOutOfRange
                            ? 'px-3 py-2 font-semibold text-bad'
                            : 'px-3 py-2 font-medium'
                        }
                      >
                        <div className="flex items-center gap-2">
                          <span>{row.temperature.toFixed(1)} C</span>
                          {row.isOutOfRange ? (
                            <Badge variant="danger">Fora da faixa</Badge>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </DataTable>
          </DataTableWrapper>
        </div>
      ) : null}
    </Panel>
  );
}
