import {
  DocumentCustomFields,
  GeneratedLegalDocument,
  LegalDocumentTemplateMeta,
  LegalDocumentType,
  StructuredLegalLetter,
} from "./types";
import { CaseCategory, CaseFactSummary } from "../intake/types";
import { formatIndonesianDate } from "@/lib/formatters";

export { formatIndonesianDate };

export const AVAILABLE_DOCUMENT_TEMPLATES: LegalDocumentTemplateMeta[] = [
  {
    id: "bipartite_request",
    title: "Surat Permohonan Perundingan Bipartit",
    category: ["labor"],
    description:
      "Surat resmi undangan musyawarah penyelesaian hak/upah antara pekerja/serikat pekerja dan pimpinan perusahaan sesuai Pasal 3 UU No. 2 Tahun 2004.",
    legalBasis:
      "Pasal 3 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial jo. PP No. 35 Tahun 2021",
    recommendedFor: "Perselisihan hak upah, PHK sepihak, pesangon, kompensasi PKWT",
  },
  {
    id: "disnaker_tripartite",
    title: "Surat Pengaduan & Pencatatan Perselisihan ke Disnaker (Tripartit)",
    category: ["labor"],
    description:
      "Surat permohonan pencatatan perselisihan hubungan industrial kepada Dinas Tenaga Kerja setempat apabila perundingan Bipartit gagal atau ditolak.",
    legalBasis:
      "Pasal 4 ayat (1) & Pasal 8 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
    recommendedFor: "Eskalasi mediasi ke Dinas Tenaga Kerja setelah Bipartit buntu",
  },
  {
    id: "somasi_warning",
    title: "Surat Somasi / Teguran Hukum Tertulis",
    category: [
      "tenancy_contract",
      "consumer_digital",
      "finance_loans",
      "general_dispute",
    ],
    description:
      "Surat teguran resmi yang menetapkan batas waktu pemenuhan kewajiban wanprestasi kepada pihak lawan sebelum ditempuh gugatan atau laporan resmi.",
    legalBasis:
      "Pasal 1238 & 1243 Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
    recommendedFor:
      "Sengketa deposit sewa, wanprestasi kontrak, penipuan transaksi, pengembalian dana",
  },
  {
    id: "bpsk_complaint",
    title: "Surat Pengaduan Sengketa Konsumen ke BPSK",
    category: ["consumer_digital", "finance_loans"],
    description:
      "Surat permohonan penyelesaian sengketa konsumen dan tuntutan ganti rugi kepada Badan Penyelesaian Sengketa Konsumen (BPSK).",
    legalBasis:
      "Pasal 19, Pasal 45 & Pasal 52 Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen",
    recommendedFor:
      "Kerugian konsumen barang/jasa cacat, transaksi elektronik gagal, klausul baku merugikan",
  },
  {
    id: "legal_aid_chronology",
    title: "Lembar Kronologi Fakta & Permohonan Konsultasi LBH",
    category: [
      "family_inheritance",
      "property_land",
      "general_dispute",
      "labor",
      "tenancy_contract",
      "consumer_digital",
      "finance_loans",
    ],
    description:
      "Surat pengantar resmi beserta rincian fakta perkara dan daftar bukti untuk permohonan pendampingan ke Lembaga Bantuan Hukum (LBH) atau Posbankum.",
    legalBasis: "Undang-Undang No. 16 Tahun 2011 tentang Bantuan Hukum",
    recommendedFor: "Permohonan bantuan hukum pro bono ke LBH atau Posbankum Pengadilan",
  },
];

export function getRecommendedTemplate(
  category: string
): LegalDocumentTemplateMeta {
  const matched = AVAILABLE_DOCUMENT_TEMPLATES.find((tpl) =>
    tpl.category.includes(category as CaseCategory)
  );
  return matched || AVAILABLE_DOCUMENT_TEMPLATES[2]; // default: somasi_warning
}

