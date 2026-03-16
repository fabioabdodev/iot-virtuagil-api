'use client';

import { LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuthUser } from '@/types/auth';

type DashboardHeaderProps = {
  currentUser: AuthUser | null;
  scopedClientId?: string;
  scopedClientName?: string;
  isAuthenticated: boolean;
  clientIdDraft: string;
  onClientIdDraftChange: (value: string) => void;
  onApplyClientFilter: () => void;
  onLogout: () => void;
};

export function DashboardHeader({
  currentUser,
  scopedClientId,
  scopedClientName,
  isAuthenticated,
  clientIdDraft,
  onClientIdDraftChange,
  onApplyClientFilter,
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
              {scopedClientName ? <Badge>cliente: {scopedClientName}</Badge> : null}
              {scopedClientId ? <Badge>codigo interno: {scopedClientId}</Badge> : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_120px] lg:min-w-[360px]">
            <Input
              value={clientIdDraft}
              onChange={(event) => onClientIdDraftChange(event.target.value)}
              placeholder="Buscar conta pelo codigo interno"
              className="min-h-[42px]"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={onApplyClientFilter}
              className="min-h-[42px] w-full"
            >
              Aplicar filtro
            </Button>
          </div>

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
