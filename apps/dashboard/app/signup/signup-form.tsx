'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { signup } from '@/app/(auth)/auth-api';
import { BrandLogo } from '@/components/brand-logo';
import { useI18n } from '@/components/i18n-provider';

export function SignupForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup(email, password);
      toast.success(t('auth_signup_title'));
      router.push('/login');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('error_title'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="container-page flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <BrandLogo height={36} priority />
      </div>
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t('auth_signup_title')}</h1>
          <button
            type="button"
            className="btn btn-ghost px-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/')}
          >
            {t('nav_home')}
          </button>
        </div>
        <p className="muted mt-1 text-sm">{t('auth_login_subtitle')}</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <label className="block">
            <span className="sr-only">Email</span>
            <input
              className="input"
              placeholder={t('auth_email_placeholder')}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="sr-only">{t('auth_password_sr')}</span>
            <input
              className="input"
              placeholder={t('auth_password_placeholder')}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            className="btn btn-primary w-full disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? t('auth_logging_in') : t('auth_signup')}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t('auth_have_account')}</span>
          <button type="button" className="btn btn-ghost px-0 text-xs" onClick={() => router.push('/login')}>
            {t('auth_go_login')}
          </button>
        </div>
      </div>
    </main>
  );
}
