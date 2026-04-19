import Anthropic from "@anthropic-ai/sdk";

import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

export class AnthropicLlmProvider implements LLMProvider {
  readonly id = "anthropic" as const;

  isAvailable(): boolean {
    return Boolean(getServerEnv().ANTHROPIC_API_KEY?.trim());
  }

  private client() {
    const env = getServerEnv();
    if (!env.ANTHROPIC_API_KEY?.trim()) {
      throw new Error("ANTHROPIC_API_KEY не задан");
    }
    return new Anthropic({
      apiKey: env.ANTHROPIC_API_KEY,
      baseURL: env.ANTHROPIC_BASE_URL?.trim() || undefined,
      timeout: env.LLM_HTTP_TIMEOUT_MS,
    });
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    const env = getServerEnv();
    if (!env.ANTHROPIC_API_KEY?.trim()) {
      throw new Error("ANTHROPIC_API_KEY не задан");
    }
    const sys = `${params.system}\n\nОтветь ТОЛЬКО валидным JSON без markdown и без пояснений.`;
    const message = await this.client().messages.create({
      model: params.model,
      max_tokens: 16_384,
      temperature: params.temperature,
      system: sys,
      messages: [{ role: "user", content: params.user }],
    });
    const block = message.content[0];
    if (!block || block.type !== "text") {
      throw new Error("Пустой ответ модели (Anthropic)");
    }
    return stripJsonFence(block.text);
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const text = await this.generate(params);
    yield text;
  }
}
