import OpenAI from "openai";

import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

/**
 * vLLM / другие серверы с OpenAI-compatible HTTP API (`/v1/chat/completions`).
 * Задаётся через VLLM_BASE_URL (например http://127.0.0.1:8000/v1).
 */
export class VllmLlmProvider implements LLMProvider {
  readonly id = "vllm" as const;

  isAvailable(): boolean {
    const e = getServerEnv();
    return Boolean(e.VLLM_BASE_URL?.trim() && e.VLLM_MODEL?.trim());
  }

  private client(): OpenAI {
    const e = getServerEnv();
    const base = e.VLLM_BASE_URL!.trim().replace(/\/$/, "");
    return new OpenAI({
      apiKey: e.VLLM_API_KEY?.trim() || "local-vllm",
      baseURL: base,
      timeout: e.LLM_HTTP_TIMEOUT_MS,
    });
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error("vLLM не настроен (VLLM_BASE_URL / VLLM_MODEL)");
    }
    const completion = await this.client().chat.completions.create({
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
      throw new Error("Пустой ответ модели (vLLM)");
    }
    return stripJsonFence(raw);
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const stream = await this.client().chat.completions.create({
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
