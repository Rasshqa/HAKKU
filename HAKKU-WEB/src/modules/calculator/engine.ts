import {
  CompensationCalculationInput,
  CompensationCalculationResult,
  CalculationBreakdownItem,
  TerminationReasonMeta,
} from "./types";

export const TERMINATION_REASONS: TerminationReasonMeta[] = [
  {
    id: "efficiency_loss",
    label: "Efisiensi Perusahaan (Karena Rugi)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.5,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 43 ayat (1) PP No. 35 Tahun 2021",
    description:
      "Perusahaan melakukan PHK karena mengalami kerugian terbukti selama 2 tahun berturut-turut.",
  },
  {
    id: "efficiency_prevent",
    label: "Efisiensi Perusahaan (Cegah Kerugian)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 1.0,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 43 ayat (2) PP No. 35 Tahun 2021",
    description:
      "Perusahaan melakukan perampingan atau restrukturisasi untuk mencegah kerugian finansial di masa depan.",
  },
  {
    id: "merger_worker_refuse",
    label: "Penggabungan / Peleburan (Pekerja Menolak Lanjut)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.5,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 41 PP No. 35 Tahun 2021",
    description:
      "Perusahaan melakukan merger atau akuisisi dan pekerja tidak bersedia melanjutkan hubungan kerja.",
  },
  {
    id: "merger_company_refuse",
    label: "Penggabungan / Peleburan (Pengusaha Menolak Lanjut)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 1.0,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 42 ayat (2) PP No. 35 Tahun 2021",
    description:
      "Perusahaan hasil merger/akuisisi tidak bersedia melanjutkan hubungan kerja dengan pekerja.",
  },
  {
    id: "bankruptcy",
    label: "Perusahaan Pailit / Putusan Pengadilan Niaga",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.5,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 44 PP No. 35 Tahun 2021",
    description: "Perusahaan dinyatakan pailit berdasarkan putusan Pengadilan Niaga.",
  },
  {
    id: "force_majeure",
    label: "Keadaan Memaksa (Force Majeure)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.5,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 45 ayat (1) PP No. 35 Tahun 2021",
    description: "Perusahaan tutup akibat bencana alam atau keadaan memaksa di luar kendali.",
  },
  {
    id: "violation_sp3",
    label: "Pelanggaran Perjanjian Kerja (Setelah SP3)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.5,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 52 ayat (1) PP No. 35 Tahun 2021",
    description:
      "Pekerja melakukan pelanggaran setelah diberikan Surat Peringatan ke-1, 2, dan 3 secara patut.",
  },
  {
    id: "prolonged_illness",
    label: "Sakit Berkepanjangan (> 12 Bulan) / Cacat Kerja",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 2.0,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 47 PP No. 35 Tahun 2021",
    description:
      "Pekerja mengalami sakit menahun melebihi 12 bulan terus menerus atau disabilitas akibat kecelakaan kerja.",
  },
  {
    id: "retirement",
    label: "Mencapai Usia Pensiun",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 1.75,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 56 PP No. 35 Tahun 2021",
    description: "Pekerja telah mencapai usia pensiun sesuai Perjanjian Kerja / PP / PKB.",
  },
  {
    id: "death",
    label: "Pekerja Meninggal Dunia",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 2.0,
    upmkMultiplier: 1.0,
    legalBasis: "Pasal 57 PP No. 35 Tahun 2021",
    description: "Hak diserahkan kepada ahli waris pekerja yang sah.",
  },
  {
    id: "resignation",
    label: "Pengunduran Diri Sukarela (Resign)",
    applicableTo: ["pkwtt"],
    pesangonMultiplier: 0.0,
    upmkMultiplier: 0.0,
    legalBasis: "Pasal 50 PP No. 35 Tahun 2021",
    description:
      "Pekerja mengundurkan diri atas kemauan sendiri dengan pemberitahuan 30 hari sebelumnya.",
  },
  {
    id: "pkwt_end",
    label: "Kontrak PKWT Berakhir Sesuai Waktu",
    applicableTo: ["pkwt"],
    pesangonMultiplier: 0.0,
    upmkMultiplier: 0.0,
    legalBasis: "Pasal 15 PP No. 35 Tahun 2021",
    description:
      "Jangka waktu perjanjian kerja waktu tertentu telah selesai secara wajar.",
  },
  {
    id: "pkwt_early_employer",
    label: "Kontrak PKWT Diputus Sepihak oleh Perusahaan",
    applicableTo: ["pkwt"],
    pesangonMultiplier: 0.0,
    upmkMultiplier: 0.0,
    legalBasis: "Pasal 17 PP No. 35/2021 jo. Pasal 62 UU Ketenagakerjaan",
    description:
      "Pengusaha mengakhiri kontrak PKWT sebelum batas waktu yang diperjanjikan berakhir.",
  },
];

