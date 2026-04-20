'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ClipboardList, Menu, PackageCheck, PhoneCall } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

type SiteHeaderProps = {
  monitorUrl: string;
  whatsappUrl: string;
};

function navLinkClass(isActive: boolean) {
  if (isActive) {
    return 'text-white';
  }

  return 'transition hover:text-white';
}

function isActivePath(
  pathname: string,
  section: 'solucoes' | 'planos' | 'contato',
) {
  return pathname === `/${section}` || pathname.startsWith(`/${section}/`);
}

export function SiteHeader({ monitorUrl, whatsappUrl }: SiteHeaderProps) {
  const pathname = usePathname();
  const active = {
    solucoes: isActivePath(pathname, 'solucoes'),
    planos: isActivePath(pathname, 'planos'),
    contato: isActivePath(pathname, 'contato'),
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[rgba(7,11,16,0.8)] backdrop-blur-xl">
      <div className="mx-auto grid min-h-[88px] w-[min(1240px,calc(100%-32px))] grid-cols-[auto_1fr_auto] items-center gap-4">
        <Link
          href="/"
          aria-label="Virtuagil"
          className="inline-flex flex-col items-start"
        >
          <Image
            src="/brand/logomarca.png"
            alt="Virtuagil"
            width={176}
            height={48}
            className="h-auto w-[158px] md:w-[176px]"
          />
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400 md:text-[11px]">
            Tecnologia em automacao
          </span>
        </Link>

        <nav className="hidden justify-center gap-7 text-sm font-medium text-stone-400 md:flex">
          <Link
            href="/solucoes"
            className={navLinkClass(active.solucoes)}
            aria-current={active.solucoes ? 'page' : undefined}
          >
            Solucoes
          </Link>
          <Link
            href="/planos"
            className={navLinkClass(active.planos)}
            aria-current={active.planos ? 'page' : undefined}
          >
            Planos
          </Link>
          <Link
            href="/contato"
            className={navLinkClass(active.contato)}
            aria-current={active.contato ? 'page' : undefined}
          >
            Contato
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asChild variant="secondary">
            <a href={monitorUrl} target="_blank" rel="noreferrer">
              Area do cliente
            </a>
          </Button>
          <Button asChild>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              Fale com a Jade
            </a>
          </Button>
        </div>

        <details className="relative ml-auto md:hidden">
          <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/12">
            <Menu className="h-4 w-4" />
            Menu
          </summary>
          <div className="absolute right-0 top-12 w-[260px] rounded-2xl border border-white/12 bg-[#0e141b] p-4 shadow-[0_24px_60px_rgba(0,0,0,0.36)]">
            <div className="grid gap-3 text-sm text-stone-300">
              <Link
                href="/solucoes"
                className={`inline-flex items-center gap-2 ${navLinkClass(active.solucoes)}`}
                aria-current={active.solucoes ? 'page' : undefined}
              >
                <PackageCheck className="h-4 w-4" />
                Solucoes
              </Link>
              <Link
                href="/planos"
                className={`inline-flex items-center gap-2 ${navLinkClass(active.planos)}`}
                aria-current={active.planos ? 'page' : undefined}
              >
                <ClipboardList className="h-4 w-4" />
                Planos
              </Link>
              <Link
                href="/contato"
                className={`inline-flex items-center gap-2 ${navLinkClass(active.contato)}`}
                aria-current={active.contato ? 'page' : undefined}
              >
                <PhoneCall className="h-4 w-4" />
                Contato
              </Link>
            </div>
            <div className="mt-4 grid gap-2">
              <Button asChild size="sm" variant="secondary">
                <a href={monitorUrl} target="_blank" rel="noreferrer">
                  Area do cliente
                </a>
              </Button>
              <Button asChild size="sm">
                <a href={whatsappUrl} target="_blank" rel="noreferrer">
                  Fale com a Jade
                </a>
              </Button>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
