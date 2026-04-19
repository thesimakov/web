import { z } from "zod";

import { completeJson } from "@/ai/llm/complete-json";

/** Agent 1 — разбор пользовательского промпта (продукт, аудитория, тон). */

export const interpreterInputSchema = z.object({
  userPrompt: z.string().min(1),
});

export type InterpreterInput = z.infer<typeof interpreterInputSchema>;

export const interpreterOutputSchema = z.object({
  product_type: z.string(),
  industry: z.string(),
  audience: z.string(),
  tone: z.string(),
  goal: z.string(),
});

export type InterpreterOutput = z.infer<typeof interpreterOutputSchema>;

export const PROMPT_INTERPRETER_SYSTEM = `Ты — PromptInterpreterAgent. Прочитай запрос пользователя на сайт и верни ТОЛЬКО валидный JSON (без markdown, без HTML).
Поля (ключи на английском, значения можешь формулировать по смыслу запроса):
- product_type: короткая метка (например "SaaS", "Agency", "Portfolio")
- industry: отрасль или ниша
- audience: для кого продукт
- tone: тон коммуникации (например "modern", "enterprise", "playful")
- goal: главная цель конверсии в snake_case, например "lead_generation", "signup", "book_demo"`;

export async function runPromptInterpreter(
  input: InterpreterInput,
): Promise<InterpreterOutput> {
  const raw = await completeJson({
    task: "interpreter",
    system: PROMPT_INTERPRETER_SYSTEM,
    user: input.userPrompt,
    temperature: 0.2,
  });

  return interpreterOutputSchema.parse(JSON.parse(raw));
}
