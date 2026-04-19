import { NextResponse } from "next/server";

import { getDemoUserId } from "@/lib/env.server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Одна версия по номеру (целое ≥ 1). */
export async function GET(
  req: Request,
  { params }: { params: { id: string; version: string } },
) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? getDemoUserId();

  const versionNum = Number.parseInt(params.version, 10);
  if (!Number.isFinite(versionNum) || versionNum < 1) {
    return NextResponse.json({ error: "Некорректный номер версии" }, { status: 400 });
  }

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId },
  });

  if (!site) {
    return NextResponse.json(
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
    return NextResponse.json({ error: "Версия не найдена" }, { status: 404 });
  }

  return NextResponse.json({
    siteId: site.id,
    version: row.version,
    prompt: row.prompt,
    schema: row.schemaJson,
    createdAt: row.createdAt,
  });
}
