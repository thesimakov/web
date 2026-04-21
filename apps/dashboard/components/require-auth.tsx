'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { getAccessToken } from '@/app/(auth)/token-store';
import { useI18n } from '@/components/i18n-provider';

type GateState = 'checking' | 'ok';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [state, setState] = useState<GateState>('checking');

  useEffect(() => {
    if (getAccessToken()) {
      setState('ok');
      return;
    }
    const next = pathname && pathname !== '/login' ? pathname : '/workspace';
    router.replace(`/login?from=${encodeURIComponent(next)}`);
  }, [router, pathname]);

  if (state !== 'ok') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted/60" />
        <p className="text-sm">{t('auth_checking_session')}</p>
      </div>
    );
  }

  return <>{children}</>;
}
