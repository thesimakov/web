import { z } from 'zod';

export type RouterAIChatMessage =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string };

const ChatCompletionResponseSchema = z.object({
  choices: z
    .array(
      z.object({
        message: z.object({
          role: z.string(),
          content: z.string().nullable(),
        }),
      }),
    )
    .min(1),
  usage: z
    .object({
      prompt_tokens: z.number().optional(),
      completion_tokens: z.number().optional(),
      total_tokens: z.number().optional(),
    })
    .optional(),
});

export type RouterAIChatCompletion = z.infer<typeof ChatCompletionResponseSchema>;

export class RouterAIClient {
  constructor(
    private readonly opts: {
      apiKey: string;
      baseUrl?: string; // default https://routerai.ru/api/v1
      model: string;
      timeoutMs?: number;
    },
  ) {}

  async chatCompletions(params: {
    messages: RouterAIChatMessage[];
    temperature?: number;
    max_tokens?: number;
  }): Promise<{ content: string; tokensUsed: number }> {
    const baseUrl = this.opts.baseUrl ?? 'https://routerai.ru/api/v1';
    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.opts.timeoutMs ?? 60_000);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.opts.apiKey}`,
        },
        body: JSON.stringify({
          model: this.opts.model,
          messages: params.messages,
          temperature: params.temperature ?? 0.2,
          max_tokens: params.max_tokens,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`RouterAI error ${res.status}: ${text}`);
      }

      const json = await res.json();
      const parsed = ChatCompletionResponseSchema.parse(json);
      const content = parsed.choices[0]?.message.content ?? '';
      const tokensUsed = parsed.usage?.total_tokens ?? 0;
      return { content, tokensUsed };
    } finally {
      clearTimeout(timeout);
    }
  }
}

