export type Guide = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  sections: { title: string; paragraphs: string[]; bullets?: string[] }[];
  questions: { question: string; answer: string }[];
  related: string;
};

export const guides: Guide[] = [
  {
    slug: 'assistente-ia-whatsapp-pequenas-empresas',
    title: 'Assistente de IA para WhatsApp: como funciona em pequenas empresas',
    description: 'Entenda o que um assistente de IA no WhatsApp pode automatizar, quando transferir para uma pessoa e como avaliar custos e implantação.',
    summary: 'Um guia prático para empresas que atendem clientes pelo WhatsApp e querem reduzir respostas repetitivas sem perder a atenção humana.',
    related: '/solucoes/atendente-ia',
    sections: [
      {
        title: 'O que um assistente de IA no WhatsApp realmente faz?',
        paragraphs: [
          'Ele recebe perguntas, consulta informações que a empresa autorizou, responde dúvidas recorrentes e identifica quando o cliente deseja orçamento, atendimento humano ou um próximo passo. O objetivo não é fingir que a máquina é uma pessoa: o cliente deve conseguir reconhecer o atendimento automatizado.',
          'As respostas dependem da qualidade das informações fornecidas. Preços, regras, horários e condições comerciais precisam estar atualizados; uma IA não deve inventar disponibilidade ou prometer algo que a equipe não confirmou.'
        ]
      },
      {
        title: 'O que automatizar primeiro',
        paragraphs: ['Começar pequeno facilita a implantação: selecione as dúvidas que a equipe responde várias vezes ao dia, observe as conversas e melhore a base de conhecimento antes de expandir.'],
        bullets: [
          'Horário de atendimento, serviços prestados, localização e orientações gerais.',
          'Triagem de interessados e coleta de informações para orçamento.',
          'Follow-up autorizado quando o cliente demonstrou interesse.',
          'Encaminhamento à equipe no Chatwoot quando há exceção, urgência ou solicitação de pessoa.'
        ]
      },
      {
        title: 'Atendimento oficial da Meta ou conexão por QR Code?',
        paragraphs: [
          'Na API oficial do WhatsApp Business, o negócio utiliza a infraestrutura da Meta e segue políticas de mensagens, modelos e cobranças aplicáveis. É uma opção normalmente indicada para quem busca uma operação estável e escalável.',
          'Soluções baseadas em sessão com QR Code podem exigir novo pareamento se o WhatsApp desconectar. Elas reduzem algumas barreiras iniciais, mas envolvem riscos operacionais e dependem do estado da sessão. Compare as duas opções antes de contratar; custos da Meta e os valores do assistente são assuntos separados.'
        ]
      },
      {
        title: 'Como escolher um plano de atendimento',
        paragraphs: [
          'Compare limite mensal de contatos únicos, módulos disponíveis, suporte humano, histórico de conversas e implantação. Na Virtuagil, o Plano 500 considera até 500 contatos únicos por mês; Agenda e Hospedagem são opções específicas. Consulte os preços atualizados na página de planos, pois eles podem mudar.',
          'Para medir resultado, acompanhe tempo até a primeira resposta, encaminhamentos ao humano, perguntas sem resposta, satisfação e contatos que avançaram para orçamento ou contratação. O melhor fluxo é o que ajuda a equipe e o cliente.'
        ]
      }
    ],
    questions: [
      { question: 'A IA substitui o atendente?', answer: 'Não necessariamente. Ela pode cuidar das dúvidas repetitivas e encaminhar casos complexos a uma pessoa. O fluxo deve prever essa transferência.' },
      { question: 'Ela atende fora do horário comercial?', answer: 'O atendimento automatizado pode operar em horários ampliados, desde que os serviços e integrações necessários estejam disponíveis.' },
      { question: 'Preciso pagar por mensagens da Meta?', answer: 'Depende do canal e da categoria da mensagem. Na API oficial, certas mensagens têm cobrança da Meta. Confirme as tarifas atuais e mantenha esses custos separados do plano de automação.' }
    ]
  },
  {
    slug: 'agendamento-automatico-whatsapp',
    title: 'Agendamento automático pelo WhatsApp: como evitar conflitos de horário',
    description: 'Guia de agenda pelo WhatsApp para clínicas, salões e prestadores: disponibilidade, confirmação, reagendamento, cancelamento e atendimento humano.',
    summary: 'Veja como organizar serviços, profissionais e horários para permitir agendamentos por WhatsApp sem prometer vagas inexistentes.',
    related: '/planos',
    sections: [
      {
        title: 'Da pergunta ao horário reservado',
        paragraphs: [
          'Quando alguém escreve “tem horário amanhã?”, o assistente precisa conhecer o serviço desejado, a duração e o profissional quando isso for relevante. Só então a agenda pode informar opções que estejam realmente livres.',
          'Uma conversa agradável não substitui a regra de disponibilidade. O sistema deve consultar a agenda antes de sugerir um horário e verificar conflitos novamente ao confirmar uma reserva.'
        ]
      },
      {
        title: 'Os quatro cuidados mais importantes',
        paragraphs: ['A organização da agenda determina a confiabilidade da automação. Antes de liberar o atendimento, cadastre serviços, profissionais, duração e limites de horários.'],
        bullets: [
          'Disponibilidade real por profissional e serviço, com bloqueios e intervalos.',
          'Confirmação explícita do cliente antes de gravar o horário.',
          'Reagendamento e cancelamento vinculados ao agendamento correto.',
          'Encaminhamento humano quando a solicitação foge das regras programadas.'
        ]
      },
      {
        title: 'E os lembretes de consultas?',
        paragraphs: [
          'Lembretes podem ajudar, mas dependem da autorização do cliente, do canal de WhatsApp escolhido e das políticas de mensagens. Na API oficial, notificações enviadas fora da janela de atendimento podem exigir modelos aprovados e ter custo próprio.',
          'Não vale prometer “mensagens ilimitadas gratuitas”. Uma proposta comercial adequada informa separadamente o preço do assistente, a regra de contatos do plano e eventuais cobranças da plataforma.'
        ]
      },
      {
        title: 'Para quais operações faz sentido?',
        paragraphs: [
          'Clínicas de estética, consultórios, salões, odontologia e serviços com hora marcada costumam ter muitas conversas repetidas sobre disponibilidade. O ganho vem de reduzir as interrupções da equipe e oferecer um caminho simples para confirmar o horário.',
          'Na Virtuagil, o módulo Agenda é uma opção do assistente Jade. A implantação requer configurar serviços, profissionais, horários e testar cenários de conflito antes de atender clientes reais.'
        ]
      }
    ],
    questions: [
      { question: 'Posso manter atendentes humanos?', answer: 'Sim. O assistente pode responder e consultar horários, enquanto exceções e decisões delicadas continuam com a equipe.' },
      { question: 'O sistema agenda sem confirmar?', answer: 'A orientação é confirmar a escolha do cliente antes de efetivar o agendamento.' },
      { question: 'Posso usar o calendário externo que já tenho?', answer: 'Integrações com plataformas externas dependem de avaliação do sistema e do escopo. Não devem ser presumidas como parte do módulo padrão.' }
    ]
  },
  {
    slug: 'whatsapp-para-pousadas-reservas',
    title: 'WhatsApp para pousadas: atendimento, disponibilidade e confirmação de reservas',
    description: 'Como organizar pedidos de hospedagem pelo WhatsApp sem duplicar reservas de plataformas externas, com aprovação do gestor e cobrança segura.',
    summary: 'Um roteiro para pousadas que atendem hóspedes pelo WhatsApp e também vendem por plataformas de reservas.',
    related: '/planos',
    sections: [
      {
        title: 'Por que pousadas precisam de um fluxo diferente?',
        paragraphs: [
          'Uma reserva envolve datas de entrada e saída, quantidade de hóspedes, acomodação, tarifa e regras da estadia. Diferente de uma pergunta simples, uma resposta errada sobre disponibilidade pode causar duas reservas para o mesmo quarto.',
          'Se a pousada também vende por plataformas externas, como a Booking.com, é preciso controlar os períodos ocupados em todos os canais. Sem uma integração confirmada, alterações feitas em uma plataforma podem não aparecer imediatamente na outra.'
        ]
      },
      {
        title: 'Pedido de reserva não é reserva confirmada',
        paragraphs: [
          'Uma forma prudente de começar é deixar a IA coletar as datas, consultar as regras cadastradas e criar uma solicitação para conferência. O proprietário verifica os demais canais e aprova ou recusa antes de concluir.',
          'Quando não há sincronização automática comprovada com plataformas externas, uma aprovação humana reduz o risco de sobreposição. Nunca apresente pré-reserva como confirmação definitiva nem diga que houve pagamento antes da confirmação real.'
        ]
      },
      {
        title: 'Como lidar com o sinal e o pagamento?',
        paragraphs: [
          'Algumas pousadas trabalham com Pix manual; outras preferem um gateway de pagamento. Essas são estratégias distintas. No Pix manual, a equipe deve conferir o recebimento antes de marcar uma reserva como paga. Em gateways, a confirmação deve depender do retorno confiável da plataforma, não apenas da mensagem do hóspede.',
          'Evite expor informações sensíveis e forneça ao hóspede condições de cancelamento, prazo de pagamento e valor total de forma clara.'
        ]
      },
      {
        title: 'O que o assistente pode atender durante a estadia?',
        paragraphs: [
          'Além da pré-venda, ele pode responder sobre localização, horário de check-in, comodidades e normas da pousada. Pedidos como limpeza, manutenção ou um produto para o quarto devem ser encaminhados para a pessoa responsável.',
          'O módulo Hospedagem da Virtuagil prevê gestão de acomodações, tarifas, solicitações e acompanhamento administrativo. As integrações externas são avaliadas caso a caso.'
        ],
        bullets: [
          'Consultar e explicar tarifas e políticas cadastradas.',
          'Registrar interesse em datas e acomodações.',
          'Solicitar conferência e aprovação do proprietário.',
          'Organizar dúvidas frequentes e encaminhar pedidos à equipe.'
        ]
      }
    ],
    questions: [
      { question: 'O assistente atualiza automaticamente a Booking.com?', answer: 'Não presuma isso. A integração depende de disponibilidade técnica e homologação específica. Sem ela, o gestor precisa conciliar os calendários.' },
      { question: 'A IA pode fechar reservas sozinha?', answer: 'Depende do modo de confirmação configurado e das integrações confiáveis disponíveis. A aprovação humana é indicada quando existem reservas externas sem sincronização.' },
      { question: 'Quem confirma o pagamento?', answer: 'O gestor ou uma integração de pagamento autenticada. A mensagem do hóspede dizendo “paguei” não é prova de liquidação.' }
    ]
  },
  {
    slug: 'monitoramento-iot-temperatura-energia-gases',
    title: 'Monitoramento IoT para empresas: temperatura, energia e gases',
    description: 'Como sensores IoT ajudam a registrar leituras, detectar anomalias e apoiar a equipe com alertas de temperatura, consumo de energia e gases.',
    summary: 'Entenda onde sensores conectados ajudam a operação e quais cuidados são necessários antes de implementar alertas automáticos.',
    related: '/solucoes/iot',
    sections: [
      {
        title: 'O que significa monitorar com IoT?',
        paragraphs: [
          'IoT é o uso de dispositivos conectados para medir condições físicas ou estados de equipamentos e disponibilizar leituras para análise. Um sensor pode coletar temperatura, corrente elétrica ou outro sinal, enquanto um painel registra tendências e eventos.',
          'Monitoramento não é o mesmo que certificação de segurança. O tipo de sensor, sua calibração e a manutenção devem ser adequados ao ambiente e às exigências técnicas do negócio.'
        ]
      },
      {
        title: 'Temperatura de equipamentos refrigerados',
        paragraphs: [
          'Freezers, refrigeradores e câmaras que armazenam itens sensíveis se beneficiam de histórico de temperatura e alertas fora da faixa definida. O registro ajuda a identificar falhas, mas o alerta precisa chegar à equipe responsável e possuir um procedimento de resposta.'
        ],
        bullets: ['Definir faixa de temperatura por equipamento.', 'Acompanhar leituras e interrupções de conexão.', 'Registrar ocorrências e agir quando houver desvio.']
      },
      {
        title: 'Consumo elétrico e acionamentos',
        paragraphs: [
          'Medições de corrente, tensão e consumo podem mostrar padrões de uso e possíveis anomalias. O significado de cada leitura depende do equipamento e do projeto elétrico. Acionamento remoto exige análise de proteção, permissões e segurança antes da implantação.'
        ]
      },
      {
        title: 'Detecção e monitoramento de gases',
        paragraphs: [
          'Ambientes com gases ou atmosferas sensíveis pedem equipamentos selecionados conforme o risco e as normas aplicáveis. Uma solução de monitoramento pode gerar visibilidade e avisos, mas não substitui sistemas certificados de segurança quando estes são obrigatórios.'
        ]
      },
      {
        title: 'Como iniciar um projeto IoT',
        paragraphs: [
          'Comece identificando o problema, a frequência necessária das leituras, conectividade disponível, responsáveis por alarmes e critério de sucesso. A Virtuagil avalia sensores, integrações e acompanhamento conforme o escopo de cada operação.'
        ]
      }
    ],
    questions: [
      { question: 'Preciso trocar meus equipamentos?', answer: 'Depende da compatibilidade com sensores e sistemas existentes. Uma avaliação técnica define a melhor forma de medição.' },
      { question: 'A solução funciona sem internet?', answer: 'A coleta local pode continuar em alguns projetos, mas alertas e acesso remoto dependem da arquitetura e da conectividade disponível.' },
      { question: 'IoT substitui alarmes de segurança obrigatórios?', answer: 'Não. Sistemas exigidos por normas precisam atender seus requisitos próprios, independentemente da plataforma de monitoramento.' }
    ]
  }
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
