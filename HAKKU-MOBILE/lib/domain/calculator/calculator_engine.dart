import 'calculator_models.dart';

/// Mesin kalkulator kompensasi statuter — offline-first, tanpa jaringan
/// Implementasi sesuai PP No. 35 Tahun 2021
class StatutoryCalculatorEngine {
  StatutoryCalculatorEngine._();

  /// Hitung bulan dasar Uang Pesangon (UP) — Pasal 40 ayat 2
  static int getBaseSeveranceMonths(double tenureYears) {
    if (tenureYears < 1) return 1;
    if (tenureYears < 2) return 2;
    if (tenureYears < 3) return 3;
    if (tenureYears < 4) return 4;
    if (tenureYears < 5) return 5;
    if (tenureYears < 6) return 6;
    if (tenureYears < 7) return 7;
    if (tenureYears < 8) return 8;
    return 9; // Maksimal 9 bulan upah
  }

  /// Hitung bulan dasar UPMK — Pasal 40 ayat 3
  static int getBaseLongServiceMonths(double tenureYears) {
    if (tenureYears < 3) return 0;
    if (tenureYears < 6) return 2;
    if (tenureYears < 9) return 3;
    if (tenureYears < 12) return 4;
    if (tenureYears < 15) return 5;
    if (tenureYears < 18) return 6;
    if (tenureYears < 21) return 7;
    if (tenureYears < 24) return 8;
    return 10; // 24 tahun ke atas
  }

  /// Hitung Kompensasi PKWT — Pasal 15 PP 35/2021
  /// Rumus: (Masa Kerja Bulan / 12) × Upah Bulanan
  static double calculateContractCompensation({
    required int tenureMonths,
    required double monthlySalary,
  }) {
    if (tenureMonths < 1) return 0;
    return (tenureMonths / 12.0) * monthlySalary;
  }

  /// Kalkulasi komprehensif seluruh komponen hak PHK
  static CompensationBreakdown calculateSeverance({
    required ContractType contractType,
    required double monthlySalary,
    required DateTime startDate,
    required DateTime endDate,
    required TerminationReason reason,
    int unusedLeaveDays = 0,
    int remainingContractMonths = 0,
  }) {
    final days = endDate.difference(startDate).inDays;
    final tenureMonths = (days / 30.4167).floor();
    final tenureYears = days / 365.25;

    if (contractType == ContractType.pkwt) {
      final compensation = calculateContractCompensation(
        tenureMonths: tenureMonths,
        monthlySalary: monthlySalary,
      );
      final remainingSalaryDamages = remainingContractMonths * monthlySalary;
      return CompensationBreakdown(
        severancePay: 0,
        longServicePay: 0,
        rightsReplacementPay: 0,
        contractCompensation: compensation,
        remainingContractDamages: remainingSalaryDamages,
        grandTotal: compensation + remainingSalaryDamages,
      );
    }

    // PKWTT — Karyawan Tetap
    final baseUP = getBaseSeveranceMonths(tenureYears) * monthlySalary;
    final baseUPMK = getBaseLongServiceMonths(tenureYears) * monthlySalary;
    final baseUPH = (unusedLeaveDays / 25.0) * monthlySalary;

    final finalUP = baseUP * reason.upMultiplier;
    final finalUPMK = baseUPMK * reason.upmkMultiplier;
    final finalUPH = baseUPH;

    return CompensationBreakdown(
      severancePay: finalUP,
      longServicePay: finalUPMK,
      rightsReplacementPay: finalUPH,
      contractCompensation: 0,
      remainingContractDamages: 0,
      grandTotal: finalUP + finalUPMK + finalUPH,
    );
  }
}
