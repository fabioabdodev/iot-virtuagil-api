'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  Clock3,
  Snowflake,
  Thermometer,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { useClient } from '@/hooks/use-client';
import { useDevices } from '@/hooks/use-devices';
import { useDeviceReadings } from '@/hooks/use-device-readings';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';
import { formatHumanDateTime, formatRelativeDateTime } from '@/lib/date';
import { formatMonitoringInterval, formatOfflineAlertDelay } from '@/lib/monitoring-profile';
import type { DeviceSummary } from '@/types/device';

function isTemperatureOutOfRange(device: DeviceSummary) {
  if (device.lastTemperature == null) return false;
  if (device.minTemperature != null && device.lastTemperature < device.minTemperature) {
    return true;
  }
  if (device.maxTemperature != null && device.lastTemperature > device.maxTemperature) {
    return true;
  }
  return false;
}

function formatTemperature(value: number | null) {
  return value == null ? 'Sem leitura' : `${value.toFixed(1)} C`;
}

function ClientDeviceCard({ device, clientId, authToken }: { device: DeviceSummary; clientId?: string; authToken?: string }) {
  const { data: readings } = useDeviceReadings(
    device.id,
    clientId,
    24,
    authToken,
    true,
    'temperature',
  );

  const chartData = useMemo(
    () =>
      (readings ?? []).map((item) => ({
        value: item.value,
        label: new Date(item.createdAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      })),
    [readings],
  );

  const outOfRange = isTemperatureOutOfRange(device);
  const accentClass = device.isOffline
    ? 'from-rose-500/16 to-rose-500/4'
    : outOfRange
      ? 'from-amber-400/16 to-amber-400/4'
      : 'from-cyan-400/16 to-cyan-400/4';

  return (
    <Panel className={`overflow-hidden border-line/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-0`}>
      <div className={`bg-gradient-to-br ${accentClass} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Equipamento</p>
            <h3 className="mt-2 text-xl font-semibold text-ink">{device.name ?? device.id}</h3>
            <p className="mt-1 text-sm text-muted">{device.location ?? 'Local nao informado'}</p>
          </div>
          <Badge variant={device.isOffline ? 'danger' : outOfRange ? 'danger' : 'success'}>
            {device.isOffline ? (
              <WifiOff className="h-3.5 w-3.5" />
            ) : (
              <Wifi className="h-3.5 w-3.5" />
            )}
            {device.isOffline ? 'offline' : outOfRange ? 'alerta' : 'ok'}
          </Badge>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Temperatura</p>
            <p className={`mt-2 text-2xl font-semibold ${outOfRange ? 'text-amber-300' : 'text-ink'}`}>
              {formatTemperature(device.lastTemperature)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Faixa esperada</p>
            <p className="mt-2 text-base font-semibold text-ink">
              {device.minTemperature != null || device.maxTemperature != null
                ? `${device.minTemperature ?? '-'} / ${device.maxTemperature ?? '-'} C`
                : 'Nao configurada'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Ultima leitura</p>
            <p className="mt-2 text-base font-semibold text-ink">
              {device.lastReadingAt ? formatRelativeDateTime(device.lastReadingAt) : 'Sem leitura'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[22px] border border-line/70 bg-bg/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
              <Activity className="h-4 w-4 text-accent" />
              Historico resumido
            </div>
            {chartData.length > 0 ? (
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id={`fill-${device.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.38} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.04} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(120,138,168,0.14)" vertical={false} />
                    <XAxis dataKey="label" minTickGap={28} stroke="hsl(var(--muted))" />
                    <YAxis stroke="hsl(var(--muted))" width={32} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(7, 11, 22, 0.96)',
                        border: '1px solid rgba(69, 88, 123, 0.5)',
                        borderRadius: '12px',
                        color: '#f3f8ff',
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} C`, 'Temperatura']}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={outOfRange ? 'hsl(var(--bad))' : 'hsl(var(--accent))'}
                      fill={`url(#fill-${device.id})`}
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Feedback>Sem pontos suficientes para grafico.</Feedback>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-[22px] border border-line/70 bg-bg/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <Clock3 className="h-4 w-4 text-[hsl(var(--accent-2))]" />
                Monitoramento
              </div>
              <div className="mt-3 space-y-2 text-sm text-muted">
                <p>Cadencia: {formatMonitoringInterval(device.monitoringIntervalSeconds)}</p>
                <p>Offline: {formatOfflineAlertDelay(device.offlineAlertDelayMinutes)}</p>
                <p>Ultimo envio: {device.lastReadingAt ? formatHumanDateTime(device.lastReadingAt) : 'Sem leitura'}</p>
              </div>
            </div>

            <div className="rounded-[22px] border border-line/70 bg-bg/20 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                {device.isOffline ? (
                  <AlertTriangle className="h-4 w-4 text-bad" />
                ) : (
                  <Snowflake className="h-4 w-4 text-accent" />
                )}
                Situacao atual
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {device.isOffline
                  ? 'Equipamento sem comunicacao recente. Vale revisar energia, internet e instalacao local.'
                  : outOfRange
                    ? 'Equipamento online, mas com temperatura fora da faixa esperada.'
                    : 'Equipamento online e operando dentro da faixa informada.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function ClientDashboard() {
  const { authToken, isReady, isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const previewClientId = searchParams.get('clientId') ?? '';
  const clientId = user?.clientId ?? (previewClientId || undefined);
  const isAdminPreview = Boolean(!user?.clientId && previewClientId);
  const canAccessTechnicalPanel = Boolean(isAdminPreview || user?.role === 'admin');
  const technicalHref = useMemo(() => {
    const params = new URLSearchParams();
    params.set('view', 'technical');

    if (clientId) {
      params.set('clientId', clientId);
    }

    return `/?${params.toString()}`;
  }, [clientId]);

  const { data: client, isLoading: isLoadingClient } = useClient(clientId, authToken, Boolean(clientId));
  const {
    data: devicesData,
    isLoading: isLoadingDevices,
    isError,
    error,
  } = useDevices(clientId, 24, authToken, Boolean(clientId));

  const devices = devicesData ?? [];
  const onlineCount = devices.filter((device) => !device.isOffline).length;
  const offlineCount = devices.filter((device) => device.isOffline).length;
  const alertsCount = devices.filter((device) => isTemperatureOutOfRange(device) || device.isOffline).length;
  const latestReadingAt = devices
    .map((device) => device.lastReadingAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1);

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.12),transparent_26%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <Panel variant="strong" className="w-full max-w-xl p-8 text-center">
            <p className="text-sm text-muted">Preparando o painel do cliente...</p>
          </Panel>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(49,189,255,0.16),transparent_30%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <Panel variant="strong" className="w-full max-w-2xl p-8 text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Virtuagil Monitor</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink" style={{ fontFamily: 'var(--font-display)' }}>
              Painel do cliente final
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted">
              Esta area foi pensada para leitura rapida da operacao. Entre com sua conta para acompanhar temperatura, status e alertas sem precisar navegar pelo painel tecnico.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/" className="btn-primary px-5 py-3 text-sm font-semibold">
                Ir para o login
              </Link>
            </div>
          </Panel>
        </div>
      </main>
    );
  }

  if (!clientId) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.14),transparent_28%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <Panel variant="strong" className="w-full max-w-2xl p-8 text-center">
            <p className="text-sm text-muted">
              Sua sessao nao esta vinculada a uma conta de cliente. Se voce for admin, abra esta rota com `?clientId=` para visualizar uma conta em modo de preview.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href={technicalHref} className="btn-secondary px-5 py-3 text-sm font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel tecnico
              </Link>
            </div>
          </Panel>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.12),transparent_24%),radial-gradient(circle_at_100%_0%,rgba(56,189,248,0.18),transparent_30%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Virtuagil Monitor</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl" style={{ fontFamily: 'var(--font-display)' }}>
              {client?.name ?? clientId}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
              Visao simples da operacao para acompanhar status, temperatura e alertas de forma rapida.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdminPreview ? <Badge>preview admin</Badge> : null}
            {canAccessTechnicalPanel ? (
              <Link href={technicalHref} className="btn-secondary px-4 py-3 text-sm font-semibold">
                <ArrowLeft className="h-4 w-4" />
                Painel tecnico
              </Link>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          <Panel variant="strong" className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Equipamentos</p>
            <p className="mt-3 text-3xl font-semibold text-ink">{isLoadingDevices ? '...' : devices.length}</p>
            <p className="mt-2 text-sm text-muted">Pontos monitorados nesta conta.</p>
          </Panel>
          <Panel variant="strong" className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Online</p>
            <p className="mt-3 text-3xl font-semibold text-ok">{isLoadingDevices ? '...' : onlineCount}</p>
            <p className="mt-2 text-sm text-muted">Equipamentos com comunicacao recente.</p>
          </Panel>
          <Panel variant="strong" className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Atencao</p>
            <p className="mt-3 text-3xl font-semibold text-[hsl(var(--accent-2))]">{isLoadingDevices ? '...' : alertsCount}</p>
            <p className="mt-2 text-sm text-muted">Alertas ou desvios na leitura atual.</p>
          </Panel>
          <Panel variant="strong" className="p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Ultima atualizacao</p>
            <p className="mt-3 text-base font-semibold text-ink">
              {latestReadingAt ? formatHumanDateTime(latestReadingAt) : isLoadingDevices ? 'Carregando...' : 'Sem leituras'}
            </p>
            <p className="mt-2 text-sm text-muted">Visao consolidada mais recente da conta.</p>
          </Panel>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Resumo operacional</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Leitura rapida da conta</h2>
              </div>
              <Badge variant={offlineCount > 0 ? 'danger' : 'success'}>
                {offlineCount > 0 ? 'revisar operacao' : 'operacao estavel'}
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-line/70 bg-bg/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Thermometer className="h-4 w-4 text-accent" />
                  Temperatura e faixa
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Acompanhe rapidamente se cada equipamento esta dentro ou fora da faixa esperada, sem navegar por configuracoes tecnicas.
                </p>
              </div>
              <div className="rounded-[22px] border border-line/70 bg-bg/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-ink">
                  <AlertTriangle className="h-4 w-4 text-[hsl(var(--accent-2))]" />
                  Alertas recentes
                </div>
                <p className="mt-3 text-sm leading-7 text-muted">
                  Priorize o que pede atencao agora: equipamento offline, temperatura fora da faixa ou perda de comunicacao.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Orientacao</p>
            <h2 className="mt-2 text-xl font-semibold text-ink">Como usar este painel</h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>1. Veja primeiro os cards do topo para entender o estado geral.</p>
              <p>2. Depois confira os equipamentos em atencao ou offline.</p>
              <p>3. Use o historico resumido para validar tendencia e estabilidade.</p>
              {canAccessTechnicalPanel ? (
                <p>4. Para configuracoes profundas, use o painel tecnico.</p>
              ) : (
                <p>4. Se precisar alterar configuracoes, fale com o administrador responsavel pela conta.</p>
              )}
            </div>
          </Panel>
        </div>

        {isLoadingClient || isLoadingDevices ? (
          <div className="mt-6">
            <Feedback>Carregando o resumo do cliente...</Feedback>
          </div>
        ) : null}

        {isError ? (
          <div className="mt-6">
            <Feedback variant="danger">
              {error instanceof Error ? error.message : 'Falha ao carregar os equipamentos da conta.'}
            </Feedback>
          </div>
        ) : null}

        {!isLoadingDevices && !isError && devices.length === 0 ? (
          <div className="mt-6">
            <Feedback>Nenhum equipamento monitorado foi encontrado para esta conta.</Feedback>
          </div>
        ) : null}

        {!isLoadingDevices && !isError && devices.length > 0 ? (
          <section className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Equipamentos</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">Painel de leitura</h2>
              </div>
              {canAccessTechnicalPanel ? (
                <Link href={technicalHref} className="inline-flex items-center gap-2 text-sm font-medium text-accent transition hover:text-[hsl(var(--accent-2))]">
                  Abrir painel tecnico
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {devices.map((device) => (
                <ClientDeviceCard
                  key={device.id}
                  device={device}
                  clientId={clientId}
                  authToken={authToken}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
