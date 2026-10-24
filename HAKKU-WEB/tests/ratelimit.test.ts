import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { rateLimiter, enforceRateLimit, getClientIp } from "../src/lib/rate-limiter";
import {
  MAX_CONSULTATION_TURNS,
  MAX_USER_MESSAGE_LENGTH,
  countUserTurns,
} from "../src/modules/ai/consultation";

describe("Rate Limiter & Anti-Abuse Engine", () => {
  beforeEach(() => {
    rateLimiter.clear();
  });

  it("harus meloloskan permintaan pertama dan menghitung sisa kuota", () => {
    const result = rateLimiter.check("test-user-1", {
      burstLimit: 5,
      burstWindowSec: 60,
    });

    assert.equal(result.allowed, true);
    assert.equal(result.limit, 5);
    assert.equal(result.remaining, 4);
    assert.equal(result.retryAfterSec, 0);
  });

  it("harus memblokir permintaan setelah melebihi burstLimit dan mengembalikan retryAfterSec", () => {
    const key = "test-user-burst";
    const config = { burstLimit: 3, burstWindowSec: 10 };

    // Request 1, 2, 3: Allowed
    assert.equal(rateLimiter.check(key, config).allowed, true);
    assert.equal(rateLimiter.check(key, config).allowed, true);
    assert.equal(rateLimiter.check(key, config).allowed, true);

    // Request 4: Blocked
    const blocked = rateLimiter.check(key, config);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "burst");
    assert.ok(blocked.retryAfterSec > 0, "Harus mengembalikan waktu tunggu retryAfter");
  });

  it("harus memblokir saat batas per jam (hourlyLimit) terlampaui", () => {
    const key = "test-user-hourly";
    const config = { burstLimit: 20, hourlyLimit: 2, hourlyWindowSec: 3600 };

    assert.equal(rateLimiter.check(key, config).allowed, true);
    assert.equal(rateLimiter.check(key, config).allowed, true);

    const blocked = rateLimiter.check(key, config);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.reason, "hourly");
    assert.ok(blocked.retryAfterSec > 0);
  });

  it("getClientIp harus mengekstrak IP pertama dari x-forwarded-for secara aman", () => {
    const req = new NextRequest("http://localhost:3000/api/consultation/chat", {
      headers: {
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      },
    });

    const ip = getClientIp(req);
    assert.equal(ip, "203.0.113.195");
  });

  it("enforceRateLimit harus mengembalikan HTTP 429 ketika limit terlampaui", () => {
    const key = "rate-limit-helper-test";
    const req = new NextRequest("http://localhost:3000/api/consultation/chat", {
      headers: {
        "x-real-ip": "198.51.100.42",
      },
    });

    const config = { burstLimit: 2, burstWindowSec: 60 };

    const first = enforceRateLimit(req, config, key);
    assert.equal(first, null, "Permintaan awal harus diizinkan");

    const second = enforceRateLimit(req, config, key);
    assert.equal(second, null, "Permintaan kedua harus diizinkan");

    const blockedResponse = enforceRateLimit(req, config, key);
    assert.ok(blockedResponse !== null, "Harus mengembalikan response 429");
    assert.equal(blockedResponse.status, 429);
    assert.ok(blockedResponse.headers.get("Retry-After") !== null);
    assert.equal(blockedResponse.headers.get("X-RateLimit-Remaining"), "0");
  });
});

describe("Consultation Interview Turn & Cost Limitation", () => {
  it("harus menetapkan batasan maksimal 15 sesi wawancara untuk melindungi biaya API", () => {
    assert.equal(MAX_CONSULTATION_TURNS, 15);
    assert.equal(MAX_USER_MESSAGE_LENGTH, 1500);
  });

  it("countUserTurns harus menghitung jumlah pesan user secara akurat", () => {
    const history = [
      { role: "assistant" },
      { role: "user" },
      { role: "assistant" },
      { role: "user" },
      { role: "assistant" },
    ];
    assert.equal(countUserTurns(history), 2);
  });
});
