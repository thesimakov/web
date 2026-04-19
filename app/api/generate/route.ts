import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  planForLlmRouting,
  resolveBillingGate,
} from "@/app/api/generate/billing-gate";
import { runWithBillingPlan } from "@/lib/billing/planAsyncContext";
import { runCodegenPipeline } from "@/ai/pipeline/run-codegen-pipeline";
import { runGenerationPipeline } from "@/ai/pipeline/run-generation-pipeline";
import { prisma } from "@/lib/prisma";
import { saveSiteGenerationResult } from "@/lib/site-versioning";
import { deductTokensForGeneration } from "@/services/billing/tokenLedger";

export const runtime = "nodejs";
export const maxDuration = 120;

async function persistGenerationSave(params: {
  userId: string;
  prompt: string;
  /** Сохраняемый JSON: SiteSchema или { mode: 'codegen', files }. */
  schema: unknown;
  existingSiteId?: string;
}): Promise<{ siteId: string } | { forbidden: true }> {
  const json = JSON.parse(
    JSON.stringify(params.schema),
  ) as Prisma.InputJsonValue;
  try {
    return await saveSiteGenerationResult({
      userId: params.userId,
      prompt: params.prompt,
      schemaJson: json,
      existingSiteId: params.existingSiteId,
    });
  } catch (e) {
    if (e instanceof Error && e.name === "SiteAccessError") {
      return { forbidden: true };
    }
    throw e;
  }
}

function recordGenerationUsage(params: {
  userId: string | undefined;
  siteId: string | undefined;
  prompt: string;
  fallback: boolean;
  mode: "schema" | "codegen";
}) {
  const { userId, siteId, prompt, fallback, mode } = params;
  if (!userId) {
    return;
  }
  void prisma.generation
    .create({
      data: {
        userId,
        siteId: siteId ?? null,
        promptSnapshot: prompt,
        usedFallback: fallback,
        status: "completed",
      },
    })
    .catch(() => {
      /* ignore */
    });
  void prisma.usageLog
    .create({
      data: {
        userId,
        kind: "generate",
        units: 1,
        meta: { fallback, mode },
      },
    })
    .catch(() => {
      /* ignore */
    });
}

