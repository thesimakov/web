import type { PlanType } from "@prisma/client";

export function canUseCodegenMode(plan: PlanType): boolean {
  return plan === "PRO" || plan === "PREMIUM";
}

export function canUsePremiumModels(plan: PlanType): boolean {
  return plan === "PREMIUM";
}

export function canUseProModels(plan: PlanType): boolean {
  return plan === "PRO" || plan === "PREMIUM";
}
