import type { PlanType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { mapExternalPlanToPlanType } from "./types";

export const PLAN_TOKEN_GRANTS: Record<PlanType, number> = {
  FREE_TRIAL: 100,
  PRO: 5_000,
  PREMIUM: 20_000,
};

/**
 * Начисление токенов после успешной оплаты (только из доверенного webhook).
 * Идемпотентность по externalPaymentId.
 */
export async function creditTokensAfterPayment(params: {
  userId: string;
  /** Сырой id плана от провайдера */
  planExternalId: string;
  paymentProvider: string;
  amountPaidMinor?: number;
  externalPaymentId: string;
  /** Опционально: если уже знаем PlanType */
  planType?: PlanType;
}): Promise<
  | { ok: true; tokensAdded: number; duplicate: boolean }
  | { ok: false; error: string }
> {
  const planType =
    params.planType ?? mapExternalPlanToPlanType(params.planExternalId);
  if (!planType) {
    return { ok: false, error: "Unknown plan" };
  }

  const tokens = PLAN_TOKEN_GRANTS[planType];
  if (tokens <= 0) {
    return { ok: false, error: "Invalid token grant" };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.billingTransaction.findFirst({
        where: { externalPaymentId: params.externalPaymentId },
      });
      if (existing) {
        return { duplicate: true as const, tokensAdded: existing.tokensAdded };
      }

      await tx.user.upsert({
        where: { id: params.userId },
        create: {
          id: params.userId,
          tokenBalance: tokens,
          planType,
        },
        update: {
          tokenBalance: { increment: tokens },
          planType,
        },
      });

      await tx.billingTransaction.create({
        data: {
          userId: params.userId,
          plan: planType,
          tokensAdded: tokens,
          paymentProvider: params.paymentProvider,
          status: "SUCCESS",
          amountPaidMinor: params.amountPaidMinor ?? null,
          externalPaymentId: params.externalPaymentId,
          idempotencyKey: params.externalPaymentId,
        },
      });

      return { duplicate: false as const, tokensAdded: tokens };
    });

    return { ok: true, tokensAdded: result.tokensAdded, duplicate: result.duplicate };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Transaction failed";
    return { ok: false, error: msg };
  }
}
