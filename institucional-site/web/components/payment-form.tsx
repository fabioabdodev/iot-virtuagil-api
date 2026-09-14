'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PLAN_ID = 'fundador_500';
const PLAN_PRICE = 249;

export function PaymentForm() {
  const [clienteId, setClienteId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/pagamentos/criar-cobranca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteId.trim(),
          email: email.trim(),
          plano: PLAN_ID,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; checkout_url?: string; message?: string }
        | null;

      if (!response.ok || !data?.checkout_url) {
        setError(data?.message || 'Nao foi possivel gerar o pagamento agora.');
        return;
      }

      window.location.assign(data.checkout_url);
    } catch {
      setError('Nao foi possivel conectar ao pagamento agora. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="rounded-2xl border border-[#6a4a31] bg-[#d68642]/8 p-5">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#e5a266]">
          Plano Fundador
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span className="font-serif text-4xl text-white">R$ {PLAN_PRICE}</span>
          <span className="pb-1 text-sm text-stone-400">/mes</span>
        </div>
        <p className="mt-2 text-xs leading-6 text-stone-400">
          Ate 500 atendimentos por mes. Implantacao gratuita para as 10 primeiras vagas.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="cliente_id" className="text-sm font-semibold text-stone-200">
          Codigo do cliente
        </label>
        <input
          id="cliente_id"
          name="cliente_id"
          value={clienteId}
          onChange={(event) => setClienteId(event.target.value)}
          placeholder="Ex.: minha_empresa"
          autoComplete="off"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#d68642]"
        />
        <p className="text-xs leading-5 text-stone-400">
          Use exatamente o identificador informado pela Virtuagil. Se ainda nao recebeu o codigo, fale com a Jade antes de pagar.
        </p>
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-stone-200">
          E-mail do pagador
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com.br"
          autoComplete="email"
          required
          className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#d68642]"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
          {error}
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
        {loading ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Gerando pagamento...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Pagar R$ {PLAN_PRICE} no Mercado Pago
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-stone-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
        <span>
          O valor do plano e definido pela Virtuagil e validado no servidor. O pagamento e concluido no ambiente seguro do Mercado Pago; a Virtuagil nao recebe nem armazena dados do seu cartao.
        </span>
      </div>
    </form>
  );
}
