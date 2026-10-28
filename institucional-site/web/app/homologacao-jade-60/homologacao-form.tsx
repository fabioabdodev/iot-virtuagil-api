'use client';

import { FormEvent, useState } from 'react';
import { CONTRACT_PATH, CONTRACT_VERSION, PRIVACY_PATH } from '@/lib/legal';

export function HomologacaoForm({ chave }: { chave: string }) {
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const [checkout,setCheckout] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    const form = new FormData(event.currentTarget);
    if (String(form.get('email_acesso')).trim().toLowerCase() !==
        String(form.get('confirmar_email')).trim().toLowerCase()) {
      setError('Os e-mails precisam ser iguais.'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/homologacao-jade-60', {
        method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          chave,
          nome_empresa:form.get('nome_empresa'),
          nome_contato:form.get('nome_contato'),
          telefone:form.get('telefone'),
          email_acesso:form.get('email_acesso'),
          aceite_termos:form.get('aceite_termos') === 'on',
          termos_versao:CONTRACT_VERSION
        })
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.checkout_url) {
        setError(data.message || 'Não foi possível criar o checkout.'); return;
      }
      setCheckout(data.checkout_url);
    } catch { setError('Não foi possível conectar ao checkout.'); }
    finally { setLoading(false); }
  }
  if (checkout) return (
    <div className="space-y-5 rounded-2xl border border-emerald-400/40 bg-emerald-400/5 p-6">
      <h2 className="text-xl font-bold text-emerald-200">Checkout de R$ 60 preparado</h2>
      <p className="text-slate-200">O pagamento ainda NÃO foi realizado. Abra o Mercado Pago,
        confira o valor, quem receberá e as opções de parcelamento antes de pagar.
        Não utilize a mesma conta Mercado Pago como vendedor e comprador.</p>
      <a href={checkout} rel="noreferrer noopener" className="block rounded-xl bg-emerald-400 p-4 text-center font-bold text-slate-950">
        Conferir pagamento no Mercado Pago
      </a>
    </div>
  );
  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <p className="text-sm text-amber-200">Homologação restrita • R$ 60,00 no total •
        até 6 parcelas, sujeitas às condições apresentadas pelo Mercado Pago.</p>
      {[
        ['nome_empresa','Empresa de teste','text'],
        ['nome_contato','Nome do responsável','text'],
        ['telefone','WhatsApp com DDD','tel'],
        ['email_acesso','E-mail para receber o acesso','email'],
        ['confirmar_email','Confirme o e-mail','email'],
      ].map(([name,label,type])=>(
        <label key={name} className="block text-sm text-slate-200">
          <span className="mb-1 block">{label}</span>
          <input name={name} type={type} required maxLength={name==='email_acesso'||name==='confirmar_email'?254:120}
            className="w-full rounded-lg border border-white/20 bg-black/30 p-3 text-white"/>
        </label>
      ))}
      <label className="flex items-start gap-2 text-sm text-slate-300">
        <input name="aceite_termos" type="checkbox" required className="mt-1"/>
        <span>Li e aceito os <a className="underline" href={CONTRACT_PATH} target="_blank" rel="noreferrer">Termos de Contratação</a> e a
        <a className="ml-1 underline" href={PRIVACY_PATH} target="_blank" rel="noreferrer">Política de Privacidade</a>.</span>
      </label>
      {error && <p role="alert" className="text-red-300">{error}</p>}
      <button disabled={loading} type="submit" className="w-full rounded-xl bg-emerald-400 p-4 font-bold text-slate-950 disabled:opacity-50">
        {loading?'Validando checkout...':'Preparar checkout de R$ 60'}
      </button>
      <p className="text-xs text-slate-400">O checkout é preparado pelo sistema da Virtuagil.
        O pagamento só acontece no site do Mercado Pago, após a sua autorização.</p>
    </form>
  );
}
