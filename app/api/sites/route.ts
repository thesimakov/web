import { NextResponse } from "next/server";

import { getDemoUserId } from "@/lib/env.server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId") ?? getDemoUserId();

  const sites = await prisma.site.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      prompt: true,
      createdAt: true,
      publishedUrl: true,
    },
  });

  return NextResponse.json({ userId, sites });
}
