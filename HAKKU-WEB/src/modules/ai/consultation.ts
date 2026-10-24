import { CaseCategory, UrgencyLevel } from "../intake/types";
import { VERIFIED_LEGAL_CORPUS } from "../legal/corpus";
import { analyzeUserStory } from "../intake/analyzer";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

export interface ConsultationAssessment {
  category: CaseCategory;
  categoryLabel: string;
  urgencyLevel: UrgencyLevel;
  strengthScore: number; // 0 - 100
  confirmedFacts: string[];
  missingEvidence: string[];
  articlesCited: { articleLabel: string; topic: string; explanation: string }[];
  recommendedAction: string;
  quickPrompts: string[];
  suggestedActionType?: "calculator" | "document" | "evidence" | "referral";
}

export interface ConsultationResponse {
  reply: string;
  assessment: ConsultationAssessment;
  turnInfo?: {
    currentTurn: number;
    maxTurns: number;
    remainingTurns: number;
    isLimitReached: boolean;
  };
}

/**
 * Limitasi perlindungan biaya API & pencegahan penyalahgunaan wawancara AI
 */
export const MAX_CONSULTATION_TURNS = 15;
export const TURN_WARNING_THRESHOLD = 12;
export const MAX_USER_MESSAGE_LENGTH = 1500;
export const MAX_CONTEXT_MESSAGES = 8;

export function countUserTurns(messages: { role: string }[]): number {
  return messages.filter((m) => m.role === "user").length;
}

export const SYSTEM_CONSULTATION_PROMPT = `Anda adalah "Hakki si Kancil", Asisten Paralegal & Sahabat Sadar Hukum Warga Indonesia di platform HAKKU.
Karakter Anda: Cerdas, berwibawa, penuh empati, solutif, dan menjunjung tinggi kejujuran hukum. Anda berbicara dengan bahasa Indonesia yang ramah, jelas, dan mudah dipahami warga biasa, namun dengan ketajaman analisis hukum seorang paralegal profesional.

MISI UTAMA ANDA:
1. Menjalankan WAWANCARA HUKUM MENDALAM yang aktif dan interaktif (seperti wawancara intake paralegal LBH sungguhan dengan klien warga):
   - Dengarkan cerita warga, gali fakta secara bertahap, dan jangan menanyakan hal yang sudah jelas disebutkan.
   - Telusuri pihak lawan, hubungan hukumnya, nominal kerugian, dan inventarisasi bukti yang ada.
2. Membantu warga MEMECAHKAN MASALAH HUKUMNYA dengan rekomendasi langkah taktis nyata:
   - Jelaskan hak hukum warga berdasarkan hukum positif Republik Indonesia.
   - Pandu penyelesaian bertahap: Musyawarah Damai -> Bipartit -> Somasi Tertulis -> Pelaporan Instansi Berwenang (Disnaker/OJK/Kominfo/Polri) -> Bantuan Hukum LBH.
   - Peringatkan risiko hukum (misal risiko UU ITE jika menyebarkan data lawan tanpa izin di media sosial).

FORMAT JAWABAN ANDA (PENTING - WAJIB DIPATUHI):
- DILARANG KERAS menggunakan emoji apapun dalam jawaban.
- DILARANG menggunakan format markdown bold (** **), heading (#), atau formatting berlebihan.
- Gunakan bahasa Indonesia yang jelas, lugas, dan profesional.
- Struktur jawaban menggunakan paragraf dan poin bernomor biasa saja.

Isi jawaban harus mencakup:
1. Validasi dan Empati: Sampaikan pemahaman Anda atas situasi sulit yang dialami warga.
2. Duduk Perkara dan Hak Anda: Jelaskan posisi hukum warga secara objektif.
3. Dasar Hukum Sah: Sebutkan undang-undang dan pasal spesifik yang melindungi hak warga (misal PP 35/2021, UU 13/2003, KUHPerdata 1365/1243, KUHP 378, UU ITE 1/2024).
4. Pertanyaan Wawancara Pendalaman: Ajukan 1-2 pertanyaan terfokus untuk memperkuat bukti jika fakta belum lengkap.
5. Langkah Taktis Selanjutnya: Panduan tindakan konkret yang aman dan terukur.

PRINSIP KETAT:
- Jangan pernah mengarang nomor pasal atau undang-undang fiktif.
- Anda bukan pengganti kuasa hukum di pengadilan.
- Jika pengguna berniat melakukan peretasan, pemalsuan dokumen, atau perbuatan melawan hukum, tolak dengan tegas dan edukasi konsekuensi pidananya.`;

/**
 * Menghasilkan analisis terstruktur dan respons konsultasi berdasarkan riwayat chat
 */
