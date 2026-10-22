import {
  EvidenceAuditInput,
  EvidenceAuditEvaluation,
  EvidenceItem,
  EvidenceType,
} from "./types";

export const EVIDENCE_TYPE_LABELS: Record<EvidenceType, string> = {
  digital_transaction: "Bukti Transaksi Finansial (Mutasi / Bukti Transfer)",
  digital_communication: "Komunikasi Elektronik (Chat WhatsApp / Email / Rekaman)",
  written_contract: "Dokumen Tertulis (Kontrak / Kuitansi / Perjanjian)",
  identity_document: "Identitas Pihak Lawan (KTP / Rekening / Profil)",
  witness_testimony: "Keterangan Saksi (Saksi Mata / Rekan Kerja)",
  audio_visual: "Bukti Audio-Visual (Foto / Video / CCTV)",
};

import { formatRupiah } from "@/lib/formatters";
export { formatRupiah };

/**
 * Menghitung skor kesiapan pembuktian hukum (0 - 100) dan mengidentifikasi celah bukti
 * Berdasarkan standar pembuktian Pasal 184 KUHAP jo. Pasal 5-6 UU ITE No. 1/2024
 */
export function evaluateEvidenceReadiness(
  input: EvidenceAuditInput
): EvidenceAuditEvaluation {
  let score = 0;
  const strengths: string[] = [];
  const missingCriticalItems: string[] = [];
  const statutoryLegalBasis: string[] = [
    "Pasal 184 ayat (1) KUHAP (Alat Bukti yang Sah)",
    "Pasal 5 & 6 UU ITE No. 1 Tahun 2024 jo. UU No. 11/2008 (Kekuatan Hukum Dokumen Elektronik)",
    "Pasal 1866 Kitab Undang-Undang Hukum Perdata (Alat Bukti Perdata)",
  ];
  const proceduralAdvice: string[] = [];

  const availableEvidences = input.evidences.filter((e) => e.isAvailable);

  // 1. Uji Bukti Finansial / Transaksi Kerugian (30 poin)
  const hasTransactionProof = availableEvidences.some(
    (e) => e.type === "digital_transaction" || e.type === "written_contract"
  );
  if (hasTransactionProof) {
    score += 30;
    strengths.push(
      "Tersedia bukti transaksi/kontrak sah sebagai dasar kerugian materiil."
    );
  } else {
    missingCriticalItems.push(
      "Belum ada bukti transaksi resmi (mutasi bank / struk transfer / bukti bayar / kontrak tertulis). Ini adalah bukti pokok yang wajib ditunjukkan."
    );
  }

  // 2. Uji Bukti Jejak Komunikasi / Hubungan Hukum (25 poin)
  const hasCommunicationProof = availableEvidences.some(
    (e) => e.type === "digital_communication" || e.type === "audio_visual"
  );
  if (hasCommunicationProof) {
    score += 25;
    strengths.push(
      "Tersedia rekaman jejak komunikasi digital (chat WhatsApp/email) yang membuktikan adanya janji/kesepakatan."
    );
  } else {
    missingCriticalItems.push(
      "Tangkapan layar (screenshot) percakapan atau surat korespondensi yang membuktikan adanya kesepakatan belum dilampirkan."
    );
  }

  // 3. Uji Identitas Pihak Terlapor / Lawan (20 poin)
  const hasCounterpartyProof = availableEvidences.some(
    (e) => e.type === "identity_document"
  );
  const hasCounterpartyDetails =
    Boolean(input.reportedPartyName.trim()) &&
    Boolean(
      (input.reportedPartyContact && input.reportedPartyContact.trim()) ||
        (input.reportedPartyDetails && input.reportedPartyDetails.trim())
    );

  if (hasCounterpartyProof || hasCounterpartyDetails) {
    score += 20;
    strengths.push(
      "Identitas pihak terlapor (nama, nomor kontak, nomor rekening) teridentifikasi."
    );
  } else {
    missingCriticalItems.push(
      "Identitas pihak terlapor masih minim. Cantumkan nomor rekening bank, nomor kontak WhatsApp, atau tautan profil toko/pelaku."
    );
  }

  // 4. Uji Kronologi Waktu Berurutan (25 poin)
  if (input.events.length >= 2) {
    score += 15;
    strengths.push(
      `Tersusun ${input.events.length} rangkaian peristiwa berurutan tanggal.`
    );

    const eventsWithEvidence = input.events.filter(
      (ev) => ev.associatedEvidenceCodes && ev.associatedEvidenceCodes.length > 0
    );
    if (eventsWithEvidence.length > 0) {
      score += 10;
      strengths.push(
        "Peristiwa dalam kronologi telah ditautkan secara konkret dengan kode alat bukti fisik (P-1, P-2, dsb.)."
      );
    } else {
      proceduralAdvice.push(
        "Tautkan setiap peristiwa dalam kronologi dengan kode bukti yang mendukung agar penegak hukum/mediator mudah memeriksa."
      );
    }
  } else {
    missingCriticalItems.push(
      "Kronologi kejadian masih terlalu singkat. Minimal cantumkan 2 tahapan waktu (misal: saat awal transaksi dan saat pihak lawan mulai mengingkari janji)."
    );
  }

  // Klasifikasi Level Kesiapan
  let readinessLevel: "ready_for_filing" | "needs_more_evidence" | "insufficient";
  let readinessLabel: string;
  let readinessColor: string;

  if (score >= 75) {
    readinessLevel = "ready_for_filing";
    readinessLabel = "Kesiapan Pembuktian Tinggi (Siap Dilaporkan / Dimediasi)";
    readinessColor = "text-emerald-700 bg-emerald-50 border-emerald-300";
    proceduralAdvice.push(
      "Berkas bukti Anda telah memenuhi syarat formil minimum untuk dibawa ke SPKT Kepolisian, Disnaker, BPSK, atau konsultasi LBH."
    );
  } else if (score >= 50) {
    readinessLevel = "needs_more_evidence";
    readinessLabel = "Kesiapan Menengah (Perlu Tambahan Bukti Pendukung)";
    readinessColor = "text-amber-800 bg-amber-50 border-amber-300";
    proceduralAdvice.push(
      "Lengkapi poin bukti yang masih kurang di atas sebelum melapor agar laporan Anda tidak ditolak atau diminta melengkapi berkas berulang kali."
    );
  } else {
    readinessLevel = "insufficient";
    readinessLabel = "Bukti Belum Cukup (Rentan Gugur / Ditolak)";
    readinessColor = "text-rose-800 bg-rose-50 border-rose-300";
    proceduralAdvice.push(
      "Jangan terburu-buru melapor sebelum memiliki bukti transfer dan rekaman percakapan tertulis. Amankan mutasi bank dan backup chat WA terlebih dahulu."
    );
  }

  // Tambahan dasar hukum spesifik kategori
  if (input.category === "consumer_digital" || input.category === "finance_loans") {
    statutoryLegalBasis.push(
      "Pasal 28 ayat (1) jo. Pasal 45A ayat (1) UU ITE (Penipuan Transaksi Elektronik)",
      "Pasal 378 Kitab Undang-Undang Hukum Pidana (Penipuan)",
      "Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen"
    );
  } else if (input.category === "labor") {
    statutoryLegalBasis.push(
      "UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
      "Peraturan Pemerintah No. 35 & 36 Tahun 2021 (Upah & Kompensasi)"
    );
  } else {
    statutoryLegalBasis.push(
      "Pasal 1238 & 1243 KUHPerdata (Wanprestasi dan Ganti Kerugian)",
      "Pasal 372 Kitab Undang-Undang Hukum Pidana (Penggelapan)"
    );
  }

  // Format Dokumen Resmi Laporan Pengaduan & Matriks Bukti
  const formattedReportText = generateFormalReportText(input, availableEvidences);

  return {
    readinessScore: score,
    readinessLevel,
    readinessLabel,
    readinessColor,
    strengths,
    missingCriticalItems,
    statutoryLegalBasis,
    proceduralAdvice,
    formattedReportText,
  };
}

