import { CaseCategory } from "../intake/types";

export interface LegalArticle {
  articleLabel: string;
  topic: string;
  officialContent: string;
  explanation: string;
}

export interface LegalSourceItem {
  id: string;
  title: string;
  sourceType: string;
  issuer: string;
  sourceUrl: string;
  legalStatus: "verified_current" | "historical" | "needs_review";
  verifiedAt: string;
  category: CaseCategory;
  summary: string;
  articles: LegalArticle[];
  actionOptions: {
    title: string;
    rationale: string;
    preparation: string[];
    urgencyNote?: string;
  }[];
  checklist: {
    title: string;
    description: string;
    required: boolean;
  }[];
  uncertainties: string[];
}

export const VERIFIED_LEGAL_CORPUS: Record<CaseCategory, LegalSourceItem> = {
  labor: {
    id: "src_labor_ciptaker_pp36",
    title: "UU No. 13 Tahun 2003 jo. UU No. 6 Tahun 2023 (Klaster Ketenagakerjaan) & PP No. 36 Tahun 2021",
    sourceType: "Undang-Undang & Peraturan Pemerintah",
    issuer: "Pemerintah Republik Indonesia / Kemenaker",
    sourceUrl: "https://jdih.kemnaker.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-15",
    category: "labor",
    summary:
      "Peraturan ketenagakerjaan mengatur perlindungan hak normatif pekerja mencakup ketepatan pembayaran upah, uang lembur, kompensasi akhir kontrak, dan tata cara perundingan bipartit saat terjadi perselisihan.",
    articles: [
      {
        articleLabel: "PP No. 36/2021 Pasal 55 & UU 13/2003 Pasal 93",
        topic: "Kewajiban Pembayaran Upah & Denda Keterlambatan",
        officialContent:
          "Pengusaha wajib membayar upah kepada pekerja/buruh pada waktu yang telah diperjanjikan. Keterlambatan pembayaran upah dikenakan denda dengan persentase tertentu dari upah pekerja.",
        explanation:
          "Upah adalah hak mutlak pekerja atas pekerjaan yang telah dilakukan. Pengusaha yang menunda pembayaran upah tanpa dasar hukum melanggar ketentuan normatif dan dapat dikenai denda keterlambatan bertingkat.",
      },
      {
        articleLabel: "UU No. 2 Tahun 2004 Pasal 3",
        topic: "Kewajiban Musyawarah Bipartit",
        officialContent:
          "Perselisihan hubungan industrial wajib diupayakan penyelesaiannya terlebih dahulu melalui perundingan bipartit secara musyawarah untuk mencapai mufakat.",
        explanation:
          "Sebelum melapor ke Dinas Tenaga Kerja (Disnaker), pekerja dan perusahaan diwajibkan melakukan pertemuan bipartit maksimal 30 hari kerja dan membuat risalah perundingan.",
      },
      {
        articleLabel: "PP No. 35/2021 Pasal 15",
        topic: "Uang Kompensasi Pekerja Kontrak (PKWT)",
        officialContent:
          "Pengusaha wajib memberikan uang kompensasi kepada pekerja/buruh yang hubungan kerjanya berdasarkan PKWT saat berakhirnya jangka waktu kontrak.",
        explanation:
          "Pekerja kontrak yang telah bekerja minimal 1 bulan terus menerus berhak atas uang kompensasi proporsional ketika masa kontrak berakhir.",
      },
    ],
    actionOptions: [
      {
        title: "Perundingan Bipartit (Musyawarah Tertulis Internal)",
        rationale: "Syarat wajib formil sebelum mengajukan mediasi resmi ke instansi ketenagakerjaan.",
        preparation: [
          "Surat permohonan bipartit yang mencantumkan rincian hak yang tertunggak",
          "Dokumen kontrak kerja dan slip gaji atau bukti mutasi rekening",
          "Buku catatan / daftar hadir untuk risalah perundingan",
        ],
      },
      {
        title: "Pengaduan Mediasi ke Dinas Tenaga Kerja (Disnaker)",
        rationale: "Jika dalam 30 hari bipartit gagal atau perusahaan menolak berunding.",
        preparation: [
          "Bukti risalah perundingan bipartit yang buntu atau tanda terima surat bipartit yang diabaikan",
          "Identitas lengkap pekerja dan perusahaan",
          "Rincian tuntutan hak normatif secara tertulis",
        ],
      },
      {
        title: "Konsultasi ke Serikat Pekerja atau Lembaga Bantuan Hukum (LBH)",
        rationale: "Mendampingi advokasi jika terdapat intimidasi, penahanan dokumen asli (ijazah), atau pemutusan sepihak tanpa hak.",
        preparation: ["Salinan seluruh berkas korespondensi dengan atasan/HRD"],
      },
    ],
    checklist: [
      {
        title: "Simpan Surat Perjanjian Kerja (PKWT/PKWTT)",
        description: "Dokumen utama yang membuktikan adanya hubungan kerja dan besaran hak upah.",
        required: true,
      },
      {
        title: "Kumpulkan Bukti Pembayaran / Rekening Koran",
        description: "Menunjukkan histori pembayaran terakhir dan bukti bahwa hak bulan berjalan belum masuk.",
        required: true,
      },
      {
        title: "Dokumentasikan Bukti Kehadiran & Tugas Kerja",
        description: "Presensi kerja, email tugas, atau pesan penugasan dari atasan untuk membuktikan Anda aktif bekerja.",
        required: true,
      },
      {
        title: "Buat Catatan Kronologi Tertulis Tanggal Penting",
        description: "Catat tanggal masuk kerja, tanggal upah seharusnya cair, dan tanggal komunikasi dengan atasan/HRD.",
        required: true,
      },
    ],
    uncertainties: [
      "Penetapan status PKWT vs PKWTT memerlukan tinjauan langsung terhadap klausul surat perjanjian kerja.",
      "Klaim kompensasi bergantung pada verifikasi keabsahan kehadiran dan tidak adanya pemotongan sah yang telah disepakati sebelumnya.",
    ],
  },

  consumer_digital: {
    id: "src_consumer_ite_uu8",
    title: "UU No. 1 Tahun 2024 jo. UU No. 11 Tahun 2008 (UU ITE) & UU No. 8 Tahun 1999 (Perlindungan Konsumen)",
    sourceType: "Undang-Undang Republik Indonesia",
    issuer: "Pemerintah Republik Indonesia / DPR RI",
    sourceUrl: "https://jdih.kominfo.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-10",
    category: "consumer_digital",
    summary:
      "Peraturan transaksi digital dan perlindungan konsumen melindungi pembeli dari praktik penipuan, manipulasi informasi elektronik, wanprestasi penyerahan barang, serta menjamin hak pengembalian dana.",
    articles: [
      {
        articleLabel: "UU ITE Pasal 28 ayat (1) jo. Pasal 45A ayat (1)",
        topic: "Larangan Penyebaran Berita Bohong yang Merugikan Konsumen",
        officialContent:
          "Setiap orang yang dengan sengaja menyebarkan berita bohong dan menyesatkan yang mengakibatkan kerugian konsumen dalam transaksi elektronik dipidana dengan pidana penjara paling lama 6 tahun.",
        explanation:
          "Pelaku penipuan online yang memajang barang fiktif atau menerima transfer tanpa berniat mengirimkan barang dapat dipidana berdasarkan ketentuan UU ITE.",
      },
      {
        articleLabel: "KUHP Pasal 378",
        topic: "Tindak Pidana Penipuan",
        officialContent:
          "Barang siapa dengan maksud untuk menguntungkan diri sendiri atau orang lain secara melawan hukum, dengan memakai nama palsu atau martabat palsu, dengan tipu muslihat, ataupun rangkaian kebohongan, menggerakkan orang lain untuk menyerahkan barang sesuatu kepadanya, diancam karena penipuan.",
        explanation:
          "Pasal dasar penipuan umum yang digunakan oleh kepolisian dalam laporan pengaduan transaksi fiktif.",
      },
      {
        articleLabel: "UU No. 8 Tahun 1999 Pasal 4 & Pasal 7",
        topic: "Hak Konsumen & Kewajiban Pelaku Usaha",
        officialContent:
          "Konsumen berhak atas informasi yang benar, jelas, dan jujur mengenai kondisi barang/jasa, serta berhak mendapatkan kompensasi/ganti rugi apabila barang tidak sesuai kesepakatan.",
        explanation:
          "Jika transaksi terjadi dengan penjual resmi/toko, konsumen dilindungi haknya untuk menuntut penggantian barang atau pengembalian dana penuh.",
      },
    ],
    actionOptions: [
      {
        title: "Pemblokiran Rekening Pelaku via Bank Pengirim",
        rationale: "Mencegah pelaku mencairkan dana hasil transfer jika dilakukan dalam waktu cepat.",
        preparation: [
          "Bukti transfer asli (struk ATM / receipt m-banking)",
          "Surat Kronologi singkat bermeterai",
          "Nomor rekening penampung dan bank tujuan",
        ],
        urgencyNote: "Lakukan maksimal 1x24 jam sejak transaksi untuk peluang pembekuan terbesar.",
      },
      {
        title: "Pelaporan ke Portal CekRekening.id & Patroli Siber Polri",
        rationale: "Memasukkan nomor rekening dan kontak pelaku ke dalam sistem pelaporan penipuan nasional agar dibekukan oleh regulator.",
        preparation: [
          "Tangkapan layar chat dari awal sampai pemblokiran",
          "Tautan profil akun media sosial pelaku",
          "Nomor WhatsApp/kontak yang digunakan pelaku",
        ],
      },
      {
        title: "Laporan Polisi (Surat Tanda Penerimaan Laporan - STPL)",
        rationale: "Dokumen hukum resmi yang dibutuhkan bank penerima untuk proses penyitaan/pengembalian dana rekening bermasalah.",
        preparation: [
          "KTP Pelapor",
          "Cetak riwayat transfer bank",
          "Cetak bukti percakapan",
        ],
      },
    ],
    checklist: [
      {
        title: "Simpan Bukti Transfer Asli Lengkap",
        description: "Pastikan nomor referensi transaksi, waktu jam/menit, dan nama rekening tujuan tercatat jelas.",
        required: true,
      },
      {
        title: "Tangkapan Layar Riwayat Obrolan Lengkap",
        description: "Jangan hapus percakapan. Ambil tangkapan layar nomor kontak pelaku, tawaran harga, janji pengiriman, hingga pemblokiran.",
        required: true,
      },
      {
        title: "Dokumentasikan Bukti Identitas Akun Penjual",
        description: "Simpan URL akun media sosial, nomor HP, foto KTP jika pelaku sempat mengirimkan, dan riwayat resi pengiriman fiktif.",
        required: true,
      },
    ],
    uncertainties: [
      "Pengembalian uang bergantung pada apakah saldo di rekening pelaku masih tersisa saat dibekukan oleh pihak bank.",
      "Identitas pemilik rekening bank bisa jadi merupakan korban rekrutmen rekening bodong (jual beli rekening).",
    ],
  },

  tenancy_contract: {
    id: "src_tenancy_kuhperdata_buku3",
    title: "KUHPerdata Buku III (Perikatan): Pasal 1320, 1338, 1243 & 1548 s.d. 1600",
    sourceType: "Kitab Undang-Undang Hukum Perdata",
    issuer: "Kodifikasi Hukum Keperdataan Indonesia",
    sourceUrl: "https://jdihn.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-12",
    category: "tenancy_contract",
    summary:
      "Perjanjian sewa menyewa mengikat para pihak layaknya undang-undang. Pemilik berkewajiban menjamin ketenteraman penyewa, dan penyewa berkewajiban merawat serta membayar sewa sesuai kesepakatan.",
    articles: [
      {
        articleLabel: "KUHPerdata Pasal 1338",
        topic: "Asas Pacta Sunt Servanda (Kekuatan Mengikat Perjanjian)",
        officialContent:
          "Semua persetujuan yang dibuat secara sah berlaku sebagai undang-undang bagi mereka yang membuatnya. Persetujuan itu tidak dapat ditarik kembali selain dengan kesepakatan kedua belah pihak.",
        explanation:
          "Syarat yang telah disepakati dalam kontrak sewa (seperti jangka waktu dan uang deposit) tidak boleh diubah atau dibatalkan sepihak oleh pemilik maupun penyewa.",
      },
      {
        articleLabel: "KUHPerdata Pasal 1243",
        topic: "Tuntutan Ganti Rugi Akibat Wanprestasi",
        officialContent:
          "Penggantian biaya, kerugian dan bunga karena tak dipenuhinya suatu perikatan mulai diwajibkan, bila debitur, walaupun telah dinyatakan lalai, tetap lalai untuk memenuhi perikatan itu.",
        explanation:
          "Pihak yang melanggar kontrak sewa (misal menahan deposit tanpa dasar kerusakan atau memutus sewa sebelum waktu) dapat digugat ganti rugi setelah diberikan surat peringatan/somasi.",
      },
      {
        articleLabel: "KUHPerdata Pasal 1550",
        topic: "Kewajiban Pokok Pihak yang Menyewakan",
        officialContent:
          "Pihak yang menyewakan diwajibkan: 1. menyerahkan barang yang disewakan; 2. memelihara barang itu hingga dapat dipakai untuk keperluan yang dimaksudkan; 3. memberikan hak kenikmatan tenteram kepada penyewa.",
        explanation:
          "Pemilik tidak berhak mengganggu atau memutus utilitas (listrik/air) sepihak selama masa sewa masih berlaku sah.",
      },
    ],
    actionOptions: [
      {
        title: "Kirim Surat Somasi / Peringatan Tertulis Formal",
        rationale: "Menyatakan pihak lawan berada dalam keadaan lalai secara hukum sebelum tuntutan perdata diajukan.",
        preparation: [
          "Salinan kontrak sewa atau bukti percakapan kesepakatan",
          "Foto/video kondisi tempat sewa yang membuktikan tidak ada kerusakan",
          "Batas waktu tegas (misal 3 x 24 jam) untuk mengembalikan deposit atau menyelesaikan kewajiban",
        ],
      },
      {
        title: "Mediasi Bersama Pengurus Lingkungan (RT/RW/Kelurahan)",
        rationale: "Penyelesaian cepat dan hemat biaya dengan melibatkan perangkat lingkungan setempat sebagai saksi netral.",
        preparation: ["Bukti kuitansi pembayaran dan surat somasi yang telah dikirim"],
      },
      {
        title: "Gugatan Sederhana (Small Claim Court) di Pengadilan Negeri",
        rationale: "Untuk tuntutan ganti rugi materiil maksimal Rp 500 juta dengan proses cepat (maksimal 25 hari kerja) tanpa perdebatan rumit.",
        preparation: ["Perjanjian tertulis asli, bukti pembayaran, dan bukti somasi"],
      },
    ],
    checklist: [
      {
        title: "Surat Kontrak Sewa atau Kwitansi Pembayaran",
        description: "Membuktikan masa berlaku sewa dan nominal uang sewa/deposit yang telah diserahkan.",
        required: true,
      },
      {
        title: "Dokumentasi Foto/Video Kondisi Properti",
        description: "Bukti fisik saat serah terima kunci untuk membuktikan tidak ada kerusakan yang disebabkan penyewa.",
        required: true,
      },
      {
        title: "Riwayat Komunikasi / Surat Peringatan",
        description: "Tangkapan layar penolakan pihak lawan atau bukti tanda terima surat somasi.",
        required: true,
      },
    ],
    uncertainties: [
      "Jika perjanjian hanya dibuat lisan, pembuktian klausul deposit akan bergantung pada pengakuan pihak lawan dan saksi.",
      "Klaim pemotongan deposit oleh pemilik harus dibandingkan dengan klausul pemeliharaan rutin di dalam kontrak.",
    ],
  },

  finance_loans: {
    id: "src_loans_pojk10_uupdp",
    title: "POJK No. 10/POJK.05/2022 & UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)",
    sourceType: "Peraturan Otoritas Jasa Keuangan & Undang-Undang",
    issuer: "Otoritas Jasa Keuangan & Pemerintah RI",
    sourceUrl: "https://www.ojk.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-14",
    category: "finance_loans",
    summary:
      "Peraturan pinjaman daring mengatur batas etika penagihan, larangan penyebaran data pribadi ke pihak ketiga tanpa persetujuan, serta penindakan pidana terhadap pinjol ilegal oleh Satgas PASTI.",
    articles: [
      {
        articleLabel: "POJK 10/2022 & Standar Etika AFPI",
        topic: "Larangan Intimidasi & Batas Waktu Penagihan",
        officialContent:
          "Penyelenggara wajib memastikan penagihan dilakukan dengan etika, tidak menggunakan ancaman, kekerasan, atau tindakan yang bersifat mempermalukan peminjam, serta dilarang menghubungi pihak di luar kontak darurat yang disetujui.",
        explanation:
          "Penagihan yang menyebarkan data ke nomor lain di luar persetujuan atau menggunakan teror kata-kata kasar merupakan pelanggaran berat regulasi perbankan/fintech.",
      },
      {
        articleLabel: "UU PDP No. 27 Tahun 2022 Pasal 65 jo. Pasal 67",
        topic: "Pidana Penyebaran & Penyalahgunaan Data Pribadi",
        officialContent:
          "Setiap orang yang dengan sengaja dan melawan hukum memperoleh atau menyebarluaskan data pribadi yang bukan miliknya dipidana dengan pidana penjara paling lama 5 tahun.",
        explanation:
          "Debt collector atau pinjol ilegal yang mengakses daftar kontak dan menyebarkan foto atau data pribadi debitur dapat dijerat hukuman pidana penjara.",
      },
    ],
    actionOptions: [
      {
        title: "Pengaduan ke Kontak OJK 157 & Satgas PASTI",
        rationale: "Otoritas resmi yang berwenang mencabut izin fintech legal atau memblokir aplikasi/rekening pinjol ilegal.",
        preparation: [
          "Nama aplikasi pinjol yang meneror",
          "Tangkapan layar bukti ancaman / kontak penagih",
          "Bukti rekening bank yang digunakan untuk transfer",
        ],
      },
      {
        title: "Laporan Pelanggaran Data Pribadi ke Siber Polri (PatroliSiber.id)",
        rationale: "Penindakan pidana terhadap teror digital dan pencemaran nama baik via kontak darurat.",
        preparation: ["Bukti pesan teror ke keluarga/teman dan bukti nomor penagih"],
      },
    ],
    checklist: [
      {
        title: "Tangkapan Layar Seluruh Pesan Penagihan & Teror",
        description: "Simpan isi chat, nomor telepon penagih, dan jam penagihan tanpa diedit.",
        required: true,
      },
      {
        title: "Cek Status Legalitas Aplikasi di Web OJK",
        description: "Periksa apakah nama aplikasi tercantum di daftar 98+ fintech berizin resmi OJK.",
        required: true,
      },
    ],
    uncertainties: [
      "Penindakan terhadap pinjol ilegal seringkali menghadapi kendala domisili server pelaku di luar yurisdiksi Indonesia.",
    ],
  },

  family_inheritance: {
    id: "src_family_khi_kuhperdata",
    title: "Kompilasi Hukum Islam (Inpres 1/1991) & KUHPerdata Buku II (Hukum Waris)",
    sourceType: "Kompilasi Hukum Islam & KUHPerdata",
    issuer: "Mahkamah Agung RI / Pemerintah RI",
    sourceUrl: "https://mahkamahagung.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-10",
    category: "family_inheritance",
    summary:
      "Mengatur kedudukan ahli waris, pembagian harta peninggalan setelah pelunasan utang pewaris, serta hak-hak keperdataan dalam perkawinan dan pengasuhan anak.",
    articles: [
      {
        articleLabel: "KHI Pasal 171 s.d. 175 & KUHPerdata Pasal 830",
        topic: "Terbukanya Warisan & Hak Ahli Waris",
        officialContent:
          "Pewarisan hanya terjadi karena kematian. Harta peninggalan baru dapat dibagikan kepada ahli waris setelah diselesaikan kewajiban pengurusan jenazah, wasiat, dan pembayaran utang pewaris.",
        explanation:
          "Harta waris tidak boleh dikuasai atau dibagi secara sepihak oleh salah satu anak tanpa persetujuan seluruh ahli waris sah yang berhak.",
      },
    ],
    actionOptions: [
      {
        title: "Penyusunan Surat Keterangan Ahli Waris (SKAW)",
        rationale: "Dokumen otentik yang menetapkan siapa saja pihak yang sah menjadi ahli waris.",
        preparation: ["Akta Kematian, Akta Kelahiran seluruh anak, Buku Nikah Pewaris"],
      },
      {
        title: "Musyawarah Pembagian Bersama Notaris / Tokoh Agama",
        rationale: "Membuat Akta Perdamaian / Pembagian Waris secara sukarela tanpa persidangan.",
        preparation: ["Daftar inventaris harta dan sertifikat/surat kepemilikan"],
      },
    ],
    checklist: [
      {
        title: "Surat Kematian Pewaris Resmi",
        description: "Dari kelurahan atau rumah sakit yang mencatat waktu meninggalnya pewaris.",
        required: true,
      },
      {
        title: "Dokumen Kependudukan Seluruh Ahli Waris",
        description: "Kartu Keluarga dan Akta Kelahiran yang membuktikan hubungan darah.",
        required: true,
      },
    ],
    uncertainties: [
      "Yurisdiksi hukum waris di Indonesia terbagi antara Hukum Islam (PA) dan Hukum Barat/Adat (PN), tergantung agama pewaris.",
    ],
  },

  property_land: {
    id: "src_property_uupa_1960",
    title: "UU No. 5 Tahun 1960 (Undang-Undang Pokok Agraria / UUPA)",
    sourceType: "Undang-Undang Republik Indonesia",
    issuer: "Pemerintah Republik Indonesia / DPR RI",
    sourceUrl: "https://www.atrbpn.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-11",
    category: "property_land",
    summary:
      "UUPA menetapkan bahwa Sertifikat Hak Milik (SHM) merupakan alat pembuktian yang kuat mengenai kepemilikan hak atas tanah dan batas-batasnya.",
    articles: [
      {
        articleLabel: "UUPA Pasal 19 ayat (2) c jo. PP No. 24/1997",
        topic: "Kekuatan Pembuktian Sertifikat Hak Atas Tanah",
        officialContent:
          "Surat-surat tanda bukti hak berlaku sebagai alat pembuktian yang kuat mengenai kepemilikan tanah dan data fisik serta yuridis yang tercantum di dalamnya.",
        explanation:
          "Pemegang sertifikat resmi diakui sebagai pemilik sah oleh negara selama tidak dapat dibuktikan sebaliknya melalui putusan pengadilan yang berkekuatan hukum tetap.",
      },
    ],
    actionOptions: [
      {
        title: "Pengukuran Ulang / Pengembalian Batas oleh Kantor Pertanahan (BPN)",
        rationale: "Menghadirkan juru ukur resmi BPN untuk memastikan patok batas tanah yang sah sesuai buku tanah.",
        preparation: ["Sertifikat tanah asli, KTP pemohon, saksi tetangga batas"],
      },
      {
        title: "Mediasi Pertanahan di Kantor Kelurahan / BPN",
        rationale: "Mencari jalan keluar sengketa sebelum masuk ke ranah gugatan PTUN atau Pengadilan Negeri.",
        preparation: ["Warkah tanah dan riwayat jual beli"],
      },
    ],
    checklist: [
      {
        title: "Sertifikat Tanah Asli / Salinan Terlegalisir",
        description: "Memuat gambar situasi, nomor hak, dan luas bidang tanah.",
        required: true,
      },
      {
        title: "Bukti Pembayaran PBB (Pajak Bumi dan Bangunan)",
        description: "Histori pembayaran pajak 3-5 tahun terakhir.",
        required: false,
      },
    ],
    uncertainties: [
      "Sengketa tumpang tindih sertifikat (overlapping) memerlukan audit warkah di kantor BPN setempat.",
    ],
  },

  general_dispute: {
    id: "src_general_kuhperdata_1365",
    title: "KUHPerdata Buku III: Pasal 1365 (Perbuatan Melawan Hukum / PMH) & Pasal 1243 (Wanprestasi)",
    sourceType: "Kitab Undang-Undang Hukum Perdata",
    issuer: "Kodifikasi Hukum Keperdataan Indonesia",
    sourceUrl: "https://jdihn.go.id",
    legalStatus: "verified_current",
    verifiedAt: "2026-01-10",
    category: "general_dispute",
    summary:
      "Aturan dasar hukum keperdataan Indonesia yang mewajibkan setiap pihak yang menimbulkan kerugian bagi orang lain akibat perbuatan melanggar hukum atau kelalaian untuk mengganti kerugian tersebut.",
    articles: [
      {
        articleLabel: "KUHPerdata Pasal 1365",
        topic: "Perbuatan Melawan Hukum (Onrechtmatige Daad)",
        officialContent:
          "Tiap perbuatan yang melanggar hukum dan membawa kerugian kepada orang lain, mewajibkan orang yang menimbulkan kerugian karena kesalahannya untuk mengganti kerugian tersebut.",
        explanation:
          "Jika seseorang atau pihak lain menimbulkan kerugian pada Anda tanpa adanya kontrak tertulis (misal perusakan barang, pelanggaran hak), Anda berhak menuntut ganti rugi nyata.",
      },
      {
        articleLabel: "HIR Pasal 164 / KUHPerdata Pasal 1866",
        topic: "Alat Bukti Sah dalam Hukum Acara Perdata",
        officialContent:
          "Alat pembuktian terdiri atas: bukti surat/tulisan, bukti saksi, persangkaan, pengakuan, dan sumpah.",
        explanation:
          "Untuk menuntut hak di depan hukum, pihak yang mendalilkan sesuatu wajib membuktikannya dengan dokumen tertulis dan/atau keterangan saksi.",
      },
    ],
    actionOptions: [
      {
        title: "Pemberian Surat Peringatan / Klarifikasi Tertulis",
        rationale: "Menghindari perselisihan berlarut dan membuka ruang penyelesaian damai dengan batas waktu yang wajar.",
        preparation: [
          "Uraian kronologi kejadian dan perincian kerugian materi yang diminta",
          "Salinan bukti pendukung",
        ],
      },
      {
        title: "Konsultasi ke Pos Bantuan Hukum (Posbankum) Terdekat",
        rationale: "Mendapatkan arahan langsung mengenai apakah perkara lebih tepat diselesaikan secara perdata atau pidana.",
        preparation: ["Catatan kronologi peristiwa dan seluruh bukti komunikasi"],
      },
    ],
    checklist: [
      {
        title: "Dokumen Bukti Tulisan / Pesan",
        description: "Kuitansi, percakapan pesan, foto kerugian, atau surat kesepakatan.",
        required: true,
      },
      {
        title: "Identitas dan Kontak Saksi Mata",
        description: "Minimal 1-2 orang saksi yang mengetahui langsung peristiwa yang terjadi.",
        required: false,
      },
    ],
    uncertainties: [
      "Besaran ganti rugi imateriil bergantung sepenuhnya pada pertimbangan keyakinan majelis hakim di pengadilan.",
    ],
  },
};

/**
 * Mencocokkan korpus hukum berdasarkan kategori perkara
 */
export function matchLegalSources(category: CaseCategory): LegalSourceItem {
  return VERIFIED_LEGAL_CORPUS[category] || VERIFIED_LEGAL_CORPUS.general_dispute;
}
