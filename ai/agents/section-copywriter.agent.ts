import { z } from "zod";

import { completeJson } from "@/ai/llm/complete-json";
import type { InterpreterOutput } from "@/ai/agents/prompt-interpreter.agent";
import type { PlannerOutput } from "@/ai/agents/product-planner.agent";

export const copywriterOutputSchema = z.object({
  /** Подсказки для текстов по секциям (ключ — тип секции или индекс). */
  hints: z.record(z.string(), z.unknown()).optional(),
  toneNote: z.string().optional(),
});

export type CopywriterOutput = z.infer<typeof copywriterOutputSchema>;

const SYSTEM = `Ты — Copywriter. По плану секций верни ТОЛЬКО JSON с полем "hints" — объект с краткими текстовыми идеями для блоков (ключи: hero, features, cta и т.д. по смыслу).
Опционально "toneNote" — одна строка о тоне. Без markdown. Язык — русский, если не просили иное.`;

export async function runSectionCopywriter(input: {
  userPrompt: string;
  interpreter: InterpreterOutput;
  planner: PlannerOutput;
}): Promise<CopywriterOutput> {
  const raw = await completeJson({
    task: "copywriting",
    system: SYSTEM,
    user: JSON.stringify(
      {
        userPrompt: input.userPrompt,
        interpreter: input.interpreter,
        sectionsPlan: input.planner.sections,
      },
      null,
      2,
    ),
    temperature: 0.4,
  });
  try {
    return copywriterOutputSchema.parse(JSON.parse(raw));
  } catch {
    return { hints: {}, toneNote: undefined };
  }
}
