'use client';

import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type FormState = {
  nome_empresa: string;
  nome_contato: string;
  telefone: string;
  email_acesso: string;
  confirmar_email: string;
  website_url: string;
};

const initialForm: FormState = {
  nome_empresa: '',
  nome_contato: '',
  telefone: '',
  email_acesso: '',
  confirmar_email: '',
  website_url: '',
};

export function PaymentForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const email = form.email_acesso.trim().toLowerCase();
    const confirmarEmail = form.confirmar_email.trim().toLowerCase();

    if (email !== confirmarEmail) {
      setError('Os e-mails informados não conferem.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/pagamentos/criar-cobranca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nome_empresa: form.nome_empresa.trim(),
          nome_contato: form.nome_contato.trim(),
          telefone: form.telefone,
          email_acesso: email,
          website_url: form.website_url,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; checkout_url?: string; message?: string }
        | null;

      if (!response.ok || !data?.ok || !data.checkout_url) {
        setError(
          data?.message ||
            'Não foi possível gerar o checkout agora. Tente novamente em instantes.',
        );
        return;
      }

      window.location.assign(data.checkout_url);
    } catch {
      setError(
        'Não foi possível conectar ao pagamento agora. Tente novamente em instantes.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="relative overflow-hidden rounded-[26px] border border-emerald-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(6,78,59,0.12),rgba(15,23,42,0.32))] p-6 md:p-7">
        <div className="absolute right-[-70px] top-[-80px] h-52 w-52 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-200/75">
                Assistente de IA • 6 meses
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1 text-white">
                <span className="pb-1 text-2xl font-semibold">6x de</span>
                <span className="font-display text-5xl font-semibold tracking-[-0.05em] text-emerald-300 md:text-6xl">
                  R$ 299
                </span>
              </div>
              <div className="mt-1 text-sm font-semibold text-emerald-100">sem juros no cartão</div>
            </div>
            <div className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-200">
              Plano atual
            </div>
          </div>

          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">
            Plano semestral com até 500 contatos únicos atendidos por mês, implantação inicial
            assistida e acesso ao Painel Administrativo. Agenda e integrações adicionais são
            módulos contratados conforme a operação.
          </p>

          <div className="mt-5 grid gap-3 border-t border-white/[0.08] pt-5 text-sm text-slate-200 sm:grid-cols-2">
            {[
              'Até 500 contatos únicos/mês',
              'Implantação inicial assistida',
              'Follow-up automático',
              'Painel Administrativo do cliente',
            ].map((item) => (
              <span key={item} className="inline-flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
                {item}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <CreditCard className="h-4 w-4 text-emerald-300" />
            <span>Valor total do plano: R$ 1.794,00. Pagamento processado com segurança pelo Mercado Pago.</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="nome_empresa" className="text-sm font-semibold text-slate-200">
            Nome da empresa
          </label>
          <input
            id="nome_empresa"
            name="nome_empresa"
            className="form-field"
            value={form.nome_empresa}
            onChange={(event) => updateField('nome_empresa', event.target.value)}
            autoComplete="organization"
            placeholder="Ex.: Clínica Horizonte"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="nome_contato" className="text-sm font-semibold text-slate-200">
            Seu nome
          </label>
          <input
            id="nome_contato"
            name="nome_contato"
            className="form-field"
            value={form.nome_contato}
            onChange={(event) => updateField('nome_contato', event.target.value)}
            autoComplete="name"
            placeholder="Nome do responsável"
            required
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="telefone" className="text-sm font-semibold text-slate-200">
            WhatsApp com DDD
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            className="form-field"
            value={form.telefone}
            onChange={(event) => updateField('telefone', event.target.value)}
            autoComplete="tel"
            placeholder="(31) 99999-9999"
            required
          />
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="email_acesso" className="text-sm font-semibold text-slate-200">
            E-mail para acesso ao Painel Administrativo
          </label>
          <input
            id="email_acesso"
            name="email_acesso"
            type="email"
            className="form-field"
            value={form.email_acesso}
            onChange={(event) => updateField('email_acesso', event.target.value)}
            autoComplete="email"
            placeholder="voce@empresa.com.br"
            required
          />
          <p className="text-xs leading-5 text-slate-500">
            Este será o e-mail usado para criar o acesso ao Painel Administrativo depois que o
            pagamento for aprovado.
          </p>
        </div>

        <div className="grid gap-2 sm:col-span-2">
          <label htmlFor="confirmar_email" className="text-sm font-semibold text-slate-200">
            Confirme o e-mail
          </label>
          <input
            id="confirmar_email"
            name="confirmar_email"
            type="email"
            className="form-field"
            value={form.confirmar_email}
            onChange={(event) => updateField('confirmar_email', event.target.value)}
            autoComplete="email"
            placeholder="Digite novamente o e-mail"
            required
          />
        </div>

        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_url">Website</label>
          <input
            id="website_url"
            name="website_url"
            tabIndex={-1}
            autoComplete="off"
            value={form.website_url}
            onChange={(event) => updateField('website_url', event.target.value)}
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-6 text-red-100">
          {error}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Gerando checkout seguro...
          </>
        ) : (
          <>
            <LockKeyhole className="h-4 w-4" />
            Ir para pagamento seguro
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 text-xs leading-6 text-slate-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
        <span>
          O preço é definido no servidor da Virtuagil e o pagamento é concluído
          no ambiente seguro do Mercado Pago. A Virtuagil não recebe nem armazena
          os dados do seu cartão.
        </span>
      </div>
    </form>
  );
}
