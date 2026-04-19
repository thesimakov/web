import { createHash } from "crypto";

import { getRedis } from "@/lib/redis";

const CACHE_PREFIX = "llm:json:v1:";
const DEFAULT_TTL_SEC = 86_400;

function cacheKey(system: string, user: string): string {
  const h = createHash("sha256")
    .update(system, "utf8")
    .update("\n\n", "utf8")
    .update(user, "utf8")
    .digest("hex");
  return `${CACHE_PREFIX}${h}`;
}

/**
 * Возвращает сырой JSON-текст из кэша для пары system/user (дедуп LLM и fallback при сбоях).
 */
export async function getCachedJsonForRequest(params: {
  system: string;
  user: string;
}): Promise<string | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }
  try {
    const raw = await redis.get(cacheKey(params.system, params.user));
    return raw;
  } catch {
    return null;
  }
}

export async function setCachedJsonForRequest(
  params: { system: string; user: string },
  jsonText: string,
  ttlSec: number = DEFAULT_TTL_SEC,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }
  try {
    await redis.set(cacheKey(params.system, params.user), jsonText, "EX", ttlSec);
  } catch {
    /* ignore cache errors */
  }
}
