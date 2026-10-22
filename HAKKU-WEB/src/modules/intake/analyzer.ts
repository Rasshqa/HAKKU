import {
  CaseCategory,
  ClarifyingQuestion,
  IntakeAnalysisResult,
  UrgencyLevel,
  ExtractedEntities,
  ScopeAssessment,
} from "./types";

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  labor: "Ketenagakerjaan & Hubungan Kerja",
  consumer_digital: "Transaksi Digital & Perlindungan Konsumen",
  tenancy_contract: "Sewa Menyewa & Perjanjian Kontrak",
  finance_loans: "Pinjaman & Layanan Keuangan",
  family_inheritance: "Hukum Keluarga & Waris",
  property_land: "Pertanahan & Properti",
  general_dispute: "Sengketa Perdata & Kerugian Umum",
};

// Sinyal kedaruratan / ancaman keselamatan fisik
const SAFETY_TRIGGERS = [
  "ancaman bunuh",
  "diancam dibunuh",
  "dipukul",
  "pemukulan",
  "aniaya",
  "penganiayaan",
  "kdrt",
  "kekerasan fisik",
  "disekap",
  "penyekapan",
  "diculik",
  "pelecehan fisik",
  "ancaman senjata",
  "dikejar",
  "diteror fisik",
];

// Pertanyaan klarifikasi terstruktur per kategori
const QUESTION_BANK: Record<CaseCategory, ClarifyingQuestion[]> = {
  labor: [
    {
      id: "labor_employment_status",
      category: "labor",
      question: "Apa status hubungan kerja Anda di perusahaan?",
      helperText: "Status kerja menentukan aturan hukum dan hak yang berlaku.",
      whyWeAsk: "Karyawan tetap (PKWTT), kontrak (PKWT), atau harian memiliki hak kompensasi dan pesangon yang berbeda menurut UU.",
      options: [
        "Karyawan Kontrak (PKWT)",
        "Karyawan Tetap (PKWTT)",
        "Pekerja Harian / Lepas",
        "Pekerja Magang / Outsourcing",
        "Saya tidak yakin / Tanpa kontrak tertulis",
      ],
    },
    {
      id: "labor_timeline_amount",
      category: "labor",
      question: "Berapa lama hak tersebut belum diselesaikan, dan apakah nominalnya jelas?",
      helperText: "Contoh: Sudah 2 bulan gaji tertunggak sebesar Rp 4.500.000/bulan.",
      whyWeAsk: "Memperjelas nilai kerugian konkret untuk dasar penghitungan klaim hak Anda.",
      placeholder: "Tuliskan rincian waktu dan perkiraan hak yang belum dibayarkan...",
    },
    {
      id: "labor_written_evidence",
      category: "labor",
      question: "Bukti tertulis apa saja yang Anda miliki saat ini?",
      helperText: "Pilih semua dokumen yang tersimpan pada Anda.",
      whyWeAsk: "Pembuktian dalam perselisihan hubungan industrial bergantung pada dokumen resmi.",
      options: [
        "Surat Perjanjian Kerja (Kontrak)",
        "Slip Gaji / Bukti Transfer Rekening",
        "ID Card / Surat Tugas / Presensi Kehadiran",
        "Chat / Email resmi dari HRD atau Atasan",
        "Belum ada bukti tertulis",
      ],
    },
    {
      id: "labor_prior_actions",
      category: "labor",
      question: "Langkah apa yang sudah pernah Anda tempuh dengan pihak perusahaan?",
      helperText: "Apakah sudah pernah dibicarakan langsung?",
      whyWeAsk: "Hukum mewajibkan perundingan bipartit (musyawarah kedua belah pihak) sebelum dapat mengajukan mediasi ke Disnaker.",
      options: [
        "Sudah bicara lisan, belum ada hasil",
        "Sudah kirim surat permohonan / klarifikasi tertulis",
        "Belum mengambil tindakan apapun",
        "Perusahaan menolak diajak bicara / menghindar",
      ],
    },
  ],

  consumer_digital: [
    {
      id: "consumer_transaction_date",
      category: "consumer_digital",
      question: "Kapan transaksi tersebut dilakukan dan melalui kanal apa?",
      helperText: "Misal: 3 hari lalu via transfer bank langsung / marketplace / media sosial.",
      whyWeAsk: "Batas waktu pelaporan bank (pemblokiran rekening tujuan) sangat sensitif terhadap waktu.",
      placeholder: "Sebutkan tanggal transaksi, nama platform (Instagram, Tokopedia, transfer langsung, dsb.)...",
    },
    {
      id: "consumer_loss_value",
      category: "consumer_digital",
      question: "Berapa total kerugian materi yang Anda transfer atau keluarkan?",
      helperText: "Nominal kerugian menentukan jalur tindak lanjut pengaduan.",
      whyWeAsk: "Data nominal wajib dicantumkan dalam surat tanda penerimaan laporan kepolisian atau aduan rekening.",
      placeholder: "Contoh: Rp 1.500.000 via transfer ke rekening bank...",
    },
    {
      id: "consumer_evidence",
      category: "consumer_digital",
      question: "Bukti transaksi apa saja yang berhasil Anda amankan?",
      helperText: "Pastikan tangkapan layar tidak terhapus.",
      whyWeAsk: "Bukti elektronik (bukti transfer, riwayat chat, identitas akun) adalah alat bukti sah berdasarkan UU ITE.",
      options: [
        "Bukti transfer (struk ATM / mutasi mobile banking)",
        "Tangkapan layar riwayat percakapan / chat",
        "Tautan (link) akun / nomor HP penjual / foto KTP penjual",
        "Bukti belum lengkap / riwayat chat sudah dihapus pelaku",
      ],
    },
    {
      id: "consumer_report_action",
      category: "consumer_digital",
      question: "Apakah Anda sudah melapor ke pihak bank pengirim atau platform?",
      helperText: "Langkah awal mitigasi transaksi mencurigakan.",
      whyWeAsk: "Bank penerbit rekening memiliki prosedur pembekuan sementara akun penampung jika dilaporkan segera.",
      options: [
        "Sudah lapor ke customer service bank",
        "Sudah buat aduan di platform / marketplace",
        "Sudah cek rekening di CekRekening.id",
        "Belum lapor ke pihak manapun",
      ],
    },
  ],

  tenancy_contract: [
    {
      id: "tenancy_written_agreement",
      category: "tenancy_contract",
      question: "Apakah ada perjanjian sewa tertulis atau kuitansi pembayaran?",
      helperText: "Termasuk surat perjanjian bermeterai, kwitansi, atau bukti chat kesepakatan.",
      whyWeAsk: "Pasal 1338 KUHPerdata menyatakan perjanjian yang dibuat sah berlaku sebagai undang-undang bagi kedua pihak.",
      options: [
        "Ada perjanjian kontrak tertulis lengkap",
        "Hanya ada kuitansi / bukti transfer",
        "Hanya kesepakatan lisan / chat WA",
        "Tidak ada bukti tertulis sama sekali",
      ],
    },
    {
      id: "tenancy_breach_detail",
      category: "tenancy_contract",
      question: "Klausul atau kesepakatan apa yang diingkari oleh pihak lawan?",
      helperText: "Misal: penahanan uang deposit tanpa alasan, kenaikan sewa sepihak di tengah periode, atau pemutusan fasilitas.",
      whyWeAsk: "Menentukan apakah tindakan tersebut termasuk wanprestasi (ingkar janji) atau perbuatan melawan hukum.",
      placeholder: "Jelaskan poin kesepakatan mana yang dilanggar...",
    },
    {
      id: "tenancy_communication",
      category: "tenancy_contract",
      question: "Apakah Anda sudah menyampaikan teguran atau peringatan tertulis?",
      helperText: "Dalam hukum dikenal dengan somasi atau surat peringatan.",
      whyWeAsk: "Sebelum menuntut ganti rugi, pihak yang ingkar janji umumnya perlu dinyatakan lalai terlebih dahulu.",
      options: [
        "Sudah kirim surat teguran tertulis / somasi",
        "Baru komunikasi lisan / pesan singkat",
        "Pihak lawan menolak berkomunikasi",
        "Belum memberi teguran",
      ],
    },
  ],

  finance_loans: [
    {
      id: "loan_platform_legal_status",
      category: "finance_loans",
      question: "Apakah aplikasi atau lembaga pinjaman tersebut terdaftar resmi di OJK?",
      helperText: "Layanan legal terikat aturan etika penagihan OJK, sedangkan pinjol ilegal merupakan tindak pidana siber.",
      whyWeAsk: "Perlakuan hukum dan saluran pengaduan berbeda secara mendasar antara pinjol legal vs ilegal.",
      options: [
        "Terdaftar resmi di OJK (Pinjol Legal)",
        "Tidak terdaftar / Ilegal / Tidak jelas",
        "Pinjaman perorangan / rentenir",
        "Saya tidak tahu statusnya",
      ],
    },
    {
      id: "loan_intimidation_tactics",
      category: "finance_loans",
      question: "Bentuk penagihan atau masalah apa yang sedang Anda hadapi?",
      helperText: "Penagihan kasar, penyebaran data kontak pribadi, manipulasi bunga, dsb.",
      whyWeAsk: "Penyebaran data pribadi melanggar UU Pelindungan Data Pribadi (UU PDP) dan UU ITE.",
      options: [
        "Ancaman / intimidasi kata-kata kasar via telepon/chat",
        "Penyebaran data pribadi ke kontak darurat / media sosial",
        "Bunga dan denda melonjak tidak wajar di luar kesepakatan",
        "Penagihan fisik ke rumah atau tempat kerja",
      ],
    },
    {
      id: "loan_evidence_stored",
      category: "finance_loans",
      question: "Apakah Anda menyimpan rekaman, tangkapan layar ancaman, dan bukti pembayaran?",
      helperText: "Simpan semua bukti nomor penagih dan isi pesan.",
      whyWeAsk: "Diperlukan untuk pelaporan ke Satgas PASTI OJK dan Patroli Siber Polri.",
      options: [
        "Semua tangkapan layar chat & rekaman suara tersimpan",
        "Hanya sebagian bukti yang tersimpan",
        "Belum sempat mendokumentasikan bukti",
      ],
    },
  ],

  family_inheritance: [
    {
      id: "family_dispute_subject",
      category: "family_inheritance",
      question: "Apa objek atau pokok utama sengketa dalam keluarga ini?",
      helperText: "Misal: pembagian harta waris, penetapan hak asuh anak, atau pengesahan pernikahan.",
      whyWeAsk: "Menentukan apakah perkara tunduk pada yurisdiksi Pengadilan Agama (bagi muslim) atau Pengadilan Negeri.",
      placeholder: "Jelaskan objek atau pokok masalah keluarga ini...",
    },
    {
      id: "family_legal_documents",
      category: "family_inheritance",
      question: "Dokumen keperdataan apa saja yang tersedia?",
      helperText: "Akta kelahiran, buku nikah, surat kematian, surat keterangan ahli waris, surat wasiat, dsb.",
      whyWeAsk: "Keabsahan hubungan nasab dan waris bergantung pada dokumen pencatatan sipil resmi.",
      options: [
        "Buku Nikah / Akta Perkawinan lengkap",
        "Akta Kelahiran / Kartu Keluarga lengkap",
        "Surat Kematian & Keterangan Ahli Waris ada",
        "Dokumen belum lengkap / ditahan salah satu pihak",
      ],
    },
    {
      id: "family_mediation_effort",
      category: "family_inheritance",
      question: "Apakah sudah pernah diupayakan mediasi keluarga atau tokoh masyarakat?",
      helperText: "Musyawarah kekeluargaan selalu menjadi prioritas utama hukum keluarga.",
      whyWeAsk: "Mediasi non-litigasi yang didokumentasikan mempermudah penyelesaian tanpa biaya sidang berkepanjangan.",
      options: [
        "Sudah musyawarah tapi menemui jalan buntu",
        "Belum pernah musyawarah resmi",
        "Salah satu pihak menolak diajak bicara",
      ],
    },
  ],

  property_land: [
    {
      id: "property_land_title",
      category: "property_land",
      question: "Apa status alas hak kepemilikan tanah/properti tersebut?",
      helperText: "Contoh: Sertifikat Hak Milik (SHM), Hak Guna Bangunan (HGB), Girik/Letter C, atau Akta Jual Beli (AJB).",
      whyWeAsk: "Kekuatan pembuktian kepemilikan tanah diatur secara ketat dalam UUPA No. 5/1960.",
      options: [
        "Sertifikat Hak Milik (SHM) atas nama sendiri / keluarga",
        "Sertifikat HGB / Hak Pakai",
        "Girik / Letter C / Petok D",
        "Akta Jual Beli (AJB) Notaris/PPAT",
        "Hanya kuitansi jual beli / tidak ada surat",
      ],
    },
    {
      id: "property_dispute_party",
      category: "property_land",
      question: "Siapa pihak lawan yang bersengketa dan apa tindakan mereka?",
      helperText: "Tetangga, pengembang, keluarga, atau pihak yang mengaku pemilik.",
      whyWeAsk: "Menentukan apakah sengketa berupa perdata batas tanah atau dugaan penyerobotan lahan (pidana).",
      placeholder: "Jelaskan siapa yang mengklaim dan apa yang dilakukan (misal mematok tanah, membangun tanpa izin)...",
    },
  ],

  general_dispute: [
    {
      id: "general_chronology_time",
      category: "general_dispute",
      question: "Kapan peristiwa tersebut terjadi dan di mana lokasi kejadiannya?",
      helperText: "Mengetahui rentang waktu dan yurisdiksi daerah.",
      whyWeAsk: "Setiap perkara hukum memiliki yurisdiksi pengadilan dan batas kedaluwarsa (daluwarsa) tertentu.",
      placeholder: "Tuliskan perkiraan waktu kejadian dan kota/kabupaten...",
    },
    {
      id: "general_damage_loss",
      category: "general_dispute",
      question: "Berapa kerugian materi atau imateriil yang Anda alami?",
      helperText: "Bentuk kerugian berupa uang, barang yang rusak, atau hilangnya kesempatan.",
      whyWeAsk: "Pasal 1365 KUHPerdata mensyaratkan adanya kerugian nyata yang dapat dibuktikan akibat perbuatan pihak lain.",
      placeholder: "Rincikan perkiraan kerugian yang ditimbulkan...",
    },
    {
      id: "general_parties_evidence",
      category: "general_dispute",
      question: "Apakah Anda mengetahui identitas lengkap pihak lawan dan memiliki bukti?",
      helperText: "Nama, nomor kontak, saksi, dokumen, foto kejadian.",
      whyWeAsk: "Tuntutan hukum tidak dapat diajukan kepada pihak yang identitasnya tidak jelas (*error in persona*).",
      options: [
        "Identitas pihak lawan diketahui jelas dan ada bukti pendukung",
        "Hanya kenal sebagian / hanya nomor telepon/rekening",
        "Identitas pihak lawan tidak diketahui sama sekali",
      ],
    },
  ],
};

