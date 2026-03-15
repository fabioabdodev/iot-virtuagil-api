'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  ChartNoAxesCombined,
  CircleDot,
  KeyRound,
  RefreshCw,
  Snowflake,
  Thermometer,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { DeviceForm } from '@/components/device-form';
import { DeviceHistoryPanel } from '@/components/device-history-panel';
import { DashboardHeader } from '@/components/dashboard-header';
import { ActuationPanel } from '@/components/actuation-panel';
import { AlertRulesPanel } from '@/components/alert-rules-panel';
import { SimulationLabPanel } from '@/components/simulation-lab-panel';
import { ClientModulesPanel } from '@/components/client-modules-panel';
import { ClientProfilePanel } from '@/components/client-profile-panel';
import { ClientsPanel } from '@/components/clients-panel';
import { AuditLogPanel } from '@/components/audit-log-panel';
import { SetupGuideCard } from '@/components/setup-guide-card';
import { UsersPanel } from '@/components/users-panel';
import { CommercialReadinessPanel } from '@/components/commercial-readiness-panel';
import { OperationalActivityPanel } from '@/components/operational-activity-panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableWrapper } from '@/components/ui/data-table';
import { Feedback } from '@/components/ui/feedback';
import { Input } from '@/components/ui/input';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { AccessNotice } from '@/components/ui/access-notice';
import { MetricCard } from '@/components/ui/metric-card';
import { Panel } from '@/components/ui/panel';
import { TurnstileWidget } from '@/components/ui/turnstile-widget';
import { useAuth } from '@/lib/auth-context';
import { useDeviceMutations } from '@/hooks/use-device-mutations';
import { useDevices } from '@/hooks/use-devices';
import { useClientModules } from '@/hooks/use-client-modules';

