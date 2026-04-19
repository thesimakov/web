import { ZodError } from "zod";

import { safeParseSiteSchema } from "@/ai/validation/site-schema.zod";
import type { SiteSchema } from "@/schema/site-schema";

/** Agent 12 — строгая проверка JSON перед рендером. */

export function runSchemaValidator(raw: unknown): {
  ok: true;
  schema: SiteSchema;
} {
  const result = safeParseSiteSchema(raw);
  if (!result.success) {
    throw formatValidationError(result.error);
  }
  return { ok: true, schema: result.data as SiteSchema };
}

function formatValidationError(error: ZodError): Error {
  const msg = error.issues
    .map((e) => `${e.path.join(".") || "schema"}: ${e.message}`)
    .join("; ");
  return new Error(`Ошибка проверки схемы: ${msg}`);
}
