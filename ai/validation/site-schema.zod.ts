import { z } from "zod";

import type { SiteSchema } from "@/schema/site-schema";

const themeSchema = z.object({
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  font: z.string().min(1),
});

const heroProps = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  cta: z.string().optional(),
  secondaryCta: z.string().optional(),
});

const featureItem = z.object({
  title: z.string(),
  desc: z.string(),
});

const featuresProps = z.object({
  title: z.string().optional(),
  items: z.array(featureItem).min(1),
});

const pricingTokenUsage = z.object({
  label: z.string(),
  used: z.number().nonnegative(),
  total: z.number().positive(),
});

const pricingPlan = z.object({
  name: z.string(),
  price: z.string(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  cta: z.string().optional(),
  highlighted: z.boolean().optional(),
  badge: z.string().optional(),
  showIcon: z.literal("zap").optional(),
  tokenUsage: pricingTokenUsage.optional(),
  isCurrentPlan: z.boolean().optional(),
  accent: z.enum(["emerald", "default"]).optional(),
  featuresStyle: z.enum(["bullet", "check"]).optional(),
});

const pricingProps = z.object({
  title: z.string().optional(),
  plans: z.array(pricingPlan).min(1),
});

const testimonialItem = z.object({
  quote: z.string(),
  author: z.string(),
  role: z.string().optional(),
});

const testimonialsProps = z.object({
  title: z.string().optional(),
  items: z.array(testimonialItem).min(1),
});

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const faqProps = z.object({
  title: z.string().optional(),
  items: z.array(faqItem).min(1),
});

const ctaProps = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  cta: z.string().optional(),
});

const workflowStep = z.object({
  title: z.string(),
  desc: z.string(),
});

const workflowProps = z.object({
  title: z.string().optional(),
  steps: z.array(workflowStep).min(1),
});

const socialProofProps = z.object({
  headline: z.string().optional(),
  stat: z.string().optional(),
  logos: z.array(z.string()).optional(),
});

export const siteSectionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("hero"),
    variant: z.string(),
    props: heroProps,
  }),
  z.object({
    type: z.literal("features"),
    variant: z.string(),
    props: featuresProps,
  }),
  z.object({
    type: z.literal("pricing"),
    variant: z.string(),
    props: pricingProps,
  }),
  z.object({
    type: z.literal("testimonials"),
    variant: z.string(),
    props: testimonialsProps,
  }),
  z.object({
    type: z.literal("faq"),
    variant: z.string(),
    props: faqProps,
  }),
  z.object({
    type: z.literal("cta"),
    variant: z.string(),
    props: ctaProps,
  }),
  z.object({
    type: z.literal("workflow"),
    variant: z.string(),
    props: workflowProps,
  }),
  z.object({
    type: z.literal("social-proof"),
    variant: z.string(),
    props: socialProofProps,
  }),
]);

export const siteSchemaZod = z.object({
  theme: themeSchema,
  sections: z.array(siteSectionSchema).min(1),
});

export function parseSiteSchema(data: unknown): SiteSchema {
  return siteSchemaZod.parse(data) as SiteSchema;
}

export function safeParseSiteSchema(data: unknown) {
  return siteSchemaZod.safeParse(data);
}
