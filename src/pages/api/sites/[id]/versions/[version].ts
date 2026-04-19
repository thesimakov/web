import type { APIRoute } from "astro";

import { getDemoUserId } from "@/lib/env.server";
import { jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

/** Одна версия по номеру (целое ≥ 1). */
export const GET: APIRoute = async ({ request, params }) => {
  const id = params.id;
  const versionParam = params.version;
  if (!id || !versionParam) {
    return jsonResponse({ error: "Некорректные параметры" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? getDemoUserId();

  const versionNum = Number.parseInt(versionParam, 10);
  if (!Number.isFinite(versionNum) || versionNum < 1) {
    return jsonResponse({ error: "Некорректный номер версии" }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id, userId },
  });

  if (!site) {
    return jsonResponse(
      { error: "Сайт не найден или нет доступа" },
      { status: 404 },
    );
  }

  const row = await prisma.siteVersion.findUnique({
    where: {
      siteId_version: {
        siteId: site.id,
        version: versionNum,
      },
    },
  });

  if (!row) {
    return jsonResponse({ error: "Версия не найдена" }, { status: 404 });
  }

  return jsonResponse({
    siteId: site.id,
    version: row.version,
    prompt: row.prompt,
    schema: row.schemaJson,
    createdAt: row.createdAt,
  });
};