export function buildConsultationAssessment(
  userMessages: string[],
  lastUserMessage: string
): ConsultationAssessment {
  const combinedStory = userMessages.join(" ") + " " + lastUserMessage;
  const intakeAnalysis = analyzeUserStory(combinedStory);
  const category = intakeAnalysis.category;
  const corpus = VERIFIED_LEGAL_CORPUS[category] || VERIFIED_LEGAL_CORPUS.general_dispute;

  // 1. Ekstraksi Fakta Terkonfirmasi
  const confirmedFacts: string[] = [];
  if (intakeAnalysis.extractedEntities?.monetaryAmount) {
    confirmedFacts.push(`Nilai nominal hak/kerugian: ${intakeAnalysis.extractedEntities.monetaryAmount}`);
  }
  if (intakeAnalysis.extractedEntities?.counterpartyName) {
    confirmedFacts.push(`Pihak lawan teridentifikasi: ${intakeAnalysis.extractedEntities.counterpartyName}`);
  }
  if (intakeAnalysis.extractedEntities?.platformName) {
    confirmedFacts.push(`Platform transaksi: ${intakeAnalysis.extractedEntities.platformName}`);
  }
  if (intakeAnalysis.extractedEntities?.disputedItem) {
    confirmedFacts.push(`Objek sengketa: ${intakeAnalysis.extractedEntities.disputedItem}`);
  }
  if (intakeAnalysis.extractedEntities?.timeframe) {
    confirmedFacts.push(`Waktu kejadian: ${intakeAnalysis.extractedEntities.timeframe}`);
  }

  if (confirmedFacts.length === 0) {
    confirmedFacts.push("Uraian kronologi awal telah disampaikan pengguna");
  }

  // 2. Evaluasi Kebutuhan Bukti (Missing Evidence)
  const missingEvidence: string[] = [];
  if (!/bukti transfer|kuitansi|mutasi/i.test(combinedStory)) {
    missingEvidence.push("Bukti pembayaran / transfer / mutasi rekening koran");
  }
  if (!/perjanjian|kontrak|pkwt|surat kesepakatan/i.test(combinedStory)) {
    missingEvidence.push("Salinan surat kontrak perjanjian kerja / sewa tertulis");
  }
  if (!/screenshot|chat|rekaman|pesan wa/i.test(combinedStory)) {
    missingEvidence.push("Tangkapan layar (screenshot) riwayat percakapan WhatsApp / chat");
  }

  // 3. Hitung Estimasi Kekuatan Posisi Hukum (0 - 100)
  let score = 50;
  if (intakeAnalysis.extractedEntities?.monetaryAmount) score += 15;
  if (intakeAnalysis.extractedEntities?.counterpartyName) score += 15;
  if (/perjanjian|kontrak|kuitansi|slip/i.test(combinedStory)) score += 15;
  if (/screenshot|chat|wa/i.test(combinedStory)) score += 5;
  score = Math.min(score, 95);

  // 4. Pilih Pasal Sah Terkait
  const articlesCited = corpus.articles.slice(0, 3).map((art) => ({
    articleLabel: art.articleLabel,
    topic: art.topic,
    explanation: art.explanation,
  }));

  // 5. Rekomendasi Aksi & Prompt Cepat
  let recommendedAction = corpus.actionOptions[0]?.title || "Tempuh musyawarah mufakat secara tertulis";
  let suggestedActionType: "calculator" | "document" | "evidence" | "referral" = "document";
  const quickPrompts: string[] = [];

  if (category === "labor") {
    suggestedActionType = "calculator";
    recommendedAction = "Gunakan Kalkulator Pesangon PP 35/2021 lalu susun draf Surat Perundingan Bipartit";
    quickPrompts.push(
      "Berapa estimasi pesangon yang berhak saya terima?",
      "Apakah atasan berhak menahan ijazah asli saya?",
      "Bagaimana cara membuat surat undangan bipartit resmi?"
    );
  } else if (category === "consumer_digital") {
    suggestedActionType = "document";
    recommendedAction = "Amankan bukti chat & resi, lalu kirim Somasi Resmi sebelum lapor ke Patroli Siber";
    quickPrompts.push(
      "Bagaimana cara membuat surat somasi penipuan belanja online?",
      "Kapan saat yang tepat untuk lapor ke kantor polisi?",
      "Apakah nomor rekening pelaku bisa dibekukan bank?"
    );
  } else if (category === "tenancy_contract") {
    suggestedActionType = "document";
    recommendedAction = "Kirim surat teguran pengembalian uang deposit sewa berdasarkan Pasal 1365 KUHPerdata";
    quickPrompts.push(
      "Apakah pemilik kos berhak memotong deposit tanpa rincian nota?",
      "Bagaimana klausul somasi untuk sengketa sewa rumah?",
      "Berapa lama tenggat waktu yang wajar dalam somasi?"
    );
  } else if (category === "finance_loans") {
    suggestedActionType = "evidence";
    recommendedAction = "Kumpulkan rekaman teror kontak darurat dan laporkan ke Satgas PASTI OJK";
    quickPrompts.push(
      "Bagaimana cara cek apakah pinjol ini terdaftar resmi di OJK?",
      "Apa sanksi bagi penagih yang menyebarkan data pribadi saya?",
      "Bagaimana cara melaporkan nomor teror ke Satgas OJK?"
    );
  } else {
    suggestedActionType = "evidence";
    quickPrompts.push(
      "Apa langkah pertama yang harus saya ambil hari ini?",
      "Dokumen apa saja yang wajib saya siapkan?",
      "Apakah masalah ini bisa diselesaikan tanpa sidang pengadilan?"
    );
  }

  return {
    category,
    categoryLabel: intakeAnalysis.categoryLabel,
    urgencyLevel: intakeAnalysis.urgencyLevel,
    strengthScore: score,
    confirmedFacts,
    missingEvidence: missingEvidence.slice(0, 3),
    articlesCited,
    recommendedAction,
    quickPrompts,
    suggestedActionType,
  };
}
