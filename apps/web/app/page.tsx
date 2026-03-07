'use client';

import { Activity, AlertTriangle, Snowflake, Thermometer } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Image from 'next/image';
import { useDevices } from '@/hooks/use-devices';

function statusClass(isOffline: boolean) {
  return isOffline
    ? 'bg-bad/10 text-bad border-bad/20'
    : 'bg-ok/10 text-ok border-ok/20';
}

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDevices(undefined, 50);
  const devices = data ?? [];

  const online = devices.filter((d) => !d.isOffline).length;
  const offline = devices.filter((d) => d.isOffline).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="mb-6 flex items-center gap-4">
        <div className="glass rounded-2xl border px-3 py-2">
          <Image
            src="/brand/virtuagil_logo_low.png"
            alt="Virtuagil"
            width={146}
            height={42}
            priority
          />
        </div>
        <div>
          <p className="text-sm text-muted">Plataforma de monitoramento</p>
          <h1 className="text-xl font-semibold tracking-tight">
            Dashboard de Dispositivos
          </h1>
        </div>
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass animate-fade-up rounded-2xl border p-5 shadow-lift">
          <p className="mb-2 text-sm text-muted">Dispositivos</p>
          <p className="text-3xl font-semibold">{devices.length}</p>
          <Snowflake className="mt-3 h-4 w-4 text-accent" />
        </div>
        <div className="glass animate-fade-up rounded-2xl border p-5 shadow-lift [animation-delay:80ms]">
          <p className="mb-2 text-sm text-muted">Online</p>
          <p className="text-3xl font-semibold text-ok">{online}</p>
          <Activity className="mt-3 h-4 w-4 text-ok" />
        </div>
        <div className="glass animate-fade-up rounded-2xl border p-5 shadow-lift [animation-delay:120ms]">
          <p className="mb-2 text-sm text-muted">Offline</p>
          <p className="text-3xl font-semibold text-bad">{offline}</p>
          <AlertTriangle className="mt-3 h-4 w-4 text-bad" />
        </div>
        <div className="glass animate-fade-up rounded-2xl border p-5 shadow-lift [animation-delay:160ms]">
          <p className="mb-2 text-sm text-muted">Atualizacao</p>
          <p className="text-sm font-medium">
            {new Date().toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <Thermometer className="mt-3 h-4 w-4 text-accent" />
        </div>
      </section>

      <section className="glass animate-fade-up rounded-2xl border p-4 shadow-lift [animation-delay:220ms]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Resumo operacional</h2>
          <button
            onClick={() => {
              void refetch();
            }}
            className="rounded-lg border border-line bg-card/80 px-3 py-2 text-sm font-medium hover:bg-card"
          >
            Atualizar
          </button>
        </div>

        {isLoading ? <p className="text-sm text-muted">Carregando...</p> : null}
        {isError ? (
          <p className="text-sm text-bad">Erro ao carregar dispositivos.</p>
        ) : null}

        {!isLoading && !isError ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2 text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="px-3 py-2">Device</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Temperatura</th>
                  <th className="px-3 py-2">Faixa</th>
                  <th className="px-3 py-2">Ultima leitura</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="rounded-xl border bg-card/70">
                    <td className="px-3 py-3 font-medium">
                      {device.name ?? device.id}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full border px-2 py-1 text-xs ${statusClass(device.isOffline)}`}
                      >
                        {device.isOffline ? 'Offline' : 'Online'}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {device.lastTemperature != null
                        ? `${device.lastTemperature.toFixed(1)} �C`
                        : 'Sem dados'}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {device.minTemperature != null ||
                      device.maxTemperature != null
                        ? `${device.minTemperature ?? '-'} / ${device.maxTemperature ?? '-'}`
                        : 'Nao configurada'}
                    </td>
                    <td className="px-3 py-3 text-muted">
                      {device.lastReadingAt
                        ? formatDistanceToNow(new Date(device.lastReadingAt), {
                            addSuffix: true,
                            locale: ptBR,
                          })
                        : 'Sem leitura'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}
