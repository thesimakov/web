import { z } from "zod";

import type { InterpreterOutput } from "@/ai/agents/prompt-interpreter.agent";
import { completeJson } from "@/ai/llm/complete-json";

/** Agent 4 — порядок секций лендинга (только из разрешённого набора типов). */

export const plannerInputSchema = z.object({
  userPrompt: z.string().min(1),
  interpreter: z.custom<InterpreterOutput>(),
});

export type PlannerInput = z.infer<typeof plannerInputSchema>;

const sectionTypeLiteral = z.enum([
  "hero",
  "social-proof",
  "features",
  "workflow",
  "pricing",
  "testimonials",
  "faq",
  "cta",
]);

export const plannerOutputSchema = z
  .object({
    sections: z.array(sectionTypeLiteral).min(3).max(12),
  })
  .refine((data) => data.sections[0] === "hero", {
    message: "Первой секцией должен быть hero",
  });

export type PlannerOutput = z.infer<typeof plannerOutputSchema>;

export const PRODUCT_PLANNER_SYSTEM = `Ты — ProductPlannerAgent. По запросу пользователя и контексту выбери упорядоченный список секций лендинга.
Разрешённые типы секций (только эти строки, без перевода):
hero, social-proof, features, workflow, pricing, testimonials, faq, cta
Правила:
- Всегда начинай с "hero".
- Обязательно включи как минимум features и cta.
- Верни ТОЛЬКО JSON: { "sections": string[] } — без HTML и markdown.`;

export async function runProductPlanner(
  input: PlannerInput,
): Promise<PlannerOutput> {
  const raw = await completeJson({
    task: "planning",
    system: PRODUCT_PLANNER_SYSTEM,
    user: JSON.stringify(
      {
        userPrompt: input.userPrompt,
        interpreter: input.interpreter,
      },
      null,
      2,
    ),
    temperature: 0.25,
  });

  return plannerOutputSchema.parse(JSON.parse(raw));
}
