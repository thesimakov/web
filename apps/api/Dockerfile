FROM node:24-bookworm-slim AS deps
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/database/package.json packages/database/package.json
COPY packages/ai-client/package.json packages/ai-client/package.json

RUN corepack enable && pnpm -r install --no-frozen-lockfile

FROM deps AS build
WORKDIR /app
COPY . .

RUN pnpm -C packages/database prisma generate
RUN pnpm -C apps/api build

FROM node:24-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]

