import Link from "next/link";
import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/75 backdrop-blur-xl supports-[backdrop-filter]:bg-zinc-950/60",
        className,
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-white"
        >
          <Image
            src="/lemnity.svg"
            alt="Lemnity"
            width={112}
            height={24}
            priority
            className="h-6 w-auto"
          />
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-zinc-400 md:flex">
          <Link
            href="/#templates"
            className="rounded-lg px-3 py-2 transition hover:bg-white/[0.06] hover:text-white"
          >
            Шаблоны
          </Link>
          <Link
            href="/#features"
            className="rounded-lg px-3 py-2 transition hover:bg-white/[0.06] hover:text-white"
          >
            Возможности
          </Link>
          <Link
            href="/editor"
            className="rounded-lg px-3 py-2 transition hover:bg-white/[0.06] hover:text-white"
          >
            Редактор
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg px-3 py-2 transition hover:bg-white/[0.06] hover:text-white"
          >
            Мои сайты
          </Link>
          <Link
            href="/#preview"
            className="rounded-lg px-3 py-2 transition hover:bg-white/[0.06] hover:text-white"
          >
            Пример
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden text-zinc-400 hover:bg-white/[0.06] hover:text-white sm:inline-flex",
            )}
          >
            Войти
          </Link>
          <Link
            href="/editor"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 rounded-full bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-100",
            )}
          >
            Начать
          </Link>
        </div>
      </div>
    </header>
  );
}
