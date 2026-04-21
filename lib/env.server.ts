import { z } from "zod";

const llmProviderSchema = z.enum(["openai", "routerai", "anthropic", "google"]);

const serverEnvSchema = z.object({
  /** Какой провайдер использовать для агентов (см. .env.example). */
  /** По умолчанию OpenAI — чтобы не ломать существующие .env; для Gemini/Claude выставь google | anthropic. */
  LLM_PROVIDER: llmProviderSchema.default("openai"),
  /** Явная модель; если пусто — дефолт для выбранного провайдера. */
  LLM_MODEL: z.string().optional(),

  OPENAI_API_KEY: z.string().min(1).optional(),
  /** Прокси / Azure OpenAI / совместимый endpoint. */
  OPENAI_BASE_URL: z.string().optional(),
  /** Устаревшее имя: если задано, переопределяет OPENAI_MODEL_PRIMARY (одна модель OpenAI как раньше). */
  OPENAI_MODEL: z.string().optional(),
  /** Основная модель OpenAI в цепочке fallback (gpt-4o). */
  OPENAI_MODEL_PRIMARY: z.string().default("gpt-4o"),
  /** Запасная модель OpenAI (gpt-4o-mini). */
  OPENAI_MODEL_FALLBACK: z.string().default("gpt-4o-mini"),

  /**
   * RouterAI (OpenAI-compatible).
   * Документация: https://routerai.ru/docs/guides
   * Endpoint: https://routerai.ru/api/v1
   */
  ROUTERAI_API_KEY: z.string().min(1).optional(),
  ROUTERAI_BASE_URL: z.string().default("https://routerai.ru/api/v1"),

  /** Redis для кэша состояний генерации (опционально; без URL кэш отключён). */
  REDIS_URL: z.string().optional(),

  /** Локальная модель Ollama (без облачных ключей). Пример: http://127.0.0.1:11434 */
  OLLAMA_BASE_URL: z.string().optional(),
  OLLAMA_MODEL: z.string().default("llama3.2"),

  /** vLLM / OpenAI-compatible сервер (чат completions). Пример: http://127.0.0.1:8000/v1 */
  VLLM_BASE_URL: z.string().optional(),
  VLLM_MODEL: z.string().optional(),
  VLLM_API_KEY: z.string().optional(),

  /** Таймаут HTTP к LLM (мс). */
  LLM_HTTP_TIMEOUT_MS: z.coerce.number().default(120_000),
  /** Повторов на один шаг провайдера (0 = одна попытка). */
  LLM_MAX_RETRIES_PER_STEP: z.coerce.number().min(0).max(5).default(2),

  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  /** Прокси Anthropic (совместимый API). */
  ANTHROPIC_BASE_URL: z.string().optional(),
  /** По умолчанию актуальный Sonnet; переопредели через LLM_MODEL при необходимости. */
  /** Имя модели из консоли Anthropic; при 404 смени на актуальное в документации. */
  ANTHROPIC_MODEL: z.string().default("claude-3-5-sonnet-20241022"),

  /** Ключ из Google AI Studio: https://aistudio.google.com/apikey */
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  /** Gemini: flash быстрый; Pro — качество. Имя модели из документации Google. */
  GOOGLE_MODEL: z.string().default("gemini-2.0-flash"),

  /** Демо-пользователь без auth: список сайтов и save в /api/generate. Дублируй в PUBLIC_DEMO_USER_ID для клиента (Astro). */
  DEMO_USER_ID: z.string().default("local-demo"),

  /** Секрет для HMAC подписи webhook оплаты (сырое тело запроса). */
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),

  /** Токены при первом `ensure` пользователя (стартовый баланс). */
  INITIAL_SIGNUP_TOKEN_GRANT: z.coerce.number().min(0).default(100),

  /**
   * Секрет API из личного кабинета CloudPayments — для проверки `Content-HMAC` на webhook.
   * @see https://developers.cloudpayments.ru/
   */
  CLOUDPAYMENTS_API_SECRET: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type LlmProvider = z.infer<typeof llmProviderSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse({
    LLM_PROVIDER: process.env.LLM_PROVIDER,
    LLM_MODEL: process.env.LLM_MODEL,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    OPENAI_MODEL: process.env.OPENAI_MODEL,
    OPENAI_MODEL_PRIMARY: process.env.OPENAI_MODEL_PRIMARY,
    OPENAI_MODEL_FALLBACK: process.env.OPENAI_MODEL_FALLBACK,
    ROUTERAI_API_KEY: process.env.ROUTERAI_API_KEY,
    ROUTERAI_BASE_URL: process.env.ROUTERAI_BASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
    OLLAMA_MODEL: process.env.OLLAMA_MODEL,
    VLLM_BASE_URL: process.env.VLLM_BASE_URL,
    VLLM_MODEL: process.env.VLLM_MODEL,
    VLLM_API_KEY: process.env.VLLM_API_KEY,
    LLM_HTTP_TIMEOUT_MS: process.env.LLM_HTTP_TIMEOUT_MS,
    LLM_MAX_RETRIES_PER_STEP: process.env.LLM_MAX_RETRIES_PER_STEP,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_BASE_URL: process.env.ANTHROPIC_BASE_URL,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    GOOGLE_MODEL: process.env.GOOGLE_MODEL,
    DEMO_USER_ID: process.env.DEMO_USER_ID,
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
    INITIAL_SIGNUP_TOKEN_GRANT: process.env.INITIAL_SIGNUP_TOKEN_GRANT,
    CLOUDPAYMENTS_API_SECRET: process.env.CLOUDPAYMENTS_API_SECRET,
  });
}

