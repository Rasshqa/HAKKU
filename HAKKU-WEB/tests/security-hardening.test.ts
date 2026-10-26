import test from "node:test";
import assert from "node:assert/strict";
import { InMemoryCaseRepository } from "@/modules/db/repository";
import { CreateCaseInput } from "@/modules/db/types";
import { rateLimiter } from "@/lib/rate-limiter";

function createMockCaseInput(userId: string | null, title: string): CreateCaseInput {
  return {
    title,
    userId,
    factSummary: {
      originalStory: "Saya mengalami pemutusan kerja sepihak tanpa pesangon.",
      category: "labor",
      categoryLabel: "Ketenagakerjaan & PHK",
      urgencyLevel: "normal",
      knownFacts: ["Bekerja 2 tahun"],
      unknownFacts: [],
      clarifications: [],
    },
    legalSource: {
      id: "src-1",
      title: "PP 35/2021",
      sourceUrl: "https://jdih.kemnaker.go.id",
      articles: [],
      actionOptions: [],
      uncertainties: [],
    },
    checklistItems: [
      {
        id: "check-1",
        title: "Kumpulkan bukti",
        description: "Kontrak kerja dan slip gaji",
        required: true,
        isCompleted: false,
      },
    ],
  };
}

test("Security: Case Repository Multi-Tenant Isolation by userId", async () => {
  const repo = new InMemoryCaseRepository();

  // Hitung jumlah awal kasus anonim (seed case bawaan)
  const initialAnonCases = await repo.listCases({ userId: null });

  // Buat kasus untuk User A, User B, dan Anonim
  await repo.createCase(createMockCaseInput("user-a-123", "Kasus Pekerja A"));
  await repo.createCase(createMockCaseInput("user-b-456", "Kasus Pekerja B"));
  await repo.createCase(createMockCaseInput(null, "Kasus Anonim Baru"));

  // 1. Filter untuk User A hanya mengembalikan kasus User A
  const casesUserA = await repo.listCases({ userId: "user-a-123" });
  assert.equal(casesUserA.length, 1);
  assert.equal(casesUserA[0].userId, "user-a-123");
  assert.equal(casesUserA[0].title, "Kasus Pekerja A");

  // 2. Filter untuk User B hanya mengembalikan kasus User B
  const casesUserB = await repo.listCases({ userId: "user-b-456" });
  assert.equal(casesUserB.length, 1);
  assert.equal(casesUserB[0].userId, "user-b-456");
  assert.equal(casesUserB[0].title, "Kasus Pekerja B");

  // 3. Filter untuk Guest/Anonim bertambah tepat 1
  const casesAnon = await repo.listCases({ userId: null });
  assert.equal(casesAnon.length, initialAnonCases.length + 1);
  assert.ok(casesAnon.some((c) => c.title === "Kasus Anonim Baru"));
});

test("Security: Rate Limiter blocks excessive requests with 429", async () => {
  const testKey = "test-security-ip-429";
  rateLimiter.reset(testKey);

  assert.equal(rateLimiter.check(testKey, { burstLimit: 3 }).allowed, true);
  assert.equal(rateLimiter.check(testKey, { burstLimit: 3 }).allowed, true);
  assert.equal(rateLimiter.check(testKey, { burstLimit: 3 }).allowed, true);

  // Permintaan ke-4 harus diblokir karena melebihi burstLimit (3)
  const fourthReq = rateLimiter.check(testKey, { burstLimit: 3 });
  assert.equal(fourthReq.allowed, false);
  assert.ok((fourthReq.retryAfterSec ?? 0) > 0);
  assert.equal(fourthReq.reason, "burst");
});
