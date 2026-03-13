'use client';

import { Boxes, LockOpen } from 'lucide-react';
import { useClientModuleMutations } from '@/hooks/use-client-module-mutations';
import { useClientModules } from '@/hooks/use-client-modules';
import { AuthUser } from '@/types/auth';
import { AccessNotice } from '@/components/ui/access-notice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Panel } from '@/components/ui/panel';

type ClientModulesPanelProps = {
  clientId?: string;
  authToken?: string;
  currentUser: AuthUser | null;
  canManage: boolean;
  blockedReason?: string;
};

export function ClientModulesPanel({
  clientId,
  authToken,
  currentUser,
  canManage,
  blockedReason,
}: ClientModulesPanelProps) {
  const { data, isLoading, isError, error } = useClientModules(
    clientId,
    authToken,
    canManage,
  );
  const mutation = useClientModuleMutations(clientId, authToken);

  if (!clientId) {
    return <AccessNotice title="Modulos contratados" description="Selecione um cliente para consultar e ajustar os modulos habilitados na conta." badge="clientId obrigatorio" hint="A contratacao e gerenciada cliente a cliente, por isso esse painel precisa de um tenant definido." />;
  }

  if (!canManage) {
    return (
      <AccessNotice
        title="Modulos contratados"
        description="A habilitacao de modulos contratados e uma acao administrativa, usada para controlar o que cada cliente pode operar."
        badge={currentUser?.role ?? 'sem permissao'}
        tone="warning"
        hint={blockedReason ?? 'Entre com um usuario admin para alterar contratacao de temperatura e acionamento.'}
      />
    );
  }

  return (
    <Panel className="animate-fade-up p-5 [animation-delay:360ms]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Modulos do cliente</h2>
          <p className="mt-1 text-sm text-muted">
            Habilite apenas o que foi contratado em cada operacao.
          </p>
        </div>
        <Badge>
          <Boxes className="h-3.5 w-3.5 text-accent" />
          {currentUser?.role ?? 'sem sessao'}
        </Badge>
      </div>

      {mutation.isError ? (
        <Feedback variant="danger" className="mb-3">
          {mutation.error?.message ?? 'Falha ao atualizar modulos do cliente.'}
        </Feedback>
      ) : null}

      {isLoading ? <Feedback>Carregando modulos...</Feedback> : null}
      {isError ? (
        <Feedback variant="danger">
          {error?.message ?? 'Erro ao carregar modulos do cliente.'}
        </Feedback>
      ) : null}

      {!isLoading && !isError && (data?.length ?? 0) > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {(data ?? []).map((module) => (
            <Panel key={module.moduleKey} variant="strong" className="p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold">{module.name}</h3>
                  <p className="mt-1 text-sm text-muted">{module.description}</p>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs ${
                    module.enabled
                      ? 'border-ok/30 bg-ok/10 text-ok'
                      : 'border-line/70 bg-card/50 text-muted'
                  }`}
                >
                  {module.enabled ? 'Habilitado' : 'Desabilitado'}
                </span>
              </div>

              <Button
                variant={module.enabled ? 'secondary' : 'primary'}
                loading={mutation.isPending}
                onClick={() => {
                  void mutation.mutateAsync({
                    clientId,
                    moduleKey: module.moduleKey,
                    enabled: !module.enabled,
                  });
                }}
              >
                <LockOpen className="h-3.5 w-3.5" />
                {module.enabled ? 'Desabilitar' : 'Habilitar'}
              </Button>
            </Panel>
          ))}
        </div>
      ) : null}
    </Panel>
  );
}
