import { cn } from "@/lib/utils";

export type EditorVersionRow = {
  id: string;
  version: number;
  createdAt: string;
};

type EditorSiteMetaProps = {
  siteId: string;
  versionCount: number | null;
  versionsOpen: boolean;
  versionsList: EditorVersionRow[] | null;
  onRequestVersions: () => void;
  className?: string;
};

/**
 * Блок «ID сайта», счётчик версий и раскрываемый список версий — общий для превью схемы и codegen.
 */
export function EditorSiteMeta({
  siteId,
  versionCount,
  versionsOpen,
  versionsList,
  onRequestVersions,
  className,
}: EditorSiteMetaProps) {
  return (
    <div className={cn("mt-3 space-y-2 text-center text-xs text-zinc-600", className)}>
      <p>
        ID сайта: <code className="text-zinc-400">{siteId}</code>
        {versionCount != null ? (
          <>
            {" "}
            · версий в истории: <span className="text-zinc-400">{versionCount}</span>
          </>
        ) : null}
      </p>
      <div>
        <button
          type="button"
          onClick={onRequestVersions}
          className="text-violet-400 underline hover:text-violet-300"
        >
          {versionsOpen ? "Обновить список версий" : "Показать версии"}
        </button>
      </div>
      {versionsOpen && versionsList ? (
        <ul className="mx-auto max-w-md text-left text-zinc-500">
          {versionsList.map((v) => (
            <li key={v.id} className="border-b border-white/5 py-1.5">
              v{v.version} · {new Date(v.createdAt).toLocaleString("ru-RU")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
