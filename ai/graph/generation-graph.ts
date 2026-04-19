import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

import {
  runProductPlanner,
  runPromptInterpreter,
  runSchemaBuilder,
  runSectionCopywriter,
  runThemeDesigner,
} from "@/ai/agents";
import type { CopywriterOutput } from "@/ai/agents/section-copywriter.agent";
import type { InterpreterOutput } from "@/ai/agents/prompt-interpreter.agent";
import type { PlannerOutput } from "@/ai/agents/product-planner.agent";
import { getSafeModeSiteSchema } from "@/ai/fallback/safe-site-schema";
import type {
  GenerationProgress,
  PipelineStepName,
} from "@/ai/pipeline/types";
import { safeParseSiteSchema } from "@/ai/validation/site-schema.zod";
import type { SiteSchema, SiteTheme } from "@/schema/site-schema";

const GenerationState = Annotation.Root({
  userPrompt: Annotation<string>(),
  retryCount: Annotation<number>({
    reducer: (_p, n) => n,
    default: () => 0,
  }),
  previousError: Annotation<string | undefined>(),
  interpreter: Annotation<InterpreterOutput | undefined>(),
  planner: Annotation<PlannerOutput | undefined>(),
  theme: Annotation<SiteTheme | undefined>(),
  copyWriter: Annotation<CopywriterOutput | undefined>(),
  rawSchema: Annotation<unknown | undefined>(),
  finalSchema: Annotation<SiteSchema | undefined>(),
  usedFallback: Annotation<boolean>({
    reducer: (_p, n) => n,
    default: () => false,
  }),
});

type GenState = typeof GenerationState.State;

function sectionsMatchPlanner(
  schema: SiteSchema,
  planned: readonly string[],
): boolean {
  if (schema.sections.length !== planned.length) {
    return false;
  }
  return schema.sections.every((s, i) => s.type === planned[i]);
}

function emit(
  onProgress: ((p: GenerationProgress) => void) | undefined,
  step: PipelineStepName,
  status: GenerationProgress["status"],
  detail?: unknown,
) {
  onProgress?.({ step, status, detail });
}

function compileGraph(onProgress?: (p: GenerationProgress) => void) {
  const graph = new StateGraph(GenerationState)
    .addNode("interpret", async (state: GenState) => {
      emit(onProgress, "prompt-interpreter", "started");
      const interpreter = await runPromptInterpreter({
        userPrompt: state.userPrompt,
      });
      emit(onProgress, "prompt-interpreter", "completed", interpreter);
      return { interpreter };
    })
    .addNode("plan", async (state: GenState) => {
      emit(onProgress, "product-planner", "started");
      const planner = await runProductPlanner({
        userPrompt: state.userPrompt,
        interpreter: state.interpreter!,
      });
      emit(onProgress, "product-planner", "completed", planner);
      return { planner };
    })
    .addNode("design", async (state: GenState) => {
      emit(onProgress, "theme-designer", "started");
      const theme = await runThemeDesigner({
        userPrompt: state.userPrompt,
        interpreter: state.interpreter!,
        planner: state.planner!,
      });
      emit(onProgress, "theme-designer", "completed", theme);
      return { theme };
    })
    .addNode("copy", async (state: GenState) => {
      emit(onProgress, "section-copywriter", "started");
      const copyWriter = await runSectionCopywriter({
        userPrompt: state.userPrompt,
        interpreter: state.interpreter!,
        planner: state.planner!,
      });
      emit(onProgress, "section-copywriter", "completed", copyWriter);
      return { copyWriter };
    })
    .addNode("build", async (state: GenState) => {
      emit(onProgress, "schema-builder", "started");
      const rawSchema = await runSchemaBuilder({
        userPrompt: state.userPrompt,
        interpreter: state.interpreter!,
        planner: state.planner!,
        previousError: state.previousError,
        themeOverride: state.theme,
        copyWriter: state.copyWriter,
      });
      emit(onProgress, "schema-builder", "completed");
      return { rawSchema };
    })
    .addNode("validate", async (state: GenState) => {
      emit(onProgress, "schema-validator", "started");
      const parsed = safeParseSiteSchema(state.rawSchema);
      const nextRetry = state.retryCount + 1;

      if (!parsed.success) {
        const msg = parsed.error.issues
          .map((e) => `${e.path.join(".")}: ${e.message}`)
          .join("; ");
        emit(onProgress, "schema-validator", "failed", msg);
        if (nextRetry >= 2) {
          const safe = getSafeModeSiteSchema();
          emit(onProgress, "schema-validator", "completed", safe);
          return {
            finalSchema: safe,
            usedFallback: true,
            previousError: undefined,
            retryCount: nextRetry,
          };
        }
        return {
          previousError: msg,
          retryCount: nextRetry,
        };
      }

      const schema = parsed.data as SiteSchema;
      if (!sectionsMatchPlanner(schema, state.planner!.sections)) {
        const msg = `Типы и порядок секций должны точно совпадать с планом: ${state.planner!.sections.join(", ")}`;
        emit(onProgress, "schema-validator", "failed", msg);
        if (nextRetry >= 2) {
          const safe = getSafeModeSiteSchema();
          emit(onProgress, "schema-validator", "completed", safe);
          return {
            finalSchema: safe,
            usedFallback: true,
            previousError: undefined,
            retryCount: nextRetry,
          };
        }
        return {
          previousError: msg,
          retryCount: nextRetry,
        };
      }

      emit(onProgress, "schema-validator", "completed", schema);
      return { finalSchema: schema, previousError: undefined };
    })
    .addEdge(START, "interpret")
    .addEdge("interpret", "plan")
    .addEdge("plan", "design")
    .addEdge("design", "copy")
    .addEdge("copy", "build")
    .addEdge("build", "validate")
    .addConditionalEdges("validate", (state: GenState) => {
      if (state.finalSchema) {
        return END;
      }
      if (state.retryCount < 2) {
        return "build";
      }
      return END;
    });

  return graph.compile();
}

export async function invokeGenerationGraph(
  userPrompt: string,
  onProgress?: (p: GenerationProgress) => void,
): Promise<{ schema: SiteSchema; fallback?: boolean }> {
  try {
    const app = compileGraph(onProgress);
    const result = await app.invoke({
      userPrompt,
      retryCount: 0,
    });
    if (!result.finalSchema) {
      return { schema: getSafeModeSiteSchema(), fallback: true };
    }
    return {
      schema: result.finalSchema,
      fallback: result.usedFallback,
    };
  } catch {
    return { schema: getSafeModeSiteSchema(), fallback: true };
  }
}