/**
 * Menyusun naskah Laporan Kronologi Kejadian & Matriks Bukti berstandar formil Indonesia
 */
function generateFormalReportText(
  input: EvidenceAuditInput,
  evidences: EvidenceItem[]
): string {
  const lossText = input.totalLossAmount
    ? formatRupiah(input.totalLossAmount)
    : "Dalam Perhitungan / Kerugian Hak Normatif";

  const eventsFormatted = input.events
    .map((ev, i) => {
      const evidenceTags =
        ev.associatedEvidenceCodes && ev.associatedEvidenceCodes.length > 0
          ? ` [Bukti: ${ev.associatedEvidenceCodes.join(", ")}]`
          : "";
      return `   ${i + 1}. Tanggal: ${ev.date}${ev.time ? ` (Pukul ${ev.time})` : ""}\n      Peristiwa: ${ev.eventTitle}\n      Uraian: ${ev.description}${evidenceTags}`;
    })
    .join("\n\n");

  const evidenceTableFormatted = evidences
    .map((e) => {
      return `   • [${e.code}] ${e.title}\n     - Jenis       : ${EVIDENCE_TYPE_LABELS[e.type]}\n     - Keterangan  : ${e.description}\n     - Nilai Bukti : ${e.weight === "primary" ? "Bukti Utama (Kuat)" : "Bukti Pendukung"}\n     - Penyimpanan : ${e.storageLocation}`;
    })
    .join("\n\n");

  return `LAPORAN KRONOLOGI KEJADIAN & MATRIKS ALAT BUKTI
(Standar Pembuktian Pasal 184 KUHAP jo. Pasal 5 UU ITE No. 1/2024)

Perihal: Laporan Kronologis Dugaan Pelanggaran Hukum / Kerugian: ${input.caseTitle}

I. IDENTITAS PELAPOR / KORBAN:
Nama Lengkap      : ${input.reporterName || "[Nama Lengkap Pelapor]"}
NIK (KTP)         : ${input.reporterNik || "[Nomor Induk Kependudukan]"}
Nomor Telepon/WA  : ${input.reporterPhone || "[Nomor Kontak Aktif]"}
Alamat Domisili   : ${input.reporterAddress || "[Alamat Tempat Tinggal Pelapor]"}

II. IDENTITAS PIHAK TERLAPOR / LAWAN:
Nama / Badan Usaha: ${input.reportedPartyName || "[Nama Pihak Terlapor / Toko / Perusahaan]"}
Kontak / Rekening : ${input.reportedPartyContact || "[Nomor Telepon / Rekening Bank Terlapor]"}
Keterangan Tambahan: ${input.reportedPartyDetails || "[Akun Media Sosial / Unit / Lokasi Lawan]"}

III. RINGKASAN KERUGIAN:
Estimasi Total Kerugian : ${lossText}
Tempat Kejadian (Locus) : ${input.incidentLocationCity || "Indonesia"}
Rentang Waktu Kejadian  : ${input.incidentDateStart} s/d ${input.incidentDateEnd || "Sekarang"}

IV. URAIAN KRONOLOGIS KEJADIAN BERURUTAN:
${eventsFormatted || "   (Belum ada rincian tanggal kejadian yang diinputkan)"}

V. MATRIKS DAFTAR ALAT BUKTI SAH YANG DILAMPIRKAN:
${evidenceTableFormatted || "   (Belum ada alat bukti yang dilampirkan)"}

VI. PERNYATAAN KEBENARAN INFORMASI:
Demikian kronologi kejadian dan daftar alat bukti ini saya susun dengan sebenar-benarnya dan beriktikad baik tanpa ada unsur rekayasa atau fitnah, untuk dijadikan bahan laporan resmi pada pihak yang berwenang (Kepolisian / Instansi Terkait / Lembaga Bantuan Hukum).


Kota: ${input.incidentLocationCity || "Jakarta"}, Tanggal: 28 Oktober 2026

Pelapor / Pemohon,


(Materai Rp 10.000)


${input.reporterName || "[Nama Lengkap Pelapor]"}`;
}
