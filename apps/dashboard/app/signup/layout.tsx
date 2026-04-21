import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация',
  description: 'Создание аккаунта Lemnity',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
