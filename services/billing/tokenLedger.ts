import type { PlanType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { getGenerationCharge } from "./tokenCosts";

/**
 * Серверный учёт списаний. Фронт не может «начислить» токены.
 */

export async function getUserBillingSnapshot(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true, planType: true },
  });
  return user;
}

export async function assertEnoughTokens(
  userId: string,
  required: number,
): Promise<
  { ok: true; balance: number; planType: PlanType } | { ok: false; balance: number }
> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tokenBalance: true, planType: true },
  });
  if (!user) {
    return { ok: false, balance: 0 };
  }
  if (user.tokenBalance < required) {
    return { ok: false, balance: user.tokenBalance };
  }
  return { ok: true, balance: user.tokenBalance, planType: user.planType };
}

/**
 * Списание после успешной генерации (внутри уже завершённого пайплайна).
 */
export async function deductTokensForGeneration(params: {
  userId: string;
  mode: "schema" | "codegen";
  meta?: Record<string, unknown>;
}): Promise<{ ok: boolean; deducted: number; balanceAfter?: number }> {
  const charge = getGenerationCharge(params.mode, await getPlanOrDefault(params.userId));

  const updated = await prisma.user.updateMany({
    where: { id: params.userId, tokenBalance: { gte: charge } },
    data: { tokenBalance: { decrement: charge } },
  });

  if (updated.count === 0) {
    return { ok: false, deducted: 0 };
  }

  const u = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { tokenBalance: true },
  });

  await prisma.usageLog
    .create({
      data: {
        userId: params.userId,
        kind: "token_spend",
        units: charge,
        meta: {
          mode: params.mode,
          ...params.meta,
        } as object,
      },
    })
    .catch(() => {
      /* ignore */
    });

  return { ok: true, deducted: charge, balanceAfter: u?.tokenBalance };
}

async function getPlanOrDefault(userId: string): Promise<PlanType> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });
  return row?.planType ?? "FREE_TRIAL";
}
