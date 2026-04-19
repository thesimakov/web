import { CTASection } from "@/components/sections/cta-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WorkflowSection } from "@/components/sections/workflow-section";

/**
 * Реестр типов секций → React-компоненты. AI может использовать только ключи из этого объекта.
 */
export const sectionRegistry = {
  hero: HeroSection,
  features: FeaturesSection,
  pricing: PricingSection,
  testimonials: TestimonialsSection,
  faq: FAQSection,
  cta: CTASection,
  workflow: WorkflowSection,
  "social-proof": SocialProofSection,
} as const;

export type SectionRegistry = typeof sectionRegistry;
