import type { SocialProofProps } from "@/schema/site-schema";

export function SocialProofSection({
  headline,
  stat,
  logos,
}: SocialProofProps & { variant: string }) {
  return (
    <section className="border-b border-border/60 bg-muted/20 px-4 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          {headline ? (
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {headline}
            </p>
          ) : null}
          {stat ? <p className="mt-1 text-lg font-semibold">{stat}</p> : null}
        </div>
        {logos?.length ? (
          <ul className="flex flex-wrap items-center justify-center gap-8 opacity-70">
            {logos.map((name, i) => (
              <li key={`${name}-${i}`} className="text-sm font-medium">
                {name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
