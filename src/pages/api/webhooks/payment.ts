import type { APIRoute } from "astro";

import { getServerEnv } from "@/lib/env.server";
import { jsonResponse } from "@/lib/http";
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
export const POST: APIRoute = async ({ request }) => {
  const rawBody = await request.text();
  const env = getServerEnv();

  const contentHmac =
    request.headers.get("content-hmac") ??
    request.headers.get("Content-HMAC");

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
      request.headers.get("x-signature") ??
      request.headers.get("x-webhook-signature") ??
      request.headers.get("x-routerai-signature");
    signatureOk = verifyPaymentSignature(rawBody, sig);
    provider = "generic";
  }

  if (!signatureOk) {
    return jsonResponse(
      { error: "Invalid signature", code: 13 },
      { status: 401 },
    );
  }

  let json: Record<string, unknown>;
  try {
    json = parseCloudPaymentsBody(rawBody);
  } catch {
    return jsonResponse({ error: "Invalid body", code: 13 }, { status: 400 });
  }

  const parsed = getPlanFromPayment(json);
  if (!parsed.userId || !parsed.externalPaymentId) {
    return jsonResponse(
      { error: "Missing AccountId / user_id or TransactionId / id", code: 12 },
      { status: 400 },
    );
  }

  if (!isSuccessfulPaymentStatus(parsed.paymentStatus, provider)) {
    const body = { ok: true, ignored: true, reason: "not success" };
    return provider === "cloudpayments"
      ? jsonResponse({ code: 0, ...body })
      : jsonResponse(body);
  }

  if (!parsed.planId?.trim()) {
    return jsonResponse(
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
    return jsonResponse({ error: "Unknown plan", code: 12 }, { status: 400 });
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
    return jsonResponse(
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
    ? jsonResponse(payload)
    : jsonResponse({
        ok: payload.ok,
        tokensAdded: payload.tokensAdded,
        duplicate: payload.duplicate,
      });
};
