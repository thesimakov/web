import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CTAProps } from "@/schema/site-schema";

export function CTASection({
  variant,
  headline,
  subheadline,
  cta,
}: CTAProps & { variant: string }) {
  const banner = variant === "banner" || variant === "default";

  return (
    <section
      className={cn(
        "px-4 py-16 sm:py-20",
        banner && "bg-gradient-to-r from-muted/60 to-muted/20",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-4xl rounded-3xl border border-border/80 bg-card p-10 text-center shadow-sm sm:p-12",
          banner && "border-[color:var(--site-primary)]/30",
        )}
      >
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{headline}</h2>
        {subheadline ? (
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">{subheadline}</p>
        ) : null}
        {cta ? (
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              className="bg-[color:var(--site-primary)] text-white hover:opacity-90"
            >
              {cta}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
