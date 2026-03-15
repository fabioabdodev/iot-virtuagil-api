'use client';

import Link from 'next/link';
import { Bell, Building2, LayoutDashboard, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AuthUser } from '@/types/auth';

type DashboardHeaderProps = {
  currentUser: AuthUser | null;
  scopedClientId?: string;
  isAuthenticated: boolean;
  onLogout: () => void;
};

const navItems = [
  { href: '#resumo-operacional', label: 'Resumo', icon: LayoutDashboard },
  { href: '#contas-modulos', label: 'Contas', icon: Building2 },
  { href: '#auditoria', label: 'Auditoria', icon: Bell },
] as const;

export function DashboardHeader({
  currentUser,
  scopedClientId,
  isAuthenticated,
  onLogout,
}: DashboardHeaderProps) {
  const initials = currentUser?.name
    ?.split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
    .slice(0, 2) ?? 'VG';

  return (
    <header className="sticky top-0 z-40 mb-6 border-b border-line/60 bg-[linear-gradient(180deg,rgba(4,8,15,0.94),rgba(4,8,15,0.82))] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-accent/10 text-accent">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted">Virtuagil Monitor</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-ink">Plataforma IoT operacional</span>
              <Badge variant={isAuthenticated ? 'success' : 'neutral'}>
                {isAuthenticated ? 'Sessao ativa' : 'Acesso local'}
              </Badge>
              {scopedClientId ? <Badge>tenant: {scopedClientId}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <nav className="flex flex-wrap items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-2xl border border-line/70 bg-card/50 px-3 py-2 text-xs font-medium text-muted transition hover:border-accent/40 hover:text-ink"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-[20px] border border-line/70 bg-card/45 px-3 py-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--accent))_0%,hsl(var(--accent-2))_100%)] text-sm font-bold text-slate-950">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {currentUser?.name ?? 'Visitante local'}
                </p>
                <p className="truncate text-xs text-muted">
                  {currentUser?.email ?? 'Sem autenticacao'}
                </p>
              </div>
              {currentUser ? (
                <Badge>{currentUser.role === 'admin' ? 'admin' : 'operator'}</Badge>
              ) : (
                <UserCircle2 className="h-4 w-4 text-muted" />
              )}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={onLogout}
              disabled={!isAuthenticated}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
