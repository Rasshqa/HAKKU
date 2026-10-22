import {
  DocumentCustomFields,
  GeneratedLegalDocument,
  LegalDocumentTemplateMeta,
  LegalDocumentType,
} from "./types";
import { CaseCategory, CaseFactSummary } from "../intake/types";

export const AVAILABLE_DOCUMENT_TEMPLATES: LegalDocumentTemplateMeta[] = [
  {
    id: "bipartite_request",
    title: "Surat Permohonan Perundingan Bipartit",
    category: ["labor"],
    description:
      "Surat resmi permohonan musyawarah penyelesaian hak/upah antara pekerja dan pengusaha. Syarat wajib formil sebelum mengajukan mediasi resmi ke Dinas Tenaga Kerja.",
    legalBasis:
      "Pasal 3 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial jo. PP No. 36 Tahun 2021",
    recommendedFor: "Perselisihan hak upah, PHK sepihak, pesangon, kompensasi kontrak",
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
      "Surat teguran resmi yang memberikan batas waktu konkret kepada pihak lawan untuk memenuhi kewajiban hukumnya sebelum ditempuh jalur peradilan atau laporan resmi.",
    legalBasis:
      "Pasal 1238 & 1243 Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
    recommendedFor:
      "Sewa kamar/rumah, deposit tertahan, penipuan transaksi digital, wanprestasi kontrak",
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
      "Dokumen pengantar terstruktur yang merangkum kronologi, alat bukti, dan poin masalah untuk diserahkan kepada advokat di Posbankum Pengadilan atau Lembaga Bantuan Hukum (LBH).",
    legalBasis: "Undang-Undang No. 16 Tahun 2011 tentang Bantuan Hukum",
    recommendedFor: "Semua jenis perkara sebelum konsultasi dengan advokat pro bono",
  },
];

export function getRecommendedTemplate(
  category: string
): LegalDocumentTemplateMeta {
  const matched = AVAILABLE_DOCUMENT_TEMPLATES.find((tpl) =>
    tpl.category.includes(category as CaseCategory)
  );
  return matched || AVAILABLE_DOCUMENT_TEMPLATES[1]; // default: somasi
}

import { formatIndonesianDate } from "@/lib/formatters";
export { formatIndonesianDate };

export function generateLegalDocument(
  type: LegalDocumentType,
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  currentDate?: Date
): GeneratedLegalDocument {
  const dateFormatted = currentDate
    ? formatIndonesianDate(currentDate)
    : "28 Oktober 2026";
  const city = fields.letterCity.trim() || "Jakarta";

  if (type === "bipartite_request") {
    return generateBipartiteDocument(factSummary, fields, city, dateFormatted);
  }

  if (type === "somasi_warning") {
    return generateSomasiDocument(factSummary, fields, city, dateFormatted);
  }

  return generateLegalAidDocument(factSummary, fields, city, dateFormatted);
}

