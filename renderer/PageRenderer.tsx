import { CTASection } from "@/components/sections/cta-section";
import { FAQSection } from "@/components/sections/faq-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { SocialProofSection } from "@/components/sections/social-proof-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { WorkflowSection } from "@/components/sections/workflow-section";
import type { CSSProperties } from "react";

import type { SiteSchema, SiteSection } from "@/schema/site-schema";

function renderSection(section: SiteSection, index: number) {
  switch (section.type) {
    case "hero":
      return (
        <HeroSection key={index} variant={section.variant} {...section.props} />
      );
    case "features":
      return (
        <FeaturesSection key={index} variant={section.variant} {...section.props} />
      );
    case "pricing":
      return (
        <PricingSection key={index} variant={section.variant} {...section.props} />
      );
    case "testimonials":
      return (
        <TestimonialsSection key={index} variant={section.variant} {...section.props} />
      );
    case "faq":
      return <FAQSection key={index} variant={section.variant} {...section.props} />;
    case "cta":
      return <CTASection key={index} variant={section.variant} {...section.props} />;
    case "workflow":
      return (
        <WorkflowSection key={index} variant={section.variant} {...section.props} />
      );
    case "social-proof":
      return (
        <SocialProofSection key={index} variant={section.variant} {...section.props} />
      );
  }
}

export interface PageRendererProps {
  schema: SiteSchema;
}

/**
 * Рендерит страницу строго из JSON-схемы: тема через CSS-переменные, секции из типизированного union.
 */
export function PageRenderer({ schema }: PageRendererProps) {
  const { theme, sections } = schema;

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={
        {
          "--site-primary": theme.primaryColor,
          "--site-secondary": theme.secondaryColor,
          fontFamily: theme.font,
        } as CSSProperties
      }
    >
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
}
