'use client';

import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileSearch, ShieldCheck } from 'lucide-react';
import { useAuditLogs } from '@/hooks/use-audit-logs';
import { AuthUser } from '@/types/auth';
import { ClientSummary } from '@/types/client';
import { AccessNotice } from '@/components/ui/access-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';

type AuditLogPanelProps = {
  clientId?: string;
  client?: ClientSummary;
  authToken?: string;
  currentUser: AuthUser | null;
  canView: boolean;
};

function formatValue(value: unknown) {
  if (value == null) return '-';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return '[valor complexo]';
  }
}

export function AuditLogPanel({
  clientId,
  client,
  authToken,
  currentUser,
  canView,
}: AuditLogPanelProps) {
  const [entityTypeDraft, setEntityTypeDraft] = useState('');
  const [entityIdDraft, setEntityIdDraft] = useState('');
  const [periodPreset, setPeriodPreset] = useState<'24h' | '7d' | '30d' | 'all'>(
    '7d',
  );
  const [appliedFilters, setAppliedFilters] = useState({
    entityType: '',
    entityId: '',
    periodPreset: '7d' as '24h' | '7d' | '30d' | 'all',
  });

  const from = useMemo(() => {
    const now = Date.now();

    switch (appliedFilters.periodPreset) {
      case '24h':
        return new Date(now - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'all':
      default:
        return undefined;
    }
  }, [appliedFilters.periodPreset]);

  const { data, isLoading, isError, error } = useAuditLogs(
    {
      clientId,
      entityType: appliedFilters.entityType || undefined,
      entityId: appliedFilters.entityId || undefined,
      from,
      limit: 12,
    },
    authToken,
    canView,
  );

  if (!canView) {
    return (
      <AccessNotice
        title="Auditoria"
        description="A trilha de auditoria fica disponivel apenas para administradores."
        badge={currentUser?.role ?? 'sem sessao'}
        hint="Esse painel ajuda a atribuir alteracoes de faixa de temperatura e regras operacionais."
      />
    );
  }

  return (
    <Panel className="mt-6 p-4 sm:p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Governanca
          </p>
          <h2 className="mt-1 text-xl font-semibold">Auditoria recente</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Mostra quem alterou parametros criticos para reforcar responsabilidade operacional.
          </p>
          {client?.name ? (
            <p className="mt-2 text-xs text-muted">
              Historico de alteracoes da conta {client.name} ({client.id}).
            </p>
          ) : null}
        </div>
        <Badge>
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          rastreabilidade
        </Badge>
      </div>

      <div className="mb-5 grid gap-3 lg:grid-cols-[1fr_1fr_180px_auto]">
        <Input
          value={entityTypeDraft}
          onChange={(event) => setEntityTypeDraft(event.target.value)}
          placeholder="Filtrar por entidade, ex.: equipment"
        />
        <Input
          value={entityIdDraft}
          onChange={(event) => setEntityIdDraft(event.target.value)}
          placeholder="Filtrar por ID, ex.: freezer_01"
        />
        <Select
          value={periodPreset}
          onChange={(event) =>
            setPeriodPreset(event.target.value as '24h' | '7d' | '30d' | 'all')
          }
        >
          <option value="24h">Ultimas 24h</option>
          <option value="7d">Ultimos 7 dias</option>
          <option value="30d">Ultimos 30 dias</option>
          <option value="all">Todo periodo</option>
        </Select>
        <Button
          onClick={() =>
            setAppliedFilters({
              entityType: entityTypeDraft.trim(),
              entityId: entityIdDraft.trim(),
              periodPreset,
            })
          }
          variant="secondary"
          className="w-full lg:w-auto"
        >
          Aplicar filtros
        </Button>
      </div>

      {isLoading ? <Feedback>Carregando auditoria...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Falha ao carregar auditoria.'}
        </Feedback>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) > 0 ? (
        <div className="space-y-3">
          {(data ?? []).map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-line/70 bg-bg/30 p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-ink">
                    {entry.entityType} / {entry.entityId}
                  </p>
                  <p className="text-xs text-muted">
                    {entry.action}
                    {entry.fieldName ? ` - ${entry.fieldName}` : ''}
                  </p>
                </div>
                <Badge>
                  <FileSearch className="h-3.5 w-3.5 text-accent" />
                  {formatDistanceToNow(new Date(entry.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <div className="rounded-2xl border border-line/70 bg-card/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Antes</p>
                  <p className="mt-2 break-words text-ink">
                    {formatValue(entry.previousValue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-line/70 bg-card/30 p-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">Depois</p>
                  <p className="mt-2 break-words text-ink">
                    {formatValue(entry.nextValue)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs text-muted">
                Alterado por {entry.actorEmail ?? 'usuario nao identificado'}
                {entry.actorRole ? ` (${entry.actorRole})` : ''}.
              </p>
              {client?.adminName ? (
                <p className="mt-1 text-xs text-muted">
                  Responsavel principal registrado na conta: {client.adminName}.
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) === 0 ? (
        <Feedback>Nenhuma alteracao auditada foi registrada ainda.</Feedback>
      ) : null}
    </Panel>
  );
}
