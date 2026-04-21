FROM node:24-bookworm-slim AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/dashboard/package.json apps/dashboard/package.json
COPY packages/ai-client/package.json packages/ai-client/package.json

RUN corepack enable && pnpm -r install --no-frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .

RUN pnpm -C apps/dashboard build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/dashboard/.next ./.next
COPY --from=build /app/apps/dashboard/public ./public
COPY --from=build /app/apps/dashboard/package.json ./apps/dashboard/package.json
COPY --from=build /app/apps/dashboard/next.config.* ./apps/dashboard/ 2>/dev/null || true
COPY --from=build /app/apps/dashboard/app ./apps/dashboard/app
COPY --from=build /app/apps/dashboard/components ./apps/dashboard/components
COPY --from=build /app/apps/dashboard/lib ./apps/dashboard/lib
COPY --from=build /app/apps/dashboard/styles ./apps/dashboard/styles 2>/dev/null || true
COPY --from=build /app/node_modules ./node_modules

EXPOSE 44000
CMD ["pnpm", "-C", "apps/dashboard", "start"]

