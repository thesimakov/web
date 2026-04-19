This project is built with [Astro](https://astro.build), [React](https://react.dev) (острова для интерактива) и [Tailwind CSS](https://tailwindcss.com).

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321) in the browser (порт Astro по умолчанию).

## Scripts

- `npm run dev` — режим разработки
- `npm run build` — production-сборка
- `npm run start` — запуск собранного Node-сервера (`output: "server"`, адаптер `@astrojs/node`)
- `npm run preview` — превью после `build`
- `npm run lint` — `astro check`

## Env

Для демо-пользователя на клиенте задайте `PUBLIC_DEMO_USER_ID` (должен совпадать с `DEMO_USER_ID` на сервере).

См. также комментарии в `lib/env.server.ts` и Prisma/БД.
