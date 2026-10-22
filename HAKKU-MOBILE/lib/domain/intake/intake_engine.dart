/// Kategori sengketa yang dideteksi otomatis
enum DisputeCategory {
  labor('labor', 'Ketenagakerjaan'),
  digitalScam('digital_scam', 'Penipuan Digital'),
  tenancyContract('tenancy_contract', 'Sewa-Menyewa'),
  consumerDispute('consumer_dispute', 'Sengketa Konsumen'),
  generalCivil('general_civil', 'Perdata Umum'),
  other('other', 'Lainnya');

  final String code;
  final String label;
  const DisputeCategory(this.code, this.label);
}

/// Tingkat urgensi perkara
enum UrgencyLevel {
  low('low', 'Rendah', 'Situasi tidak mendesak, pelajari pilihan dengan tenang.'),
  normal('normal', 'Normal', 'Segera ambil langkah, tapi tidak darurat.'),
  urgent('urgent', 'Mendesak', 'Ada tenggat waktu atau risiko segera.'),
  critical('critical', 'Kritis', 'Butuh bantuan segera — situasi darurat.');

  final String code;
  final String label;
  final String description;
  const UrgencyLevel(this.code, this.label, this.description);
}

/// Model ringkasan fakta perkara
class CaseFactSummary {
  final DisputeCategory category;
  final UrgencyLevel urgencyLevel;
  final String originalStory;
  final List<String> knownFacts;
  final List<String> unknownFacts;
  final bool requiresEmergencyEscalation;
  final String? emergencyReason;

  const CaseFactSummary({
    required this.category,
    required this.urgencyLevel,
    this.originalStory = '',
    required this.knownFacts,
    required this.unknownFacts,
    this.requiresEmergencyEscalation = false,
    this.emergencyReason,
  });

  String get categoryLabel => category.label;
  String get urgencyLabel => urgencyLevel.label;
}

/// Mesin triage keselamatan — deteksi urgensi & kategorisasi offline
class IntakeEngine {
  IntakeEngine._();

  // Kata kunci darurat yang memerlukan eskalasi segera
  static const List<String> _emergencyKeywords = [
    'kekerasan',
    'dipukul',
    'diancam',
    'kdrt',
    'disekap',
    'diperkosa',
    'bunuh diri',
    'mau bunuh',
    'membahayakan',
    'nyawa',
    'senjata',
    'pisau',
    'dianiaya',
  ];

  // Kata kunci per kategori (sederhana, tanpa regex kompleks)
  static const Map<DisputeCategory, List<String>> _categoryKeywords = {
    DisputeCategory.labor: [
      'phk',
      'pecat',
      'gaji',
      'upah',
      'pesangon',
      'kontrak kerja',
      'karyawan',
      'perusahaan',
      'kerja',
      'lembur',
      'cuti',
      'bpjs',
      'disnaker',
    ],
    DisputeCategory.digitalScam: [
      'penipuan',
      'scam',
      'transfer',
      'rekening',
      'online',
      'shopee',
      'tokopedia',
      'whatsapp',
      'instagram',
      'tipu',
      'bohong',
      'palsu',
      'tidak terkirim',
    ],
    DisputeCategory.tenancyContract: [
      'kos',
      'sewa',
      'kontrakan',
      'landlord',
      'pemilik rumah',
      'deposit',
      'kamar',
      'apartemen',
      'diusir',
      'perjanjian sewa',
    ],
    DisputeCategory.consumerDispute: [
      'konsumen',
      'produk cacat',
      'barang rusak',
      'jasa',
      'toko',
      'beli',
      'refund',
      'garansi',
      'return',
    ],
  };

  /// Alias untuk proses analisa cerita
  static CaseFactSummary processStory(String story) => analyzeStory(story);

  /// Cek apakah cerita mengandung unsur kedaruratan fisik
  static bool checkEmergency(String story) =>
      analyzeStory(story).requiresEmergencyEscalation;

  /// Analisis cerita masalah secara lokal (offline)
  static CaseFactSummary analyzeStory(String story) {
    final lowerStory = story.toLowerCase();

    // 1. Cek darurat terlebih dahulu
    final emergencyHits =
        _emergencyKeywords.where((kw) => lowerStory.contains(kw)).toList();
    final isEmergency = emergencyHits.isNotEmpty;

    // 2. Kategorisasi
    DisputeCategory detectedCategory = DisputeCategory.other;
    int maxScore = 0;
    for (final entry in _categoryKeywords.entries) {
      final score =
          entry.value.where((kw) => lowerStory.contains(kw)).length;
      if (score > maxScore) {
        maxScore = score;
        detectedCategory = entry.key;
      }
    }

    // 3. Urgensi
    final urgency = isEmergency
        ? UrgencyLevel.critical
        : _detectUrgency(lowerStory);

    // 4. Ekstrak fakta sederhana dari panjang cerita
    final knownFacts = _extractKnownFacts(story, detectedCategory);
    final unknownFacts = _suggestUnknownFacts(detectedCategory, knownFacts);

    return CaseFactSummary(
      category: detectedCategory,
      urgencyLevel: urgency,
      originalStory: story,
      knownFacts: knownFacts,
      unknownFacts: unknownFacts,
      requiresEmergencyEscalation: isEmergency,
      emergencyReason: isEmergency
          ? 'Terdeteksi indikasi kekerasan atau ancaman. Hubungi bantuan darurat.'
          : null,
    );
  }

  static UrgencyLevel _detectUrgency(String story) {
    if (story.contains('segera') ||
        story.contains('besok') ||
        story.contains('hari ini') ||
        story.contains('deadline') ||
        story.contains('mendesak')) {
      return UrgencyLevel.urgent;
    }
    if (story.contains('sudah lama') ||
        story.contains('bertahun') ||
        story.contains('belum ada') ||
        story.length < 100) {
      return UrgencyLevel.normal;
    }
    return UrgencyLevel.normal;
  }

  static List<String> _extractKnownFacts(
      String story, DisputeCategory category) {
    final facts = <String>[];
    if (story.length > 30) {
      facts.add('Pengguna menceritakan: "${story.substring(0, story.length > 120 ? 120 : story.length)}..."');
    }
    return facts;
  }

  static List<String> _suggestUnknownFacts(
      DisputeCategory category, List<String> knownFacts) {
    switch (category) {
      case DisputeCategory.labor:
        return [
          'Jenis kontrak (PKWT atau PKWTT)?',
          'Berapa lama masa kerja?',
          'Apakah ada surat PHK tertulis?',
          'Langkah apa yang sudah ditempuh?',
        ];
      case DisputeCategory.digitalScam:
        return [
          'Platform transaksi yang digunakan?',
          'Berapa nilai kerugian?',
          'Apakah ada bukti percakapan/transfer?',
          'Sudah melapor ke platform atau polisi?',
        ];
      case DisputeCategory.tenancyContract:
        return [
          'Apakah ada perjanjian sewa tertulis?',
          'Berapa nilai deposit?',
          'Apa penyebab sengketa?',
        ];
      case DisputeCategory.consumerDispute:
        return [
          'Apa produk/jasa yang dipersengketakan?',
          'Ada kuitansi atau bukti pembelian?',
          'Sudah menghubungi penjual?',
        ];
      default:
        return [
          'Siapa pihak yang terlibat?',
          'Kapan kejadian terjadi?',
          'Langkah apa yang sudah ditempuh?',
        ];
    }
  }
}
