import type { SiteSchema } from "@/schema/site-schema";

/** Безопасная схема, если все LLM и кэш недоступны (соответствует контракту Zod). */
export function getSafeModeSiteSchema(): SiteSchema {
  return {
    theme: {
      primaryColor: "#4F46E5",
      secondaryColor: "#6366F1",
      font: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
    sections: [
      {
        type: "hero",
        variant: "fallback",
        props: {
          headline: "Service temporarily limited",
          subheadline: "Please retry generation",
          cta: "Retry",
        },
      },
    ],
  };
}
