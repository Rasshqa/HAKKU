import { CaseCategory } from "../intake/types";

export type LegalDocumentType =
  | "bipartite_request"
  | "disnaker_tripartite"
  | "somasi_warning"
  | "bpsk_complaint"
  | "legal_aid_chronology";

export type LetterHeaderMode = "institutional" | "personal";

export interface LegalDocumentTemplateMeta {
  id: LegalDocumentType;
  title: string;
  category: CaseCategory[];
  description: string;
  legalBasis: string;
  recommendedFor: string;
}

export interface DocumentCustomFields {
  headerMode?: LetterHeaderMode;
  institutionLine1?: string;
  institutionLine2?: string;
  institutionAddress?: string;
  letterNumber?: string;
  attachmentText?: string;
  senderName: string;
  senderPhone?: string;
  senderAddress?: string;
  recipientName: string;
  recipientRoleOrTitle?: string;
  recipientAddress: string;
  proposedMeetingDate?: string;
  proposedMeetingTime?: string;
  proposedMeetingDay?: string;
  responseDeadlineDays?: number;
  letterCity: string;
  ccRecipients?: string[];
}

export interface StructuredLegalLetter {
  headerMode: LetterHeaderMode;
  letterhead: {
    line1: string;
    line2: string;
    address: string;
    phone: string;
  };
  city: string;
  dateFormatted: string;
  letterNumber: string;
  attachment: string;
  subject: string;
  recipientTitle: string;
  recipientAddress: string;
  salutation: string;
  openingParagraph: string;
  legalBasisParagraph: string;
  detailIntroText: string;
  detailRows: { label: string; value: string }[];
  agendaTitle: string;
  agendaItems: string[];
  closingParagraph: string;
  signatoryRole: string;
  signatoryName: string;
  ccList: string[];
}

export interface GeneratedLegalDocument {
  type: LegalDocumentType;
  title: string;
  legalBasis: string;
  fullText: string;
  structured: StructuredLegalLetter;
  metadata: {
    city: string;
    dateFormatted: string;
    senderName: string;
    recipientName: string;
  };
}
