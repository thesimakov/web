import type { FAQProps } from "@/schema/site-schema";

export function FAQSection({ title, items }: FAQProps & { variant: string }) {
  return (
    <section
      id="faq"
      className="scroll-mt-24 border-b border-border/60 px-4 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">
        {title ? (
          <h2 className="mb-10 text-center text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
        ) : null}
        <dl className="space-y-6">
          {items.map((item, i) => (
            <div key={`${item.q}-${i}`} className="rounded-2xl border border-border/80 bg-card p-6">
              <dt className="font-medium">{item.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