/**
 * Menghitung jumlah bulan dasar uang pesangon berdasarkan masa kerja
 * Sesuai Pasal 40 ayat (2) PP 35/2021
 */
export function getBasePesangonMonths(totalServiceMonths: number): number {
  if (totalServiceMonths < 12) return 1;
  if (totalServiceMonths < 24) return 2;
  if (totalServiceMonths < 36) return 3;
  if (totalServiceMonths < 48) return 4;
  if (totalServiceMonths < 60) return 5;
  if (totalServiceMonths < 72) return 6;
  if (totalServiceMonths < 84) return 7;
  if (totalServiceMonths < 96) return 8;
  return 9; // Maksimal 9 bulan upah dasar
}

/**
 * Menghitung jumlah bulan dasar Uang Penghargaan Masa Kerja (UPMK)
 * Sesuai Pasal 40 ayat (3) PP 35/2021
 */
export function getBaseUpmkMonths(totalServiceMonths: number): number {
  if (totalServiceMonths < 36) return 0; // Kurang dari 3 tahun: 0
  if (totalServiceMonths < 72) return 2; // 3 - <6 tahun: 2 bulan
  if (totalServiceMonths < 108) return 3; // 6 - <9 tahun: 3 bulan
  if (totalServiceMonths < 144) return 4; // 9 - <12 tahun: 4 bulan
  if (totalServiceMonths < 180) return 5; // 12 - <15 tahun: 5 bulan
  if (totalServiceMonths < 216) return 6; // 15 - <18 tahun: 6 bulan
  if (totalServiceMonths < 252) return 7; // 18 - <21 tahun: 7 bulan
  if (totalServiceMonths < 288) return 8; // 21 - <24 tahun: 8 bulan
  return 10; // 24 tahun atau lebih: 10 bulan upah
}

import { formatRupiah } from "@/lib/formatters";
export { formatRupiah };

/**
 * Menghitung durasi masa kerja dari dua tanggal
 */
export function calculateTenureFromDates(startDate: Date, endDate: Date): { years: number; months: number; totalMonths: number } {
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  
  if (endDate.getDate() < startDate.getDate()) {
    months--;
  }
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  years = Math.max(0, years);
  months = Math.max(0, months);
  const totalMonths = years * 12 + months;
  
  return { years, months, totalMonths };
}

/**
 * Mesin kalkulasi kompensasi & pesangon deterministik bebas halusinasi
 * Mematuhi PP No. 35 Tahun 2021
 */
