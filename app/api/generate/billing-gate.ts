import type { PlanType } from "@prisma/client";
import { NextResponse } from "next/server";

import { ensureBillingUser } from "@/lib/billing/ensure-user";
import { prisma } from "@/lib/prisma";
import { canUseCodegenMode } from "@/services/billing/entitlements";
import { assertEnoughTokens } from "@/services/billing/tokenLedger";
import { getGenerationCharge } from "@/services/billing/tokenCosts";

export type BillingGateResult =
  | { anonymousFullAccess: true }
  | { anonymousFullAccess: false; planType: PlanType };

export async function resolveBillingGate(
  userId: string | undefined,
  outputMode: "schema" | "codegen",
): Promise<{ error: NextResponse } | BillingGateResult> {
  if (!userId) {
    return { anonymousFullAccess: true };
  }

  await ensureBillingUser(userId);

  const snap = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  });
  const planType: PlanType = snap?.planType ?? "FREE_TRIAL";

  if (outputMode === "codegen" && !canUseCodegenMode(planType)) {
    return {
      error: NextResponse.json(
        {
          error: "Режим codegen доступен с плана PRO и выше",
          code: "PLAN_FORBIDDEN",
        },
        { status: 403 },
      ),
    };
  }

  const charge = getGenerationCharge(outputMode, planType);
  const check = await assertEnoughTokens(userId, charge);
  if (!check.ok) {
    return {
      error: NextResponse.json(
        {
          error: "Недостаточно токенов",
          required: charge,
          balance: check.balance,
          code: "INSUFFICIENT_TOKENS",
        },
        { status: 402 },
      ),
    };
  }

  return { anonymousFullAccess: false, planType: check.planType };
}

export function planForLlmRouting(billing: BillingGateResult): PlanType {
  if (billing.anonymousFullAccess) {
    return "PREMIUM";
  }
  return billing.planType;
}
