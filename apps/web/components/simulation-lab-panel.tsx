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
import { ClientSummary } from '@/types/client';

type SimulationLabPanelProps = {
  clientId?: string;
  client?: ClientSummary;
};

type Scenario = {
  title: string;
  description: string;
  command: string;
  badge?: string;
  scope?: 'production' | 'local';
};

type DemoStep = {
  title: string;
  description: string;
  icon: typeof MapPinned;
};

function resolveSimulationDevices(clientId?: string) {
  if (clientId === 'cuidare-vacinas') {
    return 'freezer_vacinas_01';
  }

  return 'freezer_01,freezer_02';
}

export function SimulationLabPanel({ clientId, client }: SimulationLabPanelProps) {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const suffix = clientId ? ` --client-id ${clientId}` : '';
  const demoTenant = client?.name ?? clientId ?? 'conta-demo';
  const simulatorUrl = 'https://api-monitor.virtuagil.com.br';
  const simulatorDevices = resolveSimulationDevices(clientId);
  const simulatorApiKey = client?.deviceApiKey ?? null;
  const simulatorApiKeyPlaceholder = 'SUA_CHAVE_DEVICE';

  const demoSteps: DemoStep[] = [
    {
      title: '1. Entrar no cliente certo',
      description:
        `Comece filtrando o painel para a conta em foco (${demoTenant}) e revise o estado comercial do cliente.`,
      icon: MapPinned,
    },
    {
      title: '2. Mostrar operacao normal',
      description:
        'Use o cenario baseline para preencher historico, deixar equipamentos online e apresentar a operacao em estado saudavel.',
      icon: Eye,
    },
    {
      title: '3. Simular evento real',
      description:
        'Rode um pre-alerta ou um cenario critico para mostrar como o painel evidencia risco e como a equipe reagiria.',
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
        'Mantem freezers operando dentro da faixa esperada para validar painel e historico.',
      command: `npm run simulate:iot -- --devices ${simulatorDevices} --preset normal --url ${simulatorUrl}${suffix} --api-key ${simulatorApiKeyPlaceholder}`,
      badge: 'baseline',
      scope: 'production',
    },
    {
      title: 'Pre-alerta',
      description:
        'Aproxima as leituras do limite superior para conferir comportamento visual antes do disparo.',
      command: `npm run simulate:iot -- --devices ${simulatorDevices} --preset alerta --url ${simulatorUrl}${suffix} --api-key ${simulatorApiKeyPlaceholder}`,
      badge: 'alerta',
      scope: 'production',
    },
    {
      title: 'Cenario critico',
      description:
        'Gera valores fora da faixa para testar alerta de temperatura e resposta operacional.',
      command: `npm run simulate:iot -- --devices ${simulatorDevices} --preset critico --url ${simulatorUrl}${suffix} --api-key ${simulatorApiKeyPlaceholder}`,
      badge: 'critico',
      scope: 'production',
    },
    {
      title: 'Ensaio de offline',
      description:
        'Envia poucas leituras normais e depois para, para deixar o equipamento sem comunicar e validar o alerta de offline.',
      command: `npm run simulate:iot -- --devices ${simulatorDevices} --preset normal --count 3 --url ${simulatorUrl}${suffix} --api-key ${simulatorApiKeyPlaceholder}`,
      badge: 'offline',
      scope: 'production',
    },
    {
      title: 'Popular base demo',
      description:
        'Cria clientes, equipamentos, regras, atuadores demo e historicos iniciais sem hardware real.',
      command: 'npm run db:seed',
      badge: 'seed',
      scope: 'local',
    },
    {
      title: 'Verificar migration',
      description:
        'Confirma se a migration do modulo de acionamento entrou no banco configurado.',
      command: 'npm run db:verify-actuation',
      badge: 'schema',
      scope: 'local',
    },
    {
      title: 'Cadastrar atuador',
      description:
        'Cria um ponto de acionamento manual no ambiente de producao (requer token de sessao).',
      command: `curl -X POST ${simulatorUrl}/actuators -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN_ADMIN" -d "{\\"id\\":\\"sauna_main\\",\\"clientId\\":\\"${clientId ?? 'virtuagil'}\\",\\"name\\":\\"Sauna principal\\"}"`,
      badge: 'acionamento',
      scope: 'production',
    },
    {
      title: 'Enviar comando ON',
      description:
        'Liga a carga pela API em producao para testar painel e historico do atuador.',
      command:
        `curl -X POST ${simulatorUrl}/actuators/sauna_main/commands -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN_ADMIN" -d "{\\"desiredState\\":\\"on\\",\\"source\\":\\"lab\\"}"`,
      badge: 'manual',
      scope: 'production',
    },
    {
      title: 'Enviar comando OFF',
      description:
        'Desliga a carga pela API em producao para validar transicao de estado e novo item no historico.',
      command:
        `curl -X POST ${simulatorUrl}/actuators/sauna_main/commands -H "Content-Type: application/json" -H "Authorization: Bearer SEU_TOKEN_ADMIN" -d "{\\"desiredState\\":\\"off\\",\\"source\\":\\"lab\\"}"`,
      badge: 'manual',
      scope: 'production',
    },
    {
      title: 'Listar atuadores',
      description:
        'Consulta os pontos de acionamento do cliente atual em producao.',
      command: `curl "${simulatorUrl}/actuators?clientId=${clientId ?? 'virtuagil'}" -H "Authorization: Bearer SEU_TOKEN_ADMIN"`,
      badge: 'consulta',
      scope: 'production',
    },
    {
      title: 'Historico do acionamento',
      description:
        'Busca os ultimos comandos emitidos para um ponto de acionamento especifico em producao.',
      command: `curl ${simulatorUrl}/actuators/sauna_main/commands -H "Authorization: Bearer SEU_TOKEN_ADMIN"`,
      badge: 'log',
      scope: 'production',
    },
  ];

  function resolveCommandForCopy(command: string, injectDeviceKey: boolean) {
    if (!injectDeviceKey || !simulatorApiKey) return command;
    return command.replaceAll(simulatorApiKeyPlaceholder, simulatorApiKey);
  }

  async function copyCommand(command: string, injectDeviceKey = false) {
    const nextCommand = resolveCommandForCopy(command, injectDeviceKey);

    try {
      await navigator.clipboard.writeText(nextCommand);
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
            Estes comandos ajudam a ensaiar a operacao antes da chegada dos
            sensores e placas, como se o cliente ja estivesse em implantacao.
          </p>
          {client?.name ? (
            <p className="mt-2 text-xs text-muted">
              Conta atual no roteiro: {client.name} ({client.id}).
            </p>
          ) : null}
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
            percorrer as telas e observar onde a experiencia ainda precisa evoluir.
          </p>
          <p className="mt-2 max-w-2xl text-xs text-muted">
            Nos cenarios remotos da conta em foco, o laboratorio prioriza a
            simulacao real e evita o `--ensure-devices`, porque esse passo
            estrutural exige autenticacao administrativa e gera ruido desnecessario
            na demonstracao.
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
              {client?.notes ? (
                <p className="mt-2 text-xs text-muted">
                  Contexto da conta: {client.notes}
                </p>
              ) : null}
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
              {client?.adminName ? (
                <p className="mt-2 text-xs text-muted">
                  Responsavel previsto na conta: {client.adminName}.
                </p>
              ) : null}
            </div>
          </div>
        </Panel>
      </div>

      <Panel className="mb-5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-accent" />
          <h3 className="text-base font-semibold">Evidencias para fechar venda</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3 text-sm text-muted">
            <p className="font-medium text-ink">Temperatura</p>
            <p className="mt-2">1. Print do painel com regra ativa e equipamento online.</p>
            <p>2. Execucao do workflow no n8n com sucesso.</p>
            <p>3. Mensagem no WhatsApp com horario anotado.</p>
          </div>
          <div className="rounded-2xl border border-line/70 bg-bg/30 p-3 text-sm text-muted">
            <p className="font-medium text-ink">Acionamento</p>
            <p className="mt-2">1. Cadastro do ponto de acionamento.</p>
            <p>2. Comando ON e OFF registrados no historico.</p>
            <p>3. Leitura do estado no painel apos os comandos.</p>
          </div>
        </div>
      </Panel>

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
              <div className="flex items-center gap-2">
                {scenario.scope === 'production' ? (
                  <Badge variant="success">producao</Badge>
                ) : null}
                {scenario.scope === 'local' ? <Badge>local</Badge> : null}
                {scenario.badge ? <Badge>{scenario.badge}</Badge> : null}
              </div>
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
                    ? simulatorApiKey
                      ? 'A chave fica protegida na tela. Use "Copiar com chave" para enviar ao terminal.'
                      : 'Ajuste `SUA_CHAVE_DEVICE` antes de executar.'
                    : scenario.command.includes('SEU_TOKEN_ADMIN')
                      ? 'Use token de admin da conta antes de executar em producao.'
                    : scenario.badge === 'offline'
                      ? 'Depois do ultimo envio, aguarde o cutoff de offline para confirmar o alerta no painel e no WhatsApp.'
                      : scenario.scope === 'local'
                        ? 'Comando de manutencao local (nao usar durante visita comercial em producao).'
                      : 'Pronto para testar no terminal local.'}
                </span>
              )}

              <div className="flex items-center gap-2">
                {scenario.command.includes(simulatorApiKeyPlaceholder) && simulatorApiKey ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      void copyCommand(scenario.command, true);
                    }}
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copiar com chave
                  </Button>
                ) : null}
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
            </div>
          </Panel>
        ))}
      </div>
    </Panel>
  );
}
