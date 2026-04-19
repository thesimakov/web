/**
 * Единая точка вызова LLM: делегирует в роутер (мульти-модель + fallback + кэш).
 */
export {
  completeJson,
  completeJsonRouted,
} from "@/ai/router/complete-json-router";
export type { CompleteJsonParams, LlmTask } from "@/ai/router/types";
