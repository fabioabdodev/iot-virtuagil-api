import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Exclusão de Dados',
  description: 'Instruções para solicitar a exclusão de dados pessoais tratados pela Virtuagil.',
  alternates: { canonical: '/exclusao-de-dados' },
};

export default function ExclusaoDeDadosPage() {
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
              <Trash2 className="h-4 w-4" />
              Privacidade
            </div>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-[-0.04em] text-white md:text-5xl">Exclusão de Dados do Usuário</h1>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              Esta página explica como solicitar a exclusão de dados pessoais relacionados aos serviços, integrações e canais digitais da Virtuagil.
            </p>
            <div className="mt-10 grid gap-9 text-sm leading-7 text-slate-300">
              <section>
                <h2 className="text-xl font-bold text-white">1. Como solicitar</h2>
                <p className="mt-3">Envie a solicitação pelos canais oficiais disponíveis na página de contato da Virtuagil. Informe seu nome, um meio de contato e dados suficientes para identificarmos o cadastro ou atendimento relacionado à solicitação. Não envie senhas, tokens ou credenciais.</p>
                <Link href="/contato" className="mt-3 inline-flex font-semibold text-emerald-300 hover:text-emerald-200">Acessar canais de contato</Link>
              </section>
              <section>
                <h2 className="text-xl font-bold text-white">2. Verificação</h2>
                <p className="mt-3">Para proteger o titular, poderemos solicitar informações adicionais estritamente necessárias para confirmar a identidade e localizar os dados antes de executar a exclusão.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-white">3. Exclusão e conservação legal</h2>
                <p className="mt-3">Após a validação, os dados abrangidos pela solicitação serão eliminados ou anonimizados quando aplicável. Alguns registros poderão ser conservados pelo período necessário ao cumprimento de obrigações legais ou regulatórias, segurança, prevenção a fraudes e exercício regular de direitos.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-white">4. Dados tratados em nome de empresas clientes</h2>
                <p className="mt-3">Quando a Virtuagil tratar dados em nome de uma empresa contratante, a solicitação poderá precisar ser direcionada ou coordenada com essa empresa, conforme os papéis e responsabilidades aplicáveis ao tratamento.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-white">5. WhatsApp e plataformas de terceiros</h2>
                <p className="mt-3">A exclusão realizada pela Virtuagil abrange os dados sob seu controle. Dados mantidos diretamente por plataformas de terceiros, como WhatsApp/Meta ou outros provedores, também podem estar sujeitos às políticas e procedimentos próprios dessas plataformas.</p>
              </section>
              <section>
                <h2 className="text-xl font-bold text-white">6. Mais informações</h2>
                <p className="mt-3">Consulte também a Política de Privacidade da Virtuagil para informações gerais sobre tratamento, finalidades, compartilhamento, segurança, retenção e direitos dos titulares.</p>
                <Link href="/politica-de-privacidade" className="mt-3 inline-flex font-semibold text-emerald-300 hover:text-emerald-200">Ler Política de Privacidade</Link>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
