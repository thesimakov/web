/**
 * Локальный гибридный слой: Ollama и vLLM (OpenAI-compatible).
 * По умолчанию большинство «дешёвых» задач в Model Router идут сюда первыми.
 */
import type { LLMProvider } from "./types";
import { OllamaLlmProvider } from "./ollama-llm";
import { VllmLlmProvider } from "./vllm-llm";

export { OllamaLlmProvider } from "./ollama-llm";
export { VllmLlmProvider } from "./vllm-llm";

export function createLocalProviderInstances(): LLMProvider[] {
  return [new OllamaLlmProvider(), new VllmLlmProvider()];
}

export function isLocalLlmConfigured(): boolean {
  return createLocalProviderInstances().some((p) => p.isAvailable());
}
