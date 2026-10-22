import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import {
  InMemoryCaseRepository,
  generateCaseCode,
} from "../src/modules/db/repository";
import { CreateCaseInput, CreateCaseInputSchema } from "../src/modules/db/types";

describe("Database Engine: Case Persistence & Repository", () => {
  let repo: InMemoryCaseRepository;

  beforeEach(() => {
    repo = new InMemoryCaseRepository();
  });

  const sampleInput: CreateCaseInput = {
    factSummary: {
      originalStory: "Gaji saya selama 2 bulan belum dibayar oleh PT Maju Bersama.",
      category: "labor",
      categoryLabel: "Ketenagakerjaan",
      urgencyLevel: "normal",
      knownFacts: [
        "Kronologi awal: Gaji tertunggak 2 bulan",
        "Status kerja: PKWT",
      ],
      unknownFacts: ["Nominal pasti upah tertunggak belum dihitung"],
      clarifications: [
        {
          questionId: "labor_status",
          questionText: "Status hubungan kerja?",
          answer: "PKWT",
          isSkipped: false,
        },
      ],
      confirmedAt: new Date().toISOString(),
    },
    legalSource: {
      id: "src_labor_pp36",
      title: "UU Ketenagakerjaan & PP 36/2021",
      sourceUrl: "https://jdih.kemnaker.go.id",
      articles: [
        {
          articleLabel: "Pasal 55 PP 36/2021",
          topic: "Kewajiban Pembayaran Upah",
        },
      ],
      actionOptions: [
        {
          title: "Musyawarah Bipartit",
          rationale: "Syarat formil wajib",
        },
      ],
      uncertainties: ["Tergantung iktikad baik pengusaha"],
    },
    checklistItems: [
      {
        id: "check_contract",
        title: "Perjanjian Kerja PKWT",
        description: "Salinan kontrak kerja",
        required: true,
        isCompleted: false,
      },
      {
        id: "check_slip",
        title: "Slip Gaji Terakhir",
        description: "Bukti penghitungan hak upah",
        required: true,
        isCompleted: false,
      },
    ],
  };

  it("generateCaseCode harus menghasilkan format HK-YYYY-XXXX unik", () => {
    const code = generateCaseCode();
    assert.match(code, /^HK-\d{4}-[A-F0-9]{6}$/);
  });

  it("CreateCaseInputSchema harus memvalidasi data perkara secara ketat", () => {
    const validResult = CreateCaseInputSchema.safeParse(sampleInput);
    assert.equal(validResult.success, true);

    const invalidInput = { ...sampleInput, factSummary: { ...sampleInput.factSummary, originalStory: "pendek" } };
    const invalidResult = CreateCaseInputSchema.safeParse(invalidInput);
    assert.equal(invalidResult.success, false);
  });

  it("createCase harus menyimpan perkara dan mengembalikan detail lengkap", async () => {
    const saved = await repo.createCase(sampleInput);

    assert.ok(saved.caseRecord.id);
    assert.match(saved.caseRecord.caseCode, /^HK-\d{4}-/);
    assert.equal(saved.caseRecord.category, "labor");
    assert.equal(saved.intake.userStatement, sampleInput.factSummary.originalStory);
    assert.equal(saved.checklists.length, 2);
    assert.equal(saved.checklists[0].isCompleted, false);
    assert.ok(saved.referrals.length >= 1);
  });

  it("getCaseByCode harus menemukan perkara yang telah disimpan", async () => {
    const saved = await repo.createCase(sampleInput);
    const retrieved = await repo.getCaseByCode(saved.caseRecord.caseCode);

    assert.ok(retrieved);
    assert.equal(retrieved?.caseRecord.id, saved.caseRecord.id);
    assert.equal(retrieved?.evaluation.legalSourceId, "src_labor_pp36");
  });

  it("toggleChecklistItem harus memperbarui status penyelesaian dokumen", async () => {
    const saved = await repo.createCase(sampleInput);
    const toggled = await repo.toggleChecklistItem(saved.caseRecord.caseCode, "check_contract", true);

    assert.equal(toggled, true);

    const updated = await repo.getCaseByCode(saved.caseRecord.caseCode);
    const item = updated?.checklists.find((c) => c.itemKey === "check_contract");
    assert.equal(item?.isCompleted, true);
  });

  it("deleteCase harus menghapus perkara secara permanen (Right to Erasure UU PDP)", async () => {
    const saved = await repo.createCase(sampleInput);
    const deleted = await repo.deleteCase(saved.caseRecord.caseCode);

    assert.equal(deleted, true);

    const recheck = await repo.getCaseByCode(saved.caseRecord.caseCode);
    assert.equal(recheck, null);
  });
});
