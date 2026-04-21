import './globals.css';
import type { Metadata } from 'next';

import { Providers } from '@/components/providers';
import { YandexMetrika } from '@/components/yandex-metrika';
import { getRequestLanguage } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: {
    default: 'Lemnity',
    template: '%s — Lemnity',
  },
  description: 'Генерация сайтов, проекты и деплой в одном месте',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ymIdRaw = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  const ymId = ymIdRaw ? Number(ymIdRaw) : null;
  const lang = getRequestLanguage();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <Providers>
          {children}
          {ymId && Number.isFinite(ymId) ? <YandexMetrika id={ymId} /> : null}
        </Providers>
      </body>
    </html>
  );
}

