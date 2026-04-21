"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Box,
  LayoutGrid,
  LayoutTemplate,
  Sparkles,
} from "lucide-react";
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
      className="relative overflow-hidden border-b border-border/50 px-4 pb-20 pt-32 sm:pb-28 sm:pt-40"
    >
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl animate-float" />
        <div
          className="absolute right-1/4 top-1/4 h-[300px] w-[300px] rounded-full bg-cyan-500/5 blur-3xl"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground animate-fade-up"
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
          className="text-balance text-4xl font-bold tracking-tight sm:text-5xl sm:leading-[1.08] md:text-6xl md:leading-[1.06] lg:text-7xl"
        >
          Что вы хотите создать?
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Промпт, сборка и превью: структура и тексты приходят из данных, вы контролируете
          схему и режим вывода.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
          className="mx-auto mt-10 max-w-2xl text-left"
        >
          <label htmlFor="site-prompt" className="sr-only">
            Описание сайта
          </label>
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl shadow-black/20 glow-effect shimmer-border">
            <textarea
              id="site-prompt"
              rows={5}
              placeholder="Опишите страницу: ниша, аудитория, целевое действие…"
              className="w-full resize-none rounded-xl border-0 bg-background px-5 py-4 text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50 sm:px-6 sm:py-5 sm:text-base"
              readOnly
            />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 px-4 py-3 sm:px-5">
              <span className="text-xs text-muted-foreground">
                Генерация через <code className="text-foreground/70">/api/generate</code>
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="/editor"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "h-10 rounded-xl border-border bg-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  Сгенерировать промт
                </a>
                <a
                  href="/editor?autogen=1"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 px-5 text-sm font-medium text-white border-0 hover:from-cyan-600 hover:to-purple-600",
                  )}
                >
                  Сгенерировать сайт
                </a>
              </div>
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
              <a
                key={label}
                href="/editor"
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-zinc-300 transition hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white sm:text-sm"
              >
                <Icon className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
                {label}
              </a>
            ))}
            <a
              href="/#preview"
              className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-3 py-2 text-xs font-medium text-zinc-500 transition hover:text-zinc-300 sm:text-sm"
            >
              Смотреть пример
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
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
