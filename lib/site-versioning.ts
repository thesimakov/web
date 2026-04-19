import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type SaveSiteGenerationInput = {
  userId: string;
  prompt: string;
  schemaJson: Prisma.InputJsonValue;
  /** Если задан — обновить сайт и добавить версию (проверка userId). */
  existingSiteId?: string;
};

/**
 * Создаёт новый сайт с версией 1 или обновляет существующий и добавляет SiteVersion (max+1).
 */
export async function saveSiteGenerationResult(
  input: SaveSiteGenerationInput,
): Promise<{ siteId: string }> {
  const { userId, prompt, schemaJson, existingSiteId } = input;

  return prisma.$transaction(async (tx) => {
    if (existingSiteId) {
      const site = await tx.site.findFirst({
        where: { id: existingSiteId, userId },
      });
      if (!site) {
        const err = new Error("SITE_NOT_FOUND_OR_FORBIDDEN");
        err.name = "SiteAccessError";
        throw err;
      }

      const maxV = await tx.siteVersion.aggregate({
        where: { siteId: existingSiteId },
        _max: { version: true },
      });
      const nextVersion = (maxV._max.version ?? 0) + 1;

      await tx.site.update({
        where: { id: existingSiteId },
        data: { prompt, schemaJson },
      });

      await tx.siteVersion.create({
        data: {
          siteId: existingSiteId,
          version: nextVersion,
          prompt,
          schemaJson,
        },
      });

      return { siteId: existingSiteId };
    }

    const s = await tx.site.create({
      data: {
        userId,
        prompt,
        schemaJson,
      },
    });

    await tx.siteVersion.create({
      data: {
        siteId: s.id,
        version: 1,
        prompt,
        schemaJson,
      },
    });

    return { siteId: s.id };
  });
}
