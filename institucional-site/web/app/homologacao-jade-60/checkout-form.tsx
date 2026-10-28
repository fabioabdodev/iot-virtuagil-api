'use client';

import { useState, type FormEvent } from 'react';
import { CONTRACT_PATH, CONTRACT_VERSION, PRIVACY_PATH } from '@/lib/legal';

type Fields = {
  nome_empresa: string;
  nome_contato: string;
  telefone: string;
  email_acesso: string;
  confirmar_email: string;
  website_url: string;
};

export function CheckoutHomologacaoForm({ token }: { token: string }) {
  const [fields, setFields] = useState<Fields>({
    nome_empresa: '', nome_contato: '', telefone: '',
    email_acesso: '', confirmar_email: '', website_url: '',
  });
  const [aceito, setAceito] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [checkout, setCheckout] = useState('');

  function change(field: keyof Fields, value: string) {
    setFields(current => ({ ...current, [field]: value }));
  }

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro('');
    if (!aceito) return setErro('Aceite os Termos de Contratação antes de prosseguir.');
    if (fields.email_acesso.trim().toLowerCase() !== fields.confirmar_email.trim().toLowerCase()) {
      return setErro('Os e-mails informados não conferem.');
    }
    setEnviando(true);
    try {
      const response = await fetch('/api/pagamentos/checkout-homologacao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          token,
          nome_empresa: fields.nome_empresa,
          nome_contato: fields.nome_contato,
          telefone: fields.telefone,
          email_acesso: fields.email_acesso,
          website_url: fields.website_url,
          aceite_termos: true,
          termos_versao: CONTRACT_VERSION,
        }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || data?.ok !== true || data?.valor_total !== 60 ||
          typeof data?.checkout_url !== 'string') {
        throw new Error(data?.message || 'Não foi possível preparar este checkout.');
      }
      setCheckout(data.checkout_url);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao preparar checkout.');
    } finally {
      setEnviando(false);
    }
  }

  if (checkout) {
    return (
      <section role="status" className="grid gap-4">
        <h2 className="text-xl font-bold text-white">Checkout preparado</h2>
        <p className="text-sm text-slate-300">Abra o Mercado Pago para verificar R$ 60,00 e as parcelas. Não confirme o pagamento antes de conferir o total e o recebedor.</p>
        <a className="rounded-xl bg-emerald-400 px-5 py-3 text-center font-bold text-slate-950"
          href={checkout} target="_blank" rel="noopener noreferrer">Conferir R$ 60,00 no Mercado Pago</a>
      </section>
    );
  }

  return (
    <form onSubmit={enviar} className="grid gap-4">
      {([
        ['nome_empresa', 'Empresa de homologação', 'text'],
        ['nome_contato', 'Nome do responsável', 'text'],
        ['telefone', 'WhatsApp com DDD', 'tel'],
        ['email_acesso', 'E-mail para receber o convite do painel', 'email'],
        ['confirmar_email', 'Confirme o e-mail', 'email'],
      ] as const).map(([name, label, type]) => (
        <label key={name} className="grid gap-1.5 text-sm font-semibold text-white">
          {label}
          <input className="form-field" type={type} required maxLength={name === 'email_acesso' || name === 'confirmar_email' ? 254 : 120}
            autoComplete={name === 'email_acesso' ? 'email' : 'off'}
            value={fields[name]} onChange={e => change(name, e.target.value)} />
        </label>
      ))}
      <input className="hidden" type="text" name="website_url" tabIndex={-1} autoComplete="off"
        value={fields.website_url} onChange={e => change('website_url', e.target.value)} aria-hidden="true" />
      <label className="flex items-start gap-3 text-sm leading-6 text-slate-300">
        <input type="checkbox" checked={aceito} onChange={e => setAceito(e.target.checked)} required className="mt-1" />
        <span>Li e aceito os <a href={CONTRACT_PATH} target="_blank" rel="noopener noreferrer" className="underline">Termos de Contratação</a> e a <a href={PRIVACY_PATH} target="_blank" rel="noopener noreferrer" className="underline">Política de Privacidade</a>, versão {CONTRACT_VERSION}. Sei que o pagamento, se confirmado, será real.</span>
      </label>
      {erro ? <p role="alert" className="text-sm text-amber-300">{erro}</p> : null}
      <button type="submit" disabled={enviando || !aceito}
        className="rounded-xl bg-emerald-400 px-5 py-3 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50">
        {enviando ? 'Preparando checkout...' : 'Preparar compra de R$ 60,00'}
      </button>
      <p className="text-xs leading-5 text-slate-400">
        Não há cobrança ao preparar o link. O pagamento é feito diretamente no Mercado Pago.
        Evite pagar a própria conta de vendedor; use um comprador independente.
      </p>
    </form>
  );
}
