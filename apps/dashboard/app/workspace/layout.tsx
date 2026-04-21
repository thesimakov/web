import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Рабочая область',
  description: 'Playground, проекты и настройки',
};

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
