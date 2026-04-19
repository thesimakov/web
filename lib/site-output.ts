import type { CodegenFile } from "@/schema/codegen-schema";
import type { SiteSchema } from "@/schema/site-schema";

export type StoredSitePayload =
  | SiteSchema
  | { mode: "codegen"; files: CodegenFile[] };

export function isCodegenSitePayload(
  schemaJson: unknown,
): schemaJson is { mode: "codegen"; files: CodegenFile[] } {
  if (!schemaJson || typeof schemaJson !== "object") {
    return false;
  }
  const o = schemaJson as Record<string, unknown>;
  return o.mode === "codegen" && Array.isArray(o.files);
}
