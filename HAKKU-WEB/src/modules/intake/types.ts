export type CaseCategory =
  | "labor"
  | "consumer_digital"
  | "tenancy_contract"
  | "finance_loans"
  | "family_inheritance"
  | "property_land"
  | "general_dispute";

export type UrgencyLevel = "normal" | "urgent_safety" | "needs_attention";

export interface ClarifyingQuestion {
  id: string;
  category: CaseCategory;
  question: string;
  helperText: string;
  whyWeAsk: string;
  placeholder?: string;
  options?: string[];
}

export interface ClarificationAnswer {
  questionId: string;
  questionText: string;
  answer: string;
  isSkipped: boolean;
}

export type ScopeStatus =
  | "valid_legal_case"
  | "non_legal"
  | "insufficient_info"
  | "illegal_intent";

export interface ScopeAssessment {
  status: ScopeStatus;
  headline: string;
  reason: string;
  guidance: string;
  suggestedAction: "proceed" | "clarify_scope" | "redirect_general" | "block_illegal";
}

export interface ExtractedEntities {
  monetaryAmount?: string;
  counterpartyName?: string;
  platformName?: string;
  timeframe?: string;
  disputedItem?: string;
  isTermination?: boolean;
}

export interface IntakeAnalysisResult {
  category: CaseCategory;
  categoryLabel: string;
  urgencyLevel: UrgencyLevel;
  safetyWarning?: {
    title: string;
    description: string;
    recommendedHelplines: {
      name: string;
      contact: string;
      description: string;
    }[];
  };
  detectedKeywords: string[];
  suggestedQuestions: ClarifyingQuestion[];
  scopeAssessment?: ScopeAssessment;
  extractedEntities?: ExtractedEntities;
}

export interface CaseFactSummary {
  originalStory: string;
  category: CaseCategory;
  categoryLabel: string;
  urgencyLevel: UrgencyLevel;
  knownFacts: string[];
  unknownFacts: string[];
  clarifications: ClarificationAnswer[];
  userNotes?: string;
  confirmedAt?: string;
}