const bodySchema = z.object({
  prompt: z.string().min(1).max(12_000),
  /** schema — JSON-схема + рендер; codegen — несколько файлов TSX. */
  mode: z.enum(["schema", "codegen"]).optional().default("schema"),
  stream: z.boolean().optional(),
  userId: z.string().min(1).optional(),
  save: z.boolean().optional(),
  /** При save: обновить этот сайт и добавить версию (нужен userId). */
  siteId: z.string().min(1).optional(),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Некорректное тело запроса (ожидается JSON)" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Некорректные поля запроса", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const {
    prompt,
    stream,
    userId,
    save,
    siteId: existingSiteId,
    mode: outputMode,
  } = parsed.data;

  if (save && !userId) {
    return NextResponse.json(
      { error: "При save: true нужно передать userId" },
      { status: 400 },
    );
  }

  const billingGate = await resolveBillingGate(userId, outputMode);
  if ("error" in billingGate) {
    return billingGate.error;
  }
  const routePlan = planForLlmRouting(billingGate);

  if (stream) {
    const encoder = new TextEncoder();
    const out = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: unknown) => {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        };

        let pipelineSucceeded = false;

        try {
          await runWithBillingPlan(routePlan, async () => {
            if (outputMode === "codegen") {
              const result = await runCodegenPipeline(prompt, (p) => {
                send("progress", {
                  step: p.step,
                  status: p.status,
                  detail: p.detail,
                });
                if (p.status === "completed" && p.detail) {
                  send("partial", { stage: "codegen", detail: p.detail });
                }
              });

              pipelineSucceeded = true;

              let siteId: string | undefined;
              if (save && userId) {
                const pr = await persistGenerationSave({
                  userId,
                  prompt,
                  schema: {
                    mode: "codegen",
                    files: result.codegen.files,
                  },
                  existingSiteId,
                });
                if ("forbidden" in pr) {
                  send("error", {
                    message: "Сайт не найден или нет доступа",
                    code: "SITE_FORBIDDEN",
                  });
                  return;
                }
                siteId = pr.siteId;
              }

              send("result", {
                mode: "codegen",
                codegen: result.codegen,
                siteId,
                fallback: result.fallback === true,
              });

              recordGenerationUsage({
                userId,
                siteId,
                prompt,
                fallback: result.fallback === true,
                mode: "codegen",
              });
            } else {
              const result = await runGenerationPipeline(prompt, (p) => {
                send("progress", p);
                if (p.status === "completed" && p.step === "prompt-interpreter" && p.detail) {
                  send("partial", { stage: "interpreter", detail: p.detail });
                }
                if (p.status === "completed" && p.step === "product-planner" && p.detail) {
                  send("partial", { stage: "planner", detail: p.detail });
                }
                if (p.status === "completed" && p.step === "theme-designer" && p.detail) {
                  send("partial", { stage: "theme", detail: p.detail });
                }
                if (p.status === "completed" && p.step === "section-copywriter" && p.detail) {
                  send("partial", { stage: "copy", detail: p.detail });
                }
                if (p.status === "completed" && p.step === "schema-validator" && p.detail) {
                  send("partial", { stage: "validated_schema", schema: p.detail });
                }
              });

              pipelineSucceeded = true;

              let siteId: string | undefined;
              if (save && userId) {
                const pr = await persistGenerationSave({
                  userId,
                  prompt,
                  schema: result.schema,
                  existingSiteId,
                });
                if ("forbidden" in pr) {
                  send("error", {
                    message: "Сайт не найден или нет доступа",
                    code: "SITE_FORBIDDEN",
                  });
                  return;
                }
                siteId = pr.siteId;
              }

              send("result", {
                mode: "schema",
                schema: result.schema,
                siteId,
                fallback: result.fallback === true,
              });

              recordGenerationUsage({
                userId,
                siteId,
                prompt,
                fallback: result.fallback === true,
                mode: "schema",
              });
            }
          });

          if (userId && pipelineSucceeded) {
            await deductTokensForGeneration({ userId, mode: outputMode });
          }
        } catch (e) {
          send("error", {
            message:
              e instanceof Error ? e.message : "Ошибка генерации",
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(out, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  }

  try {
    return await runWithBillingPlan(routePlan, async () => {
      if (outputMode === "codegen") {
        const result = await runCodegenPipeline(prompt);

        let siteId: string | undefined;
        if (save && userId) {
          const pr = await persistGenerationSave({
            userId,
            prompt,
            schema: {
              mode: "codegen",
              files: result.codegen.files,
            },
            existingSiteId,
          });
          if ("forbidden" in pr) {
            return NextResponse.json(
              { error: "Сайт не найден или нет доступа" },
              { status: 403 },
            );
          }
          siteId = pr.siteId;
        }

        recordGenerationUsage({
          userId,
          siteId,
          prompt,
          fallback: result.fallback === true,
          mode: "codegen",
        });

        if (userId) {
          await deductTokensForGeneration({ userId, mode: outputMode });
        }

        return NextResponse.json({
          mode: "codegen",
          codegen: result.codegen,
          siteId,
          fallback: result.fallback === true,
        });
      }

      const result = await runGenerationPipeline(prompt);

      let siteId: string | undefined;
      if (save && userId) {
        const pr = await persistGenerationSave({
          userId,
          prompt,
          schema: result.schema,
          existingSiteId,
        });
        if ("forbidden" in pr) {
          return NextResponse.json(
            { error: "Сайт не найден или нет доступа" },
            { status: 403 },
          );
        }
        siteId = pr.siteId;
      }

      recordGenerationUsage({
        userId,
        siteId,
        prompt,
        fallback: result.fallback === true,
        mode: "schema",
      });

      if (userId) {
        await deductTokensForGeneration({ userId, mode: outputMode });
      }

      return NextResponse.json({
        mode: "schema",
        schema: result.schema,
        siteId,
        fallback: result.fallback === true,
      });
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Ошибка генерации",
      },
      { status: 500 },
    );
  }
}
