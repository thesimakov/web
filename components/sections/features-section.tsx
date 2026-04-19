import { cn } from "@/lib/utils";
import type { FeaturesProps } from "@/schema/site-schema";

export function FeaturesSection({
  variant,
  title,
  items,
}: FeaturesProps & { variant: string }) {
  const grid = variant === "grid" || variant === "default";

  return (
    <section className="border-b border-border/60 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <ul
          className={cn(
            "grid gap-6",
            grid ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-1",
          )}
        >
          {items.map((item, i) => (
            <li
              key={`${item.title}-${i}`}
              className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm"
            >
              <h3 className="text-lg font-medium">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
