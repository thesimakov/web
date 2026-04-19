import type { LlmTask } from "./types";

/** JSON-строки по умолчанию, если все провайдеры недоступны или провалились. */
export function getDefaultJsonStringForTask(task: LlmTask): string {
  switch (task) {
    case "interpreter":
      return JSON.stringify({
        product_type: "General",
        industry: "General",
        audience: "General audience",
        tone: "professional",
        goal: "lead_generation",
      });
    case "planning":
      return JSON.stringify({
        sections: ["hero", "features", "cta"],
      });
    case "design":
      return JSON.stringify({
        theme: {
          primaryColor: "#4F46E5",
          secondaryColor: "#6366F1",
          font: "Inter, ui-sans-serif, system-ui, sans-serif",
        },
      });
    case "copywriting":
      return JSON.stringify({
        heroHeadline: "Ваш продукт",
        heroSubheadline: "Краткое описание ценности",
        ctaLabel: "Связаться",
      });
    case "codegen":
      return JSON.stringify({
        files: [
          {
            path: "/components/FallbackHero.tsx",
            content:
              "export function FallbackHero() { return null; }",
          },
        ],
      });
    case "ui_generation":
    case "schema_builder":
      return JSON.stringify({
        theme: {
          primaryColor: "#4F46E5",
          secondaryColor: "#6366F1",
          font: "Inter, ui-sans-serif, system-ui, sans-serif",
        },
        sections: [
          {
            type: "hero",
            variant: "default",
            props: {
              headline: "Сервис временно ограничен",
              subheadline: "Повторите генерацию позже",
              cta: "Повторить",
            },
          },
        ],
      });
    default:
      return "{}";
  }
}
