import { z } from "zod";

import { completeJson } from "@/ai/llm/complete-json";
import type { InterpreterOutput } from "@/ai/agents/prompt-interpreter.agent";
import type { PlannerOutput } from "@/ai/agents/product-planner.agent";
import type { SiteTheme } from "@/schema/site-schema";

const themeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  font: z.string(),
});

export const themeDesignerOutputSchema = z.object({
  theme: themeSchema,
});

export type ThemeDesignerOutput = z.infer<typeof themeDesignerOutputSchema>;

const SYSTEM = `Ты — ThemeDesigner. По контексту сайта верни ТОЛЬКО JSON: { "theme": { "primaryColor", "secondaryColor", "font" } }.
Цвета — hex (#RRGGBB). font — валидный CSS font-family stack. Без markdown.`;

export async function runThemeDesigner(input: {
  userPrompt: string;
  interpreter: InterpreterOutput;
  planner: PlannerOutput;
}): Promise<SiteTheme> {
  const raw = await completeJson({
    task: "design",
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
    temperature: 0.35,
  });
  try {
    return themeDesignerOutputSchema.parse(JSON.parse(raw)).theme;
  } catch {
    return {
      primaryColor: "#4F46E5",
      secondaryColor: "#6366F1",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    };
  }
}
