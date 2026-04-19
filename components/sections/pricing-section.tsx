import { Check, Clock, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PricingPlan, PricingProps } from "@/schema/site-schema";

function planUsesCheckmarks(plan: PricingPlan) {
  if (plan.featuresStyle === "bullet") {
    return false;
  }
  if (plan.featuresStyle === "check") {
    return true;
  }
  return !!(plan.badge ?? plan.tokenUsage ?? plan.isCurrentPlan);
}

export function PricingSection({
  variant,
  title,
  plans,
}: PricingProps & { variant: string }) {
  const cols =
    plans.length > 2
      ? "lg:grid-cols-3"
      : variant === "cards" || variant === "default"
        ? "lg:grid-cols-2"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="pricing"
      className="scroll-mt-24 border-b border-border/60 px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl">
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <ul className={cn("grid gap-6", cols)}>
          {plans.map((plan, i) => {
            const checkmarks = planUsesCheckmarks(plan);
            const emerald = plan.accent === "emerald";
            const pct =
              plan.tokenUsage && plan.tokenUsage.total > 0
                ? Math.min(
                    100,
                    (plan.tokenUsage.used / plan.tokenUsage.total) * 100,
                  )
                : 0;

            return (
              <li
                key={`${plan.name}-${i}`}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm",
                  emerald
                    ? "border-emerald-500/50 ring-1 ring-emerald-500/15"
                    : "border-border/80",
                  plan.highlighted &&
                    !emerald &&
                    "border-[color:var(--site-primary)] ring-2 ring-[color:var(--site-primary)]/20",
                )}
              >
                {plan.badge ? (
                  <span
                    className={cn(
                      "absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white",
                      emerald ? "bg-emerald-600" : "bg-[color:var(--site-primary)]",
                    )}
                  >
                    {plan.badge}
                  </span>
                ) : null}

                <div className={cn("mb-6", plan.badge ? "pr-24" : "")}>
                  <h3 className="flex items-center gap-2 text-xl font-semibold">
                    {plan.showIcon === "zap" ? (
                      <Zap
                        className={cn(
                          "h-5 w-5 shrink-0",
                          emerald ? "text-emerald-400" : "text-muted-foreground",
                        )}
                        aria-hidden
                      />
                    ) : null}
                    {plan.name}
                  </h3>
                  {plan.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
                  ) : null}
                  <p className="mt-4 text-3xl font-semibold tracking-tight">{plan.price}</p>
                </div>

                {plan.tokenUsage ? (
                  <div
                    className={cn(
                      "mb-6 rounded-xl border p-3.5",
                      emerald
                        ? "border-emerald-500/35 bg-emerald-950/20"
                        : "border-border/80 bg-muted/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span
                        className={cn(
                          "flex items-center gap-1.5 text-muted-foreground",
                          emerald && "text-emerald-100/80",
                        )}
                      >
                        <Clock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                        {plan.tokenUsage.label}
                      </span>
                      <span className="tabular-nums text-foreground">
                        {plan.tokenUsage.used} / {plan.tokenUsage.total}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "mt-2.5 h-2 overflow-hidden rounded-full",
                        emerald ? "bg-emerald-950/80" : "bg-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "h-full rounded-full transition-[width]",
                          emerald
                            ? "bg-emerald-500"
                            : "bg-[color:var(--site-primary)]",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ) : null}

                {plan.features?.length ? (
                  <ul className="mb-8 flex-1 space-y-2.5 text-sm text-muted-foreground">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex gap-2">
                        {checkmarks ? (
                          <Check
                            className={cn(
                              "mt-0.5 h-4 w-4 shrink-0",
                              emerald ? "text-emerald-500/90" : "text-muted-foreground/70",
                            )}
                            aria-hidden
                          />
                        ) : (
                          <span className="select-none text-muted-foreground/80">•</span>
                        )}
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex-1" />
                )}

                {plan.isCurrentPlan ? (
                  <Button
                    disabled
                    variant="secondary"
                    className={cn(
                      "w-full border-transparent bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800/80",
                      emerald && "bg-emerald-950/50 text-emerald-100/90",
                    )}
                  >
                    {plan.cta ?? "Текущий план"}
                  </Button>
                ) : plan.cta ? (
                  <Button
                    className={cn(
                      plan.highlighted &&
                        "bg-[color:var(--site-primary)] text-white hover:opacity-90",
                    )}
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
