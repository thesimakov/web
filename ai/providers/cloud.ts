/**
 * Облачный слой: OpenAI, Anthropic, Google.
 * Используется для рассуждения, планирования и fallback после локальных моделей.
 */
import { getServerEnv } from "@/lib/env.server";

import { AnthropicLlmProvider } from "./anthropic-llm";
import { GoogleLlmProvider } from "./google-llm";
import { OpenAiLlmProvider } from "./openai-llm";
import type { LLMProvider } from "./types";

export { AnthropicLlmProvider } from "./anthropic-llm";
export { GoogleLlmProvider } from "./google-llm";
export { OpenAiLlmProvider } from "./openai-llm";

export function createCloudProviderInstances(): LLMProvider[] {
  return [
    new OpenAiLlmProvider(),
    new AnthropicLlmProvider(),
    new GoogleLlmProvider(),
  ];
}

export function isCloudLlmConfigured(): boolean {
  const e = getServerEnv();
  return Boolean(
    e.OPENAI_API_KEY?.trim() ||
      e.ANTHROPIC_API_KEY?.trim() ||
      e.GOOGLE_GENERATIVE_AI_API_KEY?.trim(),
  );
}
