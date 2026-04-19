"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "60 с", label: "до первого превью схемы" },
  { value: "JSON", label: "единственный формат от AI" },
  { value: "100%", label: "контроль через реестр секций" },
];

export function StatsStrip() {
  return (
    <section className="border-b border-white/5 bg-zinc-950/50 py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mb-10 text-center text-sm font-medium uppercase tracking-wider text-zinc-500">
          Lemnity в цифрах
        </p>
        <div className="grid gap-10 sm:grid-cols-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-4xl font-semibold tabular-nums tracking-tight text-white sm:text-5xl">
                {s.value}
              </p>
              <p className="mt-2 text-sm text-zinc-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
