import {
  getOpenAiFallbackModel,
  getOpenAiPrimaryModel,
  getServerEnv,
} from "@/lib/env.server";

import type { LlmTask } from "./types";

/** Тип бэкенда в цепочке исполнения. */
export type ProviderKind =
  | "anthropic"
  | "openai"
  | "routerai"
  | "google"
  | "ollama"
  | "vllm";

export type ProviderStep = {
  kind: ProviderKind;
  model: string;
};

function dedupeSteps(steps: ProviderStep[]): ProviderStep[] {
  const out: ProviderStep[] = [];
  const seen = new Set<string>();
  for (const s of steps) {
    const k = `${s.kind}:${s.model}`;
    if (seen.has(k)) {
      continue;
    }
    seen.add(k);
    out.push(s);
  }
  return out;
}

/** Облако: Claude → OpenAI (primary + mini) → Gemini. */
export function buildCloudSteps(): ProviderStep[] {
  const e = getServerEnv();
  const steps: ProviderStep[] = [];

  if (e.ANTHROPIC_API_KEY?.trim()) {
    steps.push({
      kind: "anthropic",
      model: e.LLM_MODEL?.trim() ? e.LLM_MODEL.trim() : e.ANTHROPIC_MODEL,
    });
  }
  if (e.OPENAI_API_KEY?.trim()) {
    steps.push({ kind: "openai", model: getOpenAiPrimaryModel() });
    steps.push({ kind: "openai", model: getOpenAiFallbackModel() });
  }
  if (e.ROUTERAI_API_KEY?.trim()) {
    steps.push({ kind: "routerai", model: getOpenAiPrimaryModel() });
    steps.push({ kind: "routerai", model: getOpenAiFallbackModel() });
  }
  if (e.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
    steps.push({ kind: "google", model: e.GOOGLE_MODEL });
  }

  return dedupeSteps(steps);
}

/** Локально: Ollama → vLLM (оба опциональны). */
export function buildLocalSteps(): ProviderStep[] {
  const e = getServerEnv();
  const steps: ProviderStep[] = [];

  if (e.OLLAMA_BASE_URL?.trim() && e.OLLAMA_MODEL?.trim()) {
    steps.push({ kind: "ollama", model: e.OLLAMA_MODEL.trim() });
  }
  if (e.VLLM_BASE_URL?.trim() && e.VLLM_MODEL?.trim()) {
    steps.push({ kind: "vllm", model: e.VLLM_MODEL.trim() });
  }

  return dedupeSteps(steps);
}

/**
 * Локальные задачи: тексты, копирайт, черновики схемы, оформление, codegen-черновики.
 * Облачные: рассуждение, интерпретация промпта, архитектурное планирование.
 */
function prefersLocalFirst(task: LlmTask): boolean {
  switch (task) {
    case "planning":
    case "interpreter":
      return false;
    case "copywriting":
    case "design":
    case "ui_generation":
    case "schema_builder":
    case "codegen":
      return true;
    default:
      return true;
  }
}

function mergePrimarySecondary(
  primary: ProviderStep[],
  secondary: ProviderStep[],
): ProviderStep[] {
  return dedupeSteps([...primary, ...secondary]);
}

/**
 * Гибридный маршрут: для задачи выбирается порядок «локально → облако» или наоборот,
 * затем цепочка дедуплицируется (fallback: предпочтительный тир → второй тир).
 */
export function getRoutingChain(task: LlmTask): ProviderStep[] {
  const local = buildLocalSteps();
  const cloud = buildCloudSteps();

  if (prefersLocalFirst(task)) {
    return mergePrimarySecondary(local, cloud);
  }
  return mergePrimarySecondary(cloud, local);
}

/** @deprecated используй getRoutingChain */
export function getModelFallbackChain(task: LlmTask): ProviderStep[] {
  return getRoutingChain(task);
}
