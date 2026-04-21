import { cookies } from 'next/headers';

import { COOKIE_KEY, guessLanguageFromLocale, type UiLanguage } from '@/lib/i18n';

export function getRequestLanguage(): UiLanguage {
  const c = cookies() as any;
  const store = typeof c?.then === 'function' ? undefined : c;
  // Next 15/React 19 typings: cookies() may be sync or async depending on context.
  // We keep this helper sync for metadata/layout usage; fall back to 'ru' if async.
  const v = store?.get?.(COOKIE_KEY)?.value;
  if (v === 'ru' || v === 'en' || v === 'tg') return v;
  const accept = store?.get?.('NEXT_LOCALE')?.value; // if Next i18n is ever enabled
  if (accept) return guessLanguageFromLocale(accept);
  return 'ru';
}

