import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

type SiteFooterProps = {
  contactEmail: string;
  whatsappUrl: string;
  monitorUrl: string;
};

function formatPhoneFromWhatsapp(url: string) {
  const digits = url.replace(/\D/g, '');
  const phone = digits.startsWith('55') ? digits.slice(2) : digits;

  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }

  return phone || 'WhatsApp comercial';
}

export function SiteFooter({ contactEmail, whatsappUrl, monitorUrl }: SiteFooterProps) {
  const phoneLabel = formatPhoneFromWhatsapp(whatsappUrl);

  return (
    <footer className="border-t border-white/10 bg-[#070b10]">
      <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] gap-8 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-14">
        <div>
          <Link href="/" aria-label="Virtuagil" className="inline-flex flex-col items-start">
            <Image
              src="/brand/logomarca.png"
              alt="Virtuagil"
              width={176}
              height={48}
              className="h-auto w-[158px] md:w-[176px]"
            />
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 md:text-[11px]">
              Tecnologia em automacao
            </span>
          </Link>

          <p className="mt-5 max-w-xl text-sm leading-7 text-stone-400">
            Automacao com Inteligencia Artificial, integracoes de processos e IoT para reduzir trabalho manual, melhorar atendimento e dar mais controle a operacao.
          </p>

          <p className="mt-6 text-xs uppercase tracking-[0.18em] text-stone-600">
            Virtuagil • Todos os direitos reservados
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Contato</div>
            <div className="mt-4 grid gap-3 text-sm text-stone-300">
              <a href={whatsappUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 transition hover:text-white">
                <Phone className="h-4 w-4 text-[#d68642]" />
                {phoneLabel}
              </a>
              <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-3 transition hover:text-white">
                <Mail className="h-4 w-4 text-[#4c9a78]" />
                {contactEmail}
              </a>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-stone-500">Acesso rapido</div>
            <div className="mt-4 grid gap-3 text-sm text-stone-300">
              <Link href="/solucoes/atendente-ia" className="transition hover:text-white">Atendente IA</Link>
              <Link href="/solucoes/automacao-processos" className="transition hover:text-white">Automacao de Processos</Link>
              <Link href="/solucoes" className="transition hover:text-white">Solucoes IoT</Link>
              <a href={monitorUrl} target="_blank" rel="noreferrer" className="transition hover:text-white">
                Area do cliente IoT
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