export function getDemoUserId(): string {
  return getServerEnv().DEMO_USER_ID;
}

/** Основная модель OpenAI для роутера (legacy OPENAI_MODEL или OPENAI_MODEL_PRIMARY). */
export function getOpenAiPrimaryModel(): string {
  const e = getServerEnv();
  const legacy = e.OPENAI_MODEL?.trim();
  if (legacy) {
    return legacy;
  }
  return e.OPENAI_MODEL_PRIMARY.trim();
}

export function getOpenAiFallbackModel(): string {
  return getServerEnv().OPENAI_MODEL_FALLBACK.trim();
}

/** Модель для текущего провайдера (LLM_MODEL переопределяет всё). */
export function getLlmModel(): string {
  const e = getServerEnv();
  if (e.LLM_MODEL?.trim()) {
    return e.LLM_MODEL.trim();
  }
  switch (e.LLM_PROVIDER) {
    case "openai":
      return getOpenAiPrimaryModel();
    case "routerai":
      return getOpenAiPrimaryModel();
    case "anthropic":
      return e.ANTHROPIC_MODEL;
    case "google":
      return e.GOOGLE_MODEL;
    default:
      return e.GOOGLE_MODEL;
  }
}

export function assertLlmConfigured(): void {
  const e = getServerEnv();
  switch (e.LLM_PROVIDER) {
    case "openai":
      if (!e.OPENAI_API_KEY) {
        throw new Error("Для LLM_PROVIDER=openai нужен OPENAI_API_KEY");
      }
      return;
    case "routerai":
      if (!e.ROUTERAI_API_KEY) {
        throw new Error("Для LLM_PROVIDER=routerai нужен ROUTERAI_API_KEY");
      }
      return;
    case "anthropic":
      if (!e.ANTHROPIC_API_KEY) {
        throw new Error("Для LLM_PROVIDER=anthropic нужен ANTHROPIC_API_KEY");
      }
      return;
    case "google":
      if (!e.GOOGLE_GENERATIVE_AI_API_KEY) {
        throw new Error(
          "Для LLM_PROVIDER=google нужен GOOGLE_GENERATIVE_AI_API_KEY",
        );
      }
      return;
    default:
      throw new Error("Неизвестный LLM_PROVIDER");
  }
}

export function hasLlmCredentials(): boolean {
  try {
    assertLlmConfigured();
    return true;
  } catch {
    return false;
  }
}

/** Есть хотя бы один бэкенд LLM (облако или локально). */
export function assertAnyLlmConfigured(): void {
  if (hasAnyLlmOrLocal()) {
    return;
  }
  throw new Error(
    "Нужен облачный ключ (OPENAI / ANTHROPIC / GOOGLE) или локальный Ollama / vLLM (OLLAMA_* / VLLM_*)",
  );
}

export function hasAnyLlmCredentials(): boolean {
  try {
    assertAnyLlmConfigured();
    return true;
  } catch {
    return false;
  }
}

/** Облако или локальный Ollama — достаточно для попытки генерации (без полного отказа API). */
export function hasAnyLlmOrLocal(): boolean {
  const e = getServerEnv();
  if (
    e.OPENAI_API_KEY?.trim() ||
    e.ROUTERAI_API_KEY?.trim() ||
    e.ANTHROPIC_API_KEY?.trim() ||
    e.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  ) {
    return true;
  }
  return Boolean(
    (e.OLLAMA_BASE_URL?.trim() && e.OLLAMA_MODEL?.trim()) ||
      (e.VLLM_BASE_URL?.trim() && e.VLLM_MODEL?.trim()),
  );
}

/** @deprecated используй getLlmModel */
export function getChatModel(): string {
  return getLlmModel();
}
