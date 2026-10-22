import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildConsultationAssessment } from "../src/modules/ai/consultation";

describe("Consultation Engine: Real-Time Legal Assessment & Interview", () => {
  it("harus mengekstrak ranah ketenagakerjaan, pasal PP 35/2021, dan nominal hak dari cerita wawancara", () => {
    const userHistory = [
      "Saya sudah bekerja selama 2 tahun di PT Maju Abadi.",
      "Bulan lalu saya diberitahu toko tutup dan saya tidak dapat pesangon sebesar Rp 8.000.000.",
    ];
    const lastMsg = "Apakah atasan berhak menahan ijazah asli saya?";

    const assessment = buildConsultationAssessment(userHistory, lastMsg);

    assert.equal(assessment.category, "labor");
    assert.equal(assessment.categoryLabel, "Ketenagakerjaan & Hubungan Kerja");
    assert.ok(assessment.strengthScore >= 60, "Kekuatan posisi hukum harus di atas 60%");
    assert.ok(assessment.articlesCited.length > 0, "Harus mengutip dasar hukum sah");
    assert.equal(assessment.suggestedActionType, "calculator");
    assert.ok(assessment.quickPrompts.length > 0, "Harus menyajikan pertanyaan cepat");
  });

  it("harus mendeteksi ranah transaksi digital dan merekomendasikan somasi untuk penipuan belanja online", () => {
    const userHistory = [
      "Saya beli handphone di toko online melalui Instagram seharga Rp 1.500.000.",
    ];
    const lastMsg = "Setelah saya transfer nomor WhatsApp saya diblokir dan barang tidak dikirim.";

    const assessment = buildConsultationAssessment(userHistory, lastMsg);

    assert.equal(assessment.category, "consumer_digital");
    assert.equal(assessment.categoryLabel, "Transaksi Digital & Perlindungan Konsumen");
    assert.equal(assessment.suggestedActionType, "document");
    assert.ok(
      assessment.confirmedFacts.some((f) => f.includes("Instagram") || f.includes("Rp 1.500.000")),
      "Harus mencatat platform Instagram atau nominal Rp 1.500.000"
    );
  });

  it("harus mengidentifikasi sengketa sewa menyewa dan mendeteksi kekurangan bukti jika belum ada kuitansi", () => {
    const userHistory = ["Saya sewa rumah kontrak 1 tahun."];
    const lastMsg = "Saat saya pindah pemilik rumah menolak mengembalikan uang deposit sewa Rp 3.000.000.";

    const assessment = buildConsultationAssessment(userHistory, lastMsg);

    assert.equal(assessment.category, "tenancy_contract");
    assert.ok(assessment.missingEvidence.length > 0, "Harus menyarankan kelengkapan bukti kuitansi/kontrak");
    assert.ok(assessment.articlesCited.some((a) => a.articleLabel.includes("KUHPerdata") || a.articleLabel.includes("1365") || a.articleLabel.includes("1243")));
  });

  it("harus menyajikan prompt cepat yang relevan dan tindakan rekomendasi terarah", () => {
    const assessment = buildConsultationAssessment([], "Saya diteror pinjol ilegal dan data disebar");
    assert.equal(assessment.category, "finance_loans");
    assert.ok(assessment.quickPrompts.length >= 2, "Harus menyajikan minimal 2 prompt cepat");
  });
});
