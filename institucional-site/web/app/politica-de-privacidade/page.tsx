import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Política de Privacidade',
  description: 'Política de Privacidade da Virtuagil e informações sobre tratamento de dados pessoais.',
  alternates: { canonical: '/politica-de-privacidade' },
};

export default function PoliticaDePrivacidadePage() {
  return (
    <main className="pb-20">
      <section className="py-12 md:py-16">
        <div className="section-shell max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
          <div className="mt-8 rounded-[32px] border border-white/[0.08] bg-white/[0.025] p-6 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Privacidade
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Política de Privacidade</h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Esta Política explica, de forma geral, como a Virtuagil trata dados pessoais relacionados ao site, contratação, implantação, suporte e operação de seus serviços.
            </p>

            <div className="mt-10 grid gap-9 text-sm leading-7 text-slate-300">
              <section><h2 className="text-xl font-bold text-white">1. Dados tratados</h2><p className="mt-3">Podemos tratar dados de identificação e contato, como nome, empresa, e-mail e telefone; dados da contratação e pagamento recebidos do processador de pagamento; registros de acesso, segurança e aceite; e dados necessários à implantação e prestação dos serviços contratados.</p></section>
              <section><h2 className="text-xl font-bold text-white">2. Finalidades</h2><p className="mt-3">Os dados podem ser utilizados para responder contatos, preparar e executar contratos, criar e administrar acessos, prestar suporte, operar funcionalidades contratadas, prevenir fraudes, manter segurança, cumprir obrigações legais e exercer direitos.</p></section>
              <section><h2 className="text-xl font-bold text-white">3. Compartilhamento e fornecedores</h2><p className="mt-3">A Virtuagil pode utilizar fornecedores necessários à operação, como serviços de hospedagem, comunicação, inteligência artificial, atendimento, bancos de dados, automação e pagamentos. O compartilhamento é limitado ao necessário para as finalidades aplicáveis.</p></section>
              <section><h2 className="text-xl font-bold text-white">4. Dados dos clientes do CONTRATANTE</h2><p className="mt-3">Quando a Virtuagil tratar dados pessoais em nome de uma empresa contratante para prestar o serviço, o tratamento será realizado conforme as instruções e configurações aplicáveis à operação contratada. A empresa contratante permanece responsável pelas decisões sobre finalidades, conteúdo e bases legais de sua própria operação, conforme o papel que efetivamente exercer.</p></section>
              <section><h2 className="text-xl font-bold text-white">5. Segurança e retenção</h2><p className="mt-3">São adotadas medidas técnicas e administrativas destinadas a proteger dados pessoais contra acessos não autorizados e eventos acidentais ou ilícitos. Os dados são mantidos pelo período necessário às finalidades informadas, à execução contratual, ao cumprimento de obrigações legais e ao exercício regular de direitos.</p></section>
              <section><h2 className="text-xl font-bold text-white">6. Direitos dos titulares</h2><p className="mt-3">Os titulares podem exercer os direitos previstos na legislação aplicável, incluindo solicitações relacionadas a confirmação de tratamento, acesso, correção e demais direitos cabíveis, observadas as hipóteses legais de conservação.</p></section>
              <section><h2 className="text-xl font-bold text-white">7. Contato</h2><p className="mt-3">Solicitações relacionadas à privacidade podem ser encaminhadas pelos canais oficiais de contato divulgados no site da Virtuagil.</p></section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
