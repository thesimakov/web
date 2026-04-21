import type { Metadata } from 'next';
import Link from 'next/link';

import { BrandLogo } from '@/components/brand-logo';
import { t } from '@/lib/i18n';
import { getRequestLanguage } from '@/lib/i18n-server';

export const metadata: Metadata = {
  title: 'Lemnity',
  description: 'Lemnity',
};

export default function Page() {
  const lang = getRequestLanguage();
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/60 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandLogo height={32} priority />
            <p className="hidden leading-tight text-xs text-muted-foreground sm:block">
              {t(lang, 'landing_tagline')}
            </p>
          </div>

          <nav className="flex items-center gap-2">
            <Link className="btn btn-ghost hidden sm:inline-flex" href="/login">
              {t(lang, 'landing_login')}
            </Link>
            <Link className="btn btn-secondary hidden sm:inline-flex" href="/signup">
              {t(lang, 'landing_signup')}
            </Link>
            <Link className="btn btn-primary" href="/workspace">
              {t(lang, 'landing_open_dashboard')}
            </Link>
          </nav>
        </div>
      </header>

      <section className="container-page pt-16">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              {t(lang, 'landing_badge')}
            </div>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {t(lang, 'landing_h1')}
            </h1>
            <p className="muted mt-4 max-w-2xl text-base leading-relaxed">
              {t(lang, 'landing_p')}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link className="btn btn-primary" href="/workspace">
                {t(lang, 'landing_cta_primary')}
              </Link>
              <Link className="btn btn-secondary" href="/signup">
                {t(lang, 'landing_cta_create')}
              </Link>
              <Link className="btn btn-ghost" href="/login">
                {t(lang, 'landing_cta_have')}
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <div className="card p-4">
                <div className="text-sm font-medium">{t(lang, 'landing_feature_1_title')}</div>
                <div className="muted mt-1 text-sm">{t(lang, 'landing_feature_1_desc')}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-medium">{t(lang, 'landing_feature_2_title')}</div>
                <div className="muted mt-1 text-sm">{t(lang, 'landing_feature_2_desc')}</div>
              </div>
              <div className="card p-4">
                <div className="text-sm font-medium">{t(lang, 'landing_feature_3_title')}</div>
                <div className="muted mt-1 text-sm">{t(lang, 'landing_feature_3_desc')}</div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="card relative overflow-hidden p-5">
              <div className="absolute inset-0 bg-gradient-to-b from-foreground/6 via-transparent to-transparent" />
              <div className="relative">
                <div className="text-sm font-medium text-foreground">
                  {t(lang, 'landing_example_title')}
                </div>
                <p className="muted mt-1 text-sm">
                  {t(lang, 'landing_example_desc')}
                </p>
                <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs text-foreground">
                  <div className="text-muted-foreground">{t(lang, 'landing_example_prompt_label')}</div>
                  <div className="mt-1">{t(lang, 'landing_example_prompt_text')}</div>
                  <div className="mt-3 text-muted-foreground">{t(lang, 'landing_example_output_label')}</div>
                  <pre className="mt-1 overflow-auto whitespace-pre-wrap">{`{
  "pages": ["home", "pricing", "docs"],
  "sections": ["hero", "features", "testimonials", "faq"],
  "deploy": { "preview": true, "prod": true }
}`}</pre>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <Link className="btn btn-primary w-full" href="/workspace">
                    {t(lang, 'landing_go_dashboard')}
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="card p-4">
                <div className="text-xs text-muted-foreground">{t(lang, 'landing_card_integration')}</div>
                <div className="mt-1 text-sm font-medium">{t(lang, 'landing_api_dashboard')}</div>
                <div className="muted mt-1 text-sm">{t(lang, 'landing_api_hint')}</div>
              </div>
              <div className="card p-4">
                <div className="text-xs text-muted-foreground">{t(lang, 'landing_card_security')}</div>
                <div className="mt-1 text-sm font-medium">{t(lang, 'landing_jwt_cors')}</div>
                <div className="muted mt-1 text-sm">{t(lang, 'landing_cors_hint')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="card p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">{t(lang, 'landing_ready')}</h2>
              <p className="muted mt-2 max-w-2xl text-sm">
                {t(lang, 'landing_ready_desc')}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link className="btn btn-primary" href="/workspace">
                {t(lang, 'landing_login')}
              </Link>
              <Link className="btn btn-secondary" href="/signup">
                {t(lang, 'landing_signup')}
              </Link>
            </div>
          </div>
        </div>
        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-10 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Lemnity</span>
          <span className="flex gap-4">
            <Link className="hover:text-zinc-300" href="/login">
              {t(lang, 'landing_footer_login')}
            </Link>
            <Link className="hover:text-zinc-300" href="/signup">
              {t(lang, 'landing_footer_signup')}
            </Link>
            <Link className="hover:text-zinc-300" href="/workspace">
              {t(lang, 'landing_footer_dashboard')}
            </Link>
          </span>
        </footer>
      </section>
    </main>
  );
}

