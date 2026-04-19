import { executeRoutedJsonCompletion } from "./execute-routed-llm";
import type { CompleteJsonParams, LlmTask, RoutedCompleteJsonParams } from "./types";

export { executeRoutedJsonCompletion } from "./execute-routed-llm";

/**
 * Обёртка над executeRoutedJsonCompletion (всегда возвращает JSON-строку, без throw по провайдерам).
 */
export async function completeJsonRouted(
  params: RoutedCompleteJsonParams,
): Promise<string> {
  return executeRoutedJsonCompletion(params);
}

/** По умолчанию ui_generation для сборки схемы. */
export async function completeJson(
  params: CompleteJsonParams & { task?: LlmTask },
): Promise<string> {
  const task = params.task ?? "ui_generation";
  const { task: _t, ...rest } = params;
  const resolved: LlmTask =
    task === "schema_builder" ? "ui_generation" : task;
  return executeRoutedJsonCompletion({ ...rest, task: resolved });
}
