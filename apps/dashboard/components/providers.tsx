'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

import { I18nProvider } from '@/components/i18n-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        {children}
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: {
              background: 'var(--popover)',
              color: 'var(--popover-foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
      </I18nProvider>
    </ThemeProvider>
  );
}
