import {
  Bot,
  Gauge,
  type LucideIcon,
  Power,
  Thermometer,
  Waves,
  Workflow,
} from 'lucide-react';

export type Product = {
  slug: string;
  title: string;
  shortLabel: string;
  category: string;
  subtitle: string;
  summary: string;
  cardDescription: string;
  image: string;
  icon: LucideIcon;
  bullets: string[];
  deliverables: string[];
  segments: string[];
  detailIntro: string;
};

export const products: Product[] = [
  {
    slug: 'atendente-ia',
    title: 'Assistente de IA',
    shortLabel: 'Atendimento com IA',
    category: 'Automação com IA',
    subtitle:
      'Assistente de IA no WhatsApp para responder, qualificar, acompanhar, agendar quando o módulo estiver ativo e encaminhar clientes.',
    summary:
      'Atenda 24 horas, responda com base nas informações da sua empresa, identifique oportunidades, faça follow-up e transfira para uma pessoa quando necessário. Operações com horário marcado podem adicionar o módulo Agenda.',
    cardDescription:
      'Uma operação de atendimento com IA para transformar conversas em próximos passos sem deixar o cliente esperando.',
    image: '/solucoes/atendente-ia.svg',
    icon: Bot,
    bullets: [
      'Atendimento e qualificação no WhatsApp',
      'Follow-up e transferência humana',
      'Agenda integrada como módulo opcional',
    ],
    deliverables: [
      'Assistente de IA configurado para o seu negócio',
      'Base de conhecimento da empresa',
      'Qualificação de interessados',
      'Follow-up automático',
      'Transferência para atendimento humano',
      'Painel Administrativo de contatos, uso e resultados',
      'Módulo Agenda opcional conforme escopo',
    ],
    segments: [
      'Clínicas, consultórios e odontologia',
      'Estética, salões e serviços com horário marcado',
      'Escritórios e prestadores de serviço',
      'Comércio e empresas que atendem pelo WhatsApp',
    ],
    detailIntro:
      'O Assistente de IA da Virtuagil organiza o primeiro atendimento, responde dúvidas, identifica interesse, acompanha oportunidades e pode conectar a conversa à agenda da operação quando esse módulo estiver ativado.',
  },
  {
    slug: 'automacao-processos',
    title: 'Automação de Processos',
    shortLabel: 'Soluções sob medida',
    category: 'Integrações e fluxos',
    subtitle:
      'Integre sistemas e elimine tarefas repetitivas com fluxos desenhados para a sua operação',
    summary:
      'Conectamos ferramentas, APIs e rotinas para reduzir trabalho manual, erros e tempo gasto em processos repetitivos.',
    cardDescription:
      'Automações personalizadas para fazer sistemas conversarem e transformar tarefas manuais em fluxos confiáveis.',
    image: '/solucoes/automacao-processos.svg',
    icon: Workflow,
    bullets: [
      'Integração entre sistemas e APIs',
      'Rotinas e notificações automáticas',
      'Projetos adaptados ao processo real',
    ],
    deliverables: [
      'Mapeamento do processo',
      'Integração entre sistemas e APIs',
      'Automação de tarefas repetitivas',
      'Notificações e gatilhos automáticos',
      'Fluxos personalizados para a operação',
    ],
    segments: [
      'Pequenas e médias empresas',
      'Equipes administrativas e comerciais',
      'Negócios com sistemas desconectados',
      'Operações com tarefas manuais recorrentes',
    ],
    detailIntro:
      'A Virtuagil cria automações sob medida para conectar ferramentas e transformar rotinas repetitivas em processos mais rápidos, rastreáveis e eficientes.',
  },
  {
    slug: 'temperatura',
    title: 'Temperatura',
    shortLabel: 'Monitoramento IoT',
    category: 'IoT',
    subtitle: 'Monitoramento de equipamentos refrigerados com histórico e alertas',
    summary:
      'Proteja o que não pode sair da faixa ideal com histórico, alertas e acompanhamento contínuo.',
    cardDescription:
      'Ideal para freezers, geladeiras e pontos refrigerados críticos que exigem resposta rápida.',
    image: '/solucoes/temperatura.jpg',
    icon: Thermometer,
    bullets: [
      'Alertas objetivos no momento certo',
      'Histórico claro por equipamento',
      'Mais segurança para operação e equipe',
    ],
    deliverables: [
      'Monitoramento contínuo de temperatura',
      'Histórico de leituras por equipamento',
      'Alerta de desvio de faixa',
      'Alerta de equipamento offline',
      'Painel de acompanhamento',
    ],
    segments: [
      'Restaurantes',
      'Clínicas pequenas',
      'Laboratórios pequenos',
      'Operações com refrigeração crítica',
    ],
    detailIntro:
      'O módulo Temperatura é uma porta de entrada para operações que não podem descobrir tarde demais que houve uma falha.',
  },
  {
    slug: 'acionamento',
    title: 'Acionamento',
    shortLabel: 'Automação IoT',
    category: 'IoT',
    subtitle: 'Controle operacional por etapas com mais rastreabilidade',
    summary:
      'Comandos e rotinas para agir com rapidez, menos improviso e mais controle do que foi feito.',
    cardDescription:
      'Um módulo para padronizar resposta operacional e reduzir dependência de memória ou improviso.',
    image: '/solucoes/acionamento.jpg',
    icon: Power,
    bullets: ['Acionamentos registrados', 'Mais padrão na rotina', 'Base para automações futuras'],
    deliverables: [
      'Controle de acionamentos',
      'Registro de comandos executados',
      'Rotinas operacionais mais firmes',
      'Mais clareza sobre quem fez o que',
      'Base para automações futuras',
    ],
    segments: [
      'Operações comerciais',
      'Reservatórios e bombas',
      'Utilidades',
      'Processos com resposta operacional recorrente',
    ],
    detailIntro:
      'O módulo Acionamento amplia a capacidade da operação de agir rápido e com mais previsibilidade, transformando rotina em processo controlado.',
  },
  {
    slug: 'consumo',
    title: 'Consumo',
    shortLabel: 'Monitoramento IoT',
    category: 'IoT',
    subtitle: 'Mais visibilidade para consumo, anomalias e eficiência',
    summary:
      'Leitura elétrica para enxergar desperdícios, prever manutenção e apoiar decisões com mais clareza.',
    cardDescription:
      'Uma camada para operações que precisam entender melhor corrente, tensão e consumo.',
    image: '/solucoes/consumo.webp',
    icon: Gauge,
    bullets: ['Corrente, tensão e consumo', 'Diagnóstico mais profundo', 'Mais previsibilidade'],
    deliverables: [
      'Monitoramento de consumo',
      'Leitura de corrente e tensão',
      'Mais visibilidade sobre anomalias',
      'Base para eficiência energética',
      'Apoio à manutenção e decisão',
    ],
    segments: [
      'Operações com alto custo energético',
      'Empresas com manutenção recorrente',
      'Negócios com foco em eficiência',
      'Clientes que buscam gestão mais profunda',
    ],
    detailIntro:
      'O módulo Consumo entra como expansão natural para clientes que querem ir além do monitoramento básico e buscar uma leitura mais gerencial da operação.',
  },
  {
    slug: 'gases',
    title: 'Gases',
    shortLabel: 'Monitoramento IoT',
    category: 'IoT',
    subtitle: 'Monitoramento de ambiente e utilidades com mais previsibilidade',
    summary:
      'Monitore ambiente e utilidades com uma camada extra de visibilidade para operações sensíveis.',
    cardDescription:
      'Ajuda a acompanhar variações importantes em ambientes que exigem mais atenção com risco e estabilidade.',
    image: '/solucoes/gases.jpg',
    icon: Waves,
    bullets: [
      'Mais visibilidade operacional',
      'Sinais de risco mais cedo',
      'Monitoramento simples de ambiente',
    ],
    deliverables: [
      'Leitura ambiental complementar',
      'Mais previsibilidade para utilidades',
      'Sinais antecipados de variação',
      'Melhor apoio a ambientes sensíveis',
      'Expansão natural do módulo ambiental',
    ],
    segments: [
      'Ambientes sensíveis',
      'Operações com utilidades críticas',
      'Clínicas e laboratórios',
      'Negócios que precisam ampliar monitoramento ambiental',
    ],
    detailIntro:
      'O módulo Gases expande a capacidade ambiental da Virtuagil para operações que precisam acompanhar mais do que temperatura e ganhar sinais antecipados de risco.',
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
