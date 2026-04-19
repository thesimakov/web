import type { LlmTask } from "@/ai/router/types";

/**
 * Повторная сборка схемы (после ошибки валидации) — не кэшируем ответ:
 * ключ уникален и не даёт дедупа; не засоряем Redis одноразовыми правками.
 */
export function shouldCacheSuccessfulLlmResponse(
  task: LlmTask,
  user: string,
): boolean {
  if (task !== "schema_builder" && task !== "ui_generation") {
    return true;
  }
  try {
    const parsed = JSON.parse(user) as { fixValidationError?: unknown };
    if (
      parsed.fixValidationError != null &&
      String(parsed.fixValidationError).length > 0
    ) {
      return false;
    }
  } catch {
    return true;
  }
  return true;
}
