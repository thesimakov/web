import { NextResponse } from "next/server";

import { getServerEnv } from "@/lib/env.server";
import {
  isSuccessfulPaymentStatus,
  getPlanFromPayment,
  resolvePlanTypeFromExternal,
  verifyPaymentSignature,
} from "@/services/billing/billingProvider";
import {
  parseCloudPaymentsBody,
  verifyCloudPaymentsContentHmac,
} from "@/services/billing/cloudpayments";
import { creditTokensAfterPayment } from "@/services/billing/tokenCreditService";

export const runtime = "nodejs";

/**
 * Webhook оплаты.
 *
 * **CloudPayments** ([документация](https://developers.cloudpayments.ru/#notifications)):
 * - Подпись: заголовок `Content-HMAC` = base64(HMAC-SHA256(raw body, **API Secret** из кабинета)).
 * - В `.env`: `CLOUDPAYMENTS_API_SECRET` = тот же секрет, что в личном кабинете CloudPayments.
 * - Укажите URL уведомления Pay: `https://<ваш-домен>/api/webhooks/payment`
 * - В виджете передайте `accountId` = id пользователя в вашей системе, план — в `data` / JsonData:
 *   `{"plan":"PRO"}` или `InvoiceId`: `plan_PREMIUM`.
 *
 * **Универсальный формат** (HMAC hex): заголовок `X-Signature: sha256=<hex>`, секрет `PAYMENT_WEBHOOK_SECRET`.
 */
export async function POST(req: Request) {
  const rawBody = await req.text();
  const env = getServerEnv();

  const contentHmac =
    req.headers.get("content-hmac") ??
    req.headers.get("Content-HMAC");

  const cpSecret = env.CLOUDPAYMENTS_API_SECRET?.trim();

  let signatureOk: boolean;
  let provider: "cloudpayments" | "generic";

  if (contentHmac && cpSecret) {
    signatureOk = verifyCloudPaymentsContentHmac(
      rawBody,
      contentHmac,
      cpSecret,
    );
    provider = "cloudpayments";
  } else {
    const sig =
      req.headers.get("x-signature") ??
      req.headers.get("x-webhook-signature") ??
      req.headers.get("x-openrouter-signature");
    signatureOk = verifyPaymentSignature(rawBody, sig);
    provider = "generic";
  }

  if (!signatureOk) {
    return NextResponse.json(
      { error: "Invalid signature", code: 13 },
      { status: 401 },
    );
  }

  let json: Record<string, unknown>;
  try {
    json = parseCloudPaymentsBody(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid body", code: 13 }, { status: 400 });
  }

  const parsed = getPlanFromPayment(json);
  if (!parsed.userId || !parsed.externalPaymentId) {
    return NextResponse.json(
      { error: "Missing AccountId / user_id or TransactionId / id", code: 12 },
      { status: 400 },
    );
  }

  if (!isSuccessfulPaymentStatus(parsed.paymentStatus, provider)) {
    const body = { ok: true, ignored: true, reason: "not success" };
    return provider === "cloudpayments"
      ? NextResponse.json({ code: 0, ...body })
      : NextResponse.json(body);
  }

  if (!parsed.planId?.trim()) {
    return NextResponse.json(
      {
        error:
          "Укажите план: JsonData {\"plan\":\"PRO\"} или InvoiceId plan_PRO",
        code: 12,
      },
      { status: 400 },
    );
  }

  const planType = resolvePlanTypeFromExternal(parsed.planId);
  if (!planType) {
    return NextResponse.json({ error: "Unknown plan", code: 12 }, { status: 400 });
  }

  const result = await creditTokensAfterPayment({
    userId: parsed.userId,
    planExternalId: parsed.planId,
    planType,
    paymentProvider:
      provider === "cloudpayments" ? "cloudpayments" : "custom",
    amountPaidMinor: parsed.amountPaidMinor,
    externalPaymentId:
      provider === "cloudpayments"
        ? `cp_${parsed.externalPaymentId}`
        : parsed.externalPaymentId,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: 13 },
      { status: 500 },
    );
  }

  const payload = {
    ok: true,
    tokensAdded: result.tokensAdded,
    duplicate: result.duplicate,
    code: 0,
  };

  return provider === "cloudpayments"
    ? NextResponse.json(payload)
    : NextResponse.json({
        ok: payload.ok,
        tokensAdded: payload.tokensAdded,
        duplicate: payload.duplicate,
      });
}
