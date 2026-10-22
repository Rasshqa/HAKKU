import { CaseCategory } from "../intake/types";

export type LegalDocumentType =
  | "bipartite_request"
  | "somasi_warning"
  | "legal_aid_chronology";

export interface LegalDocumentTemplateMeta {
  id: LegalDocumentType;
  title: string;
  category: CaseCategory[];
  description: string;
  legalBasis: string;
  recommendedFor: string;
}

export interface DocumentCustomFields {
  senderName: string;
  senderPhone?: string;
  senderAddress?: string;
  recipientName: string;
  recipientRoleOrTitle?: string;
  recipientAddress: string;
  proposedMeetingDate?: string;
  responseDeadlineDays?: number;
  letterCity: string;
}

export interface GeneratedLegalDocument {
  type: LegalDocumentType;
  title: string;
  legalBasis: string;
  fullText: string;
  metadata: {
    city: string;
    dateFormatted: string;
    senderName: string;
    recipientName: string;
  };
}
