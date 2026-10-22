import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  evaluateEvidenceReadiness,
  EVIDENCE_TYPE_LABELS,
} from "../src/modules/evidence/evaluator";
import { EvidenceAuditInput } from "../src/modules/evidence/types";

describe("Evidence Module: Legal Evidence Matrix & Incident Report", () => {
  const completeSampleInput: EvidenceAuditInput = {
    caseTitle: "Penipuan Pembelian Barang Elektronik Online",
    category: "consumer_digital",
    reporterName: "Rian Hidayat",
    reporterNik: "3171012345670001",
    reporterPhone: "081299887766",
    reporterAddress: "Jl. Tebet Barat No. 15, Jakarta Selatan",
    reportedPartyName: "Toko Digital Sejahtera (Akun @gadget_ori)",
    reportedPartyContact: "085811223344 / Bank BCA No. Rek: 1234567890 a.n. Doni",
    reportedPartyDetails: "Penjual di Instagram, akun sekarang memblokir kontak",
    incidentLocationCity: "Jakarta Selatan",
    incidentDateStart: "10 Oktober 2026",
    incidentDateEnd: "15 Oktober 2026",
    totalLossAmount: 4500000,
    events: [
      {
        id: "ev-1",
        date: "10 Oktober 2026",
        time: "14.30 WIB",
        eventTitle: "Kesepakatan Harga & Rekening Tujuan Diberikan",
        description: "Penjual menawarkan laptop bekas dan mengirimkan nomor rekening BCA.",
        associatedEvidenceCodes: ["P-1"],
      },
      {
        id: "ev-2",
        date: "10 Oktober 2026",
        time: "15.00 WIB",
        eventTitle: "Pengiriman Uang Sebesar Rp 4.500.000",
        description: "Pelapor mentransfer dana sebesar Rp 4.500.000 via m-Banking.",
        associatedEvidenceCodes: ["P-2"],
      },
      {
        id: "ev-3",
        date: "12 Oktober 2026",
        time: "10.00 WIB",
        eventTitle: "Nomor WhatsApp Diblokir & Resi Palsu",
        description: "Resi pengiriman tidak terlacak dan nomor pelapor diblokir oleh penjual.",
        associatedEvidenceCodes: ["P-1"],
      },
    ],
    evidences: [
      {
        id: "b-1",
        code: "P-1",
        title: "Tangkapan Layar Chat WhatsApp Penjual",
        type: "digital_communication",
        dateObtained: "10-12 Oktober 2026",
        description: "Percakapan negosiasi harga dan nomor rekening yang diberikan penjual.",
        weight: "primary",
        storageLocation: "Google Drive folder /bukti-kasus/chat_wa.pdf",
        isAvailable: true,
      },
      {
        id: "b-2",
        code: "P-2",
        title: "Bukti Transfer BCA & Mutasi Rekening",
        type: "digital_transaction",
        dateObtained: "10 Oktober 2026",
        description: "Struk transfer resmi m-BCA senilai Rp 4.500.000 ke rekening Doni.",
        weight: "primary",
        storageLocation: "PDF Resi Transfer BCA M-Banking",
        isAvailable: true,
      },
      {
        id: "b-3",
        code: "P-3",
        title: "Tangkapan Layar Profil Toko & Nomor Rekening",
        type: "identity_document",
        dateObtained: "10 Oktober 2026",
        description: "Akun Instagram dan nomor telepon terlapor.",
        weight: "supporting",
        storageLocation: "Screenshot PNG",
        isAvailable: true,
      },
    ],
  };

  it("harus memberikan skor tinggi (>= 75) dan status ready_for_filing bila berkas lengkap", () => {
    const evaluation = evaluateEvidenceReadiness(completeSampleInput);

    assert.ok(evaluation.readinessScore >= 75);
    assert.equal(evaluation.readinessLevel, "ready_for_filing");
    assert.ok(evaluation.strengths.length >= 3);
    assert.equal(evaluation.missingCriticalItems.length, 0);
  });

  it("harus mendeteksi bukti finansial yang hilang dan memberikan skor rendah jika belum ada bukti transfer", () => {
    const incompleteInput: EvidenceAuditInput = {
      ...completeSampleInput,
      evidences: completeSampleInput.evidences.filter(
        (e) => e.type !== "digital_transaction"
      ),
    };

    const evaluation = evaluateEvidenceReadiness(incompleteInput);
    assert.ok(evaluation.readinessScore < 75);
    assert.ok(
      evaluation.missingCriticalItems.some((item) =>
        item.toLowerCase().includes("transaksi")
      )
    );
  });

  it("harus menghasilkan draf naskah formal laporan pengaduan dengan kode bukti P-1, P-2", () => {
    const evaluation = evaluateEvidenceReadiness(completeSampleInput);
    const text = evaluation.formattedReportText;

    assert.ok(text.includes("LAPORAN KRONOLOGI KEJADIAN & MATRIKS ALAT BUKTI"));
    assert.ok(text.includes("Pasal 184 KUHAP"));
    assert.ok(text.includes("Pasal 5 UU ITE"));
    assert.ok(text.includes("Rian Hidayat"));
    assert.ok(text.includes("Rp 4.500.000"));
    assert.ok(text.includes("[P-1]"));
    assert.ok(text.includes("[P-2]"));
    assert.ok(text.includes("Materai Rp 10.000"));
  });

  it("harus memuat label deskripsi pada seluruh jenis alat bukti hukum", () => {
    assert.ok(EVIDENCE_TYPE_LABELS.digital_transaction.includes("Transaksi"));
    assert.ok(EVIDENCE_TYPE_LABELS.digital_communication.includes("Komunikasi"));
    assert.ok(EVIDENCE_TYPE_LABELS.written_contract.includes("Tertulis"));
    assert.ok(EVIDENCE_TYPE_LABELS.identity_document.includes("Identitas"));
    assert.ok(EVIDENCE_TYPE_LABELS.witness_testimony.includes("Saksi"));
    assert.ok(EVIDENCE_TYPE_LABELS.audio_visual.includes("Audio-Visual"));
  });
});