/**
 * Menganalisis cerita pengguna untuk mendeteksi:
 * 1. Urgensi keselamatan (Physical Danger / Violence / KDRT)
 * 2. Kategori hukum dominan
 * 3. Pertanyaan klarifikasi yang disesuaikan
 */
export function analyzeUserStory(story: string): IntakeAnalysisResult {
  const normalized = story.toLowerCase();

  // 1. Cek Sinyal Keselamatan
  const hasSafetyTrigger = SAFETY_TRIGGERS.some((trigger) =>
    normalized.includes(trigger)
  );

  let urgencyLevel: UrgencyLevel = "normal";
  let safetyWarning: IntakeAnalysisResult["safetyWarning"] = undefined;

  if (hasSafetyTrigger) {
    urgencyLevel = "urgent_safety";
    safetyWarning = {
      title: "Peringatan Keselamatan Fisik & Situasi Darurat",
      description:
        "Cerita Anda mengindikasikan adanya potensi ancaman fisik, kekerasan, atau situasi darurat. Keselamatan Anda adalah prioritas mutlak. Jangan menunggu konsultasi hukum biasa jika berada dalam ancaman langsung.",
      recommendedHelplines: [
        {
          name: "Panggilan Darurat Kepolisian RI",
          contact: "110",
          description: "Layanan tanggap darurat kepolisian 24 jam bebas pulsa.",
        },
        {
          name: "Layanan Sahabat Perempuan dan Anak (SAPA KemenPPPA)",
          contact: "Hotline 129 / WhatsApp 08111-129-129",
          description: "Pendampingan khusus korban kekerasan perempuan & anak / KDRT.",
        },
        {
          name: "Lembaga Perlindungan Saksi dan Korban (LPSK)",
          contact: "Hotline 148 / WhatsApp 0857-7001-0048",
          description: "Permohonan perlindungan bagi saksi dan korban tindak pidana terancam.",
        },
      ],
    };
  }

  // 2. Deteksi Kategori Hukum
  const keywordsMap: Record<CaseCategory, string[]> = {
    labor: [
      "gaji", "upah", "phk", "pesangon", "lembur", "kerja", "perusahaan",
      "atasan", "hrd", "ijazah", "karyawan", "buruh", "kontrak kerja",
      "pkwtt", "pkwt", "dirumahkan", "pemecatan", "dipecat", "pecat",
      "diberhentikan", "resign", "bos", "manajer", "supervisor",
      "gaji pokok", "cuti", "skorsing", "mutasi", "demosi",
      "surat peringatan", "tenaga kerja", "sp1", "sp2", "sp3",
      "outsourcing", "magang", "probation", "masa percobaan",
    ],
    consumer_digital: [
      "penipuan", "transfer", "toko online", "marketplace", "instagram",
      "rekening", "barang tidak dikirim", "olshop", "resi", "belanja online",
      "e-commerce", "diblokir", "seller", "pembelian",
    ],
    finance_loans: [
      "pinjol", "pinjaman online", "debt collector", "dc", "bunga", "teror",
      "kontak darurat", "sebar data", "penagih", "rentenir", "utang piutang",
      "ojk", "aplikasi pinjaman",
    ],
    tenancy_contract: [
      "sewa", "kontrakan", "kos", "deposit", "uang jaminan", "pemilik",
      "penyewa", "kontrak rumah", "ruko", "pengusiran", "perjanjian sewa",
    ],
    family_inheritance: [
      "waris", "warisan", "ahli waris", "cerai", "perceraian", "nafkah",
      "hak asuh", "gono gini", "harta bersama", "wasiat", "nikah siri",
    ],
    property_land: [
      "tanah", "sertifikat", "shm", "hgb", "girik", "patok", "batas tanah",
      "lahan", "sengketa tanah", "bangunan liar", "notaris", "ajb",
    ],
    general_dispute: [
      "rugi", "kerugian", "ingkar janji", "rusak", "perjanjian",
      "uang saya", "ganti rugi", "perbuatan melawan hukum",
    ],
  };

  const detectedKeywords: string[] = [];
  const scoreMap: Record<CaseCategory, number> = {
    labor: 0,
    consumer_digital: 0,
    tenancy_contract: 0,
    finance_loans: 0,
    family_inheritance: 0,
    property_land: 0,
    general_dispute: 0,
  };

  (Object.keys(keywordsMap) as CaseCategory[]).forEach((cat) => {
    keywordsMap[cat].forEach((keyword) => {
      if (normalized.includes(keyword)) {
        scoreMap[cat] += 1;
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
      }
    });
  });

  // Tentukan kategori dengan skor tertinggi
  let selectedCategory: CaseCategory = "general_dispute";
  let maxScore = 0;

  (Object.keys(scoreMap) as CaseCategory[]).forEach((cat) => {
    if (scoreMap[cat] > maxScore) {
      maxScore = scoreMap[cat];
      selectedCategory = cat;
    }
  });

  // 3. Ekstraksi Entitas Spesifik dari Cerita (Nominal, Pihak, Platform, Waktu)
  const extractedEntities = extractEntitiesFromStory(story, normalized);

  // 4. Evaluasi Cakupan Perkara (Scope Assessment: Hukum vs Non-Hukum vs Ilegal)
  const scopeAssessment = evaluateScopeAssessment(story, maxScore, normalized, detectedKeywords);

  // 5. Susun Pertanyaan Klarifikasi Dinamis & Terpersonalisasi
  const suggestedQuestions = buildTailoredQuestions(
    selectedCategory,
    extractedEntities,
    scopeAssessment
  );

  return {
    category: selectedCategory,
    categoryLabel: CATEGORY_LABELS[selectedCategory],
    urgencyLevel,
    safetyWarning,
    detectedKeywords,
    suggestedQuestions,
    scopeAssessment,
    extractedEntities,
  };
}

