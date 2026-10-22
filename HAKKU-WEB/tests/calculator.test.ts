import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  calculateCompensation,
  getBasePesangonMonths,
  getBaseUpmkMonths,
  calculateTenureFromDates,
  TERMINATION_REASONS,
} from "../src/modules/calculator/engine";

describe("Calculator Engine: PP No. 35 Tahun 2021 Statutory Compensation", () => {
  it("harus menghitung bulan dasar pesangon sesuai Pasal 40 ayat 2 PP 35/2021", () => {
    assert.equal(getBasePesangonMonths(6), 1); // < 1 tahun
    assert.equal(getBasePesangonMonths(12), 2); // 1 tahun
    assert.equal(getBasePesangonMonths(24), 3); // 2 tahun
    assert.equal(getBasePesangonMonths(36), 4); // 3 tahun
    assert.equal(getBasePesangonMonths(48), 5); // 4 tahun
    assert.equal(getBasePesangonMonths(60), 6); // 5 tahun
    assert.equal(getBasePesangonMonths(72), 7); // 6 tahun
    assert.equal(getBasePesangonMonths(84), 8); // 7 tahun
    assert.equal(getBasePesangonMonths(96), 9); // 8 tahun
    assert.equal(getBasePesangonMonths(150), 9); // > 8 tahun maks 9 bulan
  });

  it("harus menghitung bulan dasar UPMK sesuai Pasal 40 ayat 3 PP 35/2021", () => {
    assert.equal(getBaseUpmkMonths(24), 0); // < 3 tahun = 0
    assert.equal(getBaseUpmkMonths(36), 2); // 3 - <6 tahun = 2
    assert.equal(getBaseUpmkMonths(72), 3); // 6 - <9 tahun = 3
    assert.equal(getBaseUpmkMonths(108), 4); // 9 - <12 tahun = 4
    assert.equal(getBaseUpmkMonths(144), 5); // 12 - <15 tahun = 5
    assert.equal(getBaseUpmkMonths(180), 6); // 15 - <18 tahun = 6
    assert.equal(getBaseUpmkMonths(216), 7); // 18 - <21 tahun = 7
    assert.equal(getBaseUpmkMonths(252), 8); // 21 - <24 tahun = 8
    assert.equal(getBaseUpmkMonths(288), 10); // >= 24 tahun = 10
  });

  it("harus menghitung kompensasi PKWT tepat (Masa Kerja / 12) * Upah sesuai Pasal 15", () => {
    // Karyawan kontrak 1 tahun (12 bulan) dengan gaji 6 juta
    const result1Year = calculateCompensation({
      employmentType: "pkwt",
      terminationReason: "pkwt_end",
      monthlySalary: 6000000,
      yearsOfService: 1,
      monthsOfService: 0,
    });

    assert.equal(result1Year.pkwtCompensationAmount, 6000000);
    assert.equal(result1Year.pesangonAmount, 0);
    assert.equal(result1Year.upmkAmount, 0);
    assert.equal(result1Year.grandTotal, 6000000);

    // Karyawan kontrak 6 bulan dengan gaji 5 juta -> 2.5 juta
    const result6Months = calculateCompensation({
      employmentType: "pkwt",
      terminationReason: "pkwt_end",
      monthlySalary: 5000000,
      yearsOfService: 0,
      monthsOfService: 6,
    });

    assert.equal(result6Months.pkwtCompensationAmount, 2500000);
    assert.equal(result6Months.grandTotal, 2500000);
  });

  it("harus menghitung ganti rugi sisa kontrak + kompensasi jika PKWT diputus sepihak (Pasal 17)", () => {
    const resultEarly = calculateCompensation({
      employmentType: "pkwt",
      terminationReason: "pkwt_early_employer",
      monthlySalary: 6000000,
      yearsOfService: 0,
      monthsOfService: 8, // sudah jalan 8 bulan
      remainingContractMonths: 4, // sisa 4 bulan
    });

    // Kompensasi masa kerja dijalani: (8/12) * 6.000.000 = 4.000.000
    assert.equal(resultEarly.pkwtCompensationAmount, 4000000);
    // Ganti rugi sisa kontrak: 4 * 6.000.000 = 24.000.000
    assert.equal(resultEarly.remainingContractPenaltyAmount, 24000000);
    assert.equal(resultEarly.grandTotal, 28000000);
  });

  it("harus menghitung pesangon PKWTT efisiensi rugi (0.5x UP, 1x UPMK, UPH) sesuai Pasal 43 ayat 1", () => {
    const resultPkwtt = calculateCompensation({
      employmentType: "pkwtt",
      terminationReason: "efficiency_loss",
      monthlySalary: 10000000,
      yearsOfService: 4,
      monthsOfService: 0, // Masa kerja 4 tahun -> Dasar UP = 5 bulan, UPMK = 2 bulan
      unusedLeaveDays: 5,
    });

    // UP: 5 bulan * 0.5 * 10jt = 25jt
    assert.equal(resultPkwtt.pesangonAmount, 25000000);
    // UPMK: 2 bulan * 1.0 * 10jt = 20jt
    assert.equal(resultPkwtt.upmkAmount, 20000000);
    // UPH cuti: (10jt / 21) * 5 = 2.380.952
    assert.equal(resultPkwtt.uphAmount, Math.round((10000000 / 21) * 5));
    assert.equal(
      resultPkwtt.grandTotal,
      25000000 + 20000000 + Math.round((10000000 / 21) * 5)
    );
  });

  it("harus menolak pesangon dan UPMK pada pekerja yang resign sukarela (Pasal 50)", () => {
    const resultResign = calculateCompensation({
      employmentType: "pkwtt",
      terminationReason: "resignation",
      monthlySalary: 8000000,
      yearsOfService: 5,
      monthsOfService: 0,
      unusedLeaveDays: 6,
      voluntarySeparationPay: 2000000,
    });

    assert.equal(resultResign.pesangonAmount, 0);
    assert.equal(resultResign.upmkAmount, 0);
    assert.equal(resultResign.uphAmount, Math.round((8000000 / 21) * 6));
    assert.equal(resultResign.voluntarySeparationPayAmount, 2000000);
    assert.equal(
      resultResign.grandTotal,
      Math.round((8000000 / 21) * 6) + 2000000
    );
  });

  it("harus menghitung durasi masa kerja dari dua tanggal secara akurat", () => {
    const start = new Date(2022, 0, 15); // 15 Jan 2022
    const end = new Date(2024, 6, 15); // 15 Juli 2024 (2 tahun 6 bulan)

    const tenure = calculateTenureFromDates(start, end);
    assert.equal(tenure.years, 2);
    assert.equal(tenure.months, 6);
    assert.equal(tenure.totalMonths, 30);
  });

  it("harus memuat seluruh alasan pemutusan hubungan kerja resmi dalam peraturan", () => {
    assert.ok(TERMINATION_REASONS.length >= 10);
    TERMINATION_REASONS.forEach((reason) => {
      assert.ok(reason.id.length > 0);
      assert.ok(reason.label.length > 0);
      assert.ok(reason.legalBasis.includes("PP No. 35"));
    });
  });
});
