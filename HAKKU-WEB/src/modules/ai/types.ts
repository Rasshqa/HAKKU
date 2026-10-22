import { z } from "zod";
import { IntakeAnalysisResult } from "../intake/types";

export const CaseCategorySchema = z.enum([
  "labor",
  "consumer_digital",
  "tenancy_contract",
  "finance_loans",
  "family_inheritance",
  "property_land",
  "general_dispute",
]);

export const UrgencyLevelSchema = z.enum([
  "normal",
  "urgent_safety",
  "needs_attention",
]);

export const ClarifyingQuestionSchema = z.object({
  id: z.string().min(1),
  category: CaseCategorySchema,
  question: z.string().min(3),
  helperText: z.string(),
  whyWeAsk: z.string(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
});

export const HelplineSchema = z.object({
  name: z.string().min(1),
  contact: z.string().min(1),
  description: z.string(),
});

export const SafetyWarningSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  recommendedHelplines: z.array(HelplineSchema).min(1),
});

export const ScopeStatusSchema = z.enum([
  "valid_legal_case",
  "non_legal",
  "insufficient_info",
  "illegal_intent",
]);

export const ScopeAssessmentSchema = z.object({
  status: ScopeStatusSchema,
  headline: z.string().min(1),
  reason: z.string().min(1),
  guidance: z.string().min(1),
  suggestedAction: z.enum([
    "proceed",
    "clarify_scope",
    "redirect_general",
    "block_illegal",
  ]),
});

export const ExtractedEntitiesSchema = z.object({
  monetaryAmount: z.string().optional(),
  counterpartyName: z.string().optional(),
  platformName: z.string().optional(),
  timeframe: z.string().optional(),
  disputedItem: z.string().optional(),
  isTermination: z.boolean().optional(),
});

export const IntakeAnalysisResultSchema = z.object({
  category: CaseCategorySchema,
  categoryLabel: z.string().min(1),
  urgencyLevel: UrgencyLevelSchema,
  safetyWarning: SafetyWarningSchema.optional(),
  detectedKeywords: z.array(z.string()),
  suggestedQuestions: z.array(ClarifyingQuestionSchema).min(1),
  scopeAssessment: ScopeAssessmentSchema.optional(),
  extractedEntities: ExtractedEntitiesSchema.optional(),
});

export const IntakeRequestSchema = z.object({
  story: z
    .string()
    .min(5, "Cerita masalah minimal 5 karakter")
    .max(5000, "Cerita masalah maksimal 5.000 karakter"),
});

export type IntakeRequest = z.infer<typeof IntakeRequestSchema>;

export interface AIProvider {
  readonly name: string;
  analyzeIntake(story: string): Promise<IntakeAnalysisResult>;
}
