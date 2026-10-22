export type EmploymentType = "pkwtt" | "pkwt";

export type TerminationReason =
  | "efficiency_loss" // Efisiensi karena perusahaan mengalami kerugian (0.5x UP, 1x UPMK, UPH)
  | "efficiency_prevent" // Efisiensi untuk mencegah terjadinya kerugian (1x UP, 1x UPMK, UPH)
  | "merger_worker_refuse" // Peleburan/Penggabungan, pekerja menolak lanjut (0.5x UP, 1x UPMK, UPH)
  | "merger_company_refuse" // Peleburan/Penggabungan, pengusaha menolak lanjut (1x UP, 1x UPMK, UPH)
  | "bankruptcy" // Perusahaan Pailit / Likuidasi (0.5x UP, 1x UPMK, UPH)
  | "force_majeure" // Keadaan memaksa / penutupan perusahaan (0.5x UP, 1x UPMK, UPH)
  | "violation_sp3" // Pelanggaran ketentuan PK/PP/PKB setelah SP 1, 2, 3 (0.5x UP, 1x UPMK, UPH)
  | "prolonged_illness" // Sakit berkepanjangan > 12 bulan / cacat kerja (2x UP, 1x UPMK, UPH)
  | "retirement" // Usia pensiun (1.75x UP, 1x UPMK, UPH)
  | "death" // Pekerja meninggal dunia (2x UP, 1x UPMK, UPH)
  | "resignation" // Pengunduran diri sukarela (0x UP, 0x UPMK, UPH + Uang Pisah)
  | "pkwt_end" // Kontrak PKWT berakhir sesuai jangka waktu (Kompensasi PKWT Pasal 15)
  | "pkwt_early_employer"; // Kontrak PKWT diakhiri sepihak oleh pengusaha (Ganti rugi sisa kontrak + Kompensasi Pasal 17)

export interface TerminationReasonMeta {
  id: TerminationReason;
  label: string;
  applicableTo: EmploymentType[];
  pesangonMultiplier: number;
  upmkMultiplier: number;
  legalBasis: string;
  description: string;
}

export interface CompensationCalculationInput {
  employmentType: EmploymentType;
  terminationReason: TerminationReason;
  monthlySalary: number; // Gaji pokok + tunjangan tetap per bulan
  yearsOfService: number; // Masa kerja dalam tahun
  monthsOfService: number; // Tambahan masa kerja dalam bulan
  unusedLeaveDays?: number; // Sisa cuti tahunan belum gugur
  unpaidWagesMonths?: number; // Tunggakan gaji berjalan jika ada
  remainingContractMonths?: number; // Sisa masa kontrak jika PKWT diputus sepihak
  voluntarySeparationPay?: number; // Uang pisah (bila diatur di PP/PKB)
}

export interface CalculationBreakdownItem {
  key: string;
  title: string;
  amount: number;
  formula: string;
  legalBasis: string;
  description: string;
}

export interface CompensationCalculationResult {
  employmentType: EmploymentType;
  terminationReason: TerminationReason;
  reasonLabel: string;
  monthlySalary: number;
  totalServiceMonths: number;
  tenureFormatted: string;
  
  // Specific calculated components
  pesangonAmount: number;
  pesangonMultiplier: number;
  pesangonMonthsBase: number;
  
  upmkAmount: number;
  upmkMultiplier: number;
  upmkMonthsBase: number;
  
  uphAmount: number;
  pkwtCompensationAmount: number;
  unpaidWagesAmount: number;
  remainingContractPenaltyAmount: number;
  voluntarySeparationPayAmount: number;
  
  grandTotal: number;
  
  breakdown: CalculationBreakdownItem[];
  legalNotes: string[];
}
