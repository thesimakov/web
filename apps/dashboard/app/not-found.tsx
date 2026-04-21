import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { t } from '@/lib/i18n';
import { getRequestLanguage } from '@/lib/i18n-server';

export default function NotFound() {
  const lang = getRequestLanguage();
  return (
    <div className="container-page flex min-h-screen flex-col items-center justify-center gap-8 py-16 text-center">
      <BrandLogo height={36} priority />
      <div>
        <p className="text-sm font-medium text-zinc-500">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
          {t(lang, 'not_found_title')}
        </h1>
        <p className="muted mt-2 max-w-md text-sm">{t(lang, 'not_found_desc')}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link className="btn btn-primary" href="/">
          {t(lang, 'nav_home')}
        </Link>
        <Link className="btn btn-secondary" href="/login">
          {t(lang, 'auth_go_login')}
        </Link>
      </div>
    </div>
  );
}
