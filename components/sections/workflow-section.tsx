import { cn } from "@/lib/utils";
import type { WorkflowProps } from "@/schema/site-schema";

export function WorkflowSection({
  variant,
  title,
  steps,
}: WorkflowProps & { variant: string }) {
  return (
    <section className="border-b border-border/60 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <ol
          className={cn(
            "grid gap-6",
            variant === "steps" || variant === "default"
              ? "sm:grid-cols-1"
              : "sm:grid-cols-2 lg:grid-cols-3",
          )}
        >
          {steps.map((step, i) => (
            <li
              key={`${step.title}-${i}`}
              className="relative rounded-2xl border border-border/80 bg-card p-6 pl-14 shadow-sm"
            >
              <span
                className="absolute left-4 top-6 flex size-8 items-center justify-center rounded-full bg-[color:var(--site-primary)] text-xs font-semibold text-white"
                aria-hidden
              >
                {i + 1}
              </span>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
