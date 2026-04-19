import { NextResponse } from "next/server";

import { getDemoUserId } from "@/lib/env.server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/** Список версий схемы сайта (метаданные; полная схема — GET …/versions/[version]). */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? getDemoUserId();

  const site = await prisma.site.findFirst({
    where: { id: params.id, userId },
  });

  if (!site) {
    return NextResponse.json(
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

  return NextResponse.json({
    siteId: site.id,
    userId: site.userId,
    versions,
  });
}
