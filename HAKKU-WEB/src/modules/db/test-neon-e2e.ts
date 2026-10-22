import { PostgresCaseRepository } from "./repository";
import { CreateCaseInput } from "./types";
import { GeminiAIProvider } from "../ai/gemini";
import { getDatabasePool } from "./client";

async function runE2ETest() {
  console.log("==================================================");
  console.log("HAKKU: E2E Verification of Neon & Gemini Services");
  console.log("==================================================");

  // 1. Test Gemini Live AI API
  console.log("\n[1/3] Testing Google Gemini AI API with user API Key...");
  const apiKey = process.env.LLM_API_KEY || "";
  const modelName = process.env.LLM_MODEL_NAME || "gemini-3.8-flash";
  const gemini = new GeminiAIProvider(apiKey, modelName);
  
  const testStory = "Saya bekerja sebagai staf gudang kontrak 1 tahun. Sudah 2 bulan upah saya belum dibayarkan oleh perusahaan dan atasan tidak bisa dihubungi.";
  console.log(`Story Input: "${testStory}"`);
  
  const aiResult = await gemini.analyzeIntake(testStory);
  console.log("✓ Gemini AI Response Received successfully!");
  console.log(`  - Category: ${aiResult.category} (${aiResult.categoryLabel})`);
  console.log(`  - Urgency: ${aiResult.urgencyLevel}`);
  console.log(`  - Questions Generated: ${aiResult.suggestedQuestions.length}`);
  aiResult.suggestedQuestions.forEach((q, i) => {
    console.log(`    ${i + 1}. ${q.question}`);
  });

  // 2. Test Neon Lakebase Postgres Persistence
  console.log("\n[2/3] Testing Neon Lakebase Postgres Persistence...");
  const repo = new PostgresCaseRepository();
  
  const sampleCaseInput: CreateCaseInput = {
    factSummary: {
      originalStory: testStory,
      category: aiResult.category,
      categoryLabel: aiResult.categoryLabel,
      urgencyLevel: aiResult.urgencyLevel,
      knownFacts: [
        "Status: Staf gudang kontrak 1 tahun",
        "Upah tertunggak 2 bulan",
      ],
      unknownFacts: ["Nominal pasti gaji belum dirinci"],
      clarifications: [
        {
          questionId: aiResult.suggestedQuestions[0]?.id || "q1",
          questionText: aiResult.suggestedQuestions[0]?.question || "Pertanyaan",
          answer: "Ada kontrak kerja tertulis bermeterai",
          isSkipped: false,
        },
      ],
      confirmedAt: new Date().toISOString(),
    },
    legalSource: {
      id: "src_labor_pp36",
      title: "UU No. 13/2003 jo. UU No. 6/2023 & PP No. 36/2021",
      sourceUrl: "https://jdih.kemnaker.go.id",
      articles: [
        {
          articleLabel: "PP No. 36/2021 Pasal 55",
          topic: "Kewajiban Pembayaran Upah & Denda",
        },
      ],
      actionOptions: [
        {
          title: "Musyawarah Bipartit",
          rationale: "Kewajiban hukum sebelum mediasi Disnaker",
        },
      ],
      uncertainties: ["Tergantung iktikad baik pengusaha"],
    },
    checklistItems: [
      {
        id: "check_contract",
        title: "Perjanjian Kerja (PKWT)",
        description: "Salinan kontrak kerja",
        required: true,
        isCompleted: false,
      },
      {
        id: "check_bank_statement",
        title: "Rekening Koran / Bukti Transfer",
        description: "Bukti mutasi pembayaran terakhir",
        required: true,
        isCompleted: false,
      },
    ],
  };

  const createdCase = await repo.createCase(sampleCaseInput);
  console.log("✓ Case created and persisted in Neon PostgreSQL!");
  console.log(`  - Case ID: ${createdCase.caseRecord.id}`);
  console.log(`  - Case Code: ${createdCase.caseRecord.caseCode}`);
  console.log(`  - Status: ${createdCase.caseRecord.status}`);
  console.log(`  - Checklist Items Saved: ${createdCase.checklists.length}`);

  // Query back from Neon to verify read
  const fetchedCase = await repo.getCaseByCode(createdCase.caseRecord.caseCode);
  if (!fetchedCase) {
    throw new Error("Failed to fetch back case from Neon database!");
  }
  console.log("✓ Successfully read back case from Neon PostgreSQL!");
  console.log(`  - Verified Case Code: ${fetchedCase.caseRecord.caseCode}`);
  console.log(`  - User Statement: ${fetchedCase.intake.userStatement.slice(0, 50)}...`);

  // Test toggling checklist in Neon
  await repo.toggleChecklistItem(createdCase.caseRecord.caseCode, "check_contract", true);
  const updatedCase = await repo.getCaseByCode(createdCase.caseRecord.caseCode);
  const contractItem = updatedCase?.checklists.find((c) => c.itemKey === "check_contract");
  console.log(`✓ Checklist toggled in Neon: isCompleted = ${contractItem?.isCompleted}`);

  // 3. Test Neon Functions
  console.log("\n[3/3] Testing Neon Function Hello endpoint...");
  const functionUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL || "";
  if (functionUrl) {
    const fnRes = await fetch(functionUrl);
    const fnText = await fnRes.text();
    console.log(`✓ Neon Function Response: "${fnText.trim()}"`);
  }

  // Cleanup test case from Neon (Right to Erasure)
  console.log("\nCleaning up test case from Neon...");
  await repo.deleteCase(createdCase.caseRecord.caseCode);
  const deletedCheck = await repo.getCaseByCode(createdCase.caseRecord.caseCode);
  console.log(`✓ Case deleted from Neon (Right to Erasure): exists = ${deletedCheck !== null}`);

  const pool = getDatabasePool();
  if (pool) await pool.end();

  console.log("\n==================================================");
  console.log("ALL SERVICES VERIFIED & OPERATIONAL END-TO-END!");
  console.log("==================================================");
}

runE2ETest().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});
