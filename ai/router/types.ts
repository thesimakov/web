/**
 * Задачи для ModelRouter (маршрутизация моделей и fallback).
 */
export type LlmTask =
  | "interpreter"
  | "planning"
  | "copywriting"
  | "design"
  | "ui_generation"
  /** Генерация файлов (codegen); гибрид local → cloud в роутере. */
  | "codegen"
  /** @deprecated используй ui_generation */
  | "schema_builder";

export interface CompleteJsonParams {
  system: string;
  user: string;
  temperature: number;
}

export type RoutedCompleteJsonParams = CompleteJsonParams & {
  task: LlmTask;
};
