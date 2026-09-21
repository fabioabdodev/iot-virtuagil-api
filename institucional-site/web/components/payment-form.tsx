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
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const email = form.email_acesso.trim().toLowerCase();
    const confirmarEmail = form.confirmar_email.trim().toLowerCase();

    if (!acceptedTerms) {
      setError('Leia e aceite os Termos de Contratação e a Política de Privacidade para continuar.');
      return;
    }

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
          aceite_termos: acceptedTerms,
          termos_versao: '2026-09-21',
          canal_aceite: 'site_virtuagil',
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
      <div className="rounded-[22px] border border-emerald-300/15 bg-emerald-300/[0.055] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200/70">
              Assistente de IA • 6 meses
            </div>
            <div className="mt-2 font-display text-4xl font-semibold tracking-[-0.04em] text-white">
              R$ 1.794
            </div>
            <p className="mt-2 text-xs leading-6 text-slate-400">
              Pix ou cartão, com até 6 parcelas disponíveis no checkout.
            </p>
          </div>
          <div className="grid h-11 w-11 flex-none place-items-center rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.08]">
            <CreditCard className="h-5 w-5 text-emerald-300" />
          </div>
        </div>

        <div className="mt-4 grid gap-2 border-t border-white/[0.07] pt-4 text-xs text-slate-300 sm:grid-cols-2">
          {[
            'Até 500 atendimentos/mês',
            'Implantação inicial assistida',
            'Follow-up automático',
            'Painel Administrativo do cliente',
          ].map((item) => (
            <span key={item} className="inline-flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-none text-emerald-300" />
              {item}
            </span>
          ))}
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

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-6 text-slate-300">
          <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} className="mt-1 h-4 w-4" required />
          <span>Li e aceito os <a href="/termos-assistente-ia" target="_blank" className="font-semibold text-emerald-300 underline">Termos de Contratação</a> e a <a href="/privacidade" target="_blank" className="font-semibold text-emerald-300 underline">Política de Privacidade</a>. Estou ciente de que 6x de R$ 299,00 corresponde ao parcelamento do plano semestral de R$ 1.794,00 e de que linha/chip ou eSIM, aparelho e plano da operadora não estão incluídos. Li também os requisitos de uso do WhatsApp e implantação.</span>
        </label>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/[0.08] px-4 py-3 text-sm leading-6 text-red-100">
          {error}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={loading || !acceptedTerms} className="w-full">
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
