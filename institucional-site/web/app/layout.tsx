import type { Metadata } from 'next';
import { Cormorant_Garamond, Poppins } from 'next/font/google';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { Component as BackgroundSnippets } from '@/components/ui/background-snippets';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.virtuagil.com.br'),
  title: {
    default: 'Virtuagil | Automação com IA, Processos e IoT',
    template: '%s | Virtuagil',
  },
  description:
    'Soluções de automação com inteligência artificial, atendimento no WhatsApp, automação de processos e IoT para empresas que querem reduzir tarefas manuais e operar melhor.',
  keywords: [
    'automação com inteligência artificial',
    'automação empresarial',
    'atendimento com IA',
    'chatbot para WhatsApp',
    'automação de atendimento WhatsApp',
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
  alternates: { canonical: '/' },
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
      'Automação inteligente para atendimento, processos e operações. Conheça o Atendente IA da Virtuagil e nossas soluções sob medida e IoT.',
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';
  const monitorUrl =
    process.env.NEXT_PUBLIC_MONITOR_URL ?? 'https://monitor.virtuagil.com.br';
  const siteTheme = process.env.NEXT_PUBLIC_SITE_THEME ?? 'emerald-market';

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
      <body
        className={`${poppins.variable} ${cormorant.variable} min-h-screen`}
        data-theme={siteTheme}
      >
        <BackgroundSnippets />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <div className="flex min-h-screen flex-col">
          <SiteHeader monitorUrl={monitorUrl} whatsappUrl={whatsappUrl} />
          <div className="flex-1 pt-[88px]">{children}</div>
          <SiteFooter
            contactEmail={contactEmail}
            whatsappUrl={whatsappUrl}
            monitorUrl={monitorUrl}
          />
        </div>
      </body>
    </html>
  );
}