/**
 * Ekstraksi entitas faktual spesifik yang disebutkan pengguna dalam ceritanya
 */
function extractEntitiesFromStory(story: string, normalized: string): ExtractedEntities {
  // 1. Nominal Uang
  const moneyMatch = story.match(/(?:rp\.?\s*[\d\.,]+|\b\d+\s*(?:juta|ribu|miliar|jt|rb)\b)/i);

  // 2. Platform Digital
  let platformName: string | undefined;
  if (/instagram|\big\b/i.test(normalized)) platformName = "Instagram";
  else if (/shopee/i.test(normalized)) platformName = "Shopee";
  else if (/tokopedia/i.test(normalized)) platformName = "Tokopedia";
  else if (/tiktok/i.test(normalized)) platformName = "TikTok Shop";
  else if (/whatsapp|\bwa\b/i.test(normalized)) platformName = "WhatsApp";
  else if (/telegram/i.test(normalized)) platformName = "Telegram";
  else if (/facebook|\bfb\b/i.test(normalized)) platformName = "Facebook";

  // 3. Nama Pihak Lawan
  let counterpartyName: string | undefined;
  const ptMatch = story.match(/\b(pt|cv|toko)\s+([a-zA-Z0-9\s]{2,25})/i);
  if (ptMatch) {
    counterpartyName = ptMatch[0].trim();
  } else if (/hrd|atasan|bos/i.test(normalized)) {
    counterpartyName = "Pihak Manajemen / HRD";
  } else if (/pemilik kos|pemilik kontrakan/i.test(normalized)) {
    counterpartyName = "Pemilik Sewa / Kos";
  } else if (/penjual|seller/i.test(normalized)) {
    counterpartyName = "Pihak Penjual";
  }

  // 4. Rentang Waktu
  const timeMatch = story.match(/(?:\b\d+\s*(?:hari|minggu|bulan|tahun)\b|kemarin|minggu lalu|bulan lalu|tadi pagi)/i);

  // 5. Objek Sengketa Spesifik
  let disputedItem: string | undefined;
  if (/ijazah/i.test(normalized)) disputedItem = "Ijazah Asli";
  else if (/deposit|uang jaminan/i.test(normalized)) disputedItem = "Uang Deposit Jaminan";
  else if (/pesangon/i.test(normalized)) disputedItem = "Uang Pesangon / UPMK";
  else if (/lembur/i.test(normalized)) disputedItem = "Upah Lembur";
  else if (/sertifikat/i.test(normalized)) disputedItem = "Sertifikat Tanah / Bangunan";
  else if (/barang|paket/i.test(normalized)) disputedItem = "Barang Pesanan";

  // 6. Indikasi Pemecatan / PHK Sepihak
  const isTermination = /dipecat|pecat|phk|pemecatan|diberhentikan|dirumahkan/i.test(normalized);

  return {
    monetaryAmount: moneyMatch ? moneyMatch[0].trim() : undefined,
    counterpartyName,
    platformName,
    timeframe: timeMatch ? timeMatch[0].trim() : undefined,
    disputedItem,
    isTermination,
  };
}

