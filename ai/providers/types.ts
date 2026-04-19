/**
 * Единый контракт провайдеров LLM (облако + локально).
 * Все вызовы из приложения идут через ModelRouter → LLMProvider.
 */
export type LlmGenerateParams = {
  /** Имя модели для этого провайдера. */
  model: string;
  system: string;
  user: string;
  temperature: number;
  /** Ожидаем JSON-текст в ответе (где поддерживается). */
  jsonMode?: boolean;
};

export interface LLMProvider {
  readonly id: "openai" | "anthropic" | "google" | "ollama" | "vllm";
  /** Провайдер готов к вызову (ключ, URL и т.д.). */
  isAvailable(): boolean;
  generate(params: LlmGenerateParams): Promise<string>;
  /**
   * Поток токенов (для SSE). Если стриминг недоступен — один чанк = полный ответ.
   */
  stream(params: LlmGenerateParams): AsyncIterable<string>;
}
