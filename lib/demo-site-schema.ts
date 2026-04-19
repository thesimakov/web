import type { SiteSchema } from "@/schema/site-schema";

/** Пример схемы для превью / тестов рендерера (не из AI). */
export const demoSiteSchema: SiteSchema = {
  theme: {
    primaryColor: "#8b5cf6",
    secondaryColor: "#6366f1",
    font: "var(--font-sans), ui-sans-serif, system-ui, sans-serif",
  },
  sections: [
    {
      type: "social-proof",
      variant: "strip",
      props: {
        headline: "Нам доверяют команды, которые быстро запускают продукты",
        stat: "10 000+ кампаний автоматизировано",
      },
    },
    {
      type: "features",
      variant: "grid",
      props: {
        title: "Всё необходимое под рукой",
        items: [
          { title: "Автоматизация", desc: "Настраивайте кампании без рутины" },
          { title: "Аналитика", desc: "Следите за результатами в одном месте" },
          { title: "AI-инструменты", desc: "Генерируйте тексты и идеи" },
        ],
      },
    },
    {
      type: "workflow",
      variant: "steps",
      props: {
        title: "Как это работает",
        steps: [
          { title: "Подключение", desc: "Свяжите ваш стек за несколько минут" },
          { title: "Генерация", desc: "AI собирает страницу и тексты" },
          { title: "Публикация", desc: "Выведите сайт на свой домен" },
        ],
      },
    },
    {
      type: "pricing",
      variant: "cards",
      props: {
        title: "Простые тарифы",
        plans: [
          {
            name: "Free",
            price: "0₽ / месяц",
            badge: "ВАШ ПЛАН",
            showIcon: "zap",
            accent: "emerald",
            isCurrentPlan: true,
            cta: "Текущий план",
            tokenUsage: {
              label: "Ежедневные токены",
              used: 1,
              total: 5,
            },
            features: [
              "5 токенов в день",
              "≈ 1 сайт с 1–2 правками",
              "Публикация с нашей вотермаркой",
              "Публикация только на поддомене платформы",
            ],
          },
          {
            name: "Старт",
            price: "2 990 ₽",
            description: "Для соло-основателей",
            features: ["5 сайтов", "Базовые темы", "Почта поддержки"],
            cta: "Выбрать",
          },
          {
            name: "Про",
            price: "7 990 ₽",
            description: "Для растущих команд",
            features: [
              "Безлимит сайтов",
              "Повторная генерация AI",
              "Приоритетная поддержка",
            ],
            cta: "Выбрать",
            highlighted: true,
          },
        ],
      },
    },
    {
      type: "testimonials",
      variant: "grid",
      props: {
        title: "Отзывы",
        items: [
          {
            quote: "За день собрали полноценный лендинг.",
            author: "Алексей М.",
            role: "Основатель",
          },
          {
            quote: "Схема вместо HTML — наконец-то безопасный вывод AI.",
            author: "Сергей Р.",
            role: "CTO",
          },
        ],
      },
    },
    {
      type: "faq",
      variant: "accordion",
      props: {
        title: "Частые вопросы",
        items: [
          {
            q: "Мои данные в безопасности?",
            a: "Да — используем шифрование и стандартные практики индустрии.",
          },
          {
            q: "Можно ли экспортировать?",
            a: "Схема принадлежит вам; можно выгрузить структурированный JSON.",
          },
        ],
      },
    },
    {
      type: "cta",
      variant: "banner",
      props: {
        headline: "Готовы собрать сайт?",
        subheadline: "Сгенерируйте следующий сайт из одного промпта.",
        cta: "Начать",
      },
    },
  ],
};
