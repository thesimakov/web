import OpenAI from "openai";

import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

/**
 * RouterAI — OpenAI-compatible API.
 * Документация: https://routerai.ru/docs/guides
 * Endpoint: https://routerai.ru/api/v1
 */
export class RouterAiLlmProvider implements LLMProvider {
  readonly id = "routerai" as const;

  isAvailable(): boolean {
    return Boolean(getServerEnv().ROUTERAI_API_KEY?.trim());
  }

  private makeClient(): OpenAI {
    const env = getServerEnv();
    if (!env.ROUTERAI_API_KEY?.trim()) {
      throw new Error("ROUTERAI_API_KEY не задан");
    }
    return new OpenAI({
      apiKey: env.ROUTERAI_API_KEY,
      baseURL: env.ROUTERAI_BASE_URL?.trim() || "https://routerai.ru/api/v1",
      timeout: env.LLM_HTTP_TIMEOUT_MS,
    });
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    const client = this.makeClient();
    const completion = await client.chat.completions.create({
      model: params.model,
      temperature: params.temperature,
      ...(params.jsonMode
        ? { response_format: { type: "json_object" as const } }
        : {}),
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      throw new Error("Пустой ответ модели (RouterAI)");
    }
    return stripJsonFence(raw);
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const client = this.makeClient();
    const stream = await client.chat.completions.create({
      model: params.model,
      temperature: params.temperature,
      ...(params.jsonMode
        ? { response_format: { type: "json_object" as const } }
        : {}),
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      stream: true,
    });
    for await (const chunk of stream) {
      const t = chunk.choices[0]?.delta?.content;
      if (t) {
        yield t;
      }
    }
  }
}

