import Link from 'next/link';
import {
  ArrowLeft,
  CircleHelp,
  HardDriveDownload,
  Router,
  ShieldCheck,
  TerminalSquare,
  Workflow,
} from 'lucide-react';
import { SimulationLabPanel } from '@/components/simulation-lab-panel';
import { Badge } from '@/components/ui/badge';
import { Panel } from '@/components/ui/panel';

const troubleshootingItems = [
  {
    title: 'API nao responde',
    description:
      'Confirme se o backend esta rodando em localhost:3000 ou ajuste a URL do simulador.',
    command: 'npm run start:dev',
  },
  {
    title: 'Erro de autenticacao no ingest',
    description:
      'Revise DEVICE_API_KEY no .env e use o mesmo valor no simulador.',
    command: 'npm run simulate:iot -- --device freezer_01 --api-key SUA_CHAVE',
  },
  {
    title: 'Dashboard sem dados',
    description:
      'Popule a base e depois gere leituras com o simulador para aquecer o historico.',
    command: 'npm run db:seed',
  },
  {
    title: 'Sem devices cadastrados',
    description:
      'Use o modo ensure-devices para registrar os equipamentos automaticamente pela API.',
    command:
      'npm run simulate:iot -- --devices freezer_01,freezer_02 --preset normal --ensure-devices --api-key SUA_CHAVE',
  },
  {
    title: 'Modulo acionamento nao aparece',
    description:
      'Confirme se a migration foi aplicada e se o banco atual possui as tabelas do modulo.',
    command: 'npm run db:verify-actuation',
  },
];

const workflowSteps = [
  'Suba a API local com `npm run start:dev`.',
  'Opcionalmente rode `npm run db:seed` para carregar clientes e historico demo.',
  'Se estiver validando o banco atual, rode `npm run db:verify-actuation`.',
  'Use o simulador com `--ensure-devices` para criar os devices e iniciar a telemetria.',
  'Abra o dashboard principal e acompanhe cards, tabela e historico.',
  'Cadastre um atuador e teste comandos manuais de ligar/desligar no dashboard.',
  'Teste cenarios de alerta com presets `alerta` e `critico`.',
];

export default function LabPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <Panel variant="shell" className="mb-6 p-5 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge>
                <TerminalSquare className="h-3.5 w-3.5 text-accent" />
                Operacao assistida
              </Badge>
              <Badge>
                <Workflow className="h-3.5 w-3.5 text-[hsl(var(--accent-2))]" />
                Testes sem hardware
              </Badge>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              Laboratorio
            </p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight sm:text-4xl">
              Centro de simulacao, checklist e troubleshooting
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted sm:text-base">
              Esta pagina centraliza os passos de operacao enquanto os sensores
              IoT nao chegaram. Use os comandos prontos, valide a API e repita
              cenarios sem depender de memoria ou anotacoes soltas.
            </p>
          </div>

          <Link
            href="/"
            className="btn-secondary inline-flex items-center px-4 py-3 text-sm font-semibold"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao dashboard
          </Link>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <SimulationLabPanel />

          <Panel className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <HardDriveDownload className="h-5 w-5 text-accent" />
              <div>
                <h2 className="text-xl font-semibold">Fluxo recomendado</h2>
                <p className="text-sm text-muted">
                  Sequencia curta para sair do zero e validar o sistema.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {workflowSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-line/70 bg-card/40 px-4 py-3"
                >
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                    {index + 1}
                  </span>
                  <p className="text-sm text-ink">{step}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <CircleHelp className="h-5 w-5 text-[hsl(var(--accent-2))]" />
              <div>
                <h2 className="text-xl font-semibold">Troubleshooting</h2>
                <p className="text-sm text-muted">
                  Atalhos para os problemas mais provaveis.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {troubleshootingItems.map((item) => (
                <Panel
                  key={item.title}
                  variant="strong"
                  className="flex flex-col gap-3 p-4"
                >
                  <div>
                    <h3 className="text-base font-semibold">{item.title}</h3>
                    <p className="mt-1 text-sm text-muted">{item.description}</p>
                  </div>

                  <div className="rounded-2xl border border-line/70 bg-bg/40 p-4 font-mono text-xs leading-6 text-ink">
                    <code>{item.command}</code>
                  </div>
                </Panel>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="mb-5 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-ok" />
              <div>
                <h2 className="text-xl font-semibold">Boas praticas</h2>
                <p className="text-sm text-muted">
                  Ponto rapido de verificacao antes de testar.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-muted">
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                Garanta que `DEVICE_API_KEY` no `.env` seja o mesmo usado no
                simulador.
              </p>
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                Prefira `--ensure-devices` quando estiver preparando ambiente do
                zero.
              </p>
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                Antes de depurar o `acionamento`, rode `npm run db:verify-actuation`
                para confirmar schema e tabelas no banco atual.
              </p>
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                Use `preset alerta` e `preset critico` para validar regras e
                resposta visual do dashboard.
              </p>
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                No modulo `acionamento`, trate o estado do atuador como fluxo
                manual e simulado ate a chegada do hardware fisico.
              </p>
              <p className="rounded-2xl border border-line/70 bg-card/40 px-4 py-3">
                Quando o hardware chegar, reaproveite os mesmos fluxos para
                comparar leitura real versus simulada.
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </main>
  );
}
