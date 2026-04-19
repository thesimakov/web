export type PipelineStepName =
  | "prompt-interpreter"
  | "product-planner"
  | "theme-designer"
  | "section-copywriter"
  | "schema-builder"
  | "schema-validator";

export type GenerationProgress = {
  step: PipelineStepName;
  status: "started" | "completed" | "failed";
  detail?: unknown;
};
