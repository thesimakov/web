import { GoogleGenerativeAI } from "@google/generative-ai";

import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

export class GoogleLlmProvider implements LLMProvider {
  readonly id = "google" as const;

  isAvailable(): boolean {
    return Boolean(getServerEnv().GOOGLE_GENERATIVE_AI_API_KEY?.trim());
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    const env = getServerEnv();
    if (!env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()) {
      throw new Error("GOOGLE_GENERATIVE_AI_API_KEY не задан");
    }
    const genAI = new GoogleGenerativeAI(env.GOOGLE_GENERATIVE_AI_API_KEY);
    const gemini = genAI.getGenerativeModel({
      model: params.model,
      systemInstruction: params.system,
      generationConfig: {
        temperature: params.temperature,
        ...(params.jsonMode
          ? { responseMimeType: "application/json" as const }
          : {}),
      },
    });
    const result = await gemini.generateContent(params.user);
    const raw = result.response.text();
    if (!raw?.trim()) {
      throw new Error("Пустой ответ модели (Google)");
    }
    return stripJsonFence(raw);
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const full = await this.generate(params);
    yield full;
  }
}
