import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { analyzeUserStory } from "../src/modules/intake/analyzer";
import { matchLegalSources, VERIFIED_LEGAL_CORPUS } from "../src/modules/legal/corpus";
import { getReferralsByCategory, VERIFIED_REFERRAL_SERVICES } from "../src/modules/referral/directory";
import { buildCaseEvaluation } from "../src/modules/case/engine";
import { ClarificationAnswer } from "../src/modules/intake/types";

describe("Domain Engine: Story Analyzer (Universal Scenarios)", () => {
  it("harus mendeteksi kasus ketenagakerjaan dengan benar", () => {
    const story = "Gaji saya sudah 2 bulan belum dibayar oleh perusahaan dan atasan menghindar.";
    const result = analyzeUserStory(story);

    assert.equal(result.category, "labor");
    assert.equal(result.urgencyLevel, "normal");
    assert.ok(result.suggestedQuestions.length >= 3);
    assert.ok(result.detectedKeywords.includes("gaji") || result.detectedKeywords.includes("perusahaan"));
  });

  it("harus mendeteksi kasus pemecatan sepihak (PHK) seperti dipecat karena urusan personal", () => {
    const story = "Saya dipecat karena memacari anak bos saya.";
    const result = analyzeUserStory(story);

    assert.equal(result.category, "labor");
    assert.equal(result.categoryLabel, "Ketenagakerjaan & Hubungan Kerja");
    assert.ok(result.detectedKeywords.includes("dipecat") || result.detectedKeywords.includes("bos"));
    assert.equal(result.extractedEntities?.isTermination, true);
    assert.equal(result.scopeAssessment?.status, "valid_legal_case");
    // Pertanyaan klarifikasi harus memuat pertanyaan mengenai surat PHK tertulis
    assert.ok(result.suggestedQuestions.some((q) => q.question.includes("alasan tertulis resmi") || q.question.includes("pemecatan")));
  });

  it("harus mendeteksi penipuan belanja online / transaksi digital", () => {
    const story = "Saya beli barang di toko online, sudah transfer uang tapi nomor saya diblokir dan resi palsu.";
    const result = analyzeUserStory(story);

    assert.equal(result.category, "consumer_digital");
    assert.equal(result.urgencyLevel, "normal");
    assert.ok(result.suggestedQuestions.some((q) => q.id.includes("consumer")));
  });

  it("harus mendeteksi sengketa sewa menyewa & kontrak", () => {
    const story = "Pemilik kontrakan menolak mengembalikan uang deposit sewa kamar saya padahal sudah serah terima kunci.";
    const result = analyzeUserStory(story);

    assert.equal(result.category, "tenancy_contract");
  });

  it("harus memicu sinyal kedaruratan jika terdeteksi ancaman fisik atau kekerasan (Safety Triage)", () => {
    const story = "Suami melakukan pemukulan fisik dan KDRT di rumah serta mengancam keselamatan saya.";
    const result = analyzeUserStory(story);

    assert.equal(result.urgencyLevel, "urgent_safety");
    assert.ok(result.safetyWarning !== undefined);
    assert.ok(result.safetyWarning.recommendedHelplines.length >= 2);
    // Memastikan ada kontak darurat kepolisian 110 atau SAPA 129
    assert.ok(
      result.safetyWarning.recommendedHelplines.some(
        (h) => h.contact.includes("110") || h.contact.includes("129")
      )
    );
  });

  it("harus mendeteksi input non-hukum atau curhat umum secara tepat", () => {
    const nonLegalStory = "Halo apa kabar, resep nasi goreng kambing enak apa ya?";
    const result = analyzeUserStory(nonLegalStory);

    assert.ok(result.scopeAssessment !== undefined);
    assert.equal(result.scopeAssessment.status, "non_legal");
    assert.equal(result.scopeAssessment.suggestedAction, "redirect_general");
  });

  it("harus mendeteksi dan memblokir indikasi tindakan ilegal (hacking/pemalsuan)", () => {
    const illegalStory = "Bagaimana cara meretas akun Instagram mantan dan menyadap WhatsApp nya?";
    const result = analyzeUserStory(illegalStory);

    assert.ok(result.scopeAssessment !== undefined);
    assert.equal(result.scopeAssessment.status, "illegal_intent");
    assert.equal(result.scopeAssessment.suggestedAction, "block_illegal");
  });

  it("harus menyesuaikan pertanyaan klarifikasi dengan nominal dan platform yang disebut", () => {
    const story = "Gaji saya sebesar Rp 7.500.000 selama 2 bulan belum dibayar oleh PT Maju Bersama.";
    const result = analyzeUserStory(story);

    assert.equal(result.category, "labor");
    assert.ok(result.extractedEntities !== undefined);
    assert.ok(result.extractedEntities.monetaryAmount?.includes("7.500.000"));
    // Pertanyaan harus memuat nominal yang diekstrak secara dinamis
    const tailoredQ = result.suggestedQuestions.find((q) => q.id === "labor_timeline_amount");
    assert.ok(tailoredQ !== undefined);
    assert.ok(tailoredQ.question.includes("7.500.000"));
  });
});

