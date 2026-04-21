import { ForbiddenException, Injectable } from '@nestjs/common';
import { prisma } from '@lmnt/database';

function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function monthKey(d = new Date()) {
  return d.toISOString().slice(0, 7);
}

@Injectable()
export class UsageService {
  async getActivePlan(userId: string) {
    const sub = await prisma.subscription.findFirst({
      where: { userId, status: 'active' },
      orderBy: { startedAt: 'desc' },
    });
    const planKey = sub?.planKey ?? 'FREE';
    const plan = await prisma.plan.findUnique({ where: { key: planKey } });
    if (plan) return plan;

    // fallback: FREE defaults
    return {
      key: 'FREE',
      name: 'Free',
      tokensPerDay: 5,
      sitesPerDay: 1,
      sitesPerMonth: 1,
      priorityQueue: false,
      createdAt: new Date(),
    } as const;
  }

  async getUsage(userId: string, d = new Date()) {
    const usage = await prisma.usage.upsert({
      where: { userId_dayKey: { userId, dayKey: dayKey(d) } },
      update: {},
      create: {
        userId,
        dayKey: dayKey(d),
        monthKey: monthKey(d),
      },
    });
    return usage;
  }

  async assertCanGeneratePrompt(userId: string) {
    const plan = await this.getActivePlan(userId);
    const usage = await this.getUsage(userId);
    if (usage.tokensUsed >= plan.tokensPerDay) {
      throw new ForbiddenException('Daily token limit reached');
    }
  }

  async consumeTokens(userId: string, tokens: number) {
    await prisma.usage.update({
      where: { userId_dayKey: { userId, dayKey: dayKey() } },
      data: { tokensUsed: { increment: tokens } },
    });
  }

  async assertCanCreateSite(userId: string) {
    const plan = await this.getActivePlan(userId);
    const usage = await this.getUsage(userId);
    if (usage.sitesUsedDay >= plan.sitesPerDay) {
      throw new ForbiddenException('Daily site generation limit reached');
    }
    if (usage.sitesUsedMonth >= plan.sitesPerMonth) {
      throw new ForbiddenException('Monthly site generation limit reached');
    }
  }

  async consumeSite(userId: string) {
    await prisma.usage.update({
      where: { userId_dayKey: { userId, dayKey: dayKey() } },
      data: {
        sitesUsedDay: { increment: 1 },
        sitesUsedMonth: { increment: 1 },
      },
    });
  }
}

