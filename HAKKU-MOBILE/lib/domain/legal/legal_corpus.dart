/// Korpus peraturan perundang-undangan RI terverifikasi — tersedia offline
class LegalCorpus {
  LegalCorpus._();

  static const List<LegalSource> sources = [
    // Ketenagakerjaan
    LegalSource(
      id: 'pp35-2021',
      title: 'PP No. 35 Tahun 2021',
      fullTitle:
          'Peraturan Pemerintah Nomor 35 Tahun 2021 tentang Perjanjian Kerja Waktu Tertentu, Alih Daya, Waktu Kerja dan Waktu Istirahat, dan Pemutusan Hubungan Kerja',
      category: LegalCategory.labor,
      summary:
          'Mengatur kompensasi PKWT, hak pesangon, UPMK, UPH, dan multiplier alasan PHK.',
      keyArticles: [
        'Pasal 15 — Kompensasi PKWT',
        'Pasal 17 — Ganti Rugi Sisa Kontrak',
        'Pasal 40 — Uang Pesangon (UP), UPMK, UPH',
        'Pasal 43-52 — Multiplier alasan PHK',
      ],
      verifiedDate: '2021-02-25',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/162437/pp-no-35-tahun-2021',
    ),
    LegalSource(
      id: 'uu2-2004',
      title: 'UU No. 2 Tahun 2004',
      fullTitle:
          'Undang-Undang Nomor 2 Tahun 2004 tentang Penyelesaian Perselisihan Hubungan Industrial',
      category: LegalCategory.labor,
      summary:
          'Mengatur prosedur penyelesaian PHI: bipartit (14 hari kerja), mediasi, konsiliasi, arbitrase, dan gugatan ke PHI.',
      keyArticles: [
        'Pasal 3 — Perundingan Bipartit (14 hari kerja)',
        'Pasal 4 — Mediasi ke Disnaker',
      ],
      verifiedDate: '2004-01-14',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/40944/uu-no-2-tahun-2004',
    ),
    LegalSource(
      id: 'uu13-2003',
      title: 'UU No. 13 Tahun 2003',
      fullTitle: 'Undang-Undang Nomor 13 Tahun 2003 tentang Ketenagakerjaan',
      category: LegalCategory.labor,
      summary:
          'Undang-undang induk ketenagakerjaan Indonesia. Sebagian pasal diubah oleh UU Cipta Kerja.',
      keyArticles: [
        'Pasal 81 — Hak cuti tahunan 12 hari kerja',
        'Pasal 156 — Kompensasi PHK',
      ],
      verifiedDate: '2003-03-25',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/43013/uu-no-13-tahun-2003',
    ),
    // Perdata
    LegalSource(
      id: 'kuhperdata-1238',
      title: 'KUHPerdata Pasal 1238',
      fullTitle:
          'Kitab Undang-Undang Hukum Perdata, Pasal 1238 tentang Somasi (Teguran Hukum Tertulis)',
      category: LegalCategory.civil,
      summary:
          'Dasar hukum penerbitan surat somasi. Debitur dinyatakan lalai setelah menerima surat teguran tertulis.',
      keyArticles: [
        'Pasal 1238 — Dasar somasi tertulis',
        'Pasal 1243 — Ganti rugi akibat kelalaian',
      ],
      verifiedDate: '1847-04-30',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/44697',
    ),
    // ITE & Digital
    LegalSource(
      id: 'uu1-2024-ite',
      title: 'UU No. 1 Tahun 2024 (ITE)',
      fullTitle:
          'Undang-Undang Nomor 1 Tahun 2024 tentang Perubahan Kedua atas UU ITE',
      category: LegalCategory.digital,
      summary:
          'Mengatur informasi dan transaksi elektronik, termasuk pembuktian bukti digital dan penipuan online.',
      keyArticles: [
        'Pasal 5 — Kedudukan dokumen/informasi elektronik sebagai alat bukti',
        'Pasal 28 — Larangan penyebaran berita bohong',
      ],
      verifiedDate: '2024-01-02',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/274793/uu-no-1-tahun-2024',
    ),
    // Bantuan Hukum
    LegalSource(
      id: 'uu16-2011-lbh',
      title: 'UU No. 16 Tahun 2011 (Bantuan Hukum)',
      fullTitle:
          'Undang-Undang Nomor 16 Tahun 2011 tentang Bantuan Hukum',
      category: LegalCategory.access,
      summary:
          'Menjamin hak warga negara tidak mampu untuk mendapatkan bantuan hukum cuma-cuma dari LBH terakreditasi.',
      keyArticles: [
        'Pasal 1 — Definisi bantuan hukum',
        'Pasal 4 — Hak penerima bantuan hukum',
      ],
      verifiedDate: '2011-10-02',
      isActive: true,
      url: 'https://peraturan.bpk.go.id/Details/39444/uu-no-16-tahun-2011',
    ),
  ];

  /// Cari sumber hukum berdasarkan kategori
  static List<LegalSource> byCategory(LegalCategory category) {
    return sources.where((s) => s.category == category).toList();
  }

  /// Cari sumber hukum berdasarkan ID
  static LegalSource? byId(String id) {
    try {
      return sources.firstWhere((s) => s.id == id);
    } catch (_) {
      return null;
    }
  }
}

enum LegalCategory {
  labor('Ketenagakerjaan'),
  civil('Perdata'),
  digital('Digital & ITE'),
  criminal('Pidana'),
  access('Akses Hukum');

  final String label;
  const LegalCategory(this.label);
}

class LegalSource {
  final String id;
  final String title;
  final String fullTitle;
  final LegalCategory category;
  final String summary;
  final List<String> keyArticles;
  final String verifiedDate;
  final bool isActive;
  final String url;

  const LegalSource({
    required this.id,
    required this.title,
    required this.fullTitle,
    required this.category,
    required this.summary,
    required this.keyArticles,
    required this.verifiedDate,
    required this.isActive,
    required this.url,
  });
}
