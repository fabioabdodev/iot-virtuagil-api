import type { Metadata } from 'next';
import { HomePage } from '@/components/site/home-page';
import { loadCommercialPlans } from '@/lib/live-plans';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'IA para WhatsApp: Atendimento, Vendas e Agenda | Virtuagil',
  description:
    'Jade é uma assistente IA para WhatsApp de clínicas, salões, lojas e prestadores: atendimento, oportunidades de venda, suporte humano e Agenda opcional.',
  alternates: { canonical: '/' },
  openGraph: {
    images: [{ url: '/brand/logomarca.png', alt: 'Virtuagil — Assistente Jade e automação empresarial' }],
    title: 'Virtuagil | Assistente de IA, Automação e IoT',
    description:
      'Assistente de IA no WhatsApp para clínicas, salões, lojas e serviços. Atendimento, vendas e agendamento com a Jade Virtuagil.',
    url: 'https://www.virtuagil.com.br/',
  },
};

export default async function Page() {
  const livePlans = await loadCommercialPlans();
  return <HomePage whatsappUrl={whatsappUrl} contactEmail={contactEmail} livePlans={livePlans} />;
}