const ILLEGAL_INTENT_KEYWORDS = [
  "meretas", "hack", "membobol", "memalsukan ktp", "memalsukan ijazah",
  "slip gaji palsu", "bikin ktp palsu", "curi data", "mencuri data",
  "sadap wa", "menyadap", "kabur dari utang", "kabur dari pinjol",
  "menipu balik", "bobol rekening", "palsukan surat",
];

const NON_LEGAL_PATTERNS = [
  /^(halo|hai|pagi|siang|malam|tes|testing|coba|asdf|123)(\s+|$)/i,
  /(resep|masak|makanan|kuliner|restoran|nasi goreng|mie ayam|makan siang)/i,
  /(pacar selingkuh|putus cinta|patah hati|galau|jomblo|mantan terindah|jodoh)/i,
  /(cuaca|hujan|panas|mendung|ramalan zodiak|horoskop)/i,
  /(film favorit|lagu enak|nonton bioskop|main game|mobile legends)/i,
];

/**
 * Menilai cakupan cerita apakah merupakan sengketa hukum sah, masalah umum/curhat, atau upaya ilegal
 */
function evaluateScopeAssessment(
  story: string,
  maxScore: number,
  normalized: string,
  detectedKeywords: string[]
): ScopeAssessment {
  // Skenario A: Indikasi Upaya Ilegal
  const isIllegal = ILLEGAL_INTENT_KEYWORDS.some((tr) => normalized.includes(tr));
  if (isIllegal) {
    return {
      status: "illegal_intent",
      headline: "Permintaan di Luar Koridor Hukum Sah",
      reason: "Cerita Anda memuat indikasi permintaan untuk melakukan peretasan, pemalsuan dokumen, atau tindakan melawan hukum lainnya.",
      guidance: "HAKKU mematuhi prinsip anti-kejahatan dan tidak memfasilitasi tindakan melawan hukum (Pasal 30-35 UU ITE No. 1/2024 & Pasal 263 KUHP). Hakki sarankan untuk menyelesaikan sengketa melalui jalur musyawarah atau advokat resmi.",
      suggestedAction: "block_illegal",
    };
  }

  // Skenario B: Belum Masuk Klasifikasi Alur Terpandu / Topik Umum
  const isNonLegalPattern = NON_LEGAL_PATTERNS.some((pat) => pat.test(normalized));
  const hasDisputeWords = /rugi|sengketa|masalah|tidak bayar|tipu|rusak|usir|ancam|ijazah|hak|kontrak|perjanjian/i.test(normalized);

  if (isNonLegalPattern || (maxScore === 0 && !hasDisputeWords)) {
    return {
      status: "non_legal",
      headline: "Belum Masuk Klasifikasi Alur Terpandu",
      reason: "Masalah yang Anda sampaikan mungkin berkaitan dengan hukum atau situasi khusus, namun belum masuk ke dalam klasifikasi perkara yang didukung Alur Terpandu 6 tahap saat ini.",
      guidance: "Alur Terpandu dioptimalkan khusus untuk sengketa ketenagakerjaan (PP 35/2021), penipuan transaksi digital (UU ITE), dan sengketa sewa menyewa. Untuk permasalahan hukum lainnya yang lebih luas atau dinamis, Anda dapat mendiskusikannya langsung di Ruang Wawancara AI bersama Hakki.",
      suggestedAction: "redirect_general",
    };
  }

  // Skenario C: Informasi Terlalu Singkat / Belum Jelas
  if (story.trim().length < 30 && maxScore <= 1 && detectedKeywords.length === 0) {
    return {
      status: "insufficient_info",
      headline: "Informasi Kasus Perlu Ditambahkan",
      reason: "Uraian masalah Anda masih sangat singkat dan belum memuat kronologi peristiwa nyata atau pihak yang terkait.",
      guidance: "Agar Hakki dapat menganalisis hak dan pasal hukum yang tepat, silakan lengkapi kronologi kejadian, siapa pihak yang terlibat, dan kerugian yang dialami.",
      suggestedAction: "clarify_scope",
    };
  }

  // Skenario D: Sengketa Hukum Sah
  return {
    status: "valid_legal_case",
    headline: "Perkara Terdeteksi Memiliki Dasar Hukum Sah",
    reason: "Fakta yang diceritakan memuat unsur perselisihan hak yang diakui regulasi hukum Republik Indonesia.",
    guidance: "Lanjutkan ke langkah klarifikasi untuk memperkuat fakta dan alat bukti pendukung Anda.",
    suggestedAction: "proceed",
  };
}

