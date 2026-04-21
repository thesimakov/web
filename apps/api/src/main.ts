import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  );

  app.enableShutdownHooks();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.register(helmet as any);

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX', 'api');
  const port = config.get<number>('PORT', 3001);
  const corsOriginsEnv = config.get<string>('CORS_ORIGINS', '');

  await app.register(rateLimit as any, {
    max: 120,
    timeWindow: '1 minute',
  });

  const defaultCorsOrigins = [
    'http://localhost:44000',
    'http://127.0.0.1:44000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const configuredOrigins = corsOriginsEnv
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const allowAnyOrigin = configuredOrigins.includes('*');

  app.enableCors({
    origin: allowAnyOrigin
      ? true
      : Array.from(new Set([...defaultCorsOrigins, ...configuredOrigins])),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'authorization'],
  });

  app.setGlobalPrefix(apiPrefix);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('LMNT API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, doc);

  await app.listen({ port, host: '0.0.0.0' });
}

void bootstrap();

