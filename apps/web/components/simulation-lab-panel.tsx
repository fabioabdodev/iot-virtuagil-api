'use client';

import { useState } from 'react';
import {
  Copy,
  Eye,
  MapPinned,
  PlayCircle,
  ShieldAlert,
  TerminalSquare,
  WandSparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';

type SimulationLabPanelProps = {
  clientId?: string;
};

type Scenario = {
  title: string;
  description: string;
  command: string;
  badge?: string;
};

type DemoStep = {
  title: string;
  description: string;
  icon: typeof MapPinned;
};

export function SimulationLabPanel({ clientId }: SimulationLabPanelProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const suffix = clientId ? ` --client-id ${clientId}` : '';
  const demoTenant = clientId ?? 'tenant-demo';

  const demoSteps: DemoStep[] = [
    {
      title: '1. Entrar no tenant certo',
      description:
        `Comece filtrando o dashboard para o tenant atual (${demoTenant}) e revise o estado comercial da conta.`,
      icon: MapPinned,
    },
    {
      title: '2. Mostrar operacao normal',
      description:
        'Use o cenario baseline para preencher historico, deixar devices online e apresentar a operacao em estado saudavel.',
      icon: Eye,
    },
    {
      title: '3. Simular evento real',
      description:
        'Rode um pre-alerta ou um cenario critico para mostrar como o dashboard evidencia risco e como a equipe reagiria.',
      icon: ShieldAlert,
    },
    {
      title: '4. Fechar com proximo passo',
      description:
        'Depois da simulacao, alinhe o que ja esta pronto na plataforma e o que fica para a instalacao fisica quando o hardware chegar.',
      icon: PlayCircle,
    },
  ];

  const scenarios: Scenario[] = [
    {
      title: 'Carga normal',
      description:
        'Mantem freezers operando dentro da faixa esperada para validar dashboard e historico.',
      command: `npm run simulate:iot -- --devices freezer_01,freezer_02 --preset normal --ensure-devices${suffix} --api-key SUA_CHAVE`,
      badge: 'baseline',
    },
    {
      title: 'Pre-alerta',
      description:
        'Aproxima as leituras do limite superior para conferir comportamento visual antes do disparo.',
      command: `npm run simulate:iot -- --devices freezer_01,freezer_02 --preset alerta --ensure-devices${suffix} --api-key SUA_CHAVE`,
      badge: 'alerta',
    },
    {
      title: 'Cenario critico',
      description:
        'Gera valores fora da faixa para testar alerta de temperatura e resposta operacional.',
      command: `npm run simulate:iot -- --devices freezer_01,freezer_02 --preset critico --ensure-devices${suffix} --api-key SUA_CHAVE`,
      badge: 'critico',
    },
    {
      title: 'Popular base demo',
      description:
        'Cria clientes, devices, regras, atuadores demo e historicos iniciais sem hardware real.',
      command: 'npm run db:seed',
      badge: 'seed',
    },
    {
      title: 'Verificar migration',
      description:
        'Confirma se a migration do modulo de acionamento entrou no banco configurado.',
      command: 'npm run db:verify-actuation',
      badge: 'schema',
    },
    {
      title: 'Cadastrar atuador',
      description:
        'Cria um atuador manual para validar o modulo de acionamento sem rele fisico.',
      command: `curl -X POST http://localhost:3000/actuators -H "Content-Type: application/json" -d "{\\"id\\":\\"sauna_main\\",\\"clientId\\":\\"${clientId ?? 'virtuagil'}\\",\\"name\\":\\"Sauna principal\\"}"`,
      badge: 'acionamento',
    },
    {
      title: 'Enviar comando ON',
      description:
        'Liga ou desliga a carga pela API para testar dashboard e historico do atuador.',
      command:
        'curl -X POST http://localhost:3000/actuators/sauna_main/commands -H "Content-Type: application/json" -d "{\\"desiredState\\":\\"on\\",\\"source\\":\\"lab\\"}"',
      badge: 'manual',
    },
    {
      title: 'Enviar comando OFF',
      description:
        'Desliga a carga pela API para validar transicao de estado e novo item no historico.',
      command:
        'curl -X POST http://localhost:3000/actuators/sauna_main/commands -H "Content-Type: application/json" -d "{\\"desiredState\\":\\"off\\",\\"source\\":\\"lab\\"}"',
      badge: 'manual',
    },
    {
      title: 'Listar atuadores',
      description:
        'Consulta os atuadores do tenant atual para conferir seed, cadastro e estado operacional.',
      command: `curl "http://localhost:3000/actuators?clientId=${clientId ?? 'virtuagil'}"`,
      badge: 'consulta',
    },
    {
      title: 'Historico do atuador',
      description:
        'Busca os ultimos comandos emitidos para um atuador especifico.',
      command: 'curl http://localhost:3000/actuators/sauna_main/commands',
      badge: 'log',
    },
  ];

  async function copyCommand(command: string) {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(command);
      window.setTimeout(() => {
        setCopiedCommand((current) => (current === command ? null : current));
      }, 2000);
    } catch {
      setCopiedCommand(null);
    }
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:320ms]">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Laboratorio
          </p>
          <h2 className="mt-1 text-xl font-semibold">
            Simulacao e cenarios de teste
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Estes comandos foram montados para acelerar seus testes antes da
            chegada dos sensores e placas.
          </p>
        </div>

        <Badge>
          <WandSparkles className="h-3.5 w-3.5 text-[hsl(var(--accent-2))]" />
          Pronto para terminal
        </Badge>
      </div>

      <div className="mb-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Panel variant="strong" className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-accent" />
            <h3 className="text-base font-semibold">Roteiro de demonstracao</h3>
          </div>
          <p className="max-w-2xl text-sm text-muted">
            Use este fluxo quando quiser simular a chegada a um cliente real,
            navegar pelas telas e observar onde a UI ainda precisa evoluir.
          </p>

          <div className="mt-4 space-y-3">
            {demoSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-line/70 bg-bg/30 p-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl border border-line/70 bg-card/40 p-2">
                      <Icon className="h-4 w-4 text-[hsl(var(--accent-2))]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{step.title}</p>
                      <p className="mt-1 text-xs leading-6 text-muted">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <WandSparkles className="h-4 w-4 text-[hsl(var(--accent-2))]" />
            <h3 className="text-base font-semibold">Leitura esperada da visita</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                O que observar
              </p>
              <p className="mt-2 text-sm text-muted">
                Se a tela explica rapidamente o estado da conta, se o historico
                faz sentido para um cliente novo e se os alertas ficam claros sem
                depender de explicacao tecnica.
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                O que anotar
              </p>
              <p className="mt-2 text-sm text-muted">
                Onde a copy confunde, quais blocos ajudam na demonstracao, o que
                parece tecnico demais e quais passos do onboarding ainda pedem
                apoio manual.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {scenarios.map((scenario) => (
          <Panel
            key={scenario.title}
            variant="strong"
            className="flex h-full flex-col gap-4 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold">{scenario.title}</h3>
                <p className="mt-1 text-sm text-muted">{scenario.description}</p>
              </div>
              {scenario.badge ? <Badge>{scenario.badge}</Badge> : null}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line/70 bg-bg/40 p-4 font-mono text-xs leading-6 text-ink">
              <div className="mb-2 flex items-center gap-2 text-muted">
                <TerminalSquare className="h-4 w-4" />
                Comando
              </div>
              <code>{scenario.command}</code>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3">
              {copiedCommand === scenario.command ? (
                <Feedback variant="success" className="py-2 text-xs">
                  Comando copiado.
                </Feedback>
              ) : (
                <span className="text-xs text-muted">
                  {scenario.command.includes('SUA_CHAVE')
                    ? 'Ajuste `SUA_CHAVE` antes de executar.'
                    : 'Pronto para testar no terminal local.'}
                </span>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void copyCommand(scenario.command);
                }}
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                Copiar
              </Button>
            </div>
          </Panel>
        ))}
      </div>
    </Panel>
  );
}
