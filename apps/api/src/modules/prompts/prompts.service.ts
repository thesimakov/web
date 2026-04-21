import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@lmnt/database';
import { ConfigService } from '@nestjs/config';
import { RouterAIClient } from '@lmnt/ai-client';
import { PromptSpecSchema } from './spec-schema';
import { UsageService } from '../usage/usage.service';

function safeJsonParse(input: string): unknown {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    // попытка извлечь JSON из markdown fenced блока
    const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) ?? trimmed.match(/```([\s\S]*?)```/);
    if (match?.[1]) return JSON.parse(match[1]);
    throw new Error('Invalid JSON from model');
  }
}

@Injectable()
export class PromptsService {
  private readonly ai: RouterAIClient;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    private readonly usage: UsageService,
  ) {
    const apiKey = this.config.get<string>('ROUTERAI_API_KEY') ?? '';
    const baseUrl = this.config.get<string>('ROUTERAI_BASE_URL') ?? 'https://routerai.ru/api/v1';
    const model = this.config.get<string>('ROUTERAI_MODEL') ?? 'gpt-4o-mini';
    this.ai = new RouterAIClient({ apiKey, baseUrl, model });
  }

  async generateSpec(userId: string, projectId: string, idea: string) {
    await this.usage.assertCanGeneratePrompt(userId);

    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');

    const sub = await prisma.subscription.findFirst({ where: { userId, status: 'active' } });
    if (!sub) throw new ForbiddenException('No active subscription');

    if (!process.env.ROUTERAI_API_KEY) {
      throw new ForbiddenException('ROUTERAI_API_KEY is not configured');
    }

    const system = [
      'Ты Prompt Architect Agent для платформы LMNT.',
      'Преобразуй идею пользователя в профессиональную тех. спецификацию сайта.',
      'Верни строго JSON без пояснений.',
      'Структура JSON (ключи строго такие):',
      '- ProjectOverview (string)',
      '- TargetAudience (string)',
      '- Pages (string[])',
      '- UISections (string[])',
      '- Features (string[])',
      '- TechStack (string[])',
      '- ComponentStructure (string[])',
      '- SEORequirements (string[])'
    ].join('\n');

    const { content, tokensUsed } = await this.ai.chatCompletions({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: idea },
      ],
      temperature: 0.2,
    });

    const raw = safeJsonParse(content);
    const spec = PromptSpecSchema.parse(raw);

    await this.usage.consumeTokens(userId, Math.max(tokensUsed, 1));

    const prompt = await prisma.prompt.create({
      data: {
        projectId,
        versions: {
          create: {
            version: 1,
            idea,
            specJson: spec,
          },
        },
      },
      select: {
        id: true,
        createdAt: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: { id: true, version: true, idea: true, specJson: true, createdAt: true },
        },
      },
    });

    return { promptId: prompt.id, version: prompt.versions[0] };
  }

  async listProjectPrompts(userId: string, projectId: string) {
    const project = await prisma.project.findFirst({ where: { id: projectId, userId } });
    if (!project) throw new NotFoundException('Project not found');

    return await prisma.prompt.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        versions: {
          orderBy: { version: 'desc' },
          take: 1,
          select: { id: true, version: true, idea: true, createdAt: true },
        },
      },
    });
  }
}

