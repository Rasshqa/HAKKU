import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

import { MockAIProvider } from "../src/modules/ai/mock";
import { GeminiAIProvider } from "../src/modules/ai/gemini";
import { getAIProvider, resetAIProviderCache } from "../src/modules/ai/factory";
import { IntakeRequestSchema, IntakeAnalysisResultSchema } from "../src/modules/ai/types";

describe("AI Engine: Validation & Provider Abstraction", () => {
  beforeEach(() => {
    resetAIProviderCache();
    delete process.env.LLM_PROVIDER;
    delete process.env.LLM_API_KEY;
  });

  it("IntakeRequestSchema harus menolak input cerita kosong atau terlalu pendek", () => {
    const invalidShort = { story: "halo" };
    const resultShort = IntakeRequestSchema.safeParse(invalidShort);
    assert.equal(resultShort.success, false);

    const valid = { story: "Gaji saya sudah 3 bulan belum dibayarkan oleh perusahaan." };
    const resultValid = IntakeRequestSchema.safeParse(valid);
    assert.equal(resultValid.success, true);
  });

  it("MockAIProvider harus menghasilkan output yang 100% valid sesuai skema Zod", async () => {
    const provider = new MockAIProvider();
    const result = await provider.analyzeIntake(
      "Saya ditipu saat belanja online barang elektronik dan penjual kabur."
    );

    assert.equal(result.category, "consumer_digital");
    assert.equal(result.urgencyLevel, "normal");
    assert.ok(result.suggestedQuestions.length >= 2);

    const schemaValidation = IntakeAnalysisResultSchema.safeParse(result);
    assert.equal(schemaValidation.success, true);
  });

  it("GeminiAIProvider harus melakukan fallback aman ke rule engine bila API Key tidak valid", async () => {
    const gemini = new GeminiAIProvider("your_api_key_here", "gemini-2.0-flash");
    const result = await gemini.analyzeIntake(
      "Uang sewa kamar kos saya tidak dikembalikan padahal kunci sudah diserahkan."
    );

    assert.equal(result.category, "tenancy_contract");
    assert.ok(result.suggestedQuestions.length >= 2);
  });

  it("Factory harus menghasilkan MockAIProvider secara default dan Gemini bila dikonfigurasi", () => {
    process.env.LLM_PROVIDER = "mock";
    const defaultProvider = getAIProvider();
    assert.equal(defaultProvider.name, "mock-rules-engine");

    resetAIProviderCache();
    process.env.LLM_PROVIDER = "gemini";
    process.env.LLM_API_KEY = "test_key_123";
    const geminiProvider = getAIProvider();
    assert.equal(geminiProvider.name, "google-gemini");
  });
});
