import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de privacidade e proteção de dados pessoais da Virtuagil.',
  alternates: { canonical: '/privacidade' },
};

export default function PrivacidadePage() {
  return (
    <main className="pb-20">
      <section className="section-shell py-14 md:py-20">
        <div className="eyebrow">Privacidade e LGPD</div>
        <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-white md:text-6xl">Política de Privacidade</h1>
        <p className="mt-6 max-w-3xl text-base leading-8 text-slate-300">A Virtuagil trata dados pessoais de forma compatível com as finalidades informadas e com a Lei Geral de Proteção de Dados Pessoais (LGPD).</p>
        <div className="mt-10 grid gap-5 text-sm leading-7 text-slate-400">
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Dados e finalidades</h2><p className="mt-3">Podemos tratar dados de cadastro, contato, contratação, pagamento, acesso, registros técnicos e informações necessárias à prestação, segurança e suporte dos serviços. Os dados são usados para executar contratos, atender solicitações, proteger os sistemas, cumprir obrigações legais e exercer direitos, observadas as bases legais aplicáveis.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Assistente de IA dos clientes</h2><p className="mt-3">Quando uma empresa utiliza o Assistente de IA para atender seus próprios contatos, essa empresa normalmente define as finalidades e regras do tratamento relacionado ao seu atendimento. A Virtuagil trata os dados necessários para prestar a solução conforme as instruções e responsabilidades aplicáveis. A definição jurídica dos papéis depende da operação concreta.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Compartilhamento e fornecedores</h2><p className="mt-3">Dados podem ser processados por fornecedores de infraestrutura, comunicação, autenticação, pagamentos e tecnologia estritamente quando necessário para prestar ou proteger o serviço. A Virtuagil não vende dados pessoais.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Retenção e segurança</h2><p className="mt-3">Os dados são mantidos pelo período necessário às finalidades do tratamento, às obrigações legais, à segurança e ao exercício regular de direitos. Adotamos medidas técnicas e administrativas razoáveis para reduzir riscos de acesso não autorizado, perda, alteração ou divulgação indevida.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Direitos do titular</h2><p className="mt-3">Nos termos da LGPD, o titular pode exercer direitos como confirmação de tratamento, acesso, correção e, quando cabível, anonimização, bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revisão de decisões automatizadas. Solicitações podem ser encaminhadas pelo canal de WhatsApp informado no site e serão tratadas conforme a legislação aplicável.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Cookies e dados técnicos</h2><p className="mt-3">O site e os serviços podem utilizar dados técnicos estritamente necessários para segurança, funcionamento, sessão e diagnóstico. Caso sejam utilizados cookies ou tecnologias não essenciais para publicidade ou análise que exijam escolha do usuário, a forma de consentimento e gerenciamento deverá ser apresentada de maneira adequada.</p></section>
          <section className="surface-glass rounded-[24px] p-6"><h2 className="text-xl font-bold text-white">Contato sobre privacidade</h2><p className="mt-3">Dúvidas e solicitações relacionadas a dados pessoais podem ser encaminhadas pelo WhatsApp oficial disponível neste site. A identificação do solicitante poderá ser verificada para proteger os próprios dados do titular.</p></section>
        </div>
        <p className="mt-8 text-xs text-slate-500">Última atualização: setembro de 2026.</p>
      </section>
    </main>
  );
}
