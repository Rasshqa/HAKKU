import 'evidence_models.dart';

/// Evaluator matriks bukti statuter — offline-first
/// Sesuai Pasal 184 KUHAP & UU ITE No. 1/2024
class StatutoryEvidenceEvaluator {
  StatutoryEvidenceEvaluator._();

  /// Evaluasi skor kekuatan berkas (0–100%) dan kesiapan hukum acara
  static EvidenceAuditResult evaluateReadiness(List<EvidenceItem> items) {
    if (items.isEmpty) {
      return const EvidenceAuditResult(
        score: 0,
        status: EvidenceReadinessStatus.criticalMissing,
        label: 'Belum Ada Bukti',
        strengths: [],
        missingItems: ['Minimal 1 alat bukti tertulis atau elektronik sah.'],
      );
    }

    int score = 0;
    final strengths = <String>[];
    final missing = <String>[];

    final hasWritten =
        items.any((e) => e.type == EvidenceType.writtenDocument);
    final hasDigital = items.any((e) => e.type == EvidenceType.digitalProof);
    final hasFinancial =
        items.any((e) => e.type == EvidenceType.financialProof);
    final hasWitness =
        items.any((e) => e.type == EvidenceType.witnessStatement);

    if (hasWritten) {
      score += 35;
      strengths
          .add('Tersedia dokumen tertulis resmi (Pasal 1866 KUHPerdata).');
    } else {
      missing.add('Bukti tertulis (kontrak kerja / surat perjanjian sewa).');
    }

    if (hasDigital) {
      score += 25;
      strengths
          .add('Tersedia bukti elektronik sah (Pasal 5 UU ITE No. 1/2024).');
    } else {
      missing.add('Bukti digital (screenshot percakapan, email, dll.).');
    }

    if (hasFinancial) {
      score += 25;
      strengths
          .add('Tersedia rekam jejak transfer/kuitansi finansial riil.');
    } else {
      missing.add('Bukti mutasi rekening bank atau kuitansi pembayaran resmi.');
    }

    if (hasWitness) {
      score += 15;
      strengths
          .add('Tersedia saksi yang melihat/mengalami langsung perbuatan.');
    }

    final clampedScore = score.clamp(0, 100);

    final status = clampedScore >= 75
        ? EvidenceReadinessStatus.readyForFiling
        : clampedScore >= 45
            ? EvidenceReadinessStatus.needsSupplement
            : EvidenceReadinessStatus.criticalMissing;

    return EvidenceAuditResult(
      score: clampedScore,
      status: status,
      label: status.label,
      strengths: strengths,
      missingItems: missing,
    );
  }
}
