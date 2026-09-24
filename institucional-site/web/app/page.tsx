import type { Metadata } from 'next';
import { HomePage } from '@/components/site/home-page';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'Assistente de IA para WhatsApp, Automação e IoT',
  description:
    'Assistente de IA para WhatsApp nos planos 500 e 500 + Agenda, com follow-up, suporte humano e até 500 contatos únicos por mês. Automação de processos e IoT para empresas.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Virtuagil | Assistente de IA, Automação e IoT',
    description:
      'Atendimento com IA no WhatsApp nos planos 500 e 500 + Agenda, além de automação de processos e soluções IoT para transformar tarefas manuais em fluxos inteligentes.',
    url: 'https://www.virtuagil.com.br/',
  },
};

export default function Page() {
  return <HomePage whatsappUrl={whatsappUrl} contactEmail={contactEmail} />;
}
