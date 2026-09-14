import type { Metadata } from 'next';
import { HomePage } from '@/components/site/home-page';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export const metadata: Metadata = {
  title: 'Automação com IA, Processos e IoT',
  description:
    'A Virtuagil cria soluções de automação com IA, atendimento inteligente no WhatsApp, automação de processos e IoT para empresas em Belo Horizonte e todo o Brasil.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Virtuagil | Automação com IA, Processos e IoT',
    description:
      'Atendimento inteligente no WhatsApp, automação de processos e soluções IoT para reduzir tarefas manuais e melhorar a operação da sua empresa.',
    url: 'https://www.virtuagil.com.br/',
  },
};

export default function Page() {
  return <HomePage whatsappUrl={whatsappUrl} contactEmail={contactEmail} />;
}