function statusClass(isOffline: boolean) {
  return isOffline
    ? 'bg-bad/10 text-bad border-bad/20'
    : 'bg-ok/10 text-ok border-ok/20';
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

export default function DashboardPage() {
  return (
    <Suspense
      fallback={null}
    >
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
  const isTurnstileEnabled = Boolean(turnstileSiteKey);

  // O filtro principal vive na URL para facilitar refresh e compartilhamento do estado atual.
  const queryClientId = searchParams.get('clientId') ?? '';

  const [clientIdDraft, setClientIdDraft] = useState(queryClientId);
  const [authEmailDraft, setAuthEmailDraft] = useState('plataforma@virtuagil.com.br');
  const [authPasswordDraft, setAuthPasswordDraft] = useState('plataforma123');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const {
    authToken,
    isReady,
    isAuthenticated,
    user,
    login,
    logout,
  } = useAuth();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<'closed' | 'create' | 'edit'>(
    'closed',
  );
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [pendingDeleteDeviceId, setPendingDeleteDeviceId] = useState<
    string | null
  >(null);

  useEffect(() => {
    // Mantem o campo de filtro sincronizado quando a URL muda por navegacao ou refresh.
    setClientIdDraft(queryClientId);
  }, [queryClientId]);

  // String vazia nao deve ser enviada para a API como clientId valido.
  const clientId = useMemo(
    () => queryClientId.trim() || undefined,
    [queryClientId],
  );
  const scopedClientId = clientId ?? user?.clientId ?? undefined;
  const isAdmin = user?.role === 'admin';
  const isPlatformAdmin = Boolean(isAdmin && !user?.clientId);
  const canManageUsers = Boolean(scopedClientId && isPlatformAdmin);
  const canManageClientModules = Boolean(scopedClientId && isPlatformAdmin);
  const canManageClientProfile = Boolean(scopedClientId && isPlatformAdmin);
  const canCreateDevices = Boolean(scopedClientId && isPlatformAdmin);
  const canEditDeviceTemperature = Boolean(scopedClientId && isAdmin);
  const canEditDeviceStructure = Boolean(scopedClientId && isPlatformAdmin);
  const canManageAlertRules = Boolean(scopedClientId && isAdmin);
  const canManageActuatorStructure = Boolean(scopedClientId && isPlatformAdmin);
  const canManageActuatorCommands = Boolean(scopedClientId && isAdmin);
  const canManageActuatorSchedules = Boolean(scopedClientId && isAdmin);
  const {
    data: clientModulesData,
    isLoading: isLoadingClientModules,
  } = useClientModules(scopedClientId, authToken);
  const clientModules = clientModulesData ?? [];
  const temperatureEnabled =
    scopedClientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'temperature')?.enabled ?? false;
  const actuationEnabled =
    scopedClientId == null
      ? true
      : clientModules.find((module) => module.moduleKey === 'actuation')?.enabled ?? false;

  const { data, isLoading, isError, error, refetch } = useDevices(
    scopedClientId,
    50,
    authToken,
  );
  const devices = data ?? [];

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) ?? null;
  const editingDevice = devices.find((d) => d.id === editingDeviceId) ?? null;

  const { createMutation, updateMutation, deleteMutation } = useDeviceMutations(
    scopedClientId,
    authToken,
  );

  // Os cards superiores sao derivados localmente para evitar roundtrip extra na API.
  const online = devices.filter((d) => !d.isOffline).length;
  const offline = devices.filter((d) => d.isOffline).length;

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString());
    const nextClientId = clientIdDraft.trim();

    if (nextClientId) {
      params.set('clientId', nextClientId);
    } else {
      params.delete('clientId');
    }

    const query = params.toString();
    router.replace(query ? `/?${query}` : '/');
  }

  function focusClient(nextClientId: string) {
    setClientIdDraft(nextClientId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('clientId', nextClientId);
    router.replace(`/?${params.toString()}`);
  }

  async function handleLogin() {
    setAuthError(null);
    if (isTurnstileEnabled && !turnstileToken) {
      setAuthError('Confirme a validacao anti-bot antes de entrar.');
      return;
    }
    setIsAuthenticating(true);

    try {
      await login({
        email: authEmailDraft.trim(),
        password: authPasswordDraft,
        turnstileToken: turnstileToken ?? undefined,
      });
      void refetch();
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : 'Falha ao autenticar usuario.',
      );
    } finally {
      if (isTurnstileEnabled) {
        setTurnstileResetKey((current) => current + 1);
      }
      setIsAuthenticating(false);
    }
  }

  function clearToken() {
    logout();
    setAuthPasswordDraft('');
    setTurnstileToken(null);
    if (isTurnstileEnabled) {
      setTurnstileResetKey((current) => current + 1);
    }
    setAuthError(null);
    void refetch();
  }

  async function handleDeleteDevice(id: string) {
    // A remocao afeta selecao e formulario; por isso limpamos os estados relacionados.
    setDeletingDeviceId(id);
    try {
      await deleteMutation.mutateAsync(id);
    } finally {
      setDeletingDeviceId(null);
      setPendingDeleteDeviceId(null);
    }

    if (selectedDeviceId === id) setSelectedDeviceId(null);
    if (editingDeviceId === id) {
      setEditingDeviceId(null);
      setFormMode('closed');
    }
  }

  if (!isReady) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.12),transparent_28%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <Panel variant="strong" className="w-full max-w-xl p-8 text-center">
            <p className="text-sm text-muted">Validando sessao local...</p>
          </Panel>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.14),transparent_28%),radial-gradient(circle_at_bottom,rgba(49,189,255,0.18),transparent_32%),linear-gradient(180deg,rgba(4,8,15,1),rgba(7,14,24,1))]">
        <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full">
            <section className="mx-auto max-w-2xl space-y-4">
              <div className="flex justify-center">
                <div className="inline-flex rounded-3xl border border-line/70 bg-card/70 px-4 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.34)]">
                  <Image
                    src="/brand/virtuagil_logo_low.png"
                    alt="Virtuagil"
                    width={164}
                    height={48}
                    priority
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.24em] text-muted">
                  Virtuagil Monitor
                </p>
                <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                  Plataforma de monitoramento e automacao IoT
                </h1>
              </div>

              <Panel variant="strong" className="p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Acesso
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">Entrar na plataforma</h2>
                    <p className="mt-2 text-sm text-muted">
                      Use um usuario autorizado para acessar o dashboard.
                    </p>
                  </div>
                  <Badge>
                    <KeyRound className="h-3.5 w-3.5 text-accent" />
                    Login
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted">
                      E-mail
                    </label>
                    <Input
                      type="email"
                      value={authEmailDraft}
                      onChange={(event) => setAuthEmailDraft(event.target.value)}
                      placeholder="plataforma@virtuagil.com.br"
                      className="min-h-[50px]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-muted">
                      Senha
                    </label>
                    <Input
                      type="password"
                      value={authPasswordDraft}
                      onChange={(event) => setAuthPasswordDraft(event.target.value)}
                      placeholder="Digite sua senha"
                      className="min-h-[50px]"
                    />
                  </div>

                  {isTurnstileEnabled ? (
                    <TurnstileWidget
                      siteKey={turnstileSiteKey}
                      onTokenChange={setTurnstileToken}
                      resetKey={turnstileResetKey}
                    />
                  ) : null}

                  <Button
                    onClick={() => {
                      void handleLogin();
                    }}
                    variant="primary"
                    className="min-h-[50px] w-full"
                    loading={isAuthenticating}
                  >
                    Entrar
                  </Button>
                </div>

                {authError ? (
                  <Feedback variant="danger" className="mt-4">
                    {authError}
                  </Feedback>
                ) : null}
              </Panel>

              <Panel id="como-contratar" className="p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Interesse comercial
                </p>
                <h2 className="mt-1 text-lg font-semibold">Nao e cliente ainda?</h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  Fale com a Virtuagil para avaliar monitoramento, alertas e a
                  implantacao da sua operacao com uma jornada guiada.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href="mailto:contato@virtuagil.com.br?subject=Quero%20conhecer%20o%20Virtuagil%20Monitor"
                    className="btn-primary px-4 py-3 text-sm font-semibold"
                  >
                    Solicitar demonstracao
                  </a>
                </div>
              </Panel>

              <div className="pt-2 text-center text-xs text-muted">
                Todos os direitos reservados virtuagil.com.br
              </div>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <DashboardHeader
        currentUser={user}
        scopedClientId={scopedClientId}
        isAuthenticated={isAuthenticated}
        onLogout={clearToken}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ConfirmDialog
        open={Boolean(pendingDeleteDeviceId)}
        title="Excluir device?"
        description={
          <>
            O device <strong>{pendingDeleteDeviceId}</strong> sera removido do
            dashboard e do historico.
          </>
        }
        confirmLabel="Excluir device"
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDeleteDeviceId(null)}
        onConfirm={() => {
          if (pendingDeleteDeviceId) {
            void handleDeleteDevice(pendingDeleteDeviceId);
          }
        }}
      />

      <Panel variant="shell" className="mb-6 p-5 xl:p-7">
        <div className="relative overflow-hidden rounded-[24px] border border-line/50 bg-gradient-to-br from-card/90 via-card/70 to-bg/20 p-6">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,208,77,0.14),transparent_42%),radial-gradient(circle_at_bottom,rgba(49,189,255,0.18),transparent_45%)]" />
          <div className="relative z-10">
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <div className="glass rounded-2xl border px-3 py-2">
                <Image
                  src="/brand/virtuagil_logo_low.png"
                  alt="Virtuagil"
                  width={146}
                  height={42}
                  priority
                />
              </div>
              <Badge>
                <CircleDot className="h-3.5 w-3.5 text-ok" />
                Operacao em tempo real
              </Badge>
            </div>

            <p className="mb-3 text-sm uppercase tracking-[0.22em] text-muted">
              Plataforma de monitoramento
            </p>
            <h1 className="max-w-2xl font-[var(--font-display)] text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              Dashboard de dispositivos com telemetria, alertas e historico
              operacional em uma unica camada.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted sm:text-base">
              Use o simulador para movimentar os dados, filtre por tenant e
              acompanhe rapidamente leituras fora de faixa e devices sem
              comunicacao.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Badge>
                <Boxes className="h-3.5 w-3.5 text-accent" />
                {devices.length} devices rastreados
              </Badge>
              <Badge>
                <ChartNoAxesCombined className="h-3.5 w-3.5 text-[hsl(var(--accent-2))]" />
                Historico e tendencia
              </Badge>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/lab" className="btn-secondary px-4 py-3 text-sm font-semibold">
                Abrir laboratorio
              </Link>
            </div>
          </div>
        </div>
      </Panel>

      <Panel variant="strong" className="mb-6 p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Contexto operacional
            </p>
            <h2 className="mt-1 text-lg font-semibold">Tenant em foco</h2>
            <p className="mt-1 text-sm text-muted">
              Defina qual cliente deseja operar no restante do dashboard.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px] lg:min-w-[420px]">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted">
                ClientId
              </label>
              <Input
                value={clientIdDraft}
                onChange={(event) => setClientIdDraft(event.target.value)}
                placeholder="cuidare-vacinas"
                className="min-h-[48px]"
              />
            </div>
            <Button
              onClick={applyFilters}
              variant="primary"
              className="min-h-[48px] w-full self-end"
            >
              Aplicar filtro
            </Button>
          </div>
        </div>
      </Panel>

      <ClientsPanel
        authToken={authToken}
        currentUser={user}
        canManage={isPlatformAdmin}
        selectedClientId={scopedClientId}
        onSelectClient={focusClient}
      />

      <section id="resumo-operacional" className="mb-8 scroll-mt-28 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          className="animate-fade-up"
          title="Dispositivos"
          value={devices.length}
          icon={<Snowflake className="h-5 w-5 text-accent" />}
          accentClassName="bg-accent/10"
        />
        <MetricCard
          className="animate-fade-up [animation-delay:80ms]"
          title="Online"
          value={<span className="text-ok">{online}</span>}
          icon={<Activity className="h-5 w-5 text-ok" />}
          accentClassName="bg-ok/10"
        />
        <MetricCard
          className="animate-fade-up [animation-delay:120ms]"
          title="Offline"
          value={<span className="text-bad">{offline}</span>}
          icon={<AlertTriangle className="h-5 w-5 text-bad" />}
          accentClassName="bg-bad/10"
        />
        <MetricCard
          className="animate-fade-up [animation-delay:160ms]"
          title="Atualizacao"
          value={
            <span className="text-sm font-medium sm:text-base">
              {new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          }
          icon={<Thermometer className="h-5 w-5 text-[hsl(var(--accent-2))]" />}
          accentClassName="bg-[hsl(var(--accent-2))/0.12]"
        />
      </section>

      <div id="contas-modulos" className="scroll-mt-28">
        <CommercialReadinessPanel
        clientId={scopedClientId}
        authToken={authToken}
        currentUser={user}
        devices={devices}
        clientModules={clientModules}
        />
      </div>

      <OperationalActivityPanel
        clientId={scopedClientId}
        authToken={authToken}
        devices={devices}
        clientModules={clientModules}
      />

      <Panel className="animate-fade-up p-4 [animation-delay:220ms] sm:p-5">
        <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Operacao
            </p>
            <h2 className="mt-1 text-xl font-semibold">Resumo operacional</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Visualize o estado atual da frota, ajuste configuracoes do device e
              abra o historico sem sair da tela principal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge>clientId: {scopedClientId ?? 'todos'}</Badge>
            <Button
              onClick={() => {
                void refetch();
              }}
              variant="secondary"
              className="px-3 py-2.5"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            {canCreateDevices ? (
              <Button
                onClick={() => {
                  setEditingDeviceId(null);
                  setFormMode((current) =>
                    current === 'create' ? 'closed' : 'create',
                  );
                }}
                variant="primary"
                className="px-4 py-2.5"
              >
                {formMode === 'create' ? 'Fechar cadastro' : 'Novo device'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : null}
          </div>
        </div>

        {formMode === 'create' && temperatureEnabled && canCreateDevices ? (
          <div className="mb-5">
            <DeviceForm
              mode="create"
              clientId={scopedClientId}
              loading={createMutation.isPending}
              allowStructureFields
              allowTemperatureFields
              onCancel={() => setFormMode('closed')}
              onSubmit={async (values) => {
                await createMutation.mutateAsync({
                  ...values,
                  clientId: values.clientId ?? scopedClientId,
                });
                setFormMode('closed');
              }}
            />
          </div>
        ) : null}

        {formMode === 'edit' &&
        editingDevice &&
        temperatureEnabled &&
        canEditDeviceTemperature ? (
          <div className="mb-5">
            <DeviceForm
              mode="edit"
              clientId={scopedClientId}
              device={editingDevice}
              loading={updateMutation.isPending}
              allowStructureFields={canEditDeviceStructure}
              allowTemperatureFields={canEditDeviceTemperature}
              onCancel={() => {
                setEditingDeviceId(null);
                setFormMode('closed');
              }}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync({
                  id: editingDevice.id,
                  payload: {
                    clientId: values.clientId,
                    name: values.name,
                    location: values.location,
                    minTemperature: values.minTemperature,
                    maxTemperature: values.maxTemperature,
                  },
                });
                setEditingDeviceId(null);
                setFormMode('closed');
              }}
            />
          </div>
        ) : null}

        {createMutation.isError ||
        updateMutation.isError ||
        deleteMutation.isError ? (
          <Feedback variant="danger" className="mb-3">
            {createMutation.error?.message ??
              updateMutation.error?.message ??
              deleteMutation.error?.message ??
              'Erro ao salvar alteracoes do device. Verifique os dados e tente novamente.'}
          </Feedback>
        ) : null}

        {isLoading ? <Feedback>Carregando...</Feedback> : null}
        {isError && devices.length === 0 ? (
          <Feedback variant="danger">
            {error?.message ?? 'Erro ao carregar dispositivos.'}
          </Feedback>
        ) : null}
        {isError && devices.length > 0 ? (
          <Feedback className="mb-3">
            Falha momentanea ao atualizar dispositivos. Exibindo os ultimos dados
            carregados.
          </Feedback>
        ) : null}

        {!isLoading && temperatureEnabled && devices.length > 0 ? (
          <div className="space-y-4">
            <DataTableWrapper>
              <DataTable>
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Temperatura</th>
                    <th>Faixa</th>
                    <th>Ultima leitura</th>
                    <th className="text-right">Acoes</th>
                    <th className="text-right">Historico</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map((device) => (
                    <tr
                      key={device.id}
                      className={
                        isTemperatureOutOfRange(
                          device.lastTemperature,
                          device.minTemperature,
                          device.maxTemperature,
                        )
                          ? 'bg-bad/5'
                          : undefined
                      }
                    >
                      <td className="font-medium">
                        <div className="flex flex-col">
                          <span>{device.name ?? device.id}</span>
                          <span className="text-xs text-muted">{device.id}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs ${statusClass(device.isOffline)}`}
                        >
                          {device.isOffline ? 'Offline' : 'Online'}
                        </span>
                      </td>
                      <td>
                        {device.lastTemperature != null ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                isTemperatureOutOfRange(
                                  device.lastTemperature,
                                  device.minTemperature,
                                  device.maxTemperature,
                                )
                                  ? 'font-semibold text-bad'
                                  : undefined
                              }
                            >
                              {device.lastTemperature.toFixed(1)} C
                            </span>
                            {isTemperatureOutOfRange(
                              device.lastTemperature,
                              device.minTemperature,
                              device.maxTemperature,
                            ) ? (
                              <Badge variant="danger">Alerta</Badge>
                            ) : null}
                          </div>
                        ) : (
                          'Sem dados'
                        )}
                      </td>
                      <td className="text-muted">
                        {device.minTemperature != null ||
                        device.maxTemperature != null
                          ? `${device.minTemperature ?? '-'} / ${device.maxTemperature ?? '-'}`
                          : 'Nao configurada'}
                      </td>
                      <td className="text-muted">
                        {device.lastReadingAt
                          ? formatDistanceToNow(
                              new Date(device.lastReadingAt),
                              {
                                addSuffix: true,
                                locale: ptBR,
                              },
                            )
                          : 'Sem leitura'}
                      </td>
                      <td className="text-right">
                        <div className="inline-flex items-center gap-2">
                          {canEditDeviceTemperature ? (
                            <Button
                              onClick={() => {
                                setEditingDeviceId(device.id);
                                setFormMode('edit');
                              }}
                              variant="secondary"
                              size="sm"
                            >
                              {canEditDeviceStructure ? 'Editar' : 'Faixa'}
                            </Button>
                          ) : null}
                          {canCreateDevices ? (
                            <Button
                              onClick={() => {
                                setPendingDeleteDeviceId(device.id);
                              }}
                              variant="danger"
                              size="sm"
                              loading={deletingDeviceId === device.id}
                              disabled={
                                deleteMutation.isPending &&
                                deletingDeviceId !== device.id
                              }
                            >
                              {deletingDeviceId === device.id
                                ? 'Excluindo...'
                                : 'Excluir'}
                            </Button>
                          ) : null}
                        </div>
                      </td>
                      <td className="text-right">
                        <Button
                          onClick={() => {
                            setSelectedDeviceId((current) =>
                              current === device.id ? null : device.id,
                            );
                          }}
                          variant="secondary"
                          size="sm"
                        >
                          {selectedDeviceId === device.id
                            ? 'Fechar'
                            : 'Ver grafico'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </DataTable>
            </DataTableWrapper>

            {selectedDevice ? (
              <DeviceHistoryPanel
                device={selectedDevice}
                clientId={scopedClientId}
                authToken={authToken}
              />
            ) : null}
          </div>
        ) : null}
        {!isLoading && !isError && temperatureEnabled && devices.length === 0 ? (
          <SetupGuideCard
            eyebrow="Primeiros passos"
            title="Seu modulo de temperatura ainda nao tem devices"
            description="Este cliente ja pode comecar a operar. O proximo passo e cadastrar pelo menos um equipamento e movimentar leituras para validar historico, offline e alertas."
            steps={[
              {
                title: 'Cadastrar o primeiro device',
                description: 'Informe um ID unico, um nome amigavel e a faixa minima e maxima de temperatura.',
              },
              {
                title: 'Enviar leituras ou usar o laboratorio',
                description: 'Movimente dados com simulacao para ver online, offline, historico e destaque visual no dashboard.',
              },
              {
                title: 'Criar regra de alerta',
                description: 'Depois do primeiro device, configure cooldown e tolerancia para operacao real.',
              },
            ]}
            primaryActionLabel={canCreateDevices ? 'Cadastrar primeiro device' : undefined}
            onPrimaryAction={
              canCreateDevices
                ? () => {
                    setEditingDeviceId(null);
                    setFormMode('create');
                  }
                : undefined
            }
            secondaryHref="/lab"
            secondaryLabel="Abrir laboratorio"
          />
        ) : null}
        {!isLoadingClientModules && !temperatureEnabled ? (
          <Feedback>
            O modulo `temperatura` nao esta habilitado para este cliente.
          </Feedback>
        ) : null}
      </Panel>

      {temperatureEnabled ? (
        <div className="mt-6">
          <AlertRulesPanel
            clientId={scopedClientId}
            authToken={authToken}
            devices={devices}
            canManageRules={canManageAlertRules}
            blockedReason="Seu perfil pode monitorar as regras, mas a alteracao fica restrita a administradores."
            onCreateDevice={() => {
              setEditingDeviceId(null);
              setFormMode('create');
            }}
          />
        </div>
      ) : scopedClientId ? (
        <div className="mt-6">
          <AccessNotice
            title="Modulo temperatura indisponivel"
            description="Este cliente nao contratou o modulo de temperatura, por isso devices, leituras e regras ficam bloqueados nesta conta."
            badge="nao contratado"
            hint="Habilite o modulo no painel de contratacao para liberar devices, historico e alertas."
          />
        </div>
      ) : null}

      {actuationEnabled ? (
        <div className="mt-6">
          <ActuationPanel
            clientId={scopedClientId}
            authToken={authToken}
            devices={devices}
            canManageCommands={canManageActuatorCommands}
            canManageStructure={canManageActuatorStructure}
            canManageSchedules={canManageActuatorSchedules}
            onCreateDevice={() => {
              setEditingDeviceId(null);
              setFormMode('create');
            }}
          />
        </div>
      ) : (
        <div className="mt-6">
          <AccessNotice
            title="Modulo acionamento indisponivel"
            description="O cliente atual ainda nao contratou o modulo de acionamento, entao o controle manual de cargas permanece bloqueado."
            badge="nao contratado"
            hint="Quando o modulo for habilitado, este bloco libera cadastro de atuadores, comandos e historico operacional."
          />
        </div>
      )}

      <div className="mt-6">
        <ClientProfilePanel
          clientId={scopedClientId}
          authToken={authToken}
          currentUser={user}
          canManage={canManageClientProfile}
          blockedReason={
            scopedClientId
              ? 'Somente o administrador da plataforma pode alterar o cadastro comercial do cliente.'
              : 'Defina um clientId para revisar o perfil comercial da conta.'
          }
        />
      </div>

      <div className="mt-6">
        <UsersPanel
          clientId={scopedClientId}
          authToken={authToken}
          currentUser={user}
          canManage={canManageUsers}
          blockedReason={
            scopedClientId
              ? 'Somente o administrador da plataforma pode gerenciar acessos deste cliente nesta fase.'
              : 'Defina um clientId para administrar os usuarios de uma conta especifica.'
          }
        />
      </div>

      <div className="mt-6">
        <ClientModulesPanel
          clientId={scopedClientId}
          authToken={authToken}
          currentUser={user}
          canManage={canManageClientModules}
          blockedReason={
            scopedClientId
              ? 'Somente o administrador da plataforma pode alterar os modulos contratados deste cliente.'
              : 'Defina um clientId para revisar e ajustar a contratacao modular.'
          }
        />
      </div>

      <div className="mt-6">
        <SimulationLabPanel clientId={scopedClientId} />
      </div>

      <div id="auditoria" className="scroll-mt-28">
        <AuditLogPanel
        clientId={scopedClientId}
        authToken={authToken}
        currentUser={user}
        canView={isAdmin}
        />
      </div>

      </div>
    </main>
  );
}
