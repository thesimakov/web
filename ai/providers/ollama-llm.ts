import { stripJsonFence } from "@/ai/providers/strip-json";
import { getServerEnv } from "@/lib/env.server";

import type { LLMProvider, LlmGenerateParams } from "./types";

/**
 * Локальные модели через Ollama (HTTP API совместимый с OpenAI chat у /api/chat).
 * Работает без облачных ключей — основной fallback при ограничениях сети.
 */
export class OllamaLlmProvider implements LLMProvider {
  readonly id = "ollama" as const;

  isAvailable(): boolean {
    const e = getServerEnv();
    return Boolean(e.OLLAMA_BASE_URL?.trim() && e.OLLAMA_MODEL?.trim());
  }

  private baseUrl(): string {
    const u = getServerEnv().OLLAMA_BASE_URL?.trim() ?? "";
    return u.replace(/\/$/, "");
  }

  async generate(params: LlmGenerateParams): Promise<string> {
    const url = `${this.baseUrl()}/api/chat`;
    const body = {
      model: params.model,
      stream: false,
      format: params.jsonMode ? "json" : undefined,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      options: { temperature: params.temperature },
    };

    const ctrl = new AbortController();
    const t = setTimeout(
      () => ctrl.abort(),
      getServerEnv().LLM_HTTP_TIMEOUT_MS,
    );
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Ollama HTTP ${res.status}: ${errText.slice(0, 200)}`);
      }
      const data = (await res.json()) as {
        message?: { content?: string };
      };
      const raw = data.message?.content;
      if (!raw?.trim()) {
        throw new Error("Пустой ответ Ollama");
      }
      return stripJsonFence(raw);
    } finally {
      clearTimeout(t);
    }
  }

  async *stream(params: LlmGenerateParams): AsyncIterable<string> {
    const url = `${this.baseUrl()}/api/chat`;
    const body = {
      model: params.model,
      stream: true,
      format: params.jsonMode ? "json" : undefined,
      messages: [
        { role: "system", content: params.system },
        { role: "user", content: params.user },
      ],
      options: { temperature: params.temperature },
    };

    const ctrl = new AbortController();
    const t = setTimeout(
      () => ctrl.abort(),
      getServerEnv().LLM_HTTP_TIMEOUT_MS,
    );
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`Ollama stream HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const s = line.trim();
          if (!s) {
            continue;
          }
          try {
            const j = JSON.parse(s) as { message?: { content?: string } };
            const c = j.message?.content;
            if (c) {
              yield c;
            }
          } catch {
            /* NDJSON line */
          }
        }
      }
    } finally {
      clearTimeout(t);
    }
  }
}
