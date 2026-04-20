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
  title: 'Virtuagil | Automacao e monitoramento modular',
  description:
    'Automacao e monitoramento modular para operacoes que precisam de mais visibilidade, alertas e evolucao por etapas.',
  metadataBase: new URL('https://www.virtuagil.com.br'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: '/favicon.png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      {
        url: '/brand/favicon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: ['/favicon.png'],
  },
  openGraph: {
    title: 'Virtuagil | Automacao e monitoramento modular',
    description:
      'Solucoes modulares de monitoramento, alertas e automacao para operacoes que precisam de mais previsibilidade.',
    url: 'https://www.virtuagil.com.br',
    siteName: 'Virtuagil',
    images: [
      {
        url: '/brand/logomarca.png',
        width: 1200,
        height: 630,
        alt: 'Virtuagil',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtuagil | Automacao e monitoramento modular',
    description:
      'Solucoes modulares de monitoramento, alertas e automacao para operacoes que precisam de mais previsibilidade.',
    images: ['/brand/logomarca.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappUrl =
    process.env.NEXT_PUBLIC_WHATSAPP_URL ?? 'https://wa.me/553171029727';
  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'contato@virtuagil.com.br';
  const monitorUrl =
    process.env.NEXT_PUBLIC_MONITOR_URL ?? 'https://monitor.virtuagil.com.br';

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Virtuagil',
    url: 'https://www.virtuagil.com.br',
    logo: 'https://www.virtuagil.com.br/brand/logomarca.png',
    email: contactEmail,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: whatsappUrl.replace(/\D/g, ''),
        email: contactEmail,
        availableLanguage: 'pt-BR',
      },
    ],
    sameAs: ['https://www.instagram.com/', 'https://www.linkedin.com/'],
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${poppins.variable} ${cormorant.variable} min-h-screen`}
      >
        <BackgroundSnippets />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
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