function buildPlainTextFromStructured(
  headingBadge: string,
  s: StructuredLegalLetter
): string {
  const lines: string[] = [];

  if (s.headerMode === "institutional") {
    lines.push(s.letterhead.line1.toUpperCase());
    lines.push(s.letterhead.line2.toUpperCase());
    lines.push(s.letterhead.address);
    lines.push(s.letterhead.phone);
    lines.push("======================================================================");
    lines.push("");
  }

  lines.push(headingBadge);
  lines.push(`${s.city}, ${s.dateFormatted}`);
  lines.push("");
  lines.push(`Nomor       : ${s.letterNumber}`);
  lines.push(`Lampiran    : ${s.attachment}`);
  lines.push(`Perihal     : ${s.subject}`);
  lines.push("");
  lines.push(`Kepada :`);
  lines.push(`Yth. ${s.recipientTitle}`);
  lines.push(`${s.recipientAddress}`);
  lines.push("");
  lines.push(s.salutation);
  lines.push("");
  lines.push(`      ${s.openingParagraph}`);
  lines.push("");
  lines.push(s.legalBasisParagraph);
  lines.push("");
  lines.push(s.detailIntroText);
  lines.push("");

  for (const row of s.detailRows) {
    lines.push(`${row.label.padEnd(14, " ")}: ${row.value}`);
  }

  lines.push("");
  lines.push(`      ${s.agendaTitle}`);
  lines.push("");
  s.agendaItems.forEach((item, idx) => {
    const letter = String.fromCharCode(97 + (idx % 26));
    lines.push(`${letter}. ${item}`);
  });

  lines.push("");
  lines.push(s.closingParagraph);
  lines.push("");
  lines.push(`                                                ${s.signatoryRole}`);
  lines.push("");
  lines.push("");
  lines.push(`                                                ${s.signatoryName}`);

  if (s.ccList.length > 0) {
    lines.push("");
    lines.push("Tembusan Yth. :");
    s.ccList.forEach((cc, i) => {
      lines.push(`${i + 1}. ${cc}`);
    });
  }

  return lines.join("\n");
}

export function generateLegalDocument(
  type: LegalDocumentType,
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  currentDate?: Date
): GeneratedLegalDocument {
  const dateFormatted = currentDate
    ? formatIndonesianDate(currentDate)
    : "24 Oktober 2026";
  const city = fields.letterCity.trim() || "Jakarta";

  if (type === "bipartite_request") {
    return generateBipartiteDocument(factSummary, fields, city, dateFormatted);
  }
  if (type === "disnaker_tripartite") {
    return generateDisnakerTripartiteDocument(
      factSummary,
      fields,
      city,
      dateFormatted
    );
  }
  if (type === "somasi_warning") {
    return generateSomasiDocument(factSummary, fields, city, dateFormatted);
  }
  if (type === "bpsk_complaint") {
    return generateBpskComplaintDocument(
      factSummary,
      fields,
      city,
      dateFormatted
    );
  }

  return generateLegalAidDocument(factSummary, fields, city, dateFormatted);
}

function generateBipartiteDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const headerMode = fields.headerMode || "institutional";
  const senderName = fields.senderName || "[Nama Lengkap Pekerja]";
  const senderRole = fields.recipientRoleOrTitle || "Pekerja / Perwakilan Pekerja";
  const recipientName = fields.recipientName || "[Nama Pimpinan / Perusahaan]";
  const recipientAddress = fields.recipientAddress || "di tempat";
  const meetingDate =
    fields.proposedMeetingDate || "Senin, 28 Oktober 2026";
  const meetingTime = fields.proposedMeetingTime || "09.00 WIB - Selesai";
  const meetingDay = fields.proposedMeetingDay || "Senin";

  const structured: StructuredLegalLetter = {
    headerMode,
    letterhead: {
      line1:
        fields.institutionLine1 ||
        "PERWAKILAN PEKERJA & SERIKAT BURUH MANDIRI",
      line2:
        fields.institutionLine2 ||
        "DIVISI ADVOKASI HAK NORMATIF & HUBUNGAN INDUSTRIAL",
      address:
        fields.institutionAddress ||
        fields.senderAddress ||
        "Jl. Gatot Subroto Kav. 51, Jakarta Selatan",
      phone: fields.senderPhone || "021-5255733 / 0812-3456-7890",
    },
    city,
    dateFormatted,
    letterNumber:
      fields.letterNumber || `005/BIPARTIT-PPHI/X/${new Date().getFullYear()}`,
    attachment: fields.attachmentText || "1 (satu) berkas rincian hak",
    subject: "Permohonan Perundingan Bipartit",
    recipientTitle: `Bapak/Ibu Pimpinan ${recipientName}`,
    recipientAddress,
    salutation: "Dengan Hormat,",
    openingParagraph: `Dengan surat ini kami sampaikan kepada Bapak/Ibu Pimpinan ${recipientName}, bahwa sehubungan dengan adanya permasalahan pemenuhan hak normatif ketenagakerjaan atas nama ${senderName} (${senderRole}), maka kami mengajukan permohonan resmi untuk melaksanakan perundingan Bipartit secara musyawarah untuk mencapai mufakat sebagaimana diwajibkan oleh Pasal 3 Undang-Undang No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial.`,
    legalBasisParagraph: `Sehingga melalui perundingan Bipartit ini diharapkan kedua belah pihak dapat menyepakati penyelesaian secara patut sesuai ketentuan Undang-Undang No. 13 Tahun 2003 jo. Undang-Undang No. 6 Tahun 2023 dan Peraturan Pemerintah No. 35 Tahun 2021 dalam batas waktu paling lama 30 (tiga puluh) hari kerja.`,
    detailIntroText: `Maka, mohon kesediaan Bapak/Ibu Pimpinan atau pejabat yang diberi kuasa untuk hadir dalam pertemuan perundingan Bipartit yang kami usulkan pada :`,
    detailRows: [
      { label: "Tanggal", value: meetingDate },
      { label: "Pukul", value: meetingTime },
      { label: "Hari", value: meetingDay },
      {
        label: "Tempat",
        value: `Ruang Pertemuan ${recipientName} (${recipientAddress})`,
      },
    ],
    agendaTitle: "Pokok Bahasan & Fakta Perkara :",
    agendaItems:
      factSummary.knownFacts.length > 0
        ? factSummary.knownFacts
        : [
            "Klarifikasi status hubungan kerja dan masa kerja pekerja",
            "Perhitungan dan jadwal pembayaran hak normatif / kompensasi",
            "Penandatanganan Risalah Perundingan Bipartit dan Perjanjian Bersama",
          ],
    closingParagraph: `Demikianlah surat permohonan perundingan Bipartit ini kami sampaikan. Atas perhatian dan kerja samanya kami ucapkan terima kasih.`,
    signatoryRole: senderRole,
    signatoryName: senderName,
    ccList: fields.ccRecipients || [
      "Kepala Dinas Tenaga Kerja dan Transmigrasi Setempat (sebagai laporan awal)",
      "Arsip Berkas Perkara",
    ],
  };

  const fullText = buildPlainTextFromStructured(
    "SURAT PERMOHONAN PERUNDINGAN BIPARTIT",
    structured
  );

  return {
    type: "bipartite_request",
    title: "Surat Permohonan Perundingan Bipartit",
    legalBasis:
      "Pasal 3 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
    fullText,
    structured,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}

function generateDisnakerTripartiteDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const headerMode = fields.headerMode || "institutional";
  const senderName = fields.senderName || "[Nama Lengkap Pekerja]";
  const senderRole = fields.recipientRoleOrTitle || "Pemohon Mediasi / Pekerja";
  const companyName = fields.recipientName || "[Nama Perusahaan Terlapor]";
  const disnakerAddress =
    fields.recipientAddress || `Kantor Dinas Tenaga Kerja ${city}`;

  const structured: StructuredLegalLetter = {
    headerMode,
    letterhead: {
      line1:
        fields.institutionLine1 ||
        "PERWAKILAN PEKERJA & SERIKAT BURUH MANDIRI",
      line2:
        fields.institutionLine2 ||
        "DIVISI ADVOKASI HAK NORMATIF & HUBUNGAN INDUSTRIAL",
      address:
        fields.institutionAddress ||
        fields.senderAddress ||
        "Jl. Gatot Subroto Kav. 51, Jakarta Selatan",
      phone: fields.senderPhone || "021-5255733 / 0812-3456-7890",
    },
    city,
    dateFormatted,
    letterNumber:
      fields.letterNumber || `012/TRIPARTIT-PHI/X/${new Date().getFullYear()}`,
    attachment:
      fields.attachmentText || "1 (satu) bundel risalah bipartit & bukti kerja",
    subject:
      "Permohonan Pencatatan Perselisihan Hubungan Industrial (Mediasi Tripartit)",
    recipientTitle: `Kepala Dinas Tenaga Kerja dan Transmigrasi ${city}`,
    recipientAddress: disnakerAddress,
    salutation: "Dengan Hormat,",
    openingParagraph: `Dengan surat ini kami sampaikan kepada Bapak/Ibu Kepala Dinas Tenaga Kerja dan Transmigrasi ${city}, bahwa upaya perundingan Bipartit antara pekerja atas nama ${senderName} dengan pihak manajemen ${companyName} telah ditempuh secara patut namun tidak mencapai kesepakatan (deadlock) atau tidak diindahkan dalam batas waktu formil.`,
    legalBasisParagraph: `Berdasarkan Pasal 4 ayat (1) dan Pasal 8 Undang-Undang Nomor 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial, bersama ini kami mencatatkan perselisihan tersebut untuk dimediasi oleh Mediator Hubungan Industrial pada Dinas Tenaga Kerja.`,
    detailIntroText: `Adapun identitas para pihak dan objek perselisihan yang kami mohonkan pencatatannya adalah pada :`,
    detailRows: [
      { label: "Pemohon", value: `${senderName} (${fields.senderAddress || city})` },
      { label: "Termohon", value: companyName },
      { label: "Jenis Sengketa", value: `Perselisihan Hak / PHK (${factSummary.categoryLabel})` },
      { label: "Bukti Bipartit", value: "Terlampir Surat Undangan & Kronologi Bipartit" },
    ],
    agendaTitle: "Pokok Permasalahan & Permohonan Mediasi :",
    agendaItems:
      factSummary.knownFacts.length > 0
        ? factSummary.knownFacts
        : [
            "Pemeriksaan pemenuhan hak normatif pekerja sesuai PP No. 35 Tahun 2021",
            "Pemanggilan pihak pengusaha untuk sidang mediasi Tripartit",
            "Penerbitan Anjuran Tertulis Mediator Hubungan Industrial",
          ],
    closingParagraph: `Demikianlah surat permohonan pencatatan perselisihan hubungan industrial ini kami sampaikan. Atas perhatian dan tindak lanjutnya kami ucapkan terima kasih.`,
    signatoryRole: senderRole,
    signatoryName: senderName,
    ccList: fields.ccRecipients || [
      `Pimpinan / HRD ${companyName}`,
      "Arsip Berkas Perkara",
    ],
  };

  const fullText = buildPlainTextFromStructured(
    "SURAT PERMOHONAN PENCATATAN PERSELISIHAN HUBUNGAN INDUSTRIAL (TRIPARTIT)",
    structured
  );

  return {
    type: "disnaker_tripartite",
    title: "Surat Pengaduan & Pencatatan Perselisihan ke Disnaker (Tripartit)",
    legalBasis:
      "Pasal 4 ayat (1) & Pasal 8 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
    fullText,
    structured,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}

function generateSomasiDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const headerMode = fields.headerMode || "institutional";
  const deadlineDays = fields.responseDeadlineDays || 7;
  const wordDays =
    deadlineDays === 3
      ? "tiga"
      : deadlineDays === 7
        ? "tujuh"
        : deadlineDays === 14
          ? "empat belas"
          : String(deadlineDays);
  const senderName = fields.senderName || "[Nama Lengkap Pemberi Somasi]";
  const recipientName = fields.recipientName || "[Nama Pihak yang Ditegur]";
  const recipientAddress = fields.recipientAddress || "di tempat";

  const structured: StructuredLegalLetter = {
    headerMode,
    letterhead: {
      line1:
        fields.institutionLine1 ||
        "TIM PENDAMPINGAN HUKUM & ADVOKASI PERDATA WARGA",
      line2:
        fields.institutionLine2 ||
        "SEKRETARIAT PENYELESAIAN SENGKETA NON-LITIGASI",
      address:
        fields.institutionAddress ||
        fields.senderAddress ||
        "Jl. Merdeka Selatan No. 10, Jakarta",
      phone: fields.senderPhone || "0812-3456-7890",
    },
    city,
    dateFormatted,
    letterNumber:
      fields.letterNumber || `008/SOMASI-PDT/X/${new Date().getFullYear()}`,
    attachment: fields.attachmentText || "1 (satu) berkas bukti perikatan",
    subject: "Somasi / Teguran Hukum Tertulis (Pasal 1238 KUHPerdata)",
    recipientTitle: `Bapak/Ibu ${recipientName}`,
    recipientAddress,
    salutation: "Dengan Hormat,",
    openingParagraph: `Dengan surat ini kami sampaikan kepada Bapak/Ibu ${recipientName}, bahwa sehubungan dengan adanya kewajiban perdata yang belum dipenuhi kepada ${senderName}, maka melalui surat ini kami menyampaikan SOMASI / TEGURAN HUKUM TERTULIS berdasarkan Pasal 1238 Kitab Undang-Undang Hukum Perdata (KUHPerdata) jo. Pasal 1243 KUHPerdata.`,
    legalBasisParagraph: `Bahwa tindakan penundaan atau tidak dipenuhinya perikatan secara sepihak tersebut merupakan perbuatan cidera janji (wanprestasi) yang menimbulkan kerugian materiil dan immateriil bagi pihak yang berhak.`,
    detailIntroText: `Maka, kami memberikan kesempatan untuk menyelesaikan kewajiban tersebut secara patut dengan batas ketentuan pada :`,
    detailRows: [
      {
        label: "Tenggat Waktu",
        value: `${deadlineDays} (${wordDays}) hari kalender sejak surat ini diterima`,
      },
      {
        label: "Bentuk Tindakan",
        value: "Pemenuhan kewajiban / pengembalian hak secara penuh dan tertulis",
      },
      {
        label: "Konfirmasi Ke",
        value: `${senderName} (${fields.senderPhone || "Kontak Pengirim"})`,
      },
      {
        label: "Tempat",
        value: fields.senderAddress || city,
      },
    ],
    agendaTitle: "Uraian Fakta & Pokok Tuntutan Hukum :",
    agendaItems:
      factSummary.knownFacts.length > 0
        ? factSummary.knownFacts
        : [
            "Menyelesaikan seluruh kewajiban pembayaran / pengembalian dana secara utuh",
            "Menyerahkan bukti penyelesaian tertulis sebelum tenggat waktu berakhir",
          ],
    closingParagraph: `Demikianlah surat somasi / teguran hukum tertulis ini kami sampaikan agar diselesaikan sebelum ditempuh upaya hukum lebih lanjut. Atas perhatiannya kami ucapkan terima kasih.`,
    signatoryRole: "Pemberi Somasi",
    signatoryName: senderName,
    ccList: fields.ccRecipients || [
      "Lembaga Penyelesaian Sengketa / Pos Bantuan Hukum Terkait",
      "Arsip Berkas Perkara",
    ],
  };

  const fullText = buildPlainTextFromStructured(
    "SOMASI / TEGURAN HUKUM TERTULIS",
    structured
  );

  return {
    type: "somasi_warning",
    title: "Surat Somasi / Teguran Hukum Tertulis",
    legalBasis:
      "Pasal 1238 & 1243 Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
    fullText,
    structured,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}

function generateBpskComplaintDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const headerMode = fields.headerMode || "institutional";
  const senderName = fields.senderName || "[Nama Lengkap Konsumen]";
  const businessName = fields.recipientName || "[Nama Pelaku Usaha Terlapor]";
  const bpskLocation =
    fields.recipientAddress || `Sekretariat BPSK Kota/Kabupaten ${city}`;

  const structured: StructuredLegalLetter = {
    headerMode,
    letterhead: {
      line1:
        fields.institutionLine1 ||
        "KOMUNITAS PERLINDUNGAN HAK KONSUMEN INDONESIA",
      line2:
        fields.institutionLine2 ||
        "SEKRETARIAT PENDAMPINGAN PENGADUAN SENGKETA KONSUMEN",
      address:
        fields.institutionAddress ||
        fields.senderAddress ||
        "Jl. Merdeka No. 10, Jakarta",
      phone: fields.senderPhone || "0812-3456-7890",
    },
    city,
    dateFormatted,
    letterNumber:
      fields.letterNumber || `004/PENGADUAN-BPSK/X/${new Date().getFullYear()}`,
    attachment: fields.attachmentText || "1 (satu) berkas bukti transaksi",
    subject:
      "Pengaduan Sengketa Konsumen & Permohonan Penyelesaian (UU No. 8/1999)",
    recipientTitle: `Ketua Badan Penyelesaian Sengketa Konsumen (BPSK) ${city}`,
    recipientAddress: bpskLocation,
    salutation: "Dengan Hormat,",
    openingParagraph: `Dengan surat ini kami sampaikan kepada Bapak/Ibu Ketua Badan Penyelesaian Sengketa Konsumen (BPSK) ${city}, bahwa konsumen atas nama ${senderName} telah mengalami kerugian akibat tindakan pelaku usaha ${businessName} yang tidak memenuhi standar kewajiban sebagaimana diatur dalam Undang-Undang Nomor 8 Tahun 1999 tentang Perlindungan Konsumen.`,
    legalBasisParagraph: `Sesuai ketentuan Pasal 19, Pasal 45, dan Pasal 52 Undang-Undang Nomor 8 Tahun 1999, konsumen berhak memperoleh kompensasi, ganti rugi, dan/atau penggantian atas barang/jasa yang tidak sesuai dengan perjanjian melalui forum penyelesaian BPSK.`,
    detailIntroText: `Adapun rincian identitas para pihak dan sengketa konsumen yang kami adukan adalah pada :`,
    detailRows: [
      { label: "Pengadu", value: `${senderName} (${fields.senderPhone || "-"})` },
      { label: "Teradu", value: businessName },
      { label: "Jalur Pilihan", value: "Mediasi / Konsiliasi melalui Majelis BPSK" },
      { label: "Domisili", value: fields.senderAddress || city },
    ],
    agendaTitle: "Uraian Kerugian & Tuntutan Konsumen :",
    agendaItems:
      factSummary.knownFacts.length > 0
        ? factSummary.knownFacts
        : [
            "Pengembalian dana (refund) atau penggantian kerugian materiil konsumen secara utuh",
            "Pencabutan klausul baku sepihak yang melanggar Pasal 18 UU Perlindungan Konsumen",
          ],
    closingParagraph: `Demikianlah surat pengaduan sengketa konsumen ini kami sampaikan untuk dapat diproses oleh Majelis BPSK. Atas perhatiannya kami ucapkan terima kasih.`,
    signatoryRole: "Konsumen Pengadu",
    signatoryName: senderName,
    ccList: fields.ccRecipients || [
      `Manajemen / Layanan Pelanggan ${businessName}`,
      "Dinas Perindustrian dan Perdagangan Setempat",
    ],
  };

  const fullText = buildPlainTextFromStructured(
    "SURAT PENGADUAN SENGKETA KONSUMEN KE BPSK",
    structured
  );

  return {
    type: "bpsk_complaint",
    title: "Surat Pengaduan Sengketa Konsumen ke BPSK",
    legalBasis:
      "Pasal 19, Pasal 45 & Pasal 52 Undang-Undang No. 8 Tahun 1999 tentang Perlindungan Konsumen",
    fullText,
    structured,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}

function generateLegalAidDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const headerMode = fields.headerMode || "institutional";
  const senderName = fields.senderName || "[Nama Lengkap Pemohon]";
  const recipientName =
    fields.recipientName ||
    "Pos Bantuan Hukum (Posbankum) / Lembaga Bantuan Hukum (LBH)";
  const recipientAddress = fields.recipientAddress || "di tempat";

  const combinedAgenda = [
    ...factSummary.knownFacts,
    ...(factSummary.unknownFacts.length > 0
      ? factSummary.unknownFacts.map(
          (uf) => `Hal yang memerlukan telaah lanjut: ${uf}`
        )
      : []),
  ];

  const structured: StructuredLegalLetter = {
    headerMode,
    letterhead: {
      line1:
        fields.institutionLine1 ||
        "LEMBAR PENGANTAR PERMOHONAN BANTUAN HUKUM WARGA",
      line2:
        fields.institutionLine2 ||
        "DOKUMENTASI KRONOLOGI FAKTA & ALAT BUKTI PERKARA",
      address:
        fields.institutionAddress ||
        fields.senderAddress ||
        "Alamat Domisili Pemohon",
      phone: fields.senderPhone || "Nomor Telepon Pemohon",
    },
    city,
    dateFormatted,
    letterNumber:
      fields.letterNumber || `001/PBH-LBH/X/${new Date().getFullYear()}`,
    attachment: fields.attachmentText || "1 (satu) berkas salinan bukti",
    subject: `Permohonan Konsultasi & Pendampingan Hukum (${factSummary.categoryLabel})`,
    recipientTitle: `Tim Advokat / Paralegal ${recipientName}`,
    recipientAddress,
    salutation: "Dengan Hormat,",
    openingParagraph: `Dengan surat ini kami sampaikan kepada Bapak/Ibu Tim Advokat dan Paralegal pada ${recipientName}, bahwa pemohon atas nama ${senderName} memohon kesediaan pemberian layanan konsultasi dan pendampingan bantuan hukum berdasarkan UU No. 16 Tahun 2011 tentang Bantuan Hukum atas duduk perkara: "${factSummary.originalStory}".`,
    legalBasisParagraph: `Sehubungan dengan perkara tersebut, pemohon telah menginventarisasi kronologi kejadian serta bukti-bukti awal agar memudahkan proses telaah hukum oleh Advokat Pembimbing.`,
    detailIntroText: `Adapun data diri pemohon dan klasifikasi perkara yang dimohonkan adalah pada :`,
    detailRows: [
      { label: "Nama Pemohon", value: senderName },
      { label: "Kontak HP", value: fields.senderPhone || "[Nomor Telepon]" },
      { label: "Kategori", value: factSummary.categoryLabel },
      { label: "Alamat", value: fields.senderAddress || city },
    ],
    agendaTitle: "Rincian Fakta & Hal yang Dimohonkan Pendampingan :",
    agendaItems:
      combinedAgenda.length > 0
        ? combinedAgenda
        : ["Telaah awal kedudukan hukum dan kelengkapan alat bukti perkara"],
    closingParagraph: `Demikianlah surat permohonan konsultasi dan lembar kronologi fakta ini kami sampaikan. Atas perhatian dan bantuannya kami ucapkan terima kasih.`,
    signatoryRole: "Pemohon Bantuan Hukum",
    signatoryName: senderName,
    ccList: fields.ccRecipients || ["Arsip Pemohon"],
  };

  const fullText = buildPlainTextFromStructured(
    "LEMBAR KRONOLOGI FAKTA & PERMOHONAN KONSULTASI BANTUAN HUKUM",
    structured
  );

  return {
    type: "legal_aid_chronology",
    title: "Lembar Kronologi Fakta & Permohonan Konsultasi LBH",
    legalBasis: "Undang-Undang No. 16 Tahun 2011 tentang Bantuan Hukum",
    fullText,
    structured,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}
