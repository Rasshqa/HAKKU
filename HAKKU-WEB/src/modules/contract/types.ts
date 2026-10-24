import { z } from "zod";

export type ContractDomainType = "pkwt_labor" | "tenancy_lease" | "loan_service";

export type ClauseRiskSeverity = "high_risk" | "warning" | "safe";

export interface ContractClauseFinding {
  id: string;
  title: string;
  clauseExcerpt: string;
  severity: ClauseRiskSeverity;
  severityLabel: string;
  legalBasis: string;
  explanation: string;
  recommendedRevision: string;
}

export interface ContractAuditResult {
  contractType: ContractDomainType;
  contractTypeLabel: string;
  overallRisk: ClauseRiskSeverity;
  overallRiskLabel: string;
  highRiskCount: number;
  warningCount: number;
  safeCount: number;
  summaryText: string;
  findings: ContractClauseFinding[];
  analyzedAt: string;
}

export const AnalyzeContractInputSchema = z.object({
  contractType: z.enum(["pkwt_labor", "tenancy_lease", "loan_service"]),
  contractText: z
    .string()
    .min(20, "Teks kontrak minimal 20 karakter untuk dapat diperiksa.")
    .max(15000, "Teks kontrak maksimal 15.000 karakter."),
});

export type AnalyzeContractInput = z.infer<typeof AnalyzeContractInputSchema>;
