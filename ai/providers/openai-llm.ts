import OpenAI from "openai";

import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

export class OpenAiLlmProvider implements LLMProvider {
  readonly id = "openai" as const;

  isAvailable(): boolean {
    return Boolean(getServerEnv().OPENAI_API_KEY?.trim());
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    const env = getServerEnv();
    if (!env.OPENAI_API_KEY?.trim()) {
      throw new Error("OPENAI_API_KEY не задан");
    }
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL?.trim() || undefined,
      timeout: env.LLM_HTTP_TIMEOUT_MS,
    });
    const completion = await openai.chat.completions.create({
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
      throw new Error("Пустой ответ модели (OpenAI)");
    }
    return stripJsonFence(raw);
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const env = getServerEnv();
    if (!env.OPENAI_API_KEY?.trim()) {
      throw new Error("OPENAI_API_KEY не задан");
    }
    const openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL?.trim() || undefined,
      timeout: env.LLM_HTTP_TIMEOUT_MS,
    });
    const stream = await openai.chat.completions.create({
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
