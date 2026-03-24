'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Copy, Eye, EyeOff, RefreshCcw, Save } from 'lucide-react';
import { isValidCpfOrCnpj, isValidEmail, isValidPhone } from '@/lib/client-form';
import { useClient } from '@/hooks/use-client';
import { useClientMutations } from '@/hooks/use-client-mutations';
import { AuthUser } from '@/types/auth';
import { ClientStatus } from '@/types/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Feedback } from '@/components/ui/feedback';
import { Input, Select } from '@/components/ui/input';
import { Panel } from '@/components/ui/panel';
import { AccessNotice } from '@/components/ui/access-notice';
import { formatRelativeDateTime } from '@/lib/date';

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

type PhoneField = 'adminPhone' | 'alertPhone' | 'billingPhone';
type NotifyIntensity = 'low' | 'medium' | 'high';

const NOTIFY_COOLDOWN_PRESETS: Array<{
  key: NotifyIntensity;
  label: string;
  description: string;
  minutes: number;
}> = [
  {
    key: 'low',
    label: 'Pouco',
    description: 'Menos mensagens (anti-spam forte)',
    minutes: 15,
  },
  {
    key: 'medium',
    label: 'Medio',
    description: 'Equilibrado para operacao diaria',
    minutes: 5,
  },
  {
    key: 'high',
    label: 'Muito',
    description: 'Mais mensagens (maior sensibilidade)',
    minutes: 1,
  },
];

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
  const [alertPhone, setAlertPhone] = useState('');
  const [deviceApiKey, setDeviceApiKey] = useState('');
  const [billingName, setBillingName] = useState('');
  const [billingPhone, setBillingPhone] = useState('');
  const [actuationNotifyCooldownMinutes, setActuationNotifyCooldownMinutes] =
    useState('15');
  const [useSameAlertPhone, setUseSameAlertPhone] = useState(true);
  const [useSameBillingPhone, setUseSameBillingPhone] = useState(true);
  const [billingEmail, setBillingEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [phoneFieldError, setPhoneFieldError] = useState<PhoneField | null>(null);
  const [phoneFieldErrorMessage, setPhoneFieldErrorMessage] = useState<string | null>(null);
  const [copiedDeviceApiKey, setCopiedDeviceApiKey] = useState(false);
  const [showDeviceApiKey, setShowDeviceApiKey] = useState(false);
  const [isRotateDeviceApiKeyConfirmOpen, setIsRotateDeviceApiKeyConfirmOpen] =
    useState(false);

  useEffect(() => {
    if (!data) return;
    setName(data.name ?? '');
    setAdminName(data.adminName ?? '');
    setDocument(data.document ?? '');
    const nextAdminPhone = data.adminPhone ?? data.phone ?? '';
    const nextAlertPhone = data.alertPhone ?? nextAdminPhone;
    const nextBillingName = data.billingName ?? data.adminName ?? '';
    const nextBillingPhone = data.billingPhone ?? nextAdminPhone;
    setAdminPhone(nextAdminPhone);
    setAlertPhone(nextAlertPhone);
    setDeviceApiKey(data.deviceApiKey ?? '');
    setBillingName(nextBillingName);
    setBillingPhone(nextBillingPhone);
    setActuationNotifyCooldownMinutes(
      String(data.actuationNotifyCooldownMinutes ?? 15),
    );
    setUseSameAlertPhone(nextAlertPhone === nextAdminPhone);
    setUseSameBillingPhone(nextBillingPhone === nextAdminPhone);
    setBillingEmail(data.billingEmail ?? '');
    setStatus(data.status);
    setNotes(data.notes ?? '');
    setPhoneFieldError(null);
    setPhoneFieldErrorMessage(null);
  }, [data]);

  useEffect(() => {
    const apiErrorMessage = updateMutation.error?.message;
    if (!apiErrorMessage) return;

    const fieldMatch = apiErrorMessage.match(/\[field:([^\]]+)\]/);
    if (!fieldMatch) return;

    const fields = fieldMatch[1]
      .split('|')
      .map((value) => value.trim())
      .filter(Boolean);

    const field = fields.find((value): value is PhoneField =>
      value === 'adminPhone' || value === 'alertPhone' || value === 'billingPhone',
    );

    if (!field) return;

    setPhoneFieldError(field);
    setPhoneFieldErrorMessage(
      apiErrorMessage.replace(/\s*\[field:[^\]]+\]\s*/, '').trim(),
    );
  }, [updateMutation.error]);

  function clearPhoneFieldError() {
    setPhoneFieldError(null);
    setPhoneFieldErrorMessage(null);
  }

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
    clearPhoneFieldError();

    if (!document.trim() || !isValidCpfOrCnpj(document)) {
      setFormError('Informe um CPF ou CNPJ valido.');
      return;
    }

    if (!adminName.trim()) {
      setFormError('Informe o nome do administrador.');
      return;
    }

    if (!adminPhone.trim() || !isValidPhone(adminPhone)) {
      setPhoneFieldError('adminPhone');
      setPhoneFieldErrorMessage('Informe um telefone valido para o administrador.');
      setFormError('Informe um telefone valido para o administrador.');
      return;
    }

    const nextAlertPhone = useSameAlertPhone ? adminPhone : alertPhone;
    if (!nextAlertPhone.trim() || !isValidPhone(nextAlertPhone)) {
      setPhoneFieldError('alertPhone');
      setPhoneFieldErrorMessage('Informe um WhatsApp valido para alertas.');
      setFormError('Informe um WhatsApp valido para alertas.');
      return;
    }

    const nextBillingPhone = useSameBillingPhone ? adminPhone : billingPhone;
    if (!nextBillingPhone.trim() || !isValidPhone(nextBillingPhone)) {
      setPhoneFieldError('billingPhone');
      setPhoneFieldErrorMessage('Informe um telefone valido para o financeiro.');
      setFormError('Informe um telefone valido para o financeiro.');
      return;
    }

    if (!billingEmail.trim() || !isValidEmail(billingEmail)) {
      setFormError('Informe um e-mail financeiro valido.');
      return;
    }

    const parsedActuationNotifyCooldownMinutes = Number(
      actuationNotifyCooldownMinutes,
    );
    if (
      !Number.isFinite(parsedActuationNotifyCooldownMinutes) ||
      parsedActuationNotifyCooldownMinutes < 1 ||
      parsedActuationNotifyCooldownMinutes > 240
    ) {
      setFormError(
        'Cooldown de acionamento invalido. Use um valor entre 1 e 240 minutos.',
      );
      return;
    }

    await updateMutation.mutateAsync({
      name: name.trim() || undefined,
      adminName: adminName.trim() || undefined,
      document: document.trim() || undefined,
      adminPhone: adminPhone.trim() || undefined,
      alertPhone: nextAlertPhone.trim() || undefined,
      billingName: (useSameBillingPhone ? adminName : billingName).trim() || undefined,
      billingPhone: nextBillingPhone.trim() || undefined,
      billingEmail: billingEmail.trim() || undefined,
      actuationNotifyCooldownMinutes: Math.floor(
        parsedActuationNotifyCooldownMinutes,
      ),
      status,
      notes: notes.trim() || undefined,
    });
  }

  async function handleRotateDeviceApiKey() {
    setFormError(null);
    const updatedClient = await updateMutation.mutateAsync({
      regenerateDeviceApiKey: true,
    });
    setDeviceApiKey(updatedClient.deviceApiKey ?? '');
  }

  async function handleCopyDeviceApiKey() {
    if (!deviceApiKey) return;

    try {
      await navigator.clipboard.writeText(deviceApiKey);
      setCopiedDeviceApiKey(true);
      window.setTimeout(() => {
        setCopiedDeviceApiKey(false);
      }, 1600);
    } catch {
      setFormError('Nao foi possivel copiar a chave do device.');
    }
  }

  return (
    <Panel className="p-4 sm:p-5">
      <ConfirmDialog
        open={isRotateDeviceApiKeyConfirmOpen}
        title="Gerar nova chave do equipamento?"
        description={
          <>
            <strong>Acao de alto impacto.</strong> Tem certeza que deseja gerar uma
            nova chave? Isso invalida a chave atual e pode interromper o envio de
            dados de <strong>todos os devices deste cliente</strong> ate que cada
            integracao/firmware seja atualizada com a nova chave.
          </>
        }
        confirmLabel="Gerar nova chave"
        loading={updateMutation.isPending}
        onCancel={() => setIsRotateDeviceApiKeyConfirmOpen(false)}
        onConfirm={async () => {
          try {
            await handleRotateDeviceApiKey();
          } finally {
            setIsRotateDeviceApiKeyConfirmOpen(false);
          }
        }}
      />

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
      {updateMutation.isError && !phoneFieldError ? (
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
        <Feedback variant="success" className="mb-3">
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
                {formatRelativeDateTime(data.updatedAt)}
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
                <label className="mb-1 block text-xs text-muted">
                  Nome do contato principal (administrador) *
                </label>
                <Input
                  value={adminName}
                  onChange={(event) => setAdminName(event.target.value)}
                  placeholder="Fabio Abdo"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  WhatsApp do contato principal *
                </label>
                <Input
                  value={adminPhone}
                  onChange={(event) => {
                    setAdminPhone(event.target.value);
                    clearPhoneFieldError();
                  }}
                  placeholder="(31) 99999-0000"
                  className={
                    phoneFieldError === 'adminPhone'
                      ? 'border-bad/60 focus:border-bad'
                      : undefined
                  }
                />
                {phoneFieldError === 'adminPhone' && phoneFieldErrorMessage ? (
                  <p className="mt-1 text-xs text-bad">{phoneFieldErrorMessage}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Chave do device da conta</label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                  <Input
                    type={showDeviceApiKey ? 'text' : 'password'}
                    value={deviceApiKey}
                    readOnly
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="Gerada automaticamente por cliente"
                    className="sm:flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDeviceApiKey((current) => !current)}
                    disabled={!deviceApiKey}
                    className="sm:self-stretch"
                  >
                    {showDeviceApiKey ? (
                      <EyeOff className="mr-2 h-3.5 w-3.5" />
                    ) : (
                      <Eye className="mr-2 h-3.5 w-3.5" />
                    )}
                    {showDeviceApiKey ? 'Ocultar' : 'Mostrar'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => void handleCopyDeviceApiKey()}
                    disabled={!deviceApiKey}
                    className="sm:self-stretch"
                  >
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Copiar
                  </Button>
                </div>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    loading={updateMutation.isPending}
                    onClick={() => setIsRotateDeviceApiKeyConfirmOpen(true)}
                  >
                    <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                    Gerar nova chave
                  </Button>
                </div>
                {copiedDeviceApiKey ? (
                  <p className="mt-1 text-xs text-ok">Chave copiada.</p>
                ) : (
                  <p className="mt-1 text-xs text-muted">
                    A chave permanece protegida na tela e pode ser copiada para uso no firmware.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Anti-spam de acionamento (minutos)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={240}
                  step={1}
                  value={actuationNotifyCooldownMinutes}
                  onChange={(event) =>
                    setActuationNotifyCooldownMinutes(event.target.value)
                  }
                  placeholder="Ex.: 5"
                />
                <p className="mt-1 text-xs text-muted">
                  Evita mensagens repetidas de ligar/desligar em pouco tempo.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  Intensidade de mensagens
                </label>
                <div className="grid gap-2 sm:grid-cols-3">
                  {NOTIFY_COOLDOWN_PRESETS.map((preset) => {
                    const isActive =
                      Number(actuationNotifyCooldownMinutes) === preset.minutes;

                    return (
                      <button
                        key={preset.key}
                        type="button"
                        onClick={() =>
                          setActuationNotifyCooldownMinutes(String(preset.minutes))
                        }
                        className={`rounded-xl border px-3 py-2 text-left transition ${
                          isActive
                            ? 'border-accent bg-accent/15 text-ink'
                            : 'border-line/70 bg-bg/30 text-muted hover:border-accent/60'
                        }`}
                      >
                        <p className="text-sm font-medium">{preset.label}</p>
                        <p className="mt-1 text-xs">{preset.description}</p>
                        <p className="mt-1 text-xs">
                          {preset.minutes} min
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-line/70"
                    checked={useSameAlertPhone}
                    onChange={(event) => {
                      setUseSameAlertPhone(event.target.checked);
                      clearPhoneFieldError();
                    }}
                  />
                  Usar o mesmo WhatsApp para alertas
                </label>
                <p className="text-xs text-muted">
                  Quando marcado, os alertas e a Jade usam o mesmo WhatsApp do contato principal.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">
                  WhatsApp principal para alertas {useSameAlertPhone ? '' : '*'}
                </label>
                <Input
                  value={useSameAlertPhone ? adminPhone : alertPhone}
                  onChange={(event) => {
                    setAlertPhone(event.target.value);
                    clearPhoneFieldError();
                  }}
                  disabled={useSameAlertPhone}
                  placeholder="(31) 99999-0001"
                  className={
                    phoneFieldError === 'alertPhone'
                      ? 'border-bad/60 focus:border-bad'
                      : undefined
                  }
                />
                {phoneFieldError === 'alertPhone' && phoneFieldErrorMessage ? (
                  <p className="mt-1 text-xs text-bad">{phoneFieldErrorMessage}</p>
                ) : null}
              </div>
              <div>
                <label className="mb-2 flex items-center gap-2 text-xs text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-line/70"
                    checked={useSameBillingPhone}
                    onChange={(event) => {
                      setUseSameBillingPhone(event.target.checked);
                      clearPhoneFieldError();
                    }}
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
                  onChange={(event) => {
                    setBillingPhone(event.target.value);
                    clearPhoneFieldError();
                  }}
                  disabled={useSameBillingPhone}
                  placeholder="(31) 3333-0000"
                  className={
                    phoneFieldError === 'billingPhone'
                      ? 'border-bad/60 focus:border-bad'
                      : undefined
                  }
                />
                {phoneFieldError === 'billingPhone' && phoneFieldErrorMessage ? (
                  <p className="mt-1 text-xs text-bad">{phoneFieldErrorMessage}</p>
                ) : null}
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
