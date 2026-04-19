import { z } from "zod";

import type { CopywriterOutput } from "@/ai/agents/section-copywriter.agent";
import type { InterpreterOutput } from "@/ai/agents/prompt-interpreter.agent";
import type { PlannerOutput } from "@/ai/agents/product-planner.agent";
import { completeJson } from "@/ai/llm/complete-json";
import type { SiteTheme } from "@/schema/site-schema";

/** Agent — сборка финальной SiteSchema JSON для рендерера (без HTML). */

export const schemaBuilderInputSchema = z.object({
  userPrompt: z.string().min(1),
  interpreter: z.custom<InterpreterOutput>(),
  planner: z.custom<PlannerOutput>(),
  /** Текст ошибки валидации при повторной попытке */
  previousError: z.string().optional(),
  themeOverride: z.custom<SiteTheme>().optional(),
  copyWriter: z.custom<CopywriterOutput>().optional(),
});

export type SchemaBuilderInput = z.infer<typeof schemaBuilderInputSchema>;

export const SCHEMA_BUILDER_SYSTEM = `Ты — SchemaBuilderAgent для конструктора сайтов на React по JSON-схеме.

КРИТИЧЕСКИЕ ПРАВИЛА:
- Верни ТОЛЬКО один JSON-объект. Без markdown-ограждений, без HTML, без пояснений вне JSON.
- Интерфейс строится только из этого JSON — нигде не вставляй сырой HTML в строках.
- Все видимые пользователю тексты (заголовки, кнопки, FAQ, отзывы, цены в подписях) пиши НА РУССКОМ, если пользователь явно не просил другой язык.
- theme.font — валидное значение CSS font-family (например "Inter, ui-sans-serif, system-ui, sans-serif").
- theme.primaryColor и theme.secondaryColor — hex, например "#4F46E5".
- sections — массив; у каждого элемента обязательно: "type", "variant", "props".
- "type" секции только из списка: hero, social-proof, features, workflow, pricing, testimonials, faq, cta
- Соблюдай переданный порядок секций один в один. Варианты (variant) и тексты в props можешь подобрать.
- Если передан themeOverride — используй эти цвета и шрифт в theme.
- Если переданы copyWriter.hints — учитывай идеи текстов.
- Структура props по типам:
  - hero: { headline, subheadline?, cta?, secondaryCta? }
  - social-proof: { headline?, stat?, logos? (массив названий брендов) }
  - features: { title?, items: [{ title, desc }, ...] }
  - workflow: { title?, steps: [{ title, desc }, ...] }
  - pricing: { title?, plans: [{ name, price, description?, features?, cta?, highlighted?, badge?, showIcon? ("zap"), tokenUsage?: { label, used, total }, isCurrentPlan?, accent? ("emerald"|"default"), featuresStyle? ("bullet"|"check") }, ...] }
  - testimonials: { title?, items: [{ quote, author, role? }, ...] }
  - faq: { title?, items: [{ q, a }, ...] }
  - cta: { headline, subheadline?, cta? }

Корневая форма:
{ "theme": { "primaryColor", "secondaryColor", "font" }, "sections": [ ... ] }`;

export async function runSchemaBuilder(
  input: SchemaBuilderInput,
): Promise<unknown> {
  const userPayload = {
    userPrompt: input.userPrompt,
    interpreter: input.interpreter,
    plannedSectionOrder: input.planner.sections,
    fixValidationError: input.previousError ?? null,
    themeOverride: input.themeOverride ?? null,
    copyWriter: input.copyWriter ?? null,
  };

  const raw = await completeJson({
    task: "ui_generation",
    system: SCHEMA_BUILDER_SYSTEM,
    user: JSON.stringify(userPayload, null, 2),
    temperature: 0.45,
  });

  return JSON.parse(raw) as unknown;
}
