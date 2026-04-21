## LMNT

LMNT — AI‑платформа для генерации, сборки и деплоя сайтов (mini‑Vercel).

### Быстрый старт (локально)

1) Создайте `.env` из примера:

```bash
cp .env.example .env
```

2) Поднимите инфраструктуру:

```bash
docker compose up -d postgres redis traefik
```

3) Установите зависимости:

```bash
pnpm install
```

4) Примените миграции и запустите dev:

```bash
pnpm db:migrate
pnpm dev
```

### Сервисы

- `apps/api`: NestJS (Fastify) — API gateway + core сервисы
- `apps/dashboard`: Next.js — пользовательский дашборд
- `apps/worker`: BullMQ — фоновые задачи (AI, build/deploy)
- `packages/*`: общие пакеты (ai-client, database, shared-types и др.)

### Интеграция с Vercel (деплой `apps/dashboard`)

Этот репозиторий совместим с Vercel CLI/платформой (см. `vercel.json` в корне). На Vercel обычно деплоится только UI (`apps/dashboard`), а `apps/api` и `apps/worker` остаются как отдельные сервисы (Docker/VM/Render/Fly/и т.п.).

- **Переменные окружения (Vercel → Project Settings → Environment Variables)**:
  - **`NEXT_PUBLIC_API_BASE_URL`**: базовый URL вашего API, например `https://api.example.com/api`
  - **`CORS_ORIGINS`** (на стороне `apps/api`): список разрешённых origin через запятую, например `https://lmnt.example.com,https://lmnt-git-branch.vercel.app`
    - Можно указать `*`, чтобы разрешить любой origin (не рекомендуется для prod).

