import type { PlanType } from "@prisma/client";

import type { LlmTask } from "./types";
import { getRoutingChain, type ProviderStep } from "./model-router";

function isLocalProvider(kind: string): boolean {
  return kind === "ollama" || kind === "vllm";
}

/** Грубая оценка «дороговизны» модели для фильтра по плану. */
function modelTier(step: ProviderStep): "cheap" | "mid" | "premium" {
  const m = step.model.toLowerCase();
  if (
    m.includes("opus") ||
    m.includes("o3") ||
    (m.includes("gpt-4o") && !m.includes("mini"))
  ) {
    return "premium";
  }
  if (
    m.includes("sonnet") ||
    m.includes("gpt-4o-mini") ||
    m.includes("gemini") ||
    m.includes("flash")
  ) {
    return "mid";
  }
  return "cheap";
}

/**
 * Ограничение цепочки LLM по плану: FREE — дешёвые + локальные; PRO — без топ-тир;
 * PREMIUM — без ограничений.
 */
export function getFilteredRoutingChain(
  task: LlmTask,
  plan: PlanType,
): ProviderStep[] {
  const base = getRoutingChain(task);
  if (plan === "PREMIUM") {
    return base;
  }
  if (plan === "PRO") {
    const filtered = base.filter(
      (s) => modelTier(s) !== "premium" || isLocalProvider(s.kind),
    );
    return filtered.length > 0 ? filtered : base;
  }
  const free = base.filter(
    (s) => modelTier(s) === "cheap" || isLocalProvider(s.kind),
  );
  return free.length > 0 ? free : base;
}
