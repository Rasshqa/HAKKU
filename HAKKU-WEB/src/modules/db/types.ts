import { z } from "zod";
import { CaseFactSummary } from "../intake/types";
import { CaseCategorySchema, UrgencyLevelSchema } from "../ai/types";
import { ReferralOrganization } from "../referral/directory";

export interface CaseRecord {
  id: string;
  caseCode: string;
  userId?: string | null;
  title: string;
  category: string;
  categoryLabel: string;
  urgencyLevel: string;
  status: "active" | "awaiting_help" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface CaseIntakeRecord {
  id: string;
  caseId: string;
  userStatement: string;
  clarificationData: unknown;
  factsSummary: CaseFactSummary;
  confirmedAt?: string;
  createdAt: string;
}

export interface CaseEvaluationRecord {
  id: string;
  caseId: string;
  legalSourceId: string;
  legalSourceTitle: string;
  legalSourceUrl: string;
  articlesCited: unknown[];
  actionOptions: unknown[];
  uncertainties: string[];
  createdAt: string;
}

export interface CaseChecklistRecord {
  id: string;
  caseId: string;
  itemKey: string;
  title: string;
  description: string;
  required: boolean;
  isCompleted: boolean;
  updatedAt: string;
}

export interface SavedCaseDetails {
  caseRecord: CaseRecord;
  intake: CaseIntakeRecord;
  evaluation: CaseEvaluationRecord;
  checklists: CaseChecklistRecord[];
  referrals: ReferralOrganization[];
}

export const CreateCaseInputSchema = z.object({
  factSummary: z.object({
    originalStory: z.string().min(10, "Cerita minimal 10 karakter"),
    category: CaseCategorySchema,
    categoryLabel: z.string().min(1),
    urgencyLevel: UrgencyLevelSchema,
    knownFacts: z.array(z.string()),
    unknownFacts: z.array(z.string()),
    clarifications: z.array(
      z.object({
        questionId: z.string(),
        questionText: z.string(),
        answer: z.string(),
        isSkipped: z.boolean(),
      })
    ),
    userNotes: z.string().optional(),
    confirmedAt: z.string().optional(),
  }),
  legalSource: z.object({
    id: z.string(),
    title: z.string(),
    sourceUrl: z.string(),
    articles: z.array(z.any()),
    actionOptions: z.array(z.any()),
    uncertainties: z.array(z.string()),
  }),
  checklistItems: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      required: z.boolean(),
      isCompleted: z.boolean(),
    })
  ),
});

export type CreateCaseInput = z.infer<typeof CreateCaseInputSchema>;

export const ToggleChecklistInputSchema = z.object({
  itemKey: z.string().min(1),
  isCompleted: z.boolean(),
});
