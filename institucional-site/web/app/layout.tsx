import type { Metadata } from 'next';
import { Manrope, Sora } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.virtuagil.com.br'),
  title: {
    default: 'Virtuagil | Automação com IA, Processos e IoT',
    template: '%s | Virtuagil',
  },
  description:
    'Automação com inteligência artificial, processos integrados e IoT para empresas que querem atender melhor, reduzir tarefas manuais e ganhar controle da operação.',
  keywords: [
    'assistente de IA para empresas',
    'automação com inteligência artificial',
    'atendimento com IA no WhatsApp',
    'automação empresarial',
    'automação de processos',
    'integração de sistemas',
    'automação IoT',
    'monitoramento IoT',
    'Virtuagil',
    'Belo Horizonte',
  ],
  authors: [{ name: 'Virtuagil', url: 'https://www.virtuagil.com.br' }],
  creator: 'Virtuagil',
  publisher: 'Virtuagil',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  category: 'technology',
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/favicon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/favicon.png'],
  },
  openGraph: {
    title: 'Virtuagil | Automação com IA, Processos e IoT',
    description:
      'Assistente de IA para WhatsApp, automação de processos e soluções IoT para empresas que querem operar melhor.',
    url: 'https://www.virtuagil.com.br',
    siteName: 'Virtuagil',
    images: [
      {
        url: '/brand/logomarca.png',
        width: 1200,
        height: 630,
        alt: 'Virtuagil - Tecnologia em automação',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtuagil | Automação com IA, Processos e IoT',
    description:
      'Automação inteligente para atendimento, processos e operações empresariais.',
    images: ['/brand/logomarca.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';
  const monitorUrl =
    process.env.NEXT_PUBLIC_MONITOR_URL ?? 'https://monitor.virtuagil.com.br';
  const assistantUrl =
    process.env.NEXT_PUBLIC_ASSISTENTE_URL ?? 'https://atendente.virtuagil.com.br';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://www.virtuagil.com.br/#organization',
    name: 'Virtuagil',
    url: 'https://www.virtuagil.com.br',
    logo: 'https://www.virtuagil.com.br/brand/logomarca.png',
    description:
      'Empresa de tecnologia especializada em automação com inteligência artificial, automação de processos e IoT.',
    email: contactEmail,
    areaServed: [
      { '@type': 'Country', name: 'Brasil' },
      { '@type': 'City', name: 'Belo Horizonte' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        telephone: `+${whatsappUrl.replace(/\D/g, '').replace(/^55/, '55')}`,
        email: contactEmail,
        availableLanguage: ['pt-BR'],
      },
    ],
  };

  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${sora.variable} min-h-screen`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex min-h-screen flex-col">
          <SiteHeader
            monitorUrl={monitorUrl}
            assistantUrl={assistantUrl}
            whatsappUrl={whatsappUrl}
          />
          <div className="flex-1 pt-[76px]">{children}</div>
          <SiteFooter
            contactEmail={contactEmail}
            whatsappUrl={whatsappUrl}
            monitorUrl={monitorUrl}
            assistantUrl={assistantUrl}
          />
        </div>
      </body>
    </html>
  );
}
