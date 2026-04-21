# Деплой на reg.cloud (VPS) для Lemnity

Домены:

- Основной домен: `https://lemnity.com`
- Dashboard/кабинет: `https://lemnity.com/*` (например, `/workspace`)
- API: `https://lemnity.com/api/*`

## 1) DNS

В DNS укажи A-записи на IP VPS:

- `@` (lemnity.com) → `VPS_IP`
- `www` → `VPS_IP` (опционально)

Для проектов (позже):

- `*` (wildcard) → `VPS_IP` (для `project-name.lemnity.com`)

## 2) VPS

Рекомендуется: Ubuntu 24.04 LTS.

Открыть порты:

- 22 (SSH)
- 80/443 (HTTP/HTTPS)

Установить Docker + Docker Compose plugin.

## 3) Размещение проекта на сервере

```bash
sudo mkdir -p /opt/lmnt
sudo chown -R "$USER":"$USER" /opt/lmnt
cd /opt/lmnt
git clone <YOUR_REPO_URL> .
```

## 4) Env

```bash
cd /opt/lmnt/deploy
cp .env.api.example .env.api
cp .env.dashboard.example .env.dashboard
```

Отредактируй:

- `.env.api`: `DATABASE_URL`, `JWT_SECRET`
- `.env.dashboard`: при необходимости `NEXT_PUBLIC_YANDEX_METRIKA_ID`

## 5) Миграции Prisma (prod)

```bash
cd /opt/lmnt/deploy
docker compose run --rm migrate
```

## 6) Запуск

```bash
cd /opt/lmnt/deploy
docker compose up -d --build
```

Проверка:

- `https://lemnity.com/api/health` → 200
- `https://lemnity.com/workspace` → 200

## 7) Обновление

```bash
cd /opt/lmnt
git pull
cd deploy
docker compose up -d --build
docker compose run --rm migrate
```

## 8) Логи

```bash
cd /opt/lmnt/deploy
docker compose logs -f --tail=200
```

