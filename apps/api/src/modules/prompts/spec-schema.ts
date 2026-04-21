import { z } from 'zod';

export const PromptSpecSchema = z.object({
  ProjectOverview: z.string(),
  TargetAudience: z.string(),
  Pages: z.array(z.string()).min(1),
  UISections: z.array(z.string()).min(1),
  Features: z.array(z.string()).min(1),
  TechStack: z.array(z.string()).min(1),
  ComponentStructure: z.array(z.string()).min(1),
  SEORequirements: z.array(z.string()).min(1)
});

export type PromptSpec = z.infer<typeof PromptSpecSchema>;

