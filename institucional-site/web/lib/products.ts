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
    title: 'Atendente IA',
    shortLabel: 'Inteligencia Artificial',
    category: 'Automacao com IA',
    subtitle: 'Atendimento inteligente no WhatsApp para responder, qualificar e acompanhar clientes',
    summary: 'Atenda 24 horas, responda com base nas informacoes da sua empresa, identifique oportunidades e transfira para uma pessoa quando necessario.',
    cardDescription: 'Uma operacao de atendimento completa para transformar conversas em oportunidades sem deixar o cliente esperando.',
    image: '/solucoes/atendente-ia.svg',
    icon: Bot,
    bullets: ['Atendimento 24 horas no WhatsApp', 'Qualificacao e follow-up automatico', 'Transferencia para atendimento humano'],
    deliverables: ['Atendente com IA configurado para o seu negocio', 'Base de conhecimento da empresa', 'Qualificacao de interessados', 'Follow-up automatico', 'Transferencia para atendimento humano', 'Dashboard de contatos, uso e resultados'],
    segments: ['Clinicas e consultorios', 'Escritorios e prestadores de servico', 'Comercio e lojas', 'Empresas que atendem e vendem pelo WhatsApp'],
    detailIntro: 'O Atendente IA da Virtuagil organiza o primeiro atendimento comercial, responde duvidas, identifica interesse e acompanha oportunidades para sua equipe dedicar tempo ao que realmente precisa de uma pessoa.',
  },
  {
    slug: 'automacao-processos',
    title: 'Automacao de Processos',
    shortLabel: 'Solucoes sob medida',
    category: 'Integracoes e fluxos',
    subtitle: 'Integre sistemas e elimine tarefas repetitivas com fluxos desenhados para a sua operacao',
    summary: 'Conectamos ferramentas, APIs e rotinas para reduzir trabalho manual, erros e tempo gasto em processos repetitivos.',
    cardDescription: 'Automacoes personalizadas para fazer sistemas conversarem e transformar tarefas manuais em fluxos confiaveis.',
    image: '/solucoes/automacao-processos.svg',
    icon: Workflow,
    bullets: ['Integracao entre sistemas e APIs', 'Rotinas e notificacoes automaticas', 'Projetos adaptados ao processo real'],
    deliverables: ['Mapeamento do processo', 'Integracao entre sistemas e APIs', 'Automacao de tarefas repetitivas', 'Notificacoes e gatilhos automaticos', 'Fluxos personalizados para a operacao'],
    segments: ['Pequenas e medias empresas', 'Equipes administrativas e comerciais', 'Negocios com sistemas desconectados', 'Operacoes com tarefas manuais recorrentes'],
    detailIntro: 'A Virtuagil cria automacoes sob medida para conectar ferramentas e transformar rotinas repetitivas em processos mais rapidos, rastreaveis e eficientes.',
  },
  {
    slug: 'temperatura', title: 'Temperatura', shortLabel: 'Monitoramento IoT', category: 'IoT', subtitle: 'Monitoramento de equipamentos refrigerados com historico e alertas', summary: 'Proteja o que nao pode sair da faixa ideal com historico, alertas e acompanhamento continuo.', cardDescription: 'Ideal para freezers, geladeiras e pontos refrigerados criticos que exigem resposta rapida.', image: '/solucoes/temperatura.jpg', icon: Thermometer, bullets: ['Alertas objetivos no momento certo', 'Historico claro por equipamento', 'Mais seguranca para operacao e equipe'], deliverables: ['Monitoramento continuo de temperatura', 'Historico de leituras por equipamento', 'Alerta de desvio de faixa', 'Alerta de equipamento offline', 'Painel de acompanhamento'], segments: ['Restaurantes', 'Clinicas pequenas', 'Laboratorios pequenos', 'Operacoes com refrigeracao critica'], detailIntro: 'O modulo Temperatura e uma porta de entrada para operacoes que nao podem descobrir tarde demais que houve uma falha.'
  },
  {
    slug: 'acionamento', title: 'Acionamento', shortLabel: 'Automacao IoT', category: 'IoT', subtitle: 'Controle operacional por etapas com mais rastreabilidade', summary: 'Comandos e rotinas para agir com rapidez, menos improviso e mais controle do que foi feito.', cardDescription: 'Um modulo para padronizar resposta operacional e reduzir dependencia de memoria ou improviso.', image: '/solucoes/acionamento.jpg', icon: Power, bullets: ['Acionamentos registrados', 'Mais padrao na rotina', 'Valor percebido maior'], deliverables: ['Controle de acionamentos', 'Registro de comandos executados', 'Rotinas operacionais mais firmes', 'Mais clareza sobre quem fez o que', 'Base para automacoes futuras'], segments: ['Operacoes comerciais', 'Reservatorios e bombas', 'Utilidades', 'Processos com resposta operacional recorrente'], detailIntro: 'O modulo Acionamento amplia a capacidade da operacao de agir rapido e com mais previsibilidade, transformando rotina em processo controlado.'
  },
  {
    slug: 'consumo', title: 'Consumo', shortLabel: 'Monitoramento IoT', category: 'IoT', subtitle: 'Mais visibilidade para consumo, anomalias e eficiencia', summary: 'Leitura eletrica para enxergar desperdicios, prever manutencao e apoiar decisoes com mais clareza.', cardDescription: 'Uma camada premium para operacoes que precisam entender melhor corrente, tensao e consumo.', image: '/solucoes/consumo.webp', icon: Gauge, bullets: ['Corrente, tensao e consumo', 'Diagnostico mais profundo', 'Mais previsibilidade'], deliverables: ['Monitoramento de consumo', 'Leitura de corrente e tensao', 'Mais visibilidade sobre anomalias', 'Base para eficiencia energetica', 'Apoio a manutencao e decisao'], segments: ['Operacoes com alto custo energetico', 'Empresas com manutencao recorrente', 'Negocios com foco em eficiencia', 'Clientes que buscam gestao mais profunda'], detailIntro: 'O modulo Consumo entra como expansao natural para clientes que querem ir alem do monitoramento basico e buscar leitura mais gerencial da operacao.'
  },
  {
    slug: 'gases', title: 'Gases', shortLabel: 'Monitoramento IoT', category: 'IoT', subtitle: 'Monitoramento de ambiente e utilidades com mais previsibilidade', summary: 'Monitore ambiente e utilidades com uma camada extra de visibilidade para operacoes sensiveis.', cardDescription: 'Ajuda a acompanhar variacoes importantes em ambientes que exigem mais atencao com risco e estabilidade.', image: '/solucoes/gases.jpg', icon: Waves, bullets: ['Mais visibilidade operacional', 'Sinais de risco mais cedo', 'Monitoramento simples de ambiente'], deliverables: ['Leitura ambiental complementar', 'Mais previsibilidade para utilidades', 'Sinais antecipados de variacao', 'Melhor apoio a ambientes sensiveis', 'Expansao natural do modulo ambiental'], segments: ['Ambientes sensiveis', 'Operacoes com utilidades criticas', 'Clinicas e laboratorios', 'Negocios que precisam ampliar monitoramento ambiental'], detailIntro: 'O modulo Gases expande a capacidade ambiental da Virtuagil para operacoes que precisam acompanhar mais do que temperatura e ganhar sinais antecipados de risco.'
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}
