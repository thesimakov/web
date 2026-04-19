import { AsyncLocalStorage } from "async_hooks";

import type { PlanType } from "@prisma/client";

type Ctx = { planType: PlanType };

const storage = new AsyncLocalStorage<Ctx>();

export function getRequestPlanType(): PlanType | undefined {
  return storage.getStore()?.planType;
}

export function runWithBillingPlan<T>(
  planType: PlanType,
  fn: () => Promise<T>,
): Promise<T> {
  return storage.run({ planType }, fn);
}
