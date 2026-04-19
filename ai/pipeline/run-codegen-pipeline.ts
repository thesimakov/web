import { CODEGEN_SYSTEM } from "@/ai/codegen/codegen-prompts";
import { executeRoutedJsonCompletion } from "@/ai/router/execute-routed-llm";
import { getDefaultJsonStringForTask } from "@/ai/router/task-defaults";
import type { CodegenPayload } from "@/schema/codegen-schema";
import { safeParseCodegenPayload } from "@/ai/validation/codegen-output.zod";

export type CodegenProgress = {
  step: "codegen";
  status: "started" | "completed" | "failed";
  detail?: unknown;
};

/**
 * Генерация набора файлов (режим codegen). Выход только после Zod или fallback.
 */
export async function runCodegenPipeline(
  userPrompt: string,
  onProgress?: (p: CodegenProgress) => void,
): Promise<{ codegen: CodegenPayload; fallback?: boolean }> {
  onProgress?.({ step: "codegen", status: "started" });

  const raw = await executeRoutedJsonCompletion({
    task: "codegen",
    system: CODEGEN_SYSTEM,
    user: userPrompt,
    temperature: 0.35,
  });

  let data: unknown;
  try {
    data = JSON.parse(raw) as unknown;
  } catch {
    data = null;
  }

  const parsed =
    data !== null ? safeParseCodegenPayload(data) : { success: false as const };

  if (parsed.success) {
    onProgress?.({ step: "codegen", status: "completed" });
    return { codegen: parsed.data };
  }

  const fallbackJson = getDefaultJsonStringForTask("codegen");
  const fb = safeParseCodegenPayload(JSON.parse(fallbackJson) as unknown);
  if (fb.success) {
    onProgress?.({
      step: "codegen",
      status: "completed",
      detail: { usedFallback: true },
    });
    return { codegen: fb.data, fallback: true };
  }

  onProgress?.({ step: "codegen", status: "failed", detail: "validation" });
  return {
    codegen: {
      files: [
        {
          path: "/app/page.tsx",
          content:
            'export default function Page() { return <main className="p-8">Codegen fallback</main>; }',
        },
      ],
    },
    fallback: true,
  };
}
