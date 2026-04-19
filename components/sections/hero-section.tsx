import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { HeroProps } from "@/schema/site-schema";

export function HeroSection({
  variant,
  headline,
  subheadline,
  cta,
  secondaryCta,
}: HeroProps & { variant: string }) {
  const centered = variant === "centered" || variant === "default";

  return (
    <section
      className={cn(
        "border-b border-border/60 bg-gradient-to-b from-muted/40 to-background px-4 py-20 sm:py-28",
        centered && "text-center",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-3xl",
          !centered && "grid gap-10 lg:grid-cols-2 lg:items-center lg:text-left",
        )}
      >
        <div className="space-y-6">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {headline}
          </h1>
          {subheadline ? (
            <p className="text-lg text-muted-foreground text-pretty">{subheadline}</p>
          ) : null}
          <div
            className={cn(
              "flex flex-wrap gap-3",
              centered && "justify-center",
              !centered && "lg:justify-start",
            )}
          >
            {cta ? (
              <Button size="lg" className="bg-[color:var(--site-primary)] text-white hover:opacity-90">
                {cta}
              </Button>
            ) : null}
            {secondaryCta ? (
              <Button size="lg" variant="outline">
                {secondaryCta}
              </Button>
            ) : null}
          </div>
        </div>
        {!centered ? (
          <div className="rounded-2xl border border-border/80 bg-card p-8 shadow-sm">
            <div className="aspect-video rounded-lg bg-muted/50" aria-hidden />
          </div>
        ) : null}
      </div>
    </section>
  );
}
