import { HomePage } from '@/components/site/home-page';

const whatsappUrl =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/5531999990000';
const contactEmail =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';

export default function Page() {
  return <HomePage whatsappUrl={whatsappUrl} contactEmail={contactEmail} />;
}
