import {
  ContractAuditResult,
  ContractClauseFinding,
  ContractDomainType,
} from "./types";

interface StatutoryClauseRule {
  id: string;
  domains: ContractDomainType[];
  keywords: RegExp[];
  title: string;
  severity: "high_risk" | "warning" | "safe";
  severityLabel: string;
  legalBasis: string;
  explanation: string;
  recommendedRevision: string;
}

const CONTRACT_DOMAIN_LABELS: Record<ContractDomainType, string> = {
  pkwt_labor: "Perjanjian Kerja (PKWT / PKWTT)",
  tenancy_lease: "Perjanjian Sewa Properti / Kontrakan",
  loan_service: "Perjanjian Pinjaman / Layanan Digital",
};

const STATUTORY_CLAUSE_RULES: StatutoryClauseRule[] = [
  {
    id: "rule-pkwt-probation",
    domains: ["pkwt_labor"],
    keywords: [
      /masa\s+percobaan/i,
      /probation/i,
      /uji\s+coba\s+kerja/i,
    ],
    title: "Klausul Masa Percobaan (Probation) dalam Kontrak PKWT",
    severity: "high_risk",
    severityLabel: "Batal Demi Hukum",
    legalBasis:
      "Pasal 58 ayat (1) & (2) UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023 & Pasal 12 PP No. 35 Tahun 2021",
    explanation:
      "Perjanjian Kerja Waktu Tertentu (PKWT) dilarang mensyaratkan adanya masa percobaan kerja. Apabila tetap dicantumkan, maka masa percobaan tersebut batal demi hukum dan masa kerja tetap dihitung sejak hari pertama bekerja.",
    recommendedRevision:
      "Hapus ketentuan masa percobaan (probation). Evaluasi kinerja dilakukan secara berkala tanpa mengurangi hak normatif pekerja sejak tanggal mulai kontrak.",
  },
  {
    id: "rule-pkwt-diploma-withholding",
    domains: ["pkwt_labor"],
    keywords: [
      /tahan.*ijazah/i,
      /menyerahkan\s+ijazah\s+asli/i,
      /ijazah\s+asli.*jaminan/i,
      /penahanan\s+dokumen\s+asli/i,
      /bpkb.*jaminan/i,
    ],
    title: "Penahanan Ijazah atau Dokumen Pribadi Asli sebagai Jaminan",
    severity: "high_risk",
    severityLabel: "Klausul Berisiko Tinggi",
    legalBasis:
      "Pasal 1320 & 1338 KUHPerdata (Asas Kepatutan & Keseimbangan) jo. Perda Ketenagakerjaan & SE Menaker",
    explanation:
      "Penahanan dokumen negara asli (Ijazah, Akta, KTP, BPKB) tanpa dasar jaminan kebendaan yang sah menempatkan pekerja dalam posisi tidak seimbang dan berpotensi menghambat hak konstitusional warga untuk mencari penghidupan (Pasal 27 ayat 2 UUD 1945).",
    recommendedRevision:
      "Pihak Pertama hanya berhak melakukan verifikasi kesesuaian Ijazah asli pada saat rekrutmen dan menyimpan salinan (fotokopi/scan) yang telah dilegalisasi, sedangkan dokumen asli dikembalikan kepada Pihak Kedua.",
  },
  {
    id: "rule-pkwt-no-compensation",
    domains: ["pkwt_labor"],
    keywords: [
      /tidak\s+berhak.*kompensasi/i,
      /tanpa\s+uang\s+kompensasi/i,
      /menolak\s+tuntutan\s+pesangon/i,
      /melepaskan\s+hak.*kompensasi/i,
    ],
    title: "Peniadaan Hak Uang Kompensasi Berakhirnya PKWT",
    severity: "high_risk",
    severityLabel: "Batal Demi Hukum",
    legalBasis:
      "Pasal 61A UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023 & Pasal 15 PP No. 35 Tahun 2021",
    explanation:
      "Pengusaha wajib memberikan uang kompensasi kepada pekerja PKWT yang telah mempunyai masa kerja paling sedikit 1 (satu) bulan secara terus-menerus. Pelepasan hak normatif di bawah standar undang-undang tidak sah secara hukum.",
    recommendedRevision:
      "Pada saat berakhirnya jangka waktu PKWT, Pihak Pertama wajib membayarkan Uang Kompensasi kepada Pihak Kedua sesuai perhitungan Pasal 15 dan Pasal 16 Peraturan Pemerintah Nomor 35 Tahun 2021.",
  },
  {
    id: "rule-pkwt-disproportionate-penalty",
    domains: ["pkwt_labor"],
    keywords: [
      /denda\s+penalti/i,
      /penalti\s+sebesar/i,
      /mengundurkan\s+diri.*denda/i,
      /wajib\s+membayar\s+denda.*kali\s+gaji/i,
    ],
    title: "Denda Penalti Pengunduran Diri Sepihak yang Tidak Seimbang",
    severity: "warning",
    severityLabel: "Perlu Negosiasi",
    legalBasis:
      "Pasal 62 UU No. 13 Tahun 2003 tentang Ketenagakerjaan & Asas Proporsionalitas KUHPerdata",
    explanation:
      "Pasal 62 UU Ketenagakerjaan mengatur bahwa ganti rugi pengakhiran PKWT berlaku timbal balik sebesar sisa upah sampai batas waktu berakhirnya perjanjian, bukan denda sepihak berkali-kali lipat yang hanya membebani pekerja.",
    recommendedRevision:
      "Apabila salah satu pihak mengakhiri hubungan kerja sebelum berakhirnya jangka waktu PKWT, penyelesaian hak dan kewajiban dilakukan secara proporsional sesuai ketentuan Pasal 62 UU No. 13 Tahun 2003 dengan pemberitahuan tertulis minimal 30 hari sebelumnya.",
  },
  {
    id: "rule-labor-unpaid-overtime",
    domains: ["pkwt_labor"],
    keywords: [
      /lembur.*tidak\s+dibayar/i,
      /tanpa\s+upah\s+lembur/i,
      /bersedia\s+bekerja\s+melebihi\s+jam\s+kerja\s+tanpa/i,
    ],
    title: "Kewajiban Kerja Lembur Tanpa Perhitungan Upah Lembur",
    severity: "high_risk",
    severityLabel: "Melanggar Hak Normatif",
    legalBasis:
      "Pasal 78 ayat (2) UU No. 13 Tahun 2003 jo. Pasal 26 & 31 PP No. 35 Tahun 2021",
    explanation:
      "Pengusaha yang mempekerjakan pekerja melebihi waktu kerja standar (7 jam/hari atau 40 jam/minggu) wajib membayar upah kerja lembur kecuali untuk jabatan tertentu level pemikir/eksekutif dengan kompensasi upah lebih tinggi.",
    recommendedRevision:
      "Setiap penugasan kerja yang melebihi jam kerja normal (40 jam seminggu) dilakukan atas persetujuan tertulis dan diperhitungkan sebagai jam kerja lembur sesuai tarif Pasal 31 PP No. 35 Tahun 2021.",
  },
  {
    id: "rule-tenancy-arbitrary-deposit",
    domains: ["tenancy_lease"],
    keywords: [
      /deposit.*hangus\s+sepihak/i,
      /uang\s+jaminan.*tidak\s+dikembalikan/i,
      /pemotongan\s+deposit\s+tanpa\s+rincian/i,
      /deposit\s+menjadi\s+hak\s+penuh\s+pemilik/i,
    ],
    title: "Penahanan / Penghangusan Uang Deposit Sewa Tanpa Rincian Kerusakan",
    severity: "warning",
    severityLabel: "Perlu Negosiasi",
    legalBasis:
      "Pasal 1338 ayat (3) KUHPerdata (Asas Iktikad Baik) & Pasal 1560 KUHPerdata",
    explanation:
      "Uang jaminan (security deposit) bertujuan menutup tunggakan utilitas atau kerusakan fisik nyata di luar keausan wajar (normal wear and tear). Pemotongan tanpa bukti kwitansi perbaikan melanggar asas iktikad baik.",
    recommendedRevision:
      "Uang jaminan sewa (deposit) wajib dikembalikan selambat-lambatnya 7 (tujuh) hari kalender setelah serah terima kunci, dikurangi hanya biaya perbaikan kerusakan nyata yang dibuktikan dengan nota/rincian tertulis.",
  },
  {
    id: "rule-tenancy-structural-repair",
    domains: ["tenancy_lease"],
    keywords: [
      /segala\s+kerusakan\s+bangunan.*tanggung\s+jawab\s+penyewa/i,
      /kebocoran\s+atap.*ditanggung\s+penyewa/i,
      /kerusakan\s+struktur.*beban\s+penyewa/i,
    ],
    title: "Pengalihan Beban Perbaikan Struktur Bangunan kepada Penyewa",
    severity: "warning",
    severityLabel: "Perlu Negosiasi",
    legalBasis:
      "Pasal 1551 & Pasal 1583 Kitab Undang-Undang Hukum Perdata (KUHPerdata)",
    explanation:
      "Menurut Pasal 1551 dan 1583 KUHPerdata, pemilik properti wajib memelihara barang yang disewakan agar tetap layak huni (termasuk perbaikan besar/struktur), sedangkan penyewa hanya menanggung perbaikan kecil harian.",
    recommendedRevision:
      "Perbaikan kecil harian menjadi tanggung jawab Penyewa, sedangkan perbaikan struktural bangunan (atap bocor utama, pipa induk, struktur dinding) tetap menjadi tanggung jawab Pemilik.",
  },
  {
    id: "rule-loan-contact-scraping",
    domains: ["loan_service"],
    keywords: [
      /mengakses\s+seluruh\s+kontak/i,
      /akses\s+galeri\s+foto/i,
      /menyebarkan\s+data.*kontak\s+darurat/i,
      /menghubungi\s+daftar\s+kontak/i,
    ],
    title: "Izin Akses Daftar Kontak / Galeri Pribadi untuk Penagihan",
    severity: "high_risk",
    severityLabel: "Melanggar UU PDP & POJK",
    legalBasis:
      "Pasal 20 & 65 UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) jo. POJK No. 10/POJK.05/2022",
    explanation:
      "Penyelenggara layanan pinjaman hanya diizinkan mengakses Kamera, Mikrofon, dan Lokasi (Camilan). Pengambilan daftar kontak telepon dan penyebaran data pribadi kepada pihak ketiga dilarang keras dan diancam pidana.",
    recommendedRevision:
      "Hapus klausul pemberian akses buku telepon/galeri foto. Penagihan hanya dilakukan secara langsung kepada Debitur melalui saluran komunikasi resmi yang terdaftar.",
  },
  {
    id: "rule-consumer-exoneration",
    domains: ["pkwt_labor", "tenancy_lease", "loan_service"],
    keywords: [
      /dilarang\s+mengajukan\s+tuntutan\s+hukum/i,
      /melepaskan\s+hak\s+untuk\s+menggugat/i,
      /tidak\s+dapat\s+dituntut\s+secara\s+perdata\s+maupun\s+pidana/i,
      /tunduk\s+sepenuhnya\s+pada\s+aturan\s+baru.*sepihak/i,
    ],
    title: "Klausul Eksonerasi / Pelepasan Hak Upaya Hukum Warga",
    severity: "high_risk",
    severityLabel: "Batal Demi Hukum",
    legalBasis:
      "Pasal 18 ayat (1) & (3) UU No. 8 Tahun 1999 tentang Perlindungan Konsumen jo. Pasal 1337 KUHPerdata",
    explanation:
      "Setiap klausul baku yang menyatakan pengalihan tanggung jawab pelaku usaha atau membatasi hak hukum warga untuk menempuh penyelesaian sengketa melalui badan peradilan dinyatakan batal demi hukum.",
    recommendedRevision:
      "Apabila timbul perselisihan dari perjanjian ini, Para Pihak sepakat menyelesaikannya terlebih dahulu secara musyawarah untuk mufakat, dan apabila tidak tercapai sepakat maka diselesaikan melalui jalur hukum yang berlaku.",
  },
];

