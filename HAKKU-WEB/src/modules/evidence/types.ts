export type EvidenceType =
  | "digital_transaction" // Bukti Transfer Bank, Mutasi, Struk QRIS / E-Wallet
  | "digital_communication" // Tangkapan Layar Chat WhatsApp/Telegram, Email Resmi, Log Panggilan
  | "written_contract" // Perjanjian Kerja/Sewa, Kuitansi Bermeterai, Slip Gaji Fisik
  | "identity_document" // KTP, NPWP, Profil Akun Pihak Lawan, Nomor Rekening Terlapor
  | "witness_testimony" // Keterangan Saksi / Rekan Kerja / Saksi Mata Kejadian
  | "audio_visual"; // Rekaman Suara Panggilan, Foto Fisik Kerusakan, Rekaman CCTV

export type EvidenceWeight = "primary" | "supporting" | "corroborative";

export interface EvidenceItem {
  id: string;
  code: string; // Misal: "P-1", "P-2", "P-3" (Standar kode alat bukti Pelapor/Penggugat di Indonesia)
  title: string;
  type: EvidenceType;
  dateObtained: string;
  description: string;
  weight: EvidenceWeight;
  storageLocation: string; // Lokasi penyimpanan (misal: "PDF Mutasi m-Banking", "Screenshot WA tersimpan di Drive")
  sourceNotes?: string; // Catatan sumber perolehan, keaslian berkas, atau rantai penyimpanan (chain of custody)
  isAvailable: boolean;
}

export interface ChronologyEvent {
  id: string;
  date: string;
  time?: string;
  eventTitle: string;
  description: string;
  associatedEvidenceCodes: string[]; // Kode bukti terkait, misal: ["P-1", "P-2"]
}

export interface EvidenceAuditInput {
  caseTitle: string;
  category: string;
  reporterName: string;
  reporterNik?: string;
  reporterPhone: string;
  reporterAddress: string;
  reportedPartyName: string;
  reportedPartyContact?: string;
  reportedPartyDetails?: string;
  incidentLocationCity: string;
  incidentDateStart: string;
  incidentDateEnd?: string;
  totalLossAmount?: number;
  events: ChronologyEvent[];
  evidences: EvidenceItem[];
}

export interface EvidenceAuditEvaluation {
  readinessScore: number; // 0 - 100
  readinessLevel: "ready_for_filing" | "needs_more_evidence" | "insufficient";
  readinessLabel: string;
  readinessColor: string;
  strengths: string[];
  missingCriticalItems: string[];
  statutoryLegalBasis: string[];
  proceduralAdvice: string[];
  formattedReportText: string;
}
