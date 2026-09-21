import Image from 'next/image';
import Link from 'next/link';
import { Bot, ExternalLink, MessageCircleMore, Monitor } from 'lucide-react';

type SiteFooterProps = {
  contactEmail: string;
  whatsappUrl: string;
  monitorUrl: string;
  assistantUrl: string;
};

export function SiteFooter({
  contactEmail: _contactEmail,
  whatsappUrl,
  monitorUrl,
  assistantUrl,
}: SiteFooterProps) {
  return (
    <footer className="mt-16 border-t border-white/[0.07] bg-[#04070b]/86">
      <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <Link href="/" aria-label="Virtuagil" className="inline-flex">
            <Image
              src="/brand/logomarca.png"
              alt="Virtuagil"
              width={176}
              height={48}
              className="h-auto w-[158px]"
            />
          </Link>
          <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400">
            Inteligência artificial, automação de processos e IoT aplicados a
            problemas reais de operação, atendimento e crescimento.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full border border-white/[0.07] px-3 py-1.5">
              Belo Horizonte • Brasil
            </span>
            <span className="rounded-full border border-white/[0.07] px-3 py-1.5">
              Tecnologia em automação
            </span>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Navegação
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <Link href="/solucoes" className="transition hover:text-white">
              Soluções
            </Link>
            <Link href="/planos" className="transition hover:text-white">
              Planos
            </Link>
            <Link href="/contato" className="transition hover:text-white">
              Contato
            </Link>
            <Link
              href="/contratar-assistente-ia"
              className="inline-flex items-center gap-2 font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              <Bot className="h-4 w-4" />
              Contratar Assistente de IA
            </Link>
          </div>
        </div>

        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Contato e acesso
          </div>
          <div className="mt-4 grid gap-3 text-sm text-slate-300">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <MessageCircleMore className="h-4 w-4 text-emerald-300" />
              WhatsApp
            </a>
            <a
              href={assistantUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <ExternalLink className="h-4 w-4 text-emerald-300" />
              Painel Administrativo
            </a>
            <a
              href={monitorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 transition hover:text-white"
            >
              <Monitor className="h-4 w-4 text-sky-300" />
              Plataforma IoT
            </a>
          </div>
        </div>
      </div>

      <div className="soft-divider" />
      <div className="section-shell flex flex-col gap-2 py-5 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} Virtuagil. Todos os direitos reservados.</span>
        <span>Automação que trabalha junto com a sua operação.</span>
      </div>
    </footer>
  );
}
