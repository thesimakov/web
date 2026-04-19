import type { APIRoute } from "astro";

import { getDemoUserId } from "@/lib/env.server";
import { jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

/** Список версий схемы сайта (метаданные; полная схема — GET …/versions/[version]). */
export const GET: APIRoute = async ({ request, params }) => {
  const id = params.id;
  if (!id) {
    return jsonResponse({ error: "Некорректный id" }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") ?? getDemoUserId();

  const site = await prisma.site.findFirst({
    where: { id, userId },
  });

  if (!site) {
    return jsonResponse(
      { error: "Сайт не найден или нет доступа" },
      { status: 404 },
    );
  }

  const versions = await prisma.siteVersion.findMany({
    where: { siteId: site.id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      prompt: true,
      createdAt: true,
    },
  });

  return jsonResponse({
    siteId: site.id,
    userId: site.userId,
    versions,
  });
};