function generateBipartiteDocument(
  factSummary: CaseFactSummary,
  fields: DocumentCustomFields,
  city: string,
  dateFormatted: string
): GeneratedLegalDocument {
  const factsList = factSummary.knownFacts
    .map((fact, idx) => `   ${idx + 1}. ${fact}`)
    .join("\n");

  const meetingDate =
    fields.proposedMeetingDate || "7 (tujuh) hari kerja setelah surat ini diterima";

  const fullText = `SURAT PERMOHONAN PERUNDINGAN BIPARTIT

Nomor       : 01/BIPARTIT/${new Date().getFullYear()}
Lampiran    : Salinan Bukti Terkait
Perihal     : Permohonan Perundingan Bipartit atas Perselisihan Hak Ketenagakerjaan

${city}, ${dateFormatted}

Kepada Yth.
Pimpinan / Manajemen Perusahaan
${fields.recipientName || "[Nama Perusahaan / Atasan]"}
${fields.recipientAddress || "[Alamat Kantor Perusahaan]"}

Dengan hormat,

Yang bertanda tangan di bawah ini:
Nama Lengkap      : ${fields.senderName || "[Nama Lengkap Pekerja]"}
Jabatan / Pekerjaan: ${fields.recipientRoleOrTitle || "Pekerja / Karyawan"}
Nomor Telepon/HP  : ${fields.senderPhone || "[Nomor Telepon]"}
Alamat            : ${fields.senderAddress || "[Alamat Tempat Tinggal]"}

Bersama surat ini, saya menyampaikan permohonan resmi untuk diadakannya perundingan Bipartit secara musyawarah untuk mencapai mufakat, sebagaimana diwajibkan oleh Pasal 3 Undang-Undang No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial.

Adapun duduk perkara dan fakta-fakta yang mendasari permohonan ini adalah sebagai berikut:
${factsList}

Berdasarkan ketentuan hukum ketenagakerjaan yang berlaku di Republik Indonesia (Undang-Undang No. 13 Tahun 2003 jo. Undang-Undang No. 6 Tahun 2023 serta Peraturan Pemerintah No. 36 Tahun 2021), hak-hak normatif pekerja wajib diselesaikan secara patut dan tepat waktu.

Demi tercapainya penyelesaian yang berkeadilan dan beriktikad baik bagi kedua belah pihak, dengan ini saya mengusulkan agar perundingan Bipartit dapat diselenggarakan pada:
Hari / Tanggal : ${meetingDate}
Waktu          : 10.00 WIB s/d selesai
Tempat         : Kantor Perusahaan atau Tempat yang Disepakati Bersama

Demikian surat permohonan ini saya sampaikan. Apabila dalam waktu 30 (tiga puluh) hari kerja sejak surat ini diterima perundingan tidak dapat terlaksana atau tidak mencapai kesepakatan, maka sesuai prosedur hukum yang berlaku, permasalahan ini akan saya teruskan ke Dinas Tenaga Kerja setempat untuk dimohonkan mediasi hubungan industrial.

Atas perhatian dan iktikad baik Bapak/Ibu Pimpinan, saya ucapkan terima kasih.


Hormat saya,
Pemohon Perundingan,


(Materai Rp 10.000)


${fields.senderName || "[Nama Lengkap Pekerja]"}`;

  return {
    type: "bipartite_request",
    title: "Surat Permohonan Perundingan Bipartit",
    legalBasis:
      "Pasal 3 UU No. 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial",
    fullText,
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
  const deadlineDays = fields.responseDeadlineDays || 7;
  const factsList = factSummary.knownFacts
    .map((fact, idx) => `   ${idx + 1}. ${fact}`)
    .join("\n");

  const fullText = `SOMASI / TEGURAN HUKUM TERTULIS
(Pertama dan Terakhir)

${city}, ${dateFormatted}

Kepada Yth.
${fields.recipientName || "[Nama Pihak yang Dituju]"}
${fields.recipientAddress || "[Alamat Lengkap Pihak yang Dituju]"}

Perihal: Somasi / Teguran Hukum Tertulis atas Pelanggaran Kewajiban Hukum (Wanprestasi)

Dengan hormat,

Saya yang bertanda tangan di bawah ini:
Nama Lengkap      : ${fields.senderName || "[Nama Lengkap Pengirim]"}
Nomor Telepon/HP  : ${fields.senderPhone || "[Nomor Telepon]"}
Alamat Domisili   : ${fields.senderAddress || "[Alamat Lengkap Pengirim]"}

Dengan ini menyampaikan Somasi (Teguran Hukum Tertulis) kepada Saudara/i berdasarkan fakta-fakta hukum sebagai berikut:

${factsList}

Bahwa berdasarkan Pasal 1238 Kitab Undang-Undang Hukum Perdata (KUHPerdata), debitur dinyatakan lalai dengan surat perintah atau dengan akta sejenis itu, atau berdasarkan perikatan itu sendiri. Tindakan Saudara/i yang belum menyelesaikan kewajiban tersebut telah menimbulkan kerugian nyata bagi saya.

TUNTUTAN SOMASI:
Melalui surat somasi ini, saya menegur dan memberikan kesempatan terakhir kepada Saudara/i untuk segera:
1. Menyelesaikan seluruh kewajiban hukum yang belum dipenuhi secara penuh dan beriktikad baik;
2. Mengembalikan hak/dana/dokumen yang menjadi hak saya tanpa potongan sepihak.

TENGGAT WAKTU PENYELESAIAN:
Saya memberikan tenggat waktu selama ${deadlineDays} (${deadlineDays === 7 ? "tujuh" : String(deadlineDays)}) hari kalender terhitung sejak tanggal surat ini diterima oleh Saudara/i.

PERINGATAN HUKUM:
Apabila hingga batas waktu di atas Saudara/i tetap mengabaikan somasi ini atau tidak menunjukkan iktikad baik penyelesaian, maka saya akan menempuh upaya hukum yang tegas tanpa pemberitahuan lebih lanjut, baik melalui:
1. Jalur perdata berupa gugatan ganti rugi wanprestasi di Pengadilan Negeri; dan/atau
2. Pengaduan resmi ke badan penyelesaian sengketa terkait (BPSK / Otoritas Jasa Keuangan / Kepolisian RI sesuai ranah perkara).

Segala biaya perkara dan kerugian yang timbul akibat proses hukum tersebut akan menjadi beban Saudara/i sepenuhnya.

Demikian somasi ini disampaikan untuk menjadi perhatian dan dilaksanakan dengan penuh tanggung jawab.


Hormat saya,
Pemberi Somasi,


(Materai Rp 10.000)


${fields.senderName || "[Nama Lengkap Pengirim]"}`;

  return {
    type: "somasi_warning",
    title: "Surat Somasi / Teguran Hukum Tertulis",
    legalBasis: "Pasal 1238 & 1243 Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
    fullText,
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
  const knownList = factSummary.knownFacts
    .map((f, i) => `   ${i + 1}. ${f}`)
    .join("\n");

  const unknownList =
    factSummary.unknownFacts.length > 0
      ? factSummary.unknownFacts
          .map((uf) => `   - ${uf}`)
          .join("\n")
      : "   - Seluruh fakta dasar telah terangkum.";

  const fullText = `LEMBAR KRONOLOGI FAKTA & PERMOHONAN KONSULTASI BANTUAN HUKUM
(Berdasarkan UU No. 16 Tahun 2011 tentang Bantuan Hukum)

Kepada Yth.
Tim Advokat / Paralegal
${fields.recipientName || "Pos Bantuan Hukum (Posbankum) / Lembaga Bantuan Hukum (LBH)"}
${fields.recipientAddress || "Kantor Layanan Setempat"}

${city}, ${dateFormatted}

Perihal: Permohonan Bantuan Hukum / Konsultasi Perkara: ${factSummary.categoryLabel}

Dengan hormat,
Saya yang bertanda tangan di bawah ini:
Nama Lengkap      : ${fields.senderName || "[Nama Lengkap Pemohon]"}
Kontak HP         : ${fields.senderPhone || "[Nomor Telepon / WhatsApp]"}
Domisili          : ${fields.senderAddress || "[Alamat Tempat Tinggal]"}

Bersama ini saya memohon kesediaan Tim Bantuan Hukum untuk memberikan konsultasi dan pendampingan atas persoalan hukum yang sedang saya hadapi, dengan uraian kronologi fakta terstruktur sebagai berikut:

I. KRONOLOGI AWAL:
"${factSummary.originalStory}"

II. FAKTA-FAKTA YANG TELAH TERKONFIRMASI:
${knownList}

III. ASPEK YANG MASIH MEMERLUKAN TELAAH HUKUM / BUKTI TAMBAHAN:
${unknownList}

IV. MAKSUD DAN TUJUAN KONSULTASI:
Memahami hak-hak hukum normatif, meneliti kekuatan alat bukti yang dimiliki, serta memohon arahan/pendampingan dalam menempuh langkah musyawarah maupun prosedur hukum resmi berikutnya.

Demikian ringkasan fakta perkara ini saya sampaikan dengan sebenar-benarnya untuk bahan pertimbangan konsultasi hukum cuma-cuma (pro bono).


Pemohon Konsultasi,



${fields.senderName || "[Nama Lengkap Pemohon]"}`;

  return {
    type: "legal_aid_chronology",
    title: "Lembar Kronologi Fakta & Permohonan Konsultasi LBH",
    legalBasis: "Undang-Undang No. 16 Tahun 2011 tentang Bantuan Hukum",
    fullText,
    metadata: {
      city,
      dateFormatted,
      senderName: fields.senderName,
      recipientName: fields.recipientName,
    },
  };
}
