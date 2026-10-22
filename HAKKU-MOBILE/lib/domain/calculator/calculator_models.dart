/// Jenis kontrak kerja sesuai UU Ketenagakerjaan
enum ContractType {
  pkwtt('PKWTT', 'Karyawan Tetap'),
  pkwt('PKWT', 'Karyawan Kontrak');

  final String code;
  final String label;
  const ContractType(this.code, this.label);
}

/// Alasan PHK dengan multiplier sesuai PP 35/2021 Pasal 43–52
enum TerminationReason {
  efficiency(
    'efficiency',
    'Efisiensi Perusahaan Merugi',
    upMultiplier: 0.5,
    upmkMultiplier: 1.0,
  ),
  efficiencyLoss(
    'efficiency_loss',
    'Efisiensi Akibat Kerugian',
    upMultiplier: 0.5,
    upmkMultiplier: 1.0,
  ),
  closure(
    'closure',
    'Perusahaan Tutup',
    upMultiplier: 1.0,
    upmkMultiplier: 1.0,
  ),
  forceMajeure(
    'force_majeure',
    'Force Majeure',
    upMultiplier: 0.5,
    upmkMultiplier: 1.0,
  ),
  companyAcquisition(
    'company_acquisition',
    'Penggabungan / Akuisisi',
    upMultiplier: 1.0,
    upmkMultiplier: 1.0,
  ),
  illness(
    'illness',
    'Sakit Berkepanjangan',
    upMultiplier: 2.0,
    upmkMultiplier: 2.0,
  ),
  death(
    'death',
    'Meninggal Dunia',
    upMultiplier: 2.0,
    upmkMultiplier: 2.0,
  ),
  retirement(
    'retirement',
    'Pensiun',
    upMultiplier: 1.75,
    upmkMultiplier: 1.0,
  ),
  resignation(
    'resignation',
    'Mengundurkan Diri',
    upMultiplier: 0.0,
    upmkMultiplier: 0.0,
  );

  final String code;
  final String label;
  final double upMultiplier;
  final double upmkMultiplier;

  const TerminationReason(
    this.code,
    this.label, {
    required this.upMultiplier,
    required this.upmkMultiplier,
  });
}

/// Hasil kalkulasi kompensasi PHK
class CompensationBreakdown {
  final double severancePay; // Uang Pesangon (UP)
  final double longServicePay; // Uang Penghargaan Masa Kerja (UPMK)
  final double rightsReplacementPay; // Uang Penggantian Hak (UPH)
  final double contractCompensation; // Kompensasi PKWT Pasal 15
  final double remainingContractDamages; // Ganti rugi sisa kontrak Pasal 17
  final double grandTotal;

  const CompensationBreakdown({
    required this.severancePay,
    required this.longServicePay,
    required this.rightsReplacementPay,
    required this.contractCompensation,
    required this.remainingContractDamages,
    required this.grandTotal,
  });
}