function extractMatchingSentence(text: string, regexes: RegExp[]): string {
  const blocks = text
    .split(/\n+|(?<=[.!?])\s+/)
    .map((b) => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    if (regexes.some((rx) => rx.test(block))) {
      return block.length > 260 ? `${block.slice(0, 257)}...` : block;
    }
  }
  return text.slice(0, 200).trim();
}

export function analyzeContractClauses(
  contractType: ContractDomainType,
  contractText: string
): ContractAuditResult {
  const normalized = contractText.trim();
  const findings: ContractClauseFinding[] = [];

  for (const rule of STATUTORY_CLAUSE_RULES) {
    if (!rule.domains.includes(contractType)) continue;
    const isMatched = rule.keywords.some((rx) => rx.test(normalized));
    if (isMatched) {
      findings.push({
        id: rule.id,
        title: rule.title,
        clauseExcerpt: extractMatchingSentence(normalized, rule.keywords),
        severity: rule.severity,
        severityLabel: rule.severityLabel,
        legalBasis: rule.legalBasis,
        explanation: rule.explanation,
        recommendedRevision: rule.recommendedRevision,
      });
    }
  }

  // Check for positive/healthy clauses in the contract
  if (
    /musyawarah\s+untuk\s+mufakat|diselesaikan\s+secara\s+musyawarah|bipartit/i.test(
      normalized
    )
  ) {
    findings.push({
      id: "safe-dispute-resolution",
      title: "Klausul Penyelesaian Sengketa melalui Musyawarah",
      clauseExcerpt: extractMatchingSentence(normalized, [
        /musyawarah/i,
        /bipartit/i,
      ]),
      severity: "safe",
      severityLabel: "Sesuai Regulasi",
      legalBasis: "Pasal 1338 KUHPerdata & UU No. 2 Tahun 2004",
      explanation:
        "Pencantuman mekanisme musyawarah mufakat sebelum menempuh jalur litigasi memberikan perlindungan prosedural yang seimbang bagi kedua belah pihak.",
      recommendedRevision:
        "Klausul ini sudah baik dan sesuai standar perjanjian yang sehat.",
    });
  }

  if (
    contractType === "pkwt_labor" &&
    /bpjs\s+ketenagakerjaan|bpjs\s+kesehatan|jaminan\s+sosial/i.test(normalized)
  ) {
    findings.push({
      id: "safe-bpjs-coverage",
      title: "Jaminan Sosial Ketenagakerjaan & Kesehatan (BPJS)",
      clauseExcerpt: extractMatchingSentence(normalized, [/bpjs|jaminan\s+sosial/i]),
      severity: "safe",
      severityLabel: "Sesuai Regulasi",
      legalBasis: "UU No. 24 Tahun 2011 tentang Badan Penyelenggara Jaminan Sosial",
      explanation:
        "Pendaftaran pekerja ke dalam program jaminan sosial merupakan kewajiban normatif pemberi kerja yang melindungi pekerja dari risiko kerja.",
      recommendedRevision:
        "Klausul ini sudah sesuai dengan ketentuan perundang-undangan.",
    });
  }

  // Fallback if no specific red-flag pattern matched
  if (findings.length === 0) {
    findings.push({
      id: "safe-general-review",
      title: "Tidak Ditemukan Klausul Terlarang secara Eksplisit",
      clauseExcerpt: normalized.slice(0, 220),
      severity: "safe",
      severityLabel: "Wajar / Perlu Ketelitian",
      legalBasis: "Pasal 1320 & Pasal 1338 Kitab Undang-Undang Hukum Perdata",
      explanation:
        "Pada teks yang dimasukkan tidak terdeteksi frasa penahanan ijazah, masa percobaan PKWT, atau klausul eksonerasi sepihak. Pastikan nilai hak, tanggal berakhir kontrak, dan kewajiban masing-masing pihak tertulis jelas.",
      recommendedRevision:
        "Pastikan setiap hak pembayaran, jangka waktu kontrak, dan mekanisme pengakhiran perjanjian tertulis secara spesifik dalam angka dan tanggal.",
    });
  }

  const highRiskCount = findings.filter((f) => f.severity === "high_risk").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const safeCount = findings.filter((f) => f.severity === "safe").length;

  const overallRisk =
    highRiskCount > 0 ? "high_risk" : warningCount > 0 ? "warning" : "safe";

  const overallRiskLabel =
    overallRisk === "high_risk"
      ? "Berisiko Tinggi — Terdapat Klausul Batal Demi Hukum / Melanggar UU"
      : overallRisk === "warning"
        ? "Perlu Negosiasi — Terdapat Klausul Timpang yang Merugikan"
        : "Relatif Aman — Klausul Pokok Sesuai Koridor Hukum";

  const summaryText =
    highRiskCount > 0
      ? `Ditemukan ${highRiskCount} klausul berisiko tinggi dan ${warningCount} klausul yang perlu dinegosiasikan. Jangan menandatangani draf ini sebelum mengajukan revisi tertulis atas poin yang bertentangan dengan undang-undang.`
      : warningCount > 0
        ? `Ditemukan ${warningCount} klausul yang memberatkan salah satu pihak. Gunakan draf kalimat revisi di bawah ini untuk bernegosiasi sebelum penandatanganan.`
        : `Tidak ditemukan klausul yang secara terang-terangan melanggar larangan undang-undang. Tetap periksa kejelasan nominal, jadwal, dan identitas para pihak.`;

  return {
    contractType,
    contractTypeLabel: CONTRACT_DOMAIN_LABELS[contractType],
    overallRisk,
    overallRiskLabel,
    highRiskCount,
    warningCount,
    safeCount,
    summaryText,
    findings,
    analyzedAt: new Date().toISOString(),
  };
}

