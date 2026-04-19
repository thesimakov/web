import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { safeParseCodegenPayload } from "@/ai/validation/codegen-output.zod";
import { safeParseSiteSchema } from "@/ai/validation/site-schema.zod";
import { prisma } from "@/lib/prisma";
import { isCodegenSitePayload } from "@/lib/site-output";
import { saveSiteGenerationResult } from "@/lib/site-versioning";

export const runtime = "nodejs";

const patchBodySchema = z.object({
  userId: z.string().min(1),
  prompt: z.string().min(1).max(12_000).optional(),
  schema: z.unknown(),
});

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      _count: { select: { versions: true } },
    },
  });

  if (!site) {
    return NextResponse.json({ error: "Сайт не найден" }, { status: 404 });
  }

  return NextResponse.json({
    id: site.id,
    userId: site.userId,
    prompt: site.prompt,
    schema: site.schemaJson,
    createdAt: site.createdAt,
    publishedUrl: site.publishedUrl,
    versionCount: site._count.versions,
  });
}

/**
 * Ручное сохранение схемы: обновляет сайт и добавляет новую версию (проверка userId).
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректное тело запроса (ожидается JSON)" },
      { status: 400 },
    );
  }

  const parsed = patchBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные поля", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { userId, prompt, schema } = parsed.data;
  const site = await prisma.site.findFirst({
    where: { id: params.id, userId },
  });

  if (!site) {
    return NextResponse.json(
      { error: "Сайт не найден или нет доступа" },
      { status: 403 },
    );
  }

  let schemaJson: Prisma.InputJsonValue;

  if (isCodegenSitePayload(schema)) {
    const codegenValid = safeParseCodegenPayload({
      files: schema.files,
    });
    if (!codegenValid.success) {
      return NextResponse.json(
        {
          error: "Codegen-пейлоад не прошёл проверку",
          issues: codegenValid.error.flatten(),
        },
        { status: 400 },
      );
    }
    schemaJson = JSON.parse(
      JSON.stringify({
        mode: "codegen" as const,
        files: codegenValid.data.files,
      }),
    ) as Prisma.InputJsonValue;
  } else {
    const valid = safeParseSiteSchema(schema);
    if (!valid.success) {
      return NextResponse.json(
        {
          error: "Схема не прошла проверку",
          issues: valid.error.flatten(),
        },
        { status: 400 },
      );
    }
    schemaJson = JSON.parse(
      JSON.stringify(valid.data),
    ) as Prisma.InputJsonValue;
  }

  try {
    await saveSiteGenerationResult({
      userId,
      prompt: prompt ?? site.prompt,
      schemaJson,
      existingSiteId: site.id,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "SiteAccessError") {
      return NextResponse.json(
        { error: "Сайт не найден или нет доступа" },
        { status: 403 },
      );
    }
    throw e;
  }

  const updated = await prisma.site.findUnique({
    where: { id: site.id },
    include: { _count: { select: { versions: true } } },
  });

  return NextResponse.json({
    id: updated!.id,
    prompt: updated!.prompt,
    schema: updated!.schemaJson,
    versionCount: updated!._count.versions,
  });
}
