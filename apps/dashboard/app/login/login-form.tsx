'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { login } from '@/app/(auth)/auth-api';
import { setSession } from '@/app/(auth)/token-store';
import { BrandLogo } from '@/components/brand-logo';
import { useI18n } from '@/components/i18n-provider';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const rawFrom = searchParams.get('from') || '/workspace';
  const from =
    rawFrom.startsWith('/') && !rawFrom.startsWith('//') ? rawFrom : '/workspace';

  return (
    <main className="container-page flex min-h-screen flex-col items-center justify-center py-12">
      <div className="mb-8">
        <BrandLogo height={36} priority />
      </div>
      <div className="card w-full max-w-md p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{t('auth_login_title')}</h1>
          <button
            type="button"
            className="btn btn-ghost px-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/')}
          >
            {t('nav_home')}
          </button>
        </div>
        <p className="muted mt-1 text-sm">Вход временно отключён.</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Мы заканчиваем настройку авторизации. Попробуйте позже.
        </p>

        <div className="mt-6 grid gap-2">
          <button
            type="button"
            className="btn btn-primary w-full"
            onClick={() => router.push('/')}
          >
            На главную
          </button>
          <button
            type="button"
            className="btn btn-ghost w-full text-xs text-muted-foreground"
            onClick={() => router.push(from.startsWith('/') ? from : '/workspace')}
          >
            Перейти в дашборд
          </button>
        </div>
      </div>
    </main>
  );
}
