'use client';

import { MessageCircleMore } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { jadeWhatsappUrl } from '@/lib/jade-contact';

/** Um único acesso móvel discreto; não compete com o formulário de pagamento. */
export function JadeMobileContact({ whatsappUrl }: { whatsappUrl: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/contratar-assistente-ia') ||
      pathname?.startsWith('/pagamento')) return null;
  return (
    <a
      href={jadeWhatsappUrl(whatsappUrl)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Jade no WhatsApp para tirar dúvidas e contratar"
      className="fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-500 px-4 py-3 text-sm font-extrabold text-slate-950 shadow-[0_12px_40px_rgba(0,0,0,.35)] transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 md:hidden"
    >
      <MessageCircleMore className="h-5 w-5" />
      Falar com a Jade
    </a>
  );
}
