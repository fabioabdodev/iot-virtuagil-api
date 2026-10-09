import type { Metadata } from 'next';
import { HomePage } from '@/components/site/home-page';
import { loadCommercialPlans } from '@/lib/live-plans';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'Jade: Assistente de IA para WhatsApp, Agenda e Hospedagem',
  description:
    'Conheça a Jade, assistente de IA da Virtuagil para WhatsApp. Atendimento, follow-up, suporte humano, Agenda e Hospedagem. Converse com a Jade e veja os planos.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Virtuagil | Assistente de IA, Automação e IoT',
    description:
      'Converse com a Jade, assistente de IA Virtuagil para WhatsApp: tira dúvidas, apresenta planos e orienta sua contratação. Agenda, Hospedagem e IoT.',
    url: 'https://www.virtuagil.com.br/',
  },
};

export default async function Page() {
  const livePlans = await loadCommercialPlans();
  return <HomePage whatsappUrl={whatsappUrl} contactEmail={contactEmail} livePlans={livePlans} />;
}
