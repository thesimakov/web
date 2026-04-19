import { cn } from "@/lib/utils";
import type { TestimonialsProps } from "@/schema/site-schema";

export function TestimonialsSection({
  variant,
  title,
  items,
}: TestimonialsProps & { variant: string }) {
  return (
    <section className="border-b border-border/60 bg-muted/30 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <ul
          className={cn(
            "grid gap-6",
            variant === "carousel" ? "sm:grid-cols-1" : "sm:grid-cols-2",
          )}
        >
          {items.map((item, i) => (
            <li
              key={`${item.author}-${i}`}
              className="rounded-2xl border border-border/80 bg-background p-6 shadow-sm"
            >
              <blockquote className="text-base leading-relaxed">“{item.quote}”</blockquote>
              <footer className="mt-4 text-sm">
                <span className="font-medium">{item.author}</span>
                {item.role ? (
                  <span className="text-muted-foreground"> — {item.role}</span>
                ) : null}
              </footer>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
