import { Worker } from 'bullmq';
import type { Logger } from 'pino';
import { RouterAIClient } from '@lmnt/ai-client';
import type { WorkerConfig } from '../lib/config';

/**
 * Пока это "заготовка": в Phase 2 prompt generation делается синхронно через API.
 * Здесь оставляем очередь, чтобы позже перенести генерацию в background без смены контракта.
 */
export function registerPromptWorker(cfg: WorkerConfig, log: Logger) {
  const ai =
    cfg.ROUTERAI_API_KEY
      ? new RouterAIClient({
          apiKey: cfg.ROUTERAI_API_KEY,
          baseUrl: cfg.ROUTERAI_BASE_URL,
          model: cfg.ROUTERAI_MODEL,
        })
      : null;

  return new Worker(
    'ai_prompt',
    async (job) => {
      log.info({ jobId: job.id }, 'prompt job received');
      if (!ai) throw new Error('ROUTERAI_API_KEY is not configured for worker');
      const idea = String(job.data?.idea ?? '');
      const { content } = await ai.chatCompletions({
        messages: [
          { role: 'system', content: 'Верни JSON спецификацию сайта.' },
          { role: 'user', content: idea },
        ],
      });
      return { content };
    },
    {
      connection: { url: cfg.REDIS_URL },
    },
  );
}

