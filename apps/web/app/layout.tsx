import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '700'],
});

const body = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'Virtuagil | Monitor IoT',
  description: 'Dashboard de monitoramento de dispositivos IoT',
  icons: {
    icon: [
      { url: '/brand/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/brand/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/brand/favicon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#05070d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable}`}>
      <body className="font-[var(--font-body)] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