describe("Domain Engine: Verified Legal Corpus", () => {
  it("seluruh korpus hukum harus memiliki status verified_current dan URL sah", () => {
    const categories = Object.keys(VERIFIED_LEGAL_CORPUS) as (keyof typeof VERIFIED_LEGAL_CORPUS)[];

    categories.forEach((cat) => {
      const source = matchLegalSources(cat);
      assert.equal(source.legalStatus, "verified_current");
      assert.ok(source.sourceUrl.startsWith("https://"));
      assert.ok(source.articles.length >= 1);
      assert.ok(source.actionOptions.length >= 1);
      assert.ok(source.checklist.length >= 1);
      assert.ok(source.uncertainties.length >= 1);
    });
  });

  it("setiap pasal hukum dalam korpus harus memuat pasal resmi dan penjelasan konkret", () => {
    const labor = matchLegalSources("labor");
    const hasWageArticle = labor.articles.some((a) => a.topic.includes("Upah"));
    assert.ok(hasWageArticle, "Harus memuat pasal perlindungan upah");
  });
});

describe("Domain Engine: Fact Separation & Case Evaluation", () => {
  it("harus memisahkan secara tegas fakta pengguna vs informasi yang belum diketahui", () => {
    const story = "Uang sewa saya dinaikkan sepihak.";
    const analysis = analyzeUserStory(story);

    const answers: ClarificationAnswer[] = [
      {
        questionId: "q1",
        questionText: "Apakah ada kontrak tertulis?",
        answer: "Ada kontrak bermeterai 1 tahun",
        isSkipped: false,
      },
      {
        questionId: "q2",
        questionText: "Berapa kenaikannya?",
        answer: "Saya tidak tahu",
        isSkipped: true,
      },
    ];

    const evaluation = buildCaseEvaluation(story, analysis, answers);

    // Known facts harus memuat cerita awal dan jawaban q1
    assert.ok(evaluation.factSummary.knownFacts.some((f) => f.includes("Ada kontrak bermeterai")));
    // Unknown facts harus memuat q2 yang dilewati
    assert.ok(evaluation.factSummary.unknownFacts.some((f) => f.includes("Apakah ada kontrak tertulis?") === false));
    assert.ok(evaluation.factSummary.unknownFacts.some((f) => f.includes("Berapa kenaikannya?")));
    // Checklist harus terisi
    assert.ok(evaluation.checklistItems.length >= 1);
  });
});

describe("Domain Engine: Referral Directory", () => {
  it("seluruh organisasi rujukan harus memiliki status verified dan URL resmi", () => {
    VERIFIED_REFERRAL_SERVICES.forEach((org) => {
      assert.equal(org.verificationStatus, "verified");
      assert.ok(org.website.startsWith("https://"));
      assert.ok(org.feePolicy.length > 0);
    });
  });

  it("harus mengembalikan Posbankum atau YLBHI saat pencarian kategori apapun", () => {
    const laborRefs = getReferralsByCategory("labor");
    assert.ok(laborRefs.length >= 1);

    const generalRefs = getReferralsByCategory("general_dispute");
    assert.ok(generalRefs.some((r) => r.id === "ref_posbankum_pn_pa" || r.id === "ref_ylbhi"));
  });
});
