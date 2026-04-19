import { HeroPrompt } from "@/components/marketing/hero-prompt";
import { HomeFeatures } from "@/components/marketing/home-features";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { demoSiteSchema } from "@/lib/demo-site-schema";
import { PageRenderer } from "@/renderer/PageRenderer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroPrompt />
        <HomeFeatures />
        <section
          id="preview"
          className="scroll-mt-20 border-t border-white/[0.06] bg-zinc-950 py-16 sm:py-20"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
              Живой пример
            </p>
            <h2 className="mx-auto max-w-2xl text-balance text-center text-2xl font-medium tracking-tight text-white sm:text-3xl">
              Страница целиком из схемы
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-relaxed text-zinc-400 sm:text-base">
              Тот же принцип, что и у{" "}
              <a
                href="https://v0.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-200 underline decoration-white/15 underline-offset-4 hover:decoration-white/35"
              >
                v0
              </a>
              : секции, тема и копирайт приходят из данных — рендер через типизированные
              компоненты, без HTML из модели.
            </p>
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/30 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_32px_64px_-28px_rgba(0,0,0,0.65)] ring-1 ring-white/[0.04]">
              <div className="dark">
                <PageRenderer schema={demoSiteSchema} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
