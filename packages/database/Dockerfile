FROM node:24-bookworm-slim
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json ./
COPY packages/database/package.json packages/database/package.json

RUN corepack enable && pnpm -r install --no-frozen-lockfile

COPY packages/database ./packages/database

RUN pnpm -C packages/database prisma generate

