'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Bot,
  Boxes,
  CreditCard,
  LogIn,
  Menu,
  MessageCircleMore,
  Monitor,
  PhoneCall,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

type SiteHeaderProps = {
  monitorUrl: string;
  assistantUrl: string;
  whatsappUrl: string;
};

function navLinkClass(isActive: boolean) {
  return isActive
    ? 'text-white'
    : 'text-slate-400 transition hover:text-white';
}

function matches(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function SiteHeader({
  monitorUrl,
  assistantUrl,
  whatsappUrl,
}: SiteHeaderProps) {
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    mobileMenuRef.current?.removeAttribute('open');
  }, [pathname]);

  const closeMobileMenu = () => mobileMenuRef.current?.removeAttribute('open');

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.07] bg-[#05080d]/82 backdrop-blur-2xl">
      <div className="section-shell grid min-h-[76px] grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link href="/" aria-label="Virtuagil" className="inline-flex items-center">
          <Image
            src="/brand/logomarca.png"
            alt="Virtuagil"
            width={176}
            height={48}
            className="h-auto w-[142px] md:w-[158px]"
            priority
          />
        </Link>

        <nav className="hidden items-center justify-center gap-7 text-sm font-semibold md:flex">
          <Link
            href="/solucoes"
            className={navLinkClass(matches(pathname, '/solucoes'))}
          >
            Soluções
          </Link>
          <Link
            href="/planos"
            className={navLinkClass(matches(pathname, '/planos'))}
          >
            Planos
          </Link>
          <Link
            href="/contato"
            className={navLinkClass(matches(pathname, '/contato'))}
          >
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm">
            <a href={assistantUrl} target="_blank" rel="noreferrer">
              <LogIn className="h-4 w-4" />
              Área do cliente
            </a>
          </Button>
          <Button asChild size="sm">
            <Link href="/contratar-assistente-ia">
              Contratar Assistente de IA
            </Link>
          </Button>
        </div>

        <details ref={mobileMenuRef} className="relative ml-auto md:hidden">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-semibold text-white">
            <Menu className="h-4 w-4" />
            Menu
          </summary>

          <div className="absolute right-0 top-12 w-[290px] rounded-[24px] border border-white/10 bg-[#0a1118]/98 p-4 shadow-[0_28px_90px_rgba(0,0,0,0.48)] backdrop-blur-xl">
            <div className="grid gap-1 text-sm">
              <Link
                href="/solucoes"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <Boxes className="h-4 w-4 text-emerald-300" />
                Soluções
              </Link>
              <Link
                href="/planos"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <CreditCard className="h-4 w-4 text-emerald-300" />
                Planos
              </Link>
              <Link
                href="/contato"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <PhoneCall className="h-4 w-4 text-emerald-300" />
                Contato
              </Link>
              <a
                href={whatsappUrl}
                onClick={closeMobileMenu}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <MessageCircleMore className="h-4 w-4 text-emerald-300" />
                WhatsApp
              </a>
              <a
                href={monitorUrl}
                onClick={closeMobileMenu}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-slate-300 hover:bg-white/[0.05] hover:text-white"
              >
                <Monitor className="h-4 w-4 text-sky-300" />
                Área IoT
              </a>
            </div>

            <div className="mt-3 grid gap-2 border-t border-white/[0.07] pt-3">
              <Button asChild size="sm">
                <Link href="/contratar-assistente-ia" onClick={closeMobileMenu}>
                  <Bot className="h-4 w-4" />
                  Contratar Assistente de IA
                </Link>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={assistantUrl} onClick={closeMobileMenu} target="_blank" rel="noreferrer">
                  <LogIn className="h-4 w-4" />
                  Área do cliente
                </a>
              </Button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
