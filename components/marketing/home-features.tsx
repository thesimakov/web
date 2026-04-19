"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CloudUpload,
  GitBranch,
  Layers,
  Puzzle,
  Sparkles,
} from "lucide-react";

const items = [
  {
    icon: Sparkles,
    title: "Промпт. Сборка. Публикация.",
    desc: "Опишите задачу — модель планирует секции, пишет копирайт и отдаёт JSON. Рендер только из схемы, без сырого HTML.",
  },
  {
    icon: GitBranch,
    title: "Синхронизация с репозиторием",
    desc: "Подключите GitHub и выгружайте сгенерированные файлы в ветку — как привыкли в современном стеке.",
  },
  {
    icon: Puzzle,
    title: "Интеграции",
    desc: "Собирайте страницы рядом с вашими API и сервисами: контракты данных остаются под контролем.",
  },
  {
    icon: CloudUpload,
    title: "Деплой",
    desc: "Вынесите превью в прод за считанные минуты — от схемы до рабочей сборки без ручной вёрстки.",
  },
  {
    icon: Layers,
    title: "Режим правок",
    desc: "Переключайтесь между схемой и codegen: смотрите структуру страницы или файлы TSX в одном месте.",
  },
  {
    icon: Bot,
    title: "Агентный пайплайн",
    desc: "Планировщик, дизайнер и валидатор последовательно собирают результат — предсказуемо и проверяемо.",
  },
];

export function HomeFeatures() {
  return (
    <section
      id="features"
      className="scroll-mt-20 border-b border-white/[0.06] bg-zinc-950 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            Возможности
          </p>
          <h2 className="mt-3 text-balance text-3xl font-medium tracking-tight text-white sm:text-4xl">
            От идеи до рабочей страницы за минуты
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-zinc-400 sm:text-base">
            Умная инфраструктура под генерацию: безопасный вывод, превью и контроль версий —
            с вашей схемой и хостингом.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-white/[0.08] bg-zinc-900/40 p-6 transition-colors hover:border-white/[0.12] hover:bg-zinc-900/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors group-hover:border-white/15 group-hover:text-white">
                <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-medium text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
