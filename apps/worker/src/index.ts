import { Worker } from 'bullmq';
import pino from 'pino';
import { Config } from './lib/config';
import { registerPromptWorker } from './workers/prompt-worker';

const log = pino({ level: process.env.LOG_LEVEL ?? 'info' });

async function main() {
  const cfg = Config.parse(process.env);
  log.info({ redis: cfg.REDIS_URL }, 'worker starting');

  const workers: Worker[] = [];

  workers.push(registerPromptWorker(cfg, log));

  const shutdown = async () => {
    log.info('worker shutting down');
    await Promise.allSettled(workers.map((w) => w.close()));
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void main().catch((e) => {
  log.error(e, 'worker crashed');
  process.exit(1);
});

