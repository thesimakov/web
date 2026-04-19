import { GenerationEditor } from "@/components/editor/generation-editor";
import { SiteHeader } from "@/components/marketing/site-header";

export const metadata = {
  title: "Редактор — Lemnity",
};

function parseOutputMode(
  raw: string | string[] | undefined,
): "schema" | "codegen" | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "schema" || v === "codegen") {
    return v;
  }
  return undefined;
}

export default function EditorPage({
  searchParams,
}: {
  searchParams: { site?: string; mode?: string | string[] };
}) {
  const initialSiteId = searchParams.site;
  const initialOutputMode = parseOutputMode(searchParams.mode);

  return (
    <>
      <SiteHeader />
      <GenerationEditor
        initialSiteId={initialSiteId}
        initialOutputMode={initialOutputMode}
      />
    </>
  );
}
