import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  analyzeContractClauses,
  SAMPLE_CONTRACTS,
} from "../src/modules/contract/analyzer";

describe("Contract Red-Flag Scanner: Pemeriksa Klausul Kontrak Berbahaya", () => {
  it("harus mendeteksi klausul masa percobaan (probation) dan penahanan ijazah pada kontrak PKWT", () => {
    const samplePkwt = SAMPLE_CONTRACTS.pkwt_labor;
    assert.ok(samplePkwt);

    const result = analyzeContractClauses("pkwt_labor", samplePkwt.text);
    assert.equal(result.contractType, "pkwt_labor");
    assert.equal(result.overallRisk, "high_risk");
    assert.ok(result.highRiskCount >= 2);
    assert.ok(
      result.findings.some(
        (f) => f.id === "rule-pkwt-probation" && f.severity === "high_risk"
      )
    );
    assert.ok(
      result.findings.some(
        (f) => f.id === "rule-pkwt-diploma-withholding" && f.severity === "high_risk"
      )
    );
  });

  it("harus mendeteksi klausul pemotongan deposit sepihak dan kerusakan struktur pada perjanjian sewa", () => {
    const sampleTenancy = SAMPLE_CONTRACTS.tenancy_lease;
    assert.ok(sampleTenancy);

    const result = analyzeContractClauses("tenancy_lease", sampleTenancy.text);
    assert.ok(result.findings.some((f) => f.id === "rule-tenancy-arbitrary-deposit"));
    assert.ok(result.findings.some((f) => f.id === "rule-tenancy-structural-repair"));
  });

  it("harus mendeteksi akses kontak/galeri ilegal dan klausul eksonerasi pada syarat layanan pinjaman", () => {
    const sampleLoan = SAMPLE_CONTRACTS.loan_service;
    assert.ok(sampleLoan);

    const result = analyzeContractClauses("loan_service", sampleLoan.text);
    assert.ok(result.findings.some((f) => f.id === "rule-loan-contact-scraping"));
    assert.ok(result.findings.some((f) => f.id === "rule-consumer-exoneration"));
  });

  it("harus memberikan status safe apabila teks kontrak bersih dari klausul berbahaya", () => {
    const cleanText =
      "PASAL 1: Para Pihak sepakat melaksanakan perjanjian kerja waktu tertentu selama 12 bulan dengan hak kompensasi penuh sesuai PP No. 35 Tahun 2021 dan didaftarkan dalam program BPJS Ketenagakerjaan serta diselesaikan secara musyawarah untuk mufakat.";
    const result = analyzeContractClauses("pkwt_labor", cleanText);
    assert.equal(result.overallRisk, "safe");
    assert.equal(result.highRiskCount, 0);
    assert.equal(result.warningCount, 0);
  });
});
