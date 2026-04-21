'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { useI18n } from '@/components/i18n-provider';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center gap-6 py-16 text-center">
      <BrandLogo height={36} />
      <div>
        <h1 className="text-xl font-semibold text-foreground">{t('error_title')}</h1>
        <p className="muted mt-2 max-w-md text-sm">{t('error_desc')}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn btn-primary" onClick={() => reset()}>
          {t('error_retry')}
        </button>
        <Link className="btn btn-secondary" href="/">
          {t('nav_home')}
        </Link>
      </div>
    </div>
  );
}
