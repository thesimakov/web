import type { APIRoute } from "astro";

import { getDemoUserId } from "@/lib/env.server";
import { jsonResponse } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const GET: APIRoute = async ({ request }) => {
  const { searchParams } = new URL(request.url);
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

  return jsonResponse({ userId, sites });
};
