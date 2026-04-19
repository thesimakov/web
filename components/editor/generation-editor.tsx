"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorSiteMeta } from "@/components/editor/editor-site-meta";
import { buttonVariants } from "@/components/ui/button";
import { CLIENT_DEMO_USER_ID } from "@/lib/demo-user-public";
import { cn } from "@/lib/utils";
import { isCodegenSitePayload } from "@/lib/site-output";
import { PageRenderer } from "@/renderer/PageRenderer";
import type { CodegenPayload } from "@/schema/codegen-schema";
import type { SiteSchema } from "@/schema/site-schema";

function parseSseBlock(block: string): {
  event: string;
  json: unknown;
} | null {
  let event = "message";
  const lines = block.split("\n").filter(Boolean);
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5).trim());
    }
  }
  const data = dataLines.join("\n");
  if (!data) {
    return null;
  }
  try {
    return { event, json: JSON.parse(data) as unknown };
  } catch {
    return null;
  }
}

function buildEditorSearch(params: { site?: string | null; mode: "schema" | "codegen" }) {
  const sp = new URLSearchParams();
  if (params.site) {
    sp.set("site", params.site);
  }
  sp.set("mode", params.mode);
  return sp.toString();
}

export function GenerationEditor({
  initialSiteId,
  initialOutputMode,
}: {
  initialSiteId?: string;
  initialOutputMode?: "schema" | "codegen";
}) {
  const replaceEditorUrl = useCallback(
    (opts: { site?: string | null; mode: "schema" | "codegen" }) => {
      if (typeof window === "undefined") {
        return;
      }
      const site = opts.site ?? undefined;
      const q = buildEditorSearch({ site: site ?? undefined, mode: opts.mode });
      const pathname = window.location.pathname;
      window.history.replaceState(null, "", `${pathname}?${q}`);
    },
    [],
  );
  const [prompt, setPrompt] = useState(
    "Лендинг для AI-маркетинга для стартапов, тон современный, акцент на лид-форму",
  );
  const [save, setSave] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingSite, setLoadingSite] = useState(!!initialSiteId);
  const [error, setError] = useState<string | null>(null);
  const [outputMode, setOutputMode] = useState<"schema" | "codegen">(
    () => initialOutputMode ?? "schema",
  );
  const [schema, setSchema] = useState<SiteSchema | null>(null);
  const [codegen, setCodegen] = useState<CodegenPayload | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  const [versionCount, setVersionCount] = useState<number | null>(null);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [versionsList, setVersionsList] = useState<
    { version: number; createdAt: string; id: string }[] | null
  >(null);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState(false);

  const loadSite = useCallback(async (id: string) => {
    setLoadingSite(true);
    setError(null);
    try {
      const res = await fetch(`/api/sites/${id}`);
      const data = (await res.json()) as {
        prompt?: string;
        schema?: unknown;
        error?: string;
        versionCount?: number;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Не удалось загрузить сайт");
      }
      if (data.prompt) {
        setPrompt(data.prompt);
      }
      if (data.schema && isCodegenSitePayload(data.schema)) {
        setCodegen({ files: data.schema.files });
        setSchema(null);
        setOutputMode("codegen");
        setSelectedFilePath(data.schema.files[0]?.path ?? null);
      } else if (data.schema) {
        setSchema(data.schema as SiteSchema);
        setCodegen(null);
        setOutputMode("schema");
        setSelectedFilePath(null);
      }
      if (typeof data.versionCount === "number") {
        setVersionCount(data.versionCount);
      }
      setSiteId(id);
      const loadedMode =
        data.schema && isCodegenSitePayload(data.schema) ? "codegen" : "schema";
      replaceEditorUrl({ site: id, mode: loadedMode });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoadingSite(false);
    }
  }, [replaceEditorUrl]);

  useEffect(() => {
    if (initialSiteId) {
      void loadSite(initialSiteId);
    }
  }, [initialSiteId, loadSite]);

  async function loadVersionsList(id: string) {
    setVersionsOpen(true);
    try {
      const res = await fetch(
        `/api/sites/${id}/versions?userId=${encodeURIComponent(CLIENT_DEMO_USER_ID)}`,
      );
      const data = (await res.json()) as {
        versions?: { id: string; version: number; createdAt: string }[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Не удалось загрузить версии");
      }
      setVersionsList(data.versions ?? []);
    } catch {
      setVersionsList([]);
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setStreamStatus(null);
    setFallbackNotice(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode: outputMode,
          save,
          userId: CLIENT_DEMO_USER_ID,
          stream: true,
          ...(save && siteId ? { siteId } : {}),
        }),
      });
      if (!res.ok) {
        const errBody = (await res.json()) as { error?: string };
        throw new Error(errBody.error ?? "Ошибка генерации");
      }
      if (!res.body) {
        throw new Error("Пустой ответ сервера");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalSchema: SiteSchema | null = null;
      let finalCodegen: CodegenPayload | null = null;
      let finalSiteId: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const block of parts) {
          const parsed = parseSseBlock(block);
          if (!parsed) {
            continue;
          }
          if (parsed.event === "progress") {
            const p = parsed.json as {
              step?: string;
              status?: string;
            };
            setStreamStatus(
              `${p.step ?? "?"} — ${p.status === "started" ? "старт" : p.status === "completed" ? "готово" : "ошибка"}`,
            );
          }
          if (parsed.event === "partial") {
            const body = parsed.json as {
              stage?: string;
              schema?: SiteSchema;
            };
            if (body.stage === "validated_schema" && body.schema) {
              finalSchema = body.schema;
              setSchema(body.schema);
            }
          }
          if (parsed.event === "result") {
            const body = parsed.json as {
              mode?: string;
              schema?: SiteSchema;
              codegen?: CodegenPayload;
              siteId?: string;
              fallback?: boolean;
            };
            if (body.mode === "codegen" && body.codegen?.files) {
              finalCodegen = body.codegen;
              setCodegen(body.codegen);
              setSchema(null);
              setSelectedFilePath(body.codegen.files[0]?.path ?? null);
            } else if (body.schema) {
              finalSchema = body.schema;
              setSchema(body.schema);
              setCodegen(null);
              setSelectedFilePath(null);
            }
            if (body.siteId) {
              finalSiteId = body.siteId;
            }
            if (body.fallback === true) {
              setFallbackNotice(true);
            }
          }
          if (parsed.event === "error") {
            const body = parsed.json as { message?: string };
            throw new Error(body.message ?? "Ошибка генерации");
          }
        }
      }

      if (finalSchema) {
        setSchema(finalSchema);
      }
      if (finalCodegen) {
        setCodegen(finalCodegen);
      }
      setSiteId((prev) => finalSiteId ?? prev);
      const effectiveMode = finalCodegen ? "codegen" : "schema";
      replaceEditorUrl({
        site: finalSiteId ?? siteId ?? null,
        mode: effectiveMode,
      });
      if (finalSiteId && save) {
        try {
          const meta = await fetch(`/api/sites/${finalSiteId}`);
          const m = (await meta.json()) as { versionCount?: number };
          if (typeof m.versionCount === "number") {
            setVersionCount(m.versionCount);
          }
        } catch {
          /* ignore */
        }
      }
      setStreamStatus(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка запроса");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Редактор</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Промпт → <code className="text-zinc-400">/api/generate</code> → превью
            схемы или список сгенерированных файлов (режим Codegen). Пользователь для
            сохранения:{" "}
            <code className="text-zinc-400">{CLIENT_DEMO_USER_ID}</code>
          </p>
        </div>
        <a
          href="/dashboard"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "border-white/20 bg-transparent text-zinc-300 hover:bg-white/10",
          )}
        >
          Мои сайты
        </a>
      </div>

      <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-4 ring-1 ring-white/5 sm:p-6">
        <label htmlFor="editor-prompt" className="text-sm font-medium text-zinc-400">
          Описание сайта
        </label>
        <textarea
          id="editor-prompt"
          rows={5}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || loadingSite}
          className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40"
          placeholder="Опишите нишу, аудиторию и цель страницы…"
        />

        <div className="mt-4 flex flex-wrap items-center gap-6">
          <div className="flex flex-wrap gap-3 text-sm text-zinc-400">
            <span className="text-zinc-500">Режим:</span>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="out-mode"
                checked={outputMode === "schema"}
                onChange={() => {
                  setOutputMode("schema");
                  replaceEditorUrl({
                    site: siteId ?? initialSiteId ?? null,
                    mode: "schema",
                  });
                }}
                disabled={loading || loadingSite}
                className="border-white/20 bg-zinc-900"
              />
              Схема → превью
            </label>
            <label className="flex cursor-pointer items-center gap-1.5">
              <input
                type="radio"
                name="out-mode"
                checked={outputMode === "codegen"}
                onChange={() => {
                  setOutputMode("codegen");
                  replaceEditorUrl({
                    site: siteId ?? initialSiteId ?? null,
                    mode: "codegen",
                  });
                }}
                disabled={loading || loadingSite}
                className="border-white/20 bg-zinc-900"
              />
              Codegen (файлы)
            </label>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-400">
            <input
              type="checkbox"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
              className="rounded border-white/20 bg-zinc-900"
            />
            Сохранить в «Мои сайты»
          </label>
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || loadingSite || !prompt.trim()}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-50",
            )}
          >
            {loading ? "Генерация…" : "Сгенерировать"}
          </button>
        </div>

        {streamStatus ? (
          <p className="mt-4 text-xs text-zinc-500">{streamStatus}</p>
        ) : null}

        {fallbackNotice ? (
          <p className="mt-4 rounded-lg border border-zinc-500/40 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-300">
            Использован резервный режим (облако недоступно или сработал fallback). Можно
            повторить генерацию позже.
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
            {error}
          </p>
        ) : null}
      </div>

      {loadingSite ? (
        <p className="mt-8 text-center text-sm text-zinc-500">Загрузка сайта…</p>
      ) : null}

      {codegen && !loadingSite ? (
        <div className="mt-10">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
            Сгенерированные файлы
          </p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_1fr]">
            <ul className="space-y-1 rounded-xl border border-white/10 bg-zinc-950/80 p-2 text-xs text-zinc-300">
              {codegen.files.map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setSelectedFilePath(f.path)}
                    className={cn(
                      "w-full rounded-lg px-2 py-1.5 text-left font-mono hover:bg-white/10",
                      selectedFilePath === f.path ? "bg-violet-500/20 text-white" : "",
                    )}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
            </ul>
            <pre className="max-h-[480px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-4 text-left text-xs text-zinc-200">
              {codegen.files.find((f) => f.path === selectedFilePath)?.content ??
                codegen.files[0]?.content ??
                ""}
            </pre>
          </div>
          {siteId ? (
            <EditorSiteMeta
              siteId={siteId}
              versionCount={versionCount}
              versionsOpen={versionsOpen}
              versionsList={versionsList}
              onRequestVersions={() => void loadVersionsList(siteId)}
            />
          ) : null}
        </div>
      ) : null}

      {schema && !loadingSite && !codegen ? (
        <div className="mt-10">
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-wider text-zinc-500">
            Превью
          </p>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/40 shadow-2xl ring-1 ring-white/5">
            <div className="dark">
              <PageRenderer schema={schema} />
            </div>
          </div>
          {siteId ? (
            <EditorSiteMeta
              siteId={siteId}
              versionCount={versionCount}
              versionsOpen={versionsOpen}
              versionsList={versionsList}
              onRequestVersions={() => void loadVersionsList(siteId)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

