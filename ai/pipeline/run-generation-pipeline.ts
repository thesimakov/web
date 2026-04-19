import { invokeGenerationGraph } from "@/ai/graph/generation-graph";
import type { SiteSchema } from "@/schema/site-schema";

import type { GenerationProgress } from "./types";

export type { GenerationProgress, PipelineStepName } from "./types";

/**
 * LangGraph: intent → planner → designer → copywriter → schema → validator.
 */
export async function runGenerationPipeline(
  userPrompt: string,
  onProgress?: (p: GenerationProgress) => void,
): Promise<{ schema: SiteSchema; fallback?: boolean }> {
  return invokeGenerationGraph(userPrompt, onProgress);
}
