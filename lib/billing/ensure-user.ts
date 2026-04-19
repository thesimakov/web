import { getServerEnv } from "@/lib/env.server";
import { prisma } from "@/lib/prisma";

/** Создаёт запись пользователя для биллинга (id = внешний user id из клиента). */
export async function ensureBillingUser(userId: string): Promise<void> {
  const grant = getServerEnv().INITIAL_SIGNUP_TOKEN_GRANT;
  await prisma.user.upsert({
    where: { id: userId },
    create: {
      id: userId,
      tokenBalance: grant,
      planType: "FREE_TRIAL",
    },
    update: {},
  });
}
