import { shouldCacheSuccessfulLlmResponse } from "@/ai/cache/llm-cache-policy";
import {
  getCachedJsonForRequest,
  setCachedJsonForRequest,
} from "@/ai/cache/generation-cache";
import { withTimeout } from "@/lib/async-timeout";
import { getServerEnv } from "@/lib/env.server";

import { getRequestPlanType } from "@/lib/billing/planAsyncContext";

import { getDefaultJsonStringForTask } from "./task-defaults";
import { getLlmRegistry } from "./llm-registry";
import { getFilteredRoutingChain } from "./plan-routing";
import { getRoutingChain } from "./model-router";
import type { LlmTask } from "./types";

/**
 * Единая точка: ModelRouter → провайдеры → таймаут → ретраи → кэш → дефолт JSON.
 * Не бросает наружу (кроме программных ошибок): возвращает JSON-текст.
 */
export async function executeRoutedJsonCompletion(params: {
  task: LlmTask;
  system: string;
  user: string;
  temperature: number;
}): Promise<string> {
  const { task, system, user, temperature } = params;
  const plan = getRequestPlanType();
  const chain =
    plan != null
      ? getFilteredRoutingChain(task, plan)
      : getRoutingChain(task);
  const registry = getLlmRegistry();
  const env = getServerEnv();
  const timeoutMs = env.LLM_HTTP_TIMEOUT_MS;
  const maxAttempts = 1 + env.LLM_MAX_RETRIES_PER_STEP;
  const errors: unknown[] = [];

  const baseParams = {
    system,
    user,
    temperature,
    jsonMode: true as const,
  };

  for (const step of chain) {
    const provider = registry[step.kind];
    if (!provider.isAvailable()) {
      continue;
    }

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const text = await withTimeout(
          provider.generate({
            ...baseParams,
            model: step.model,
          }),
          timeoutMs,
        );
        if (shouldCacheSuccessfulLlmResponse(task, user)) {
          void setCachedJsonForRequest({ system, user }, text);
        }
        return text;
      } catch (e) {
        errors.push(e);
      }
    }
  }

  const cached = await getCachedJsonForRequest({ system, user });
  if (cached) {
    return cached;
  }

  return getDefaultJsonStringForTask(task);
}
