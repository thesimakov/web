import { createHmac, timingSafeEqual } from "crypto";

/**
 * CloudPayments: проверка подписи уведомления.
 * @see https://developers.cloudpayments.ru/#notifications
 * Заголовок `Content-HMAC`: base64( HMAC_SHA256( raw_body, API Secret ) )
 */
export function verifyCloudPaymentsContentHmac(
  rawBody: string,
  contentHmacHeader: string | null,
  apiSecret: string,
): boolean {
  if (!apiSecret?.trim() || !contentHmacHeader?.trim()) {
    return false;
  }
  const expected = createHmac("sha256", apiSecret.trim())
    .update(rawBody, "utf8")
    .digest("base64");
  const got = contentHmacHeader.trim();
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(got, "utf8");
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Тело уведомления: JSON или `application/x-www-form-urlencoded`. */
export function parseCloudPaymentsBody(raw: string): Record<string, unknown> {
  const t = raw.trim();
  if (t.startsWith("{")) {
    return JSON.parse(t) as Record<string, unknown>;
  }
  const params = new URLSearchParams(raw);
  const o: Record<string, unknown> = {};
  for (const [k, v] of params) {
    o[k] = v;
  }
  return o;
}
