import Link from "next/link";

import { SiteHeader } from "@/components/marketing/site-header";
import { getDemoUserId } from "@/lib/env.server";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Мои сайты — Lemnity",
};

export default async function DashboardPage() {
  const userId = getDemoUserId();
  const sites = await prisma.site.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white">Мои сайты</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Демо-кабинет без логина. Пользователь:{" "}
              <code className="text-zinc-400">{userId}</code> — задай тот же id в{" "}
              <code className="text-zinc-400">DEMO_USER_ID</code> /{" "}
              <code className="text-zinc-400">NEXT_PUBLIC_DEMO_USER_ID</code>
            </p>
          </div>
          <Link
            href="/editor"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500"
          >
            Новая генерация
          </Link>
        </div>

        {sites.length === 0 ? (
          <p className="mt-10 text-center text-zinc-500">
            Пока нет сохранённых сайтов. Сгенерируй в{" "}
            <Link href="/editor" className="text-violet-400 underline">
              редакторе
            </Link>{" "}
            с галочкой «Сохранить».
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {sites.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-white/10 bg-zinc-900/50 px-4 py-3"
              >
                <Link
                  href={`/editor?site=${s.id}`}
                  className="font-medium text-white hover:text-violet-300"
                >
                  {s.prompt.length > 100 ? `${s.prompt.slice(0, 100)}…` : s.prompt}
                </Link>
                <p className="mt-1 text-xs text-zinc-500">
                  {s.createdAt.toLocaleString("ru-RU")} · id:{" "}
                  <code className="text-zinc-400">{s.id}</code>
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
