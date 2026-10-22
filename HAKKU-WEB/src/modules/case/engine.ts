import {
  ClarificationAnswer,
  CaseFactSummary,
  IntakeAnalysisResult,
} from "../intake/types";
import { LegalSourceItem, matchLegalSources } from "../legal/corpus";
import { ReferralOrganization, getReferralsByCategory } from "../referral/directory";

export interface InteractiveChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  isCompleted: boolean;
}

export interface CaseFullEvaluation {
  factSummary: CaseFactSummary;
  legalSource: LegalSourceItem;
  checklistItems: InteractiveChecklistItem[];
  referrals: ReferralOrganization[];
}

/**
 * Menyusun ringkasan fakta dan evaluasi perkara secara dinamis
 * Memisahkan secara tegas:
 * - Fakta yang dinyatakan pengguna (known facts)
 * - Informasi yang belum diketahui (unknown facts)
 */
export function buildCaseEvaluation(
  originalStory: string,
  intakeAnalysis: IntakeAnalysisResult,
  clarificationAnswers: ClarificationAnswer[]
): CaseFullEvaluation {
  const knownFacts: string[] = [];
  const unknownFacts: string[] = [];

  // Masukkan fakta utama dari cerita awal
  knownFacts.push(`Kronologi awal yang disampaikan: "${originalStory.trim()}"`);

  // Proses jawaban klarifikasi
  clarificationAnswers.forEach((ans) => {
    if (ans.isSkipped || !ans.answer.trim() || ans.answer === "Saya tidak tahu") {
      unknownFacts.push(
        `Belum diketahui / dilewati: ${ans.questionText}`
      );
    } else {
      knownFacts.push(
        `${ans.questionText}: ${ans.answer.trim()}`
      );
    }
  });

  const factSummary: CaseFactSummary = {
    originalStory,
    category: intakeAnalysis.category,
    categoryLabel: intakeAnalysis.categoryLabel,
    urgencyLevel: intakeAnalysis.urgencyLevel,
    knownFacts,
    unknownFacts,
    clarifications: clarificationAnswers,
    confirmedAt: new Date().toISOString(),
  };

  const legalSource = matchLegalSources(intakeAnalysis.category);

  const checklistItems: InteractiveChecklistItem[] = legalSource.checklist.map(
    (item, index) => ({
      id: `check_${intakeAnalysis.category}_${index}`,
      title: item.title,
      description: item.description,
      required: item.required,
      isCompleted: false,
    })
  );

  const referrals = getReferralsByCategory(intakeAnalysis.category);

  return {
    factSummary,
    legalSource,
    checklistItems,
    referrals,
  };
}
