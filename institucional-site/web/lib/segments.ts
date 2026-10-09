// Catálogo comercial por segmento. Novos mercados podem ser adicionados aqui,
// reaproveitando layout, URLs, links e sitemap sem copiar páginas ou prometer integrações.
export type Segment = {
  slug: string;
  name: string;
  seoTitle: string;
  description: string;
  headline: string;
  intro: string;
  problem: string;
  examples: string[];
  flow: { title: string; detail: string }[];
  details: string[];
  precautions: string;
  questions: { question: string; answer: string }[];
  relatedGuide: string;
};

export const segments: Segment[] = [
  {
    slug: 'clinicas-estetica',
    name: 'Clínicas de estética',
    seoTitle: 'IA no WhatsApp para Clínicas de Estética',
    description: 'Atendimento com IA para clínicas de estética: dúvidas, triagem, agendamentos, retorno de interessados e encaminhamento humano pelo WhatsApp.',
    headline: 'Assistente de IA no WhatsApp para clínicas de estética',
    intro: 'Quem procura um procedimento costuma perguntar preço, duração, horários, formas de pagamento e disponibilidade. A Jade ajuda a organizar essas conversas e encaminhar o interessado até a avaliação ou agendamento, respeitando as regras da clínica.',
    problem: 'Uma recepção ocupada pode perder solicitações de avaliação enquanto responde perguntas repetidas. O assistente reduz essa fila inicial, mas não substitui a orientação de profissionais habilitados.',
    examples: ['Explicar serviços, localização e horários com base no material aprovado pela clínica.', 'Consultar opções de horário quando o módulo Agenda estiver configurado.', 'Registrar interesse em avaliação e preparar o encaminhamento à recepção.', 'Acompanhar interessados que autorizaram contato, sem insistência indesejada.'],
    flow: [
      {title: 'A pessoa procura uma avaliação', detail: 'A assistente esclarece informações administrativas e pergunta qual atendimento procura, sem indicar procedimentos clínicos.'},
      {title: 'A agenda oferece opções reais', detail: 'Se a Agenda estiver contratada e configurada, consulta serviço, profissional, duração e bloqueios antes de apresentar horários.'},
      {title: 'A recepção assume casos especiais', detail: 'Dúvidas sobre contraindicações, intercorrências ou condutas são encaminhadas ao profissional responsável.'},
      {title: 'O interessado recebe um próximo passo claro', detail: 'A conversa avança para agendamento, avaliação humana ou esclarecimento da equipe, de acordo com a escolha da pessoa.'},
    ],
    details: ['A clínica define seus serviços, profissionais, políticas de agendamento e dúvidas frequentes. A personalização utiliza uma base de conhecimento separada por estabelecimento.', 'Um painel permite acompanhar contatos e uso do plano. O fluxo pode crescer com Agenda e atendimento humano, sem desenvolver um produto isolado para cada clínica.'],
    precautions: 'Questões clínicas, diagnóstico, risco, indicação de tratamento e informações de saúde exigem atendimento profissional e proteção de dados pessoais sensíveis. A IA não deve prometer resultados estéticos.',
    questions: [
      {question: 'A Jade pode marcar avaliação estética?', answer: 'Pode orientar e consultar horários quando o módulo Agenda estiver configurado para os serviços e profissionais da clínica.'},
      {question: 'A IA indica o melhor procedimento?', answer: 'Não. A indicação clínica e a avaliação de contraindicações pertencem ao profissional habilitado.'},
      {question: 'Posso transferir para a recepcionista?', answer: 'Sim. O fluxo pode direcionar casos específicos para o atendimento humano.'},
    ],
    relatedGuide: '/guias/agendamento-automatico-whatsapp',
  },
  {
    slug: 'odontologia',
    name: 'Clínicas odontológicas',
    seoTitle: 'IA para Clínicas Odontológicas e Dentistas',
    description: 'IA no WhatsApp para consultórios odontológicos: organizar agendamentos, dúvidas administrativas, confirmação de interesse e suporte humano.',
    headline: 'Atendimento por IA para clínicas odontológicas',
    intro: 'A recepção de um consultório divide o tempo entre pacientes presenciais, telefone e WhatsApp. A Jade pode responder perguntas administrativas, organizar pedidos de consulta e ajudar interessados a encontrar o caminho até a equipe.',
    problem: 'Mensagens de novos pacientes chegam enquanto o consultório atende. Sem um fluxo definido, dúvidas sobre valores, convênios e disponibilidade ficam sem acompanhamento.',
    examples: ['Informar endereço, horários e serviços oferecidos conforme o conteúdo aprovado.', 'Organizar solicitações de avaliação, retorno ou primeira consulta.', 'Consultar a Agenda por serviço e profissional, quando contratada.', 'Encaminhar dúvidas clínicas, dor intensa e urgências a uma pessoa.'],
    flow: [
      {title: 'Primeiro contato', detail: 'O assistente pergunta o tipo de consulta pretendida e responde às informações administrativas cadastradas.'},
      {title: 'Escolha de horário', detail: 'Com Agenda habilitada, verifica a disponibilidade correspondente ao profissional e ao tempo do serviço.'},
      {title: 'Confirmação ou atendimento humano', detail: 'Apresenta um resumo e encaminha dúvidas particulares à recepção, sem inventar vagas.'},
      {title: 'Acompanhamento permitido', detail: 'Se o paciente autorizou, a clínica pode estruturar retornos administrativos respeitando as regras do canal.'},
    ],
    details: ['Tratamentos, profissionais, horários e convênios variam entre clínicas. Por isso a base de informações precisa ser configurada para cada consultório.', 'A Jade não é prontuário eletrônico nem substitui dentistas. Integrações com sistemas de gestão ou prontuários somente podem ser prometidas após avaliação específica.'],
    precautions: 'Nunca coletar anamnese extensa ou dados de saúde desnecessários pelo atendimento comercial. Diagnósticos, prescrições e triagem de urgência devem permanecer com profissionais habilitados.',
    questions: [
      {question: 'Pode agendar uma consulta odontológica?', answer: 'Sim, quando o serviço, a agenda e o profissional estiverem configurados no módulo Agenda.'},
      {question: 'Pode responder se um tratamento é indicado?', answer: 'Não. Questões clínicas e conduta precisam ser avaliadas por um cirurgião-dentista.'},
      {question: 'Funciona com o meu software odontológico?', answer: 'A compatibilidade depende do sistema utilizado e de uma análise de integração.'},
    ],
    relatedGuide: '/guias/agendamento-automatico-whatsapp',
  },
  {
    slug: 'saloes-beleza',
    name: 'Salões de beleza e barbearias',
    seoTitle: 'IA no WhatsApp para Salões de Beleza',
    description: 'Assistente de IA para salão de beleza e barbearia: informações sobre serviços, consulta de horários, agenda e atendimento pelo WhatsApp.',
    headline: 'WhatsApp organizado para salões, barbearias e beleza',
    intro: 'Corte, coloração, manicure e outros serviços têm durações, profissionais e preços diferentes. A Jade pode explicar o catálogo do salão, responder dúvidas e ajudar a encontrar um horário sem interromper o profissional durante o atendimento.',
    problem: 'Enquanto cabeleireiros e barbeiros estão ocupados, novas mensagens perguntam sobre encaixes, valores, pacotes e remarcações. Respostas tardias podem fazer o cliente desistir.',
    examples: ['Apresentar serviços, valores cadastrados, endereço e regras do salão.', 'Consultar horários de um profissional específico quando a Agenda estiver ativa.', 'Esclarecer duração, preparação e políticas administrativas aprovadas.', 'Encaminhar pedidos de orçamento que precisam de avaliação presencial.'],
    flow: [
      {title: 'O cliente escolhe o serviço', detail: 'A assistente identifica se é corte, manicure, barba ou outro procedimento cadastrado e informa a duração prevista.'},
      {title: 'Seleciona profissional ou preferência', detail: 'Quando há agenda, considera profissional, jornada, intervalos e bloqueios.'},
      {title: 'Confirma o horário disponível', detail: 'Antes de gravar, solicita a confirmação do cliente e revalida a disponibilidade.'},
      {title: 'Encaminha exceções', detail: 'Correções de coloração, serviços combinados ou orçamentos especiais ficam com a equipe.'},
    ],
    details: ['O catálogo do salão e a duração de cada serviço são definidos pela empresa. Em um negócio pequeno, a mesma rotina pode começar com poucas opções e expandir conforme a demanda.', 'O atendimento humano continua disponível e o limite mensal de contatos únicos segue o plano contratado, sem precisar criar uma instância de software do zero.'],
    precautions: 'A disponibilidade depende de configuração real da Agenda; não informar preço ou encaixe se o estabelecimento ainda não confirmou os dados.',
    questions: [
      {question: 'A IA separa a agenda de cada profissional?', answer: 'O módulo Agenda pode ser configurado por profissional, serviço e horários de trabalho.'},
      {question: 'Ela confirma valores de serviços?', answer: 'Somente os valores que o salão cadastrou e autorizou divulgar.'},
      {question: 'Serve para uma barbearia pequena?', answer: 'Sim, o fluxo pode começar com uma lista simples de serviços e horários, respeitando o limite do plano.'},
    ],
    relatedGuide: '/guias/agendamento-automatico-whatsapp',
  },
  {
    slug: 'lojas-comercio',
    name: 'Lojas e comércio',
    seoTitle: 'IA para Lojas: Atendimento e Vendas no WhatsApp',
    description: 'Assistente IA para lojas e comércio no WhatsApp: dúvidas de produtos, qualificação de compradores, pedidos de orçamento e acompanhamento de vendas.',
    headline: 'Assistente de IA para lojas que vendem pelo WhatsApp',
    intro: 'Uma loja recebe perguntas sobre modelos, condições, entrega, localização e disponibilidade. A Jade pode organizar o primeiro contato, esclarecer informações de catálogo atualizadas e encaminhar pedidos para o vendedor certo.',
    problem: 'O vendedor alterna entre o balcão e mensagens. Quando precisa procurar respostas a cada contato, demora a montar orçamentos e perde o histórico de quem demonstrou interesse.',
    examples: ['Esclarecer características e faixas de preço de produtos informados pela loja.', 'Coletar necessidades do comprador para preparar um orçamento.', 'Encaminhar negociação, desconto ou pedido especial ao vendedor.', 'Fazer acompanhamento autorizado de oportunidades ainda em aberto.'],
    flow: [
      {title: 'O cliente explica o que procura', detail: 'A Jade identifica a categoria, quantidade ou preferência sem inventar estoque.'},
      {title: 'Consulta informações aprovadas', detail: 'Responde conforme catálogo e condições fornecidos pelo lojista; preço e disponibilidade devem ser mantidos atualizados.'},
      {title: 'Qualifica a oportunidade', detail: 'Reúne dados necessários para o orçamento e transfere ao vendedor quando há negociação ou necessidade especial.'},
      {title: 'A equipe fecha a venda', detail: 'A finalização pode seguir o processo comercial existente. Integração com ERP ou checkout exige escopo específico.'},
    ],
    details: ['O fluxo pode ser usado por lojas físicas, pequenos varejistas e empresas que recebem pedidos pelo WhatsApp. Personalização não significa prometer sincronização automática de estoque.', 'O acompanhamento de interessados pode ajudar o vendedor a priorizar conversas com intenção real, em vez de enviar mensagens repetitivas indiscriminadamente.'],
    precautions: 'Não confirmar estoque, prazo de entrega, frete ou aprovação de pagamento sem consulta a fonte confiável. Nunca solicitar dados de cartão diretamente na conversa.',
    questions: [
      {question: 'A Jade consegue fechar vendas?', answer: 'Pode qualificar, explicar condições aprovadas e conduzir ao canal de compra; o fechamento depende das regras comerciais e das integrações disponíveis.'},
      {question: 'Consulta meu estoque em tempo real?', answer: 'Somente se houver integração avaliada, implementada e homologada com o sistema da loja.'},
      {question: 'Pode enviar orçamentos?', answer: 'Pode organizar informações e orientar solicitações; automações de preço e emissão dependem da configuração e do escopo.'},
    ],
    relatedGuide: '/guias/assistente-ia-whatsapp-pequenas-empresas',
  },
  {
    slug: 'profissionais-liberais',
    name: 'Profissionais liberais',
    seoTitle: 'Assistente de IA para Profissionais Liberais',
    description: 'WhatsApp com IA para advogados, contadores, arquitetos e consultores: triagem de contatos, agendas, pedidos de orçamento e atendimento humano.',
    headline: 'Assistente de IA para profissionais liberais',
    intro: 'Advogados, contadores, arquitetos e consultores precisam responder novos contatos enquanto executam trabalhos técnicos. A Jade ajuda a separar dúvidas administrativas de assuntos que exigem análise profissional.',
    problem: 'Muitas conversas chegam incompletas: a pessoa pede orçamento, mas não informa o serviço, o prazo ou o tipo de atendimento. Um primeiro filtro claro economiza tempo e evita promessas inadequadas.',
    examples: ['Apresentar áreas de atuação, horários e formas de contratação cadastradas.', 'Organizar pedidos de reunião inicial com Agenda, quando configurada.', 'Coletar informações comerciais mínimas para uma proposta.', 'Encaminhar documentos, decisões técnicas e casos confidenciais ao profissional.'],
    flow: [
      {title: 'Identifica o tipo de serviço', detail: 'A conversa começa por dúvidas administrativas e pelo objetivo do possível cliente.'},
      {title: 'Prepara o contato', detail: 'Registra apenas as informações comerciais necessárias e informa limites do atendimento automatizado.'},
      {title: 'Agenda uma conversa', detail: 'Com o módulo Agenda, mostra opções disponíveis para reunião ou consulta.'},
      {title: 'Profissional assume o caso', detail: 'A IA encaminha ao responsável sem emitir parecer jurídico, contábil ou técnico.'},
    ],
    details: ['Cada profissão segue regras específicas de publicidade e sigilo. O texto de atendimento deve ser aprovado pelo próprio profissional antes de ir ao ar.', 'A estrutura multiempresa da Virtuagil separa informações de cada cliente. Rotinas avançadas, documentos e integrações devem ser dimensionados conforme escopo e privacidade.'],
    precautions: 'Respeitar sigilo profissional, LGPD e normas de publicidade aplicáveis; especialmente advocacia, sem captação irregular, aconselhamento jurídico automático ou promessa de resultado.',
    questions: [
      {question: 'Serve para escritório de advocacia?', answer: 'Pode ajudar em informações institucionais e agendamento, com conteúdo aprovado e observância das regras da OAB e do sigilo.'},
      {question: 'Pode calcular e fechar um orçamento?', answer: 'Pode coletar os dados iniciais e encaminhar para proposta; cálculo técnico e condições dependem da configuração específica.'},
      {question: 'A IA responde como se fosse o profissional?', answer: 'Não deve se passar pelo profissional nem emitir opiniões especializadas sem supervisão.'},
    ],
    relatedGuide: '/guias/assistente-ia-whatsapp-pequenas-empresas',
  },
  {
    slug: 'clinicas-consultorios',
    name: 'Clínicas e consultórios',
    seoTitle: 'IA para Clínicas e Consultórios: Agenda',
    description: 'Atendimento administrativo com IA para clínicas e consultórios: agendamento, informações de recepção, horários e passagem para atendimento humano.',
    headline: 'IA para a recepção de clínicas e consultórios',
    intro: 'Consultórios de diferentes especialidades recebem pedidos sobre localização, horários, valores de consultas e marcações. A Jade pode cuidar das informações de recepção enquanto a equipe concentra sua atenção no atendimento presencial.',
    problem: 'A recepção precisa conciliar vários profissionais e durações de consultas. Uma promessa de horário feita sem checar a agenda pode gerar conflito e desgaste.',
    examples: ['Responder endereço, horários e orientações administrativas aprovadas.', 'Coletar preferência por profissional ou especialidade de atendimento.', 'Consultar horários reais com o módulo Agenda configurado.', 'Transferir questões clínicas ou sensíveis para a equipe autorizada.'],
    flow: [
      {title: 'Pergunta o motivo administrativo', detail: 'Identifica se a pessoa precisa de horário, endereço ou informações sobre serviços disponíveis.'},
      {title: 'Verifica a Agenda', detail: 'Consulta duração, profissional, bloqueios e disponibilidade, quando essa integração está habilitada.'},
      {title: 'Solicita confirmação', detail: 'Antes de registrar uma consulta, resume data e horário para evitar equívocos.'},
      {title: 'Separa a demanda clínica', detail: 'Sintomas, urgências, exames e orientações de saúde são encaminhados à equipe adequada.'},
    ],
    details: ['A solução é configurada com a lista de profissionais, serviços, regras de atendimento e conteúdos oficiais. O mesmo núcleo de atendimento pode ser adaptado a diferentes consultórios.', 'Não se presume integração com prontuários, planos de saúde ou sistemas de gestão. Esses itens exigem avaliação, autorização e testes próprios.'],
    precautions: 'Informações pessoais e de saúde exigem proteção reforçada; não solicitar diagnóstico ou exposição de dados sensíveis no atendimento comercial. Em urgência, orientar busca de atendimento humano apropriado.',
    questions: [
      {question: 'Pode organizar horários de vários profissionais?', answer: 'O módulo Agenda pode considerar profissionais e serviços cadastrados, conforme a configuração de cada consultório.'},
      {question: 'A IA confirma convênio médico?', answer: 'Somente informa convênios e condições aprovados e atualizados pela clínica; autorizações devem ser verificadas.'},
      {question: 'A Jade fornece orientação médica?', answer: 'Não. A IA cuida da recepção e encaminha decisões clínicas a profissionais habilitados.'},
    ],
    relatedGuide: '/guias/agendamento-automatico-whatsapp',
  },
  {
    slug: 'prestadores-servicos',
    name: 'Prestadores de serviços',
    seoTitle: 'IA para Prestadores de Serviços no WhatsApp',
    description: 'Automação no WhatsApp para prestadores de serviços: qualificação, orçamentos, pedidos de visita, agenda e acompanhamento de interessados.',
    headline: 'Assistente de IA para prestadores de serviços',
    intro: 'Empresas de manutenção, instalação, assistência e serviços especializados recebem solicitações enquanto as equipes estão fora. A Jade pode colher informações para orçamento, organizar visitas e encaminhar pedidos conforme a capacidade da operação.',
    problem: 'Mensagens como “quanto custa?” geralmente não trazem endereço aproximado, tipo de equipamento ou descrição do serviço. Pedir os dados certos evita idas e vindas.',
    examples: ['Identificar categoria de serviço e região atendida.', 'Reunir dados comerciais mínimos para orçamento ou visita.', 'Consultar janelas de agenda quando houver configuração apropriada.', 'Encaminhar emergências e demandas técnicas ao profissional de plantão.'],
    flow: [
      {title: 'Cliente descreve a necessidade', detail: 'A IA pergunta pelo tipo de serviço, local aproximado e preferência de contato, sem exigir documentos desnecessários.'},
      {title: 'Confere abrangência e regras', detail: 'Informa regiões de atendimento, horário e política de orçamento previamente cadastradas.'},
      {title: 'Encaminha proposta ou visita', detail: 'O prestador recebe a solicitação organizada para avaliar preço, prazo e disponibilidade.'},
      {title: 'Acompanha o interessado', detail: 'Follow-up autorizado pode lembrar o próximo passo, mantendo a opção de atendimento humano.'},
    ],
    details: ['A adaptação pode começar com poucos tipos de serviço e crescer para equipes e localidades diferentes. A automação nunca deve fingir ter vistoriado um problema que depende de inspeção presencial.', 'Cada empresa define seu catálogo, tempo de atendimento e responsabilidades antes de ativar a Jade. Integrações com ferramentas próprias são avaliadas separadamente.'],
    precautions: 'Orçamento final, autorização de visita, execução e garantias dependem de confirmação humana ou dados de sistemas realmente integrados.',
    questions: [
      {question: 'A IA faz orçamento de instalação?', answer: 'Pode coletar informações iniciais e apresentar políticas aprovadas; orçamento técnico final depende da empresa.'},
      {question: 'Pode agendar uma visita?', answer: 'Quando o módulo de agenda e as regras de disponibilidade estiverem configurados, pode organizar solicitações de visita.'},
      {question: 'É adequada para empresa pequena?', answer: 'Sim. O atendimento pode começar com uma base simples de perguntas e crescer gradualmente.'},
    ],
    relatedGuide: '/guias/assistente-ia-whatsapp-pequenas-empresas',
  },
];

export function getSegment(slug: string) {
  return segments.find(s => s.slug === slug);
}
