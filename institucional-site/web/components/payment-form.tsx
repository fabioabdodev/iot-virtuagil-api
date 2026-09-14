'use client';

import { FormEvent, useState } from 'react';
import { ArrowRight, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PaymentForm() {
  const [clienteId, setClienteId] = useState('');
  const [descricao, setDescricao] = useState('Implantacao Atendente IA Virtuagil');
  const [valor, setValor] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const numericValue = Number(valor.replace(',', '.'));

    if (!Number.isFinite(numericValue) || numericValue <= 0) {
      setError('Confira o valor informado na proposta.');
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
          cliente_id: clienteId.trim(),
          descricao: descricao.trim(),
          valor: numericValue,
          email: email.trim(),
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
          Use exatamente o identificador informado pela Virtuagil na sua proposta.
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

      <div className="grid gap-4 sm:grid-cols-[1fr_0.72fr]">
        <div className="grid gap-2">
          <label htmlFor="descricao" className="text-sm font-semibold text-stone-200">
            Descricao
          </label>
          <input
            id="descricao"
            name="descricao"
            value={descricao}
            onChange={(event) => setDescricao(event.target.value)}
            required
            maxLength={180}
            className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#d68642]"
          />
        </div>

        <div className="grid gap-2">
          <label htmlFor="valor" className="text-sm font-semibold text-stone-200">
            Valor combinado
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">
              R$
            </span>
            <input
              id="valor"
              name="valor"
              inputMode="decimal"
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="0,00"
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-stone-500 focus:border-[#d68642]"
            />
          </div>
        </div>
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
            Ir para o Mercado Pago
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-6 text-stone-400">
        <ShieldCheck className="mt-0.5 h-4 w-4 flex-none text-[#4c9a78]" />
        <span>
          O pagamento e concluido no ambiente seguro do Mercado Pago. A Virtuagil nao recebe nem armazena dados do seu cartao.
        </span>
      </div>
    </form>
  );
}
