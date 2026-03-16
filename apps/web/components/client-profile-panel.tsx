'use client';

import { FormEvent, useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Save } from 'lucide-react';
import { isValidCpfOrCnpj, isValidEmail, isValidPhone } from '@/lib/client-form';
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
  const [adminName, setAdminName] = useState('');
  const [document, setDocument] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [useSameBillingPhone, setUseSameBillingPhone] = useState(true);
  const [billingEmail, setBillingEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setAdminName(data.adminName ?? '');
    setDocument(data.document ?? '');
    const nextAdminPhone = data.adminPhone ?? data.phone ?? '';
    const nextBillingName = data.billingName ?? data.adminName ?? '';
    const nextBillingPhone = data.billingPhone ?? nextAdminPhone;
    setAdminPhone(nextAdminPhone);
    setBillingName(nextBillingName);
    setBillingPhone(nextBillingPhone);
    setUseSameBillingPhone(nextBillingPhone === nextAdminPhone);
    setBillingEmail(data.billingEmail ?? '');
    setStatus(data.status);
    setNotes(data.notes ?? '');
  }, [data]);

  if (!clientId) {
    return (
      <AccessNotice
        title="Perfil comercial do cliente"
        description="Selecione um cliente para revisar o cadastro comercial minimo da conta."
        badge="cliente obrigatorio"
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
    setFormError(null);

    if (!document.trim() || !isValidCpfOrCnpj(document)) {
      setFormError('Informe um CPF ou CNPJ valido.');
      return;
    }

    if (!adminName.trim()) {
      setFormError('Informe o nome do administrador.');
      return;
    }

    if (!adminPhone.trim() || !isValidPhone(adminPhone)) {
      setFormError('Informe um telefone valido para o administrador.');
      return;
    }

    const nextBillingPhone = useSameBillingPhone ? adminPhone : billingPhone;
    if (!nextBillingPhone.trim() || !isValidPhone(nextBillingPhone)) {
      setFormError('Informe um telefone valido para o financeiro.');
      return;
    }

    if (!billingEmail.trim() || !isValidEmail(billingEmail)) {
      setFormError('Informe um e-mail financeiro valido.');
      return;
    }

    await updateMutation.mutateAsync({
      name: name.trim() || undefined,
      adminName: adminName.trim() || undefined,
      document: document.trim() || undefined,
      adminPhone: adminPhone.trim() || undefined,
      billingName: (useSameBillingPhone ? adminName : billingName).trim() || undefined,
      billingPhone: nextBillingPhone.trim() || undefined,
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
      {formError ? (
        <Feedback variant="danger" className="mb-3">
          {formError}
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
              <p className="mt-2 text-sm font-medium text-ink">
                {data.name}
              </p>
              <p className="mt-1 text-xs text-muted">Codigo interno: {data.id}</p>
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
                <label className="mb-1 block text-xs text-muted">CPF ou CNPJ *</label>
                <Input
                  value={document}
                  onChange={(event) => setDocument(event.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Nome do administrador *</label>
                <Input
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  placeholder="Fabio Abdo"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Contato do administrador *</label>
                <Input
                  value={adminPhone}
                  onChange={(event) => setAdminPhone(event.target.value)}
                  placeholder="(31) 99999-0000"
                />
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-line/70"
                    checked={useSameBillingPhone}
                    onChange={(event) => setUseSameBillingPhone(event.target.checked)}
                  />
                  Usar o mesmo telefone para financeiro
                </label>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Nome do financeiro</label>
                <Input
                  value={useSameBillingPhone ? adminName : billingName}
                  onChange={(event) => setBillingName(event.target.value)}
                  disabled={useSameBillingPhone}
                  placeholder="Financeiro Cuidare"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Contato financeiro {useSameBillingPhone ? '' : '*'}
                </label>
                <Input
                  value={useSameBillingPhone ? adminPhone : billingPhone}
                  onChange={(event) => setBillingPhone(event.target.value)}
                  disabled={useSameBillingPhone}
                  placeholder="(31) 3333-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs text-muted">E-mail financeiro *</label>
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
                className="w-full rounded-2xl border border-line/70 bg-bg/40 px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 placeholder:italic focus:border-accent focus:bg-card/80 disabled:opacity-60"
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
