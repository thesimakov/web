import { createHmac, timingSafeEqual } from "crypto";

import { getServerEnv } from "@/lib/env.server";

import { mapExternalPlanToPlanType, type ExternalPlanId } from "./types";

/**
 * Абстракция провайдера оплаты / агрегатора (OpenRouter billing, Stripe, …).
 * Верификация подписи webhook + разбор полезной нагрузки.
 */

export type ParsedPaymentPayload = {
  userId: string;
  planId: ExternalPlanId;
  paymentStatus: "SUCCESS" | "FAILED" | string;
  amountPaidMinor?: number;
  /** Уникальный id события у провайдера (идемпотентность). */
  externalPaymentId: string;
  rawBody: string;
};

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

/**
 * Проверка подписи HMAC-SHA256: заголовок `X-Signature: sha256=<hex>`
 * или `X-Webhook-Signature` с тем же форматом.
 */
export function verifyPaymentSignature(
  rawBody: string,
  signatureHeader: string | null,
): boolean {
  const secret = getServerEnv().PAYMENT_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return false;
  }
  if (!signatureHeader) {
    return false;
  }
  const trimmed = signatureHeader.trim();
  const hex = trimmed.startsWith("sha256=")
    ? trimmed.slice(7)
    : trimmed;
  if (!/^[a-f0-9]+$/i.test(hex)) {
    return false;
  }
  const expected = createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");
  return safeEqual(hex.toLowerCase(), expected.toLowerCase());
}

/**
 * Извлекает план из payload (универсальный JSON).
 * Ожидаемые поля: plan_id | planId | plan, user_id | userId, status, amount, id.
 */
function parseJsonDataPlan(json: Record<string, unknown>): string | null {
  const raw = json.JsonData;
  if (typeof raw !== "string" || !raw.trim()) {
    return null;
  }
  try {
    const jd = JSON.parse(raw) as Record<string, unknown>;
    const p =
      (typeof jd.plan === "string" && jd.plan) ||
      (typeof jd.planId === "string" && jd.planId) ||
      (typeof jd.product === "string" && jd.product) ||
      null;
    return p;
  } catch {
    return null;
  }
}

export function getPlanFromPayment(json: Record<string, unknown>): {
  userId: string | null;
  planId: string | null;
  paymentStatus: string | null;
  amountPaidMinor: number | undefined;
  externalPaymentId: string | null;
} {
  /** CloudPayments Pay: AccountId, TransactionId, Status, Amount (₽), JsonData */
  if (
    typeof json.TransactionId !== "undefined" ||
    typeof json.AccountId !== "undefined"
  ) {
    const account = json.AccountId;
    const userId =
      typeof account === "string"
        ? account
        : account != null
          ? String(account)
          : null;
    const tid = json.TransactionId;
    const externalPaymentId =
      tid != null && tid !== ""
        ? String(tid)
        : null;
    const status =
      typeof json.Status === "string"
        ? json.Status
        : typeof json.status === "string"
          ? json.status
          : null;
    let amountPaidMinor: number | undefined;
    const amount = json.Amount ?? json.PaymentAmount ?? json.amount;
    if (typeof amount === "number" && Number.isFinite(amount)) {
      amountPaidMinor = Math.round(amount * 100);
    } else if (typeof amount === "string" && /^[\d.]+$/.test(amount)) {
      amountPaidMinor = Math.round(parseFloat(amount) * 100);
    }
    const planFromMeta = parseJsonDataPlan(json);
    const invoiceId =
      typeof json.InvoiceId === "string" ? json.InvoiceId.trim() : null;
    let planId = planFromMeta;
    if (!planId && invoiceId?.startsWith("plan_")) {
      planId = invoiceId.slice(5);
    }

    return {
      userId,
      planId,
      paymentStatus: status,
      amountPaidMinor,
      externalPaymentId,
    };
  }

  const userId =
    (typeof json.user_id === "string" && json.user_id) ||
    (typeof json.userId === "string" && json.userId) ||
    null;
  const planRaw =
    (typeof json.plan_id === "string" && json.plan_id) ||
    (typeof json.planId === "string" && json.planId) ||
    (typeof json.plan === "string" && json.plan) ||
    null;
  const paymentStatus =
    (typeof json.payment_status === "string" && json.payment_status) ||
    (typeof json.status === "string" && json.status) ||
    (typeof json.event === "string" && json.event) ||
    null;
  const externalPaymentId =
    (typeof json.id === "string" && json.id) ||
    (typeof json.payment_id === "string" && json.payment_id) ||
    (typeof json.event_id === "string" && json.event_id) ||
    null;

  let amountPaidMinor: number | undefined;
  const amount = json.amount ?? json.amount_paid;
  if (typeof amount === "number" && Number.isFinite(amount)) {
    amountPaidMinor = Math.round(amount);
  } else if (typeof amount === "string" && /^\d+$/.test(amount)) {
    amountPaidMinor = parseInt(amount, 10);
  }

  return {
    userId,
    planId: planRaw,
    paymentStatus,
    amountPaidMinor,
    externalPaymentId,
  };
}

/**
 * Подтверждение транзакции: нормализует статус «успех».
 */
export function confirmTransactionStatus(
  status: string | null | undefined,
): "SUCCESS" | "OTHER" {
  if (!status) {
    return "OTHER";
  }
  const s = status.toUpperCase();
  if (
    s === "SUCCESS" ||
    s === "SUCCEEDED" ||
    s === "PAID" ||
    s === "COMPLETED" ||
    s === "PAYMENT.SUCCESS"
  ) {
    return "SUCCESS";
  }
  return "OTHER";
}

/** Универсальная проверка «успешной оплаты» (в т.ч. CloudPayments `Completed`). */
export function isSuccessfulPaymentStatus(
  status: string | null | undefined,
  provider: "cloudpayments" | "generic",
): boolean {
  if (provider === "cloudpayments") {
    return (status ?? "").trim() === "Completed";
  }
  return confirmTransactionStatus(status) === "SUCCESS";
}

export function resolvePlanTypeFromExternal(
  planId: string | null,
): import("@prisma/client").PlanType | null {
  return mapExternalPlanToPlanType(planId ?? undefined);
}
