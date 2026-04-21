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
      className="scroll-mt-20 border-t border-border py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Возможности
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
            От идеи до рабочей страницы за минуты
          </h2>
          <p className="mt-4 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
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
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.99 }}
              className="group will-change-transform rounded-2xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] hover:border-cyan-500/50 hover:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.8)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-muted-foreground transition-colors group-hover:border-cyan-500/50 group-hover:text-foreground">
                <item.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