export function calculateCompensation(
  input: CompensationCalculationInput
): CompensationCalculationResult {
  const salary = Math.max(0, input.monthlySalary);
  const totalMonths = Math.max(
    0,
    input.yearsOfService * 12 + input.monthsOfService
  );

  const tenureYears = Math.floor(totalMonths / 12);
  const tenureRemainingMonths = totalMonths % 12;
  const tenureFormatted = `${tenureYears} Tahun ${tenureRemainingMonths} Bulan (${totalMonths} Bulan)`;

  const reasonMeta =
    TERMINATION_REASONS.find((r) => r.id === input.terminationReason) ||
    TERMINATION_REASONS[0];

  const breakdown: CalculationBreakdownItem[] = [];
  const legalNotes: string[] = [];

  let pesangonAmount = 0;
  let pesangonMonthsBase = 0;
  let pesangonMultiplier = 0;

  let upmkAmount = 0;
  let upmkMonthsBase = 0;
  let upmkMultiplier = 0;

  let uphAmount = 0;
  let pkwtCompensationAmount = 0;
  let unpaidWagesAmount = 0;
  let remainingContractPenaltyAmount = 0;
  const voluntarySeparationPayAmount = Math.max(
    0,
    input.voluntarySeparationPay || 0
  );

  // 1. Logika PKWT (Karyawan Kontrak)
  if (input.employmentType === "pkwt") {
    // Kompensasi PKWT Pasal 15 PP 35/2021: (Masa Kerja Bulan / 12) * 1 Bulan Upah
    if (totalMonths >= 1) {
      pkwtCompensationAmount = Math.round((totalMonths / 12) * salary);
      breakdown.push({
        key: "pkwt_compensation",
        title: "Uang Kompensasi PKWT",
        amount: pkwtCompensationAmount,
        formula: `(${totalMonths} bulan / 12) × ${formatRupiah(salary)}`,
        legalBasis: "Pasal 15 & 16 PP No. 35 Tahun 2021",
        description:
          "Wajib dibayarkan kepada pekerja PKWT dengan masa kerja minimal 1 bulan terus-menerus saat kontrak berakhir atau diperpanjang.",
      });
    }

    // Jika PHK sepihak oleh pengusaha sebelum kontrak selesai (Pasal 17 PP 35/2021 jo. Pasal 62 UU Ketenagakerjaan)
    if (input.terminationReason === "pkwt_early_employer") {
      const remainingMonths = Math.max(0, input.remainingContractMonths || 0);
      remainingContractPenaltyAmount = remainingMonths * salary;
      breakdown.push({
        key: "pkwt_remaining_penalty",
        title: "Ganti Rugi Sisa Masa Kontrak",
        amount: remainingContractPenaltyAmount,
        formula: `${remainingMonths} bulan sisa × ${formatRupiah(salary)}`,
        legalBasis: "Pasal 62 UU No. 13/2003 jo. Pasal 17 PP No. 35/2021",
        description:
          "Pihak yang mengakhiri kontrak sebelum jangka waktu berakhir wajib membayar upah pekerja hingga batas waktu berakhirnya jangka waktu perjanjian.",
      });
      legalNotes.push(
        "Pengusaha yang memutuskan PKWT sebelum waktu berakhir wajib membayar ganti rugi sisa upah kontrak SEKALIGUS uang kompensasi PKWT atas masa kerja yang telah dijalani."
      );
    }
  } else {
    // 2. Logika PKWTT (Karyawan Tetap)
    pesangonMonthsBase = getBasePesangonMonths(totalMonths);
    pesangonMultiplier = reasonMeta.pesangonMultiplier;
    pesangonAmount = Math.round(pesangonMonthsBase * pesangonMultiplier * salary);

    if (pesangonAmount > 0) {
      breakdown.push({
        key: "pesangon",
        title: "Uang Pesangon (UP)",
        amount: pesangonAmount,
        formula: `${pesangonMonthsBase} bulan × ${pesangonMultiplier} (faktor alasan) × ${formatRupiah(salary)}`,
        legalBasis: `${reasonMeta.legalBasis} jo. Pasal 40 ayat (2) PP No. 35/2021`,
        description: `Hak pesangon pokok atas masa kerja ${tenureFormatted} dengan pengali alasan ${reasonMeta.label}.`,
      });
    }

    upmkMonthsBase = getBaseUpmkMonths(totalMonths);
    upmkMultiplier = reasonMeta.upmkMultiplier;
    upmkAmount = Math.round(upmkMonthsBase * upmkMultiplier * salary);

    if (upmkAmount > 0) {
      breakdown.push({
        key: "upmk",
        title: "Uang Penghargaan Masa Kerja (UPMK)",
        amount: upmkAmount,
        formula: `${upmkMonthsBase} bulan × ${upmkMultiplier} × ${formatRupiah(salary)}`,
        legalBasis: `${reasonMeta.legalBasis} jo. Pasal 40 ayat (3) PP No. 35/2021`,
        description: `Diberikan bagi pekerja dengan masa kerja 3 tahun atau lebih.`,
      });
    }

    if (voluntarySeparationPayAmount > 0) {
      breakdown.push({
        key: "uang_pisah",
        title: "Uang Pisah",
        amount: voluntarySeparationPayAmount,
        formula: "Sesuai Perjanjian Kerja / PP / PKB Perusahaan",
        legalBasis: "Pasal 50 & 58 PP No. 35 Tahun 2021",
        description:
          "Besaran uang pisah diatur dalam Perjanjian Kerja, Peraturan Perusahaan (PP), atau Perjanjian Kerja Bersama (PKB).",
      });
    }
  }

  // 3. Hak Penggantian Cuti Tahunan (UPH - Pasal 40 ayat 4)
  const unusedLeaveDays = Math.max(0, input.unusedLeaveDays || 0);
  if (unusedLeaveDays > 0) {
    // Rumus Kemenaker: 1 hari upah = Upah Bulanan / 21 (standar 5 hari kerja per minggu)
    uphAmount = Math.round((salary / 21) * unusedLeaveDays);
    breakdown.push({
      key: "uph_cuti",
      title: "Uang Penggantian Hak (Sisa Cuti Tahunan)",
      amount: uphAmount,
      formula: `(${formatRupiah(salary)} / 21 hari) × ${unusedLeaveDays} hari cuti`,
      legalBasis: "Pasal 40 ayat (4) huruf a PP No. 35 Tahun 2021",
      description:
        "Penggantian cuti tahunan yang belum diambil dan belum gugur saat hubungan kerja berakhir.",
    });
  }

  // 4. Tunggakan Upah Bulanan (Jika ada)
  const unpaidWagesMonths = Math.max(0, input.unpaidWagesMonths || 0);
  if (unpaidWagesMonths > 0) {
    unpaidWagesAmount = Math.round(unpaidWagesMonths * salary);
    breakdown.push({
      key: "unpaid_wages",
      title: "Tunggakan Gaji Berjalan",
      amount: unpaidWagesAmount,
      formula: `${unpaidWagesMonths} bulan × ${formatRupiah(salary)}`,
      legalBasis: "Pasal 53 PP No. 36 Tahun 2021 jo. Pasal 88A UU Ketenagakerjaan",
      description:
        "Upah pokok dan tunjangan tetap yang wajib dilunasi oleh perusahaan dan tidak boleh dipotong sepihak.",
    });
  }

  const grandTotal =
    pesangonAmount +
    upmkAmount +
    uphAmount +
    pkwtCompensationAmount +
    unpaidWagesAmount +
    remainingContractPenaltyAmount +
    voluntarySeparationPayAmount;

  // Catatan Hukum Edukatif Tambahan
  legalNotes.push(
    "Komponen upah yang dijadikan dasar perhitungan adalah Upah Pokok dan Tunjangan Tetap (Pasal 40 ayat 5 PP 35/2021)."
  );
  if (input.employmentType === "pkwtt" && input.terminationReason === "resignation") {
    legalNotes.push(
      "Pekerja yang mengundurkan diri (resign) sukarela tidak berhak atas Uang Pesangon dan UPMK, namun tetap berhak atas Uang Penggantian Hak (UPH) dan Uang Pisah bila diatur di PP/PKB."
    );
  }
  legalNotes.push(
    "Hasil simulasi ini merupakan hak normatif minimal undang-undang. Apabila Peraturan Perusahaan (PP) atau PKB mengatur nilai yang lebih tinggi, maka ketentuan yang lebih menguntungkan pekerja yang berlaku."
  );

  return {
    employmentType: input.employmentType,
    terminationReason: input.terminationReason,
    reasonLabel: reasonMeta.label,
    monthlySalary: salary,
    totalServiceMonths: totalMonths,
    tenureFormatted,
    pesangonAmount,
    pesangonMultiplier,
    pesangonMonthsBase,
    upmkAmount,
    upmkMultiplier,
    upmkMonthsBase,
    uphAmount,
    pkwtCompensationAmount,
    unpaidWagesAmount,
    remainingContractPenaltyAmount,
    voluntarySeparationPayAmount,
    grandTotal,
    breakdown,
    legalNotes,
  };
}
