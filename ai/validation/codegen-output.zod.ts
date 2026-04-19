import { z } from "zod";

/** Один файл в выдаче codegen (пути как в v0: /components/X.tsx). */
export const codegenFileSchema = z.object({
  path: z
    .string()
    .min(1)
    .max(512)
    .refine((p) => p.startsWith("/"), {
      message: "path должен начинаться с /",
    }),
  content: z.string().max(500_000),
});

export const codegenPayloadSchema = z.object({
  files: z.array(codegenFileSchema).min(1).max(40),
});

export type CodegenPayloadParsed = z.infer<typeof codegenPayloadSchema>;

export function safeParseCodegenPayload(data: unknown) {
  return codegenPayloadSchema.safeParse(data);
}
