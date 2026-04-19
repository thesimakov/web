import type { PlanType } from "@prisma/client";

/**
 * Условная стоимость «юнита» по имени модели (внутренние токены продукта).
 */
export const MODEL_UNIT_COST: Record<string, number> = {
  mistral: 1,
  "gpt-4o-mini": 5,
  "claude-sonnet": 10,
  "claude-opus": 20,
  "gpt-4o": 15,
};

export function estimateModelUnitCost(modelId: string): number {
  const m = modelId.toLowerCase();
  if (m.includes("opus")) {
    return MODEL_UNIT_COST["claude-opus"];
  }
  if (m.includes("sonnet") || m.includes("claude-3")) {
    return MODEL_UNIT_COST["claude-sonnet"];
  }
  if (m.includes("gpt-4o-mini") || m.includes("4o-mini")) {
    return MODEL_UNIT_COST["gpt-4o-mini"];
  }
  if (m.includes("gpt-4o")) {
    return MODEL_UNIT_COST["gpt-4o"];
  }
  if (m.includes("mistral") || m.includes("llama") || m.includes("ollama")) {
    return MODEL_UNIT_COST.mistral;
  }
  return 5;
}

/**
 * Плоская стоимость одной генерации (пайплайн делает много LLM-вызовов).
 */
export function getGenerationCharge(
  mode: "schema" | "codegen",
  plan: PlanType,
): number {
  const base = mode === "codegen" ? 120 : 55;
  if (plan === "FREE_TRIAL") {
    return Math.ceil(base * 0.85);
  }
  if (plan === "PRO") {
    return base;
  }
  return Math.ceil(base * 1.05);
}
