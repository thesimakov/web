import { AnthropicLlmProvider } from "@/ai/providers/anthropic-llm";
import { GoogleLlmProvider } from "@/ai/providers/google-llm";
import { OllamaLlmProvider } from "@/ai/providers/ollama-llm";
import { OpenAiLlmProvider } from "@/ai/providers/openai-llm";
import { RouterAiLlmProvider } from "@/ai/providers/routerai-llm";
import { VllmLlmProvider } from "@/ai/providers/vllm-llm";
import type { LLMProvider } from "@/ai/providers/types";

export type RegistryKey = LLMProvider["id"];

let cached: Record<RegistryKey, LLMProvider> | null = null;

export function getLlmRegistry(): Record<RegistryKey, LLMProvider> {
  if (!cached) {
    cached = {
      openai: new OpenAiLlmProvider(),
      routerai: new RouterAiLlmProvider(),
      anthropic: new AnthropicLlmProvider(),
      google: new GoogleLlmProvider(),
      ollama: new OllamaLlmProvider(),
      vllm: new VllmLlmProvider(),
    };
  }
  return cached;
}
