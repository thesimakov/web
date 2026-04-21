import { Suspense } from 'react';

import { LoginForm } from './login-form';

function LoginFallback() {
  return (
    <div className="container-page flex min-h-screen items-center justify-center py-12 text-sm text-zinc-400">
      Загрузка…
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