export const SAMPLE_CONTRACTS: Record<
  ContractDomainType,
  { title: string; text: string }
> = {
  pkwt_labor: {
    title: "Contoh Draf Kontrak Kerja PKWT Bermasalah",
    text: `PASAL 2 - MASA PERCOBAAN DAN JANGKA WAKTU KONTRAK
1. Pihak Kedua dipekerjakan dengan status Perjanjian Kerja Waktu Tertentu (PKWT) selama 12 (dua belas) bulan.
2. Pihak Kedua wajib menjalani masa percobaan (probation) selama 3 (tiga) bulan pertama sejak tanggal efektif bekerja.

PASAL 4 - JAMINAN DOKUMEN DAN PENALTI
1. Selama masa kontrak berlangsung, Pihak Kedua wajib menyerahkan Ijazah asli pendidikan terakhir kepada HRD Pihak Pertama sebagai jaminan kerja.
2. Apabila Pihak Kedua mengundurkan diri sebelum masa kontrak berakhir karena alasan apa pun, Pihak Kedua wajib membayar denda penalti sebesar 5 (lima) kali gaji bulanan secara tunai.

PASAL 7 - JAM KERJA DAN PENGAKHIRAN HUBUNGAN KERJA
1. Pihak Kedua bersedia bekerja melebihi jam kerja normal sesuai kebutuhan operasional tanpa upah lembur tambahan.
2. Apabila masa kontrak PKWT berakhir, Pihak Kedua menyatakan tidak berhak menuntut uang kompensasi PKWT dalam bentuk apa pun dan melepaskan hak untuk menggugat Pihak Pertama.
3. Pihak Kedua didaftarkan dalam program BPJS Ketenagakerjaan dan BPJS Kesehatan sesuai ketentuan yang berlaku.`,
  },
  tenancy_lease: {
    title: "Contoh Perjanjian Sewa Rumah / Kontrakan Bermasalah",
    text: `PASAL 3 - UANG JAMINAN (SECURITY DEPOSIT)
1. Penyewa menyerahkan uang jaminan (deposit) sebesar Rp 4.000.000 kepada Pemilik pada saat penandatanganan perjanjian ini.
2. Pemilik berhak melakukan pemotongan deposit tanpa rincian apabila menurut penilaian pribadi Pemilik kondisi kamar kurang bersih saat masa sewa berakhir.

PASAL 5 - PEMELIHARAAN DAN KERUSAKAN BANGUNAN
1. Segala kerusakan bangunan termasuk kebocoran atap utama, keretakan dinding struktur, dan kerusakan saluran pipa induk menjadi tanggung jawab Penyewa sepenuhnya.
2. Pemilik berhak menaikkan tarif sewa sewaktu-waktu dan Penyewa tunduk sepenuhnya pada aturan baru secara sepihak tanpa hak keberatan.
3. Apabila timbul perselisihan, kedua belah pihak mengutamakan penyelesaian secara musyawarah untuk mufakat.`,
  },
  loan_service: {
    title: "Contoh Perjanjian Pinjaman / Layanan Digital Bermasalah",
    text: `PASAL 4 - PERSETUJUAN AKSES DATA PRIBADI DAN PENAGIHAN
1. Dengan menyetujui syarat layanan ini, Peminjam memberikan izin kepada Pemberi Pinjaman untuk mengakses seluruh kontak telepon dan akses galeri foto di perangkat seluler Peminjam.
2. Apabila terjadi keterlambatan pembayaran lebih dari 3 hari, Pemberi Pinjaman berhak menghubungi daftar kontak di ponsel Peminjam untuk membantu penagihan.

PASAL 8 - PELEPASAN TUNTUTAN HUKUM
1. Peminjam dengan ini melepaskan hak untuk menggugat dan menyatakan bahwa Pemberi Pinjaman tidak dapat dituntut secara perdata maupun pidana atas segala tindakan penagihan yang dilakukan.`,
  },
};
