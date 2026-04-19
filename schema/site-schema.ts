/**
 * Контракт JSON-схемы сайта: AI собирает структуру, UI рендерится только из этих типов.
 * Сырой HTML из модели не допускается — только props под зарегистрированные секции.
 */

export type SectionType =
  | "hero"
  | "features"
  | "pricing"
  | "testimonials"
  | "faq"
  | "cta"
  | "workflow"
  | "social-proof";

export interface SiteTheme {
  primaryColor: string;
  secondaryColor: string;
  font: string;
}

export interface HeroProps {
  headline: string;
  subheadline?: string;
  cta?: string;
  secondaryCta?: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface FeaturesProps {
  title?: string;
  items: FeatureItem[];
}

export interface PricingTokenUsage {
  /** Подпись блока, например «Ежедневные токены» */
  label: string;
  used: number;
  total: number;
}

export interface PricingPlan {
  name: string;
  price: string;
  description?: string;
  features?: string[];
  cta?: string;
  highlighted?: boolean;
  /** Бейдж в углу карточки, например «ВАШ ПЛАН» */
  badge?: string;
  /** Иконка молнии рядом с названием (бесплатный / быстрый старт) */
  showIcon?: "zap";
  /** Блок прогресса (токены, квота) */
  tokenUsage?: PricingTokenUsage;
  /** Карточка текущего тарифа — кнопка неактивна */
  isCurrentPlan?: boolean;
  /** Визуальный акцент: зелёная тема как в макете бесплатного плана */
  accent?: "emerald" | "default";
  /** Список фич: маркеры или галочки (по умолчанию — галочки, если заданы badge/tokenUsage/isCurrentPlan) */
  featuresStyle?: "bullet" | "check";
}

export interface PricingProps {
  title?: string;
  plans: PricingPlan[];
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsProps {
  title?: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface FAQProps {
  title?: string;
  items: FaqItem[];
}

export interface CTAProps {
  headline: string;
  subheadline?: string;
  cta?: string;
}

export interface WorkflowStep {
  title: string;
  desc: string;
}

export interface WorkflowProps {
  title?: string;
  steps: WorkflowStep[];
}

export interface SocialProofProps {
  headline?: string;
  stat?: string;
  logos?: string[];
}

export type SiteSection =
  | { type: "hero"; variant: string; props: HeroProps }
  | { type: "features"; variant: string; props: FeaturesProps }
  | { type: "pricing"; variant: string; props: PricingProps }
  | { type: "testimonials"; variant: string; props: TestimonialsProps }
  | { type: "faq"; variant: string; props: FAQProps }
  | { type: "cta"; variant: string; props: CTAProps }
  | { type: "workflow"; variant: string; props: WorkflowProps }
  | { type: "social-proof"; variant: string; props: SocialProofProps };

export interface SiteSchema {
  theme: SiteTheme;
  sections: SiteSection[];
}
