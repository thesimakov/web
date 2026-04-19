"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  LayoutGrid,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const templates = [
  { label: "Приложения и игры", icon: LayoutGrid },
  { label: "Лендинги", icon: LayoutTemplate },
  { label: "Компоненты", icon: Box },
  { label: "Дашборды", icon: Sparkles },
] as const;

export function HeroPrompt() {
  return (
    <section
      id="prompt"
      className="relative overflow-hidden border-b border-white/[0.06] px-4 pb-24 pt-12 sm:pb-32 sm:pt-16"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_-30%,rgba(255,255,255,0.08),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_100%_80%,rgba(120,80,255,0.12),transparent)]" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300"
        >
          <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Lemnity
          </span>
          <span className="text-zinc-500">·</span>
          <span>Схема и codegen в одном редакторе</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.04 }}
          className="text-balance text-4xl font-medium tracking-tight text-white sm:text-5xl sm:leading-[1.08] md:text-6xl md:leading-[1.06]"
        >
          Что вы хотите создать?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-zinc-400 sm:text-lg"
        >
          Промпт, сборка и превью: структура и тексты приходят из данных, вы контролируете
          схему и режим вывода.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mx-auto mt-12 max-w-2xl text-left"
        >
          <label htmlFor="site-prompt" className="sr-only">
            Описание сайта
          </label>
          <div className="overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_24px_80px_-24px_rgba(0,0,0,0.8)] ring-1 ring-white/[0.04] backdrop-blur-md">
            <textarea
              id="site-prompt"
              rows={5}
              placeholder="Опишите страницу: ниша, аудитория, целевое действие…"
              className="w-full resize-none border-0 bg-transparent px-5 py-4 text-[15px] leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0 sm:px-6 sm:py-5 sm:text-base"
              readOnly
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] px-4 py-3 sm:px-5">
              <span className="text-xs text-zinc-500">
                Генерация через <code className="text-zinc-400">/api/generate</code>
              </span>
              <Link
                href="/editor"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "h-9 rounded-full bg-white px-5 text-sm font-medium text-zinc-950 shadow-sm hover:bg-zinc-100",
                )}
              >
                Сгенерировать
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          id="templates"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-10 max-w-2xl scroll-mt-28"
        >
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Начать с шаблона
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {templates.map(({ label, icon: Icon }) => (
              <Link
                key={label}
                href="/editor"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white sm:text-sm"
              >
                <Icon className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                {label}
              </Link>
            ))}
            <Link
              href="/#preview"
              className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-300 sm:text-sm"
            >
              Смотреть пример
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="mx-auto mt-14 max-w-lg text-center text-sm leading-relaxed text-zinc-500"
        >
          <span className="font-medium text-zinc-400">Промпт.</span> Сборка.{" "}
          <span className="font-medium text-zinc-400">Публикация.</span> Готовые блоки и
          безопасный рендер — без сырого HTML из модели.
        </motion.p>
      </div>
    </section>
  );
}
