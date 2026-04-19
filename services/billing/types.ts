import type { PlanType } from "@prisma/client";

export type { PlanType };

/** Идентификаторы планов из внешнего биллинга (OpenRouter / Stripe и т.д.). */
export type ExternalPlanId =
  | "FREE_TRIAL"
  | "PRO"
  | "PREMIUM"
  | string;

export function mapExternalPlanToPlanType(
  raw: string | undefined,
): PlanType | null {
  if (!raw) {
    return null;
  }
  const u = raw.toUpperCase().replace(/-/g, "_");
  if (u === "FREE" || u === "FREE_TRIAL" || u === "TRIAL") {
    return "FREE_TRIAL";
  }
  if (u === "PRO" || u === "STARTER") {
    return "PRO";
  }
  if (u === "PREMIUM" || u === "ENTERPRISE") {
    return "PREMIUM";
  }
  return null;
}