/**
 * Membangun pertanyaan klarifikasi yang disesuaikan secara personal dengan entitas yang diceritakan pengguna
 */
function buildTailoredQuestions(
  category: CaseCategory,
  entities: ExtractedEntities,
  scope: ScopeAssessment
): ClarifyingQuestion[] {
  // Jika di luar ranah hukum (non-legal), tanyakan apakah ada sengketa tersembunyi
  if (scope.status === "non_legal") {
    return [
      {
        id: "scope_non_legal_clarify",
        category: "general_dispute",
        question: "Apakah ada permasalahan hak, uang, barang, atau perjanjian yang ingin Anda konsultasikan?",
        helperText: "HAKKU fokus membantu warga dalam sengketa perdata, pidana transaksi digital, dan ketenagakerjaan.",
        whyWeAsk: "Memastikan apakah ada aspek hukum tersembunyi yang belum sempat Anda ceritakan.",
        options: [
          "Ya, ada sengketa hukum yang belum saya tulis lengkap",
          "Tidak, saya hanya bertanya informasi umum / mencoba fitur",
          "Saya ingin melihat contoh kasus yang dapat dibantu HAKKU",
        ],
      },
      {
        id: "scope_support_type",
        category: "general_dispute",
        question: "Bantuan apa yang sebenarnya paling Anda perlukan saat ini?",
        helperText: "Pilih opsi yang paling menggambarkan kebutuhan Anda.",
        whyWeAsk: "Mengarahkan Anda ke fitur atau layanan rujukan yang paling sesuai.",
        options: [
          "Informasi hak hukum & aturan perundang-undangan",
          "Konseling atau ruang curhat masalah pribadi",
          "Panduan cara menggunakan aplikasi HAKKU",
        ],
      },
    ];
  }

  // Jika indikasi tindakan ilegal, beri opsi klarifikasi itikad baik
  if (scope.status === "illegal_intent") {
    return [
      {
        id: "scope_illegal_resolution",
        category: "general_dispute",
        question: "Apakah Anda bersedia menempuh penyelesaian damai yang sah menurut hukum Indonesia?",
        helperText: "Tindakan peretasan atau pemalsuan memiliki konsekuensi pidana penjara menurut UU ITE & KUHP.",
        whyWeAsk: "HAKKU hanya memfasilitasi instrumen hukum yang sah dan diakui negara.",
        options: [
          "Ya, saya ingin menempuh musyawarah dan jalur hukum yang sah",
          "Saya ingin membatalkan dan membaca batasan etika sistem",
        ],
      },
    ];
  }

  // Jika kasus hukum sah, ambil base questions dan modifikasi secara kontekstual
  const baseQuestions = QUESTION_BANK[category] || QUESTION_BANK.general_dispute;

  return baseQuestions.map((q) => {
    // 1. Ketenagakerjaan: pemecatan / PHK sepihak atau nominal uang
    if (q.id === "labor_timeline_amount") {
      if (entities.isTermination) {
        return {
          ...q,
          question: "Apakah pemecatan ini disertai alasan tertulis resmi dari perusahaan dan surat keputusan PHK?",
          helperText: "Menurut UU No. 6/2023 jo. PP 35/2021 Pasal 37, pengusaha wajib menyampaikan pemberitahuan PHK tertulis beserta alasannya minimal 14 hari kerja sebelumnya.",
          whyWeAsk: "Pemecatan tanpa surat resmi atau berlandaskan alasan pribadi (seperti urusan personal) berpotensi melanggar hukum dan berhak ditolak secara perundingan bipartit.",
          placeholder: undefined,
          options: [
            "Pemecatan sepihak secara lisan tanpa surat resmi",
            "Diberikan Surat Peringatan (SP) atau Surat Keputusan PHK tertulis",
            "Dipaksa menandatangani surat pengunduran diri (resign)",
            "Belum ada kejelasan status resmi dari manajemen",
          ],
        };
      }
      if (entities.monetaryAmount) {
        return {
          ...q,
          question: `Apakah Anda memegang bukti tertulis (slip gaji / rekening koran) terkait hak sebesar ${entities.monetaryAmount} yang belum diselesaikan?`,
          helperText: `Menyimpan bukti tertulis atas nominal ${entities.monetaryAmount} sangat krusial dalam mediasi perundingan Bipartit.`,
        };
      }
    }

    if (q.id === "labor_written_evidence" && entities.isTermination) {
      return {
        ...q,
        question: "Bukti apa saja terkait hubungan kerja dan pemecatan yang Anda miliki saat ini?",
        helperText: "Pilih semua dokumen yang tersimpan pada Anda.",
        options: [
          "Surat Perjanjian Kerja (PKWT/PKWTT) / SK Pengangkatan",
          "Tangkapan layar chat / email pemberitahuan pemecatan",
          "Slip gaji / bukti mutasi transfer rekening bank",
          "Surat Peringatan (SP 1/2/3) atau Surat Pemutusan Hubungan Kerja",
          "Belum ada bukti tertulis (hanya penyampaian lisan)",
        ],
      };
    }

    // 2. Transaksi Digital: platform yang disebut
    if (q.id === "consumer_transaction_date" && entities.platformName) {
      return {
        ...q,
        question: `Bagaimana alur transaksi yang Anda lakukan melalui ${entities.platformName}?`,
        helperText: `Pilih apakah transaksi menggunakan fitur rekening bersama resmi ${entities.platformName} atau transfer langsung ke rekening pribadi penjual.`,
        options: [
          `Transfer langsung ke rekening pribadi penjual di luar ${entities.platformName}`,
          `Melalui sistem pembayaran resmi di dalam aplikasi ${entities.platformName}`,
          "Cash on Delivery (COD) / Bayar di tempat",
          "Top-up e-wallet / Link pembayaran yang dikirim penjual",
        ],
      };
    }

    // 3. Sewa Menyewa: deposit yang disebut
    if (q.id === "tenancy_deposit_amount" && entities.monetaryAmount) {
      return {
        ...q,
        question: `Apakah bukti transfer atau kuitansi pembayaran deposit senilai ${entities.monetaryAmount} masih tersimpan rapi?`,
        helperText: `Kuitansi deposit ${entities.monetaryAmount} adalah bukti otentik penguasaan dana titipan menurut Pasal 1365 KUHPerdata.`,
      };
    }

    // 4. Counterparty name injection
    if (entities.counterpartyName && q.id.includes("prior_actions")) {
      return {
        ...q,
        question: `Langkah musyawarah apa yang sudah pernah Anda tempuh dengan ${entities.counterpartyName}?`,
      };
    }

    return q;
  });
}

