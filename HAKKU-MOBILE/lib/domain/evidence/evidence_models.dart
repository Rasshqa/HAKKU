/// Jenis alat bukti sesuai Pasal 184 KUHAP & UU ITE No. 1/2024
enum EvidenceType {
  writtenDocument('written', 'Dokumen Tertulis'),
  digitalProof('digital', 'Bukti Elektronik'),
  financialProof('financial', 'Bukti Finansial'),
  witnessStatement('witness', 'Keterangan Saksi'),
  expertOpinion('expert', 'Keterangan Ahli'),
  physicalEvidence('physical', 'Barang Bukti Fisik');

  final String code;
  final String label;
  const EvidenceType(this.code, this.label);
}

/// Item alat bukti yang dimiliki pengguna
class EvidenceItem {
  final String id;
  final EvidenceType type;
  final String description;
  final String? photoPath; // Path foto bukti (kamera/galeri)

  const EvidenceItem({
    required this.id,
    required this.type,
    required this.description,
    this.photoPath,
  });
}

/// Status kesiapan berkas hukum
enum EvidenceReadinessStatus {
  readyForFiling('Siap Diajukan', 'Berkas sudah cukup kuat.'),
  needsSupplement('Perlu Dilengkapi', 'Tambahkan beberapa bukti lagi.'),
  criticalMissing('Kritis — Belum Cukup', 'Bukti sangat minim.');

  final String label;
  final String description;
  const EvidenceReadinessStatus(this.label, this.description);
}

/// Hasil evaluasi matriks bukti
class EvidenceAuditResult {
  final int score; // 0 - 100
  final EvidenceReadinessStatus status;
  final String label;
  final List<String> strengths;
  final List<String> missingItems;

  const EvidenceAuditResult({
    required this.score,
    required this.status,
    required this.label,
    required this.strengths,
    required this.missingItems,
  });
}
