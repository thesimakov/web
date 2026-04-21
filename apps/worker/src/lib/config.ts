import { z } from 'zod';

export const Config = z.object({
  REDIS_URL: z.string().default('redis://localhost:6379'),
  ROUTERAI_API_KEY: z.string().optional(),
  ROUTERAI_BASE_URL: z.string().default('https://routerai.ru/api/v1'),
  ROUTERAI_MODEL: z.string().default('gpt-4o-mini'),
});

export type WorkerConfig = z.infer<typeof Config>;

