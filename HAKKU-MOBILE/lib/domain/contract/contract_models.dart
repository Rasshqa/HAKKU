/// Jenis ranah kontrak hukum yang diuji
enum ContractDomainType {
  pkwtLabor('pkwt_labor', 'Perjanjian Kerja (PKWT / PKWTT)'),
  tenancyLease('tenancy_lease', 'Perjanjian Sewa Properti / Kontrakan'),
  loanService('loan_service', 'Perjanjian Pinjaman / Layanan Digital');

  final String code;
  final String label;
  const ContractDomainType(this.code, this.label);

  static ContractDomainType fromCode(String code) {
    return ContractDomainType.values.firstWhere(
      (e) => e.code == code,
      orElse: () => ContractDomainType.pkwtLabor,
    );
  }
}

/// Tingkat keparahan risiko klausul kontrak
enum ClauseRiskSeverity {
  highRisk('high_risk', 'Batal Demi Hukum / Risiko Tinggi', 3),
  warning('warning', 'Perlu Negosiasi / Berpotensi Timpang', 2),
  safe('safe', 'Sesuai Koridor Hukum / Wajar', 1);

  final String code;
  final String label;
  final int level;
  const ClauseRiskSeverity(this.code, this.label, this.level);
}

/// Temuan klausul spesifik dalam naskah perjanjian
class ContractClauseFinding {
  final String id;
  final String title;
  final String clauseExcerpt;
  final ClauseRiskSeverity severity;
  final String severityLabel;
  final String legalBasis;
  final String explanation;
  final String recommendedRevision;

  const ContractClauseFinding({
    required this.id,
    required this.title,
    required this.clauseExcerpt,
    required this.severity,
    required this.severityLabel,
    required this.legalBasis,
    required this.explanation,
    required this.recommendedRevision,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'clauseExcerpt': clauseExcerpt,
        'severity': severity.code,
        'severityLabel': severityLabel,
        'legalBasis': legalBasis,
        'explanation': explanation,
        'recommendedRevision': recommendedRevision,
      };
}

/// Hasil keseluruhan audit naskah kontrak hukum
class ContractAuditResult {
  final ContractDomainType contractType;
  final String contractTypeLabel;
  final ClauseRiskSeverity overallRisk;
  final String overallRiskLabel;
  final int highRiskCount;
  final int warningCount;
  final int safeCount;
  final String summaryText;
  final List<ContractClauseFinding> findings;
  final DateTime analyzedAt;

  const ContractAuditResult({
    required this.contractType,
    required this.contractTypeLabel,
    required this.overallRisk,
    required this.overallRiskLabel,
    required this.highRiskCount,
    required this.warningCount,
    required this.safeCount,
    required this.summaryText,
    required this.findings,
    required this.analyzedAt,
  });
}
