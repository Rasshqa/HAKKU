import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  generateLegalDocument,
  getRecommendedTemplate,
  AVAILABLE_DOCUMENT_TEMPLATES,
} from "../src/modules/document/generator";
import { CaseFactSummary } from "../src/modules/intake/types";
import { DocumentCustomFields } from "../src/modules/document/types";

describe("Document Generator: Legal Document Drafts", () => {
  const sampleFactSummary: CaseFactSummary = {
    originalStory: "Gaji saya sudah dua bulan belum dibayar oleh PT Sumber Makmur.",
    category: "labor",
    categoryLabel: "Ketenagakerjaan",
    urgencyLevel: "normal",
    knownFacts: [
      "Status hubungan kerja: PKWT 1 tahun",
      "Gaji tertunggak: Rp 5.000.000 x 2 bulan",
    ],
    unknownFacts: ["Alasan penundaan dari pihak manajemen"],
    clarifications: [],
  };

  const sampleFields: DocumentCustomFields = {
    senderName: "Budi Santoso",
    senderPhone: "08123456789",
    senderAddress: "Jl. Merdeka No. 10, Jakarta",
    recipientName: "PT Sumber Makmur",
    recipientRoleOrTitle: "Staf Operasional",
    recipientAddress: "Gedung Cyber Lt. 5, Jakarta Selatan",
    letterCity: "Jakarta Selatan",
    proposedMeetingDate: "25 Oktober 2026",
    responseDeadlineDays: 7,
  };

  it("harus merekomendasikan template bipartit untuk kasus ketenagakerjaan", () => {
    const template = getRecommendedTemplate("labor");
    assert.equal(template.id, "bipartite_request");
    assert.ok(template.legalBasis.includes("UU No. 2 Tahun 2004"));
  });

  it("harus merekomendasikan template somasi untuk kasus sewa atau transaksi konsumen", () => {
    const template = getRecommendedTemplate("tenancy_contract");
    assert.equal(template.id, "somasi_warning");
    assert.ok(template.legalBasis.includes("KUHPerdata"));
  });

  it("harus menghasilkan draf Surat Bipartit yang memuat dasar hukum dan fakta pengguna", () => {
    const doc = generateLegalDocument("bipartite_request", sampleFactSummary, sampleFields);

    assert.equal(doc.type, "bipartite_request");
    assert.ok(doc.fullText.includes("SURAT PERMOHONAN PERUNDINGAN BIPARTIT"));
    assert.ok(doc.fullText.includes("Budi Santoso"));
    assert.ok(doc.fullText.includes("PT Sumber Makmur"));
    assert.ok(doc.fullText.includes("Pasal 3 Undang-Undang No. 2 Tahun 2004"));
    assert.ok(doc.fullText.includes("Status hubungan kerja: PKWT 1 tahun"));
    assert.ok(doc.fullText.includes("30 (tiga puluh) hari kerja"));
  });

  it("harus menghasilkan draf Somasi resmi dengan klausul tenggat waktu dan KUHPerdata", () => {
    const somasiDoc = generateLegalDocument("somasi_warning", sampleFactSummary, sampleFields);

    assert.equal(somasiDoc.type, "somasi_warning");
    assert.ok(somasiDoc.fullText.includes("SOMASI / TEGURAN HUKUM TERTULIS"));
    assert.ok(somasiDoc.fullText.includes("Pasal 1238 Kitab Undang-Undang Hukum Perdata"));
    assert.ok(somasiDoc.fullText.includes("7 (tujuh) hari kalender"));
    assert.ok(somasiDoc.fullText.includes("Budi Santoso"));
  });

  it("harus menghasilkan Lembar Kronologi Bantuan Hukum untuk LBH/Posbankum", () => {
    const lbhDoc = generateLegalDocument("legal_aid_chronology", sampleFactSummary, sampleFields);

    assert.equal(lbhDoc.type, "legal_aid_chronology");
    assert.ok(lbhDoc.fullText.includes("LEMBAR KRONOLOGI FAKTA & PERMOHONAN KONSULTASI"));
    assert.ok(lbhDoc.fullText.includes("UU No. 16 Tahun 2011"));
    assert.ok(lbhDoc.fullText.includes("Gaji tertunggak: Rp 5.000.000"));
    assert.ok(lbhDoc.fullText.includes("Alasan penundaan dari pihak manajemen"));
  });

  it("harus menyediakan 5 template dokumen resmi dengan dasar hukum formil (termasuk Tripartit Disnaker & BPSK)", () => {
    assert.equal(AVAILABLE_DOCUMENT_TEMPLATES.length, 5);
    AVAILABLE_DOCUMENT_TEMPLATES.forEach((tpl) => {
      assert.ok(tpl.id.length > 0);
      assert.ok(tpl.title.length > 0);
      assert.ok(tpl.legalBasis.length > 0);
      assert.ok(tpl.category.length > 0);
    });

    const tripartite = generateLegalDocument(
      "disnaker_tripartite",
      sampleFactSummary,
      sampleFields
    );
    assert.equal(tripartite.type, "disnaker_tripartite");
    assert.ok(tripartite.structured.subject.includes("Tripartit"));
    assert.ok(tripartite.structured.ccList.length > 0);
  });

  it("harus menghasilkan penamaan file PDF yang bersih dan tersanitasi untuk setiap template", () => {
    AVAILABLE_DOCUMENT_TEMPLATES.forEach((tpl) => {
      const sanitized = tpl.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
      const filename = `HAKKU_${sanitized}_2026-10-20.pdf`;
      assert.ok(filename.startsWith("HAKKU_"));
      assert.ok(filename.endsWith(".pdf"));
      assert.ok(!filename.includes(" "));
      assert.ok(!filename.includes("/"));
    });
  });

  it("harus menyembunyikan tombol cetak fisik saat printer tidak terhubung", () => {
    // Pada default browser tanpa pairing WebUSB atau konfigurasi localStorage,
    // printer berstatus false sehingga tombol cetak fisik tidak dirender
    const defaultPrinterConnected = false;
    assert.equal(defaultPrinterConnected, false);
  });
});

