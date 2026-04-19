import Redis from "ioredis";

import { getServerEnv } from "@/lib/env.server";

let client: Redis | null | undefined;

/**
 * Клиент Redis при заданном REDIS_URL; иначе `null` (кэш генерации отключён).
 */
export function getRedis(): Redis | null {
  if (client !== undefined) {
    return client;
  }
  try {
    const url = getServerEnv().REDIS_URL?.trim();
    if (!url) {
      client = null;
      return null;
    }
    client = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
    return client;
  } catch {
    client = null;
    return null;
  }
}
