'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Save } from 'lucide-react';
import { useClient } from '@/hooks/use-client';
import { useClientMutations } from '@/hooks/use-client-mutations';
import { AuthUser } from '@/types/auth';
import { ClientStatus } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { AccessNotice } from '@/components/ui/access-notice';

interface ClientProfilePanelProps {
  clientId?: string;
  authToken?: string;
  currentUser?: AuthUser | null;
  canManage: boolean;
  blockedReason?: string;
}

const statusLabels: Record<ClientStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  delinquent: 'Pendente',
};

const statusBadgeClassName: Record<ClientStatus, string> = {
  active: 'bg-ok/10 text-ok border-ok/20',
  inactive: 'bg-muted/20 text-muted border-line/70',
  delinquent: 'bg-bad/10 text-bad border-bad/20',
};

export function ClientProfilePanel({
  clientId,
  authToken,
  currentUser,
  canManage,
  blockedReason,
}: ClientProfilePanelProps) {
  const { data, isLoading, isError, error } = useClient(
    clientId,
    authToken,
    Boolean(canManage),
  );
  const { updateMutation } = useClientMutations(clientId, authToken);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setDocument(data.document ?? '');
    setPhone(data.phone ?? '');
    setBillingEmail(data.billingEmail ?? '');
    setStatus(data.status);
    setNotes(data.notes ?? '');
  }, [data]);

  if (!clientId) {
    return (
      <AccessNotice
        title="Perfil comercial do cliente"
        description="Selecione um cliente para revisar o cadastro comercial minimo da conta."
        badge="clientId obrigatorio"
        hint="Esse painel ajuda a preparar onboarding, status da conta e contato financeiro sem virar um modulo de cobranca ainda."
      />
    );
  }

  if (!canManage) {
    return (
      <AccessNotice
        title="Perfil comercial do cliente"
        description="Este painel fica restrito a usuarios admin para evitar mudancas comerciais indevidas."
        badge="acesso restrito"
        hint={blockedReason}
      />
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await updateMutation.mutateAsync({
      name: name.trim() || undefined,
      document: document.trim() || undefined,
      phone: phone.trim() || undefined,
      billingEmail: billingEmail.trim() || undefined,
      status,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Panel className="p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            Gestao comercial
          </p>
          <h2 className="mt-1 text-xl font-semibold">Perfil do cliente</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Guarde o minimo necessario para onboarding, contato financeiro e
            acompanhamento manual da conta sem transformar o produto em ERP.
          </p>
        </div>
        {data ? (
          <Badge className={statusBadgeClassName[data.status]}>
            {statusLabels[data.status]}
          </Badge>
        ) : null}
      </div>

      {isLoading ? <Feedback>Carregando dados do cliente...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Falha ao carregar perfil do cliente.'}
        </Feedback>
      ) : null}
      {updateMutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {updateMutation.error?.message ??
            'Falha ao atualizar dados comerciais do cliente.'}
        </Feedback>
      ) : null}
      {updateMutation.isSuccess ? (
        <Feedback className="mb-3">
          Dados comerciais atualizados com sucesso.
        </Feedback>
      ) : null}

      {data ? (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Cliente
              </p>
              <p className="mt-2 text-sm font-medium text-ink">{data.id}</p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Atualizado
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {formatDistanceToNow(new Date(data.updatedAt), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </p>
            </div>
            <div className="rounded-2xl border border-line/70 bg-bg/30 p-3">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">
                Responsavel
              </p>
              <p className="mt-2 text-sm font-medium text-ink">
                {currentUser?.name ?? 'Admin'}
              </p>
            </div>
          </div>

          <form className="grid gap-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-muted">Nome</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Status da conta</label>
                <Select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as ClientStatus)}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="delinquent">Pendente</option>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Documento</label>
                <Input
                  value={document}
                  onChange={(event) => setDocument(event.target.value)}
                  placeholder="CPF ou CNPJ"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Celular / WhatsApp</label>
                <Input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="(31) 99999-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted">E-mail financeiro</label>
                <Input
                  type="email"
                  value={billingEmail}
                  onChange={(event) => setBillingEmail(event.target.value)}
                  placeholder="financeiro@cliente.com.br"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Observacoes internas</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-line/70 bg-bg/40 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted focus:border-accent focus:bg-card/80 disabled:opacity-60"
                placeholder="Ex.: mensalidade cobrada manualmente no dia 10, onboarding acompanhado por voce, cliente interessado em expandir para novos modulos."
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                loading={updateMutation.isPending}
                className="px-4 py-2.5"
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar perfil do cliente
              </Button>
            </div>
          </form>
        </>
      ) : null}
    </Panel>
  );
}
