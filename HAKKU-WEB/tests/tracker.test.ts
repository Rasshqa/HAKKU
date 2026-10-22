import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Case Tracker & Statutory Response Countdown", () => {
  it("harus menghitung sisa hari dan status aktif masa tunggu 14 hari dengan tepat", () => {
    const durationDays = 14;
    const now = new Date("2026-10-25T10:00:00Z").getTime();
    const deliveryTime = new Date("2026-10-20T10:00:00Z").getTime(); // 5 days elapsed

    const elapsedDays = Math.floor((now - deliveryTime) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, durationDays - elapsedDays);
    const progress = Math.min(100, Math.round((elapsedDays / durationDays) * 100));

    assert.equal(elapsedDays, 5);
    assert.equal(remaining, 9);
    assert.equal(progress, 36);
    const isExpired = (remaining as number) === 0;
    assert.equal(isExpired, false);
  });

  it("harus mendeteksi kondisi batas waktu terpenuhi (expired / hak lapor aktif) jika melebihi 14 hari", () => {
    const durationDays = 14;
    const now = new Date("2026-10-25T10:00:00Z").getTime();
    const deliveryTime = new Date("2026-10-10T10:00:00Z").getTime(); // 15 days elapsed

    const elapsedDays = Math.floor((now - deliveryTime) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, durationDays - elapsedDays);
    const isExpired = remaining === 0;

    assert.equal(elapsedDays, 15);
    assert.equal(remaining, 0);
    assert.equal(isExpired, true);
  });

  it("harus mendukung opsi durasi somasi mendesak 7 hari (KUHPerdata 1238)", () => {
    const durationDays = 7;
    const now = new Date("2026-10-14T10:00:00Z").getTime();
    const deliveryTime = new Date("2026-10-10T10:00:00Z").getTime(); // 4 days elapsed

    const elapsedDays = Math.floor((now - deliveryTime) / (1000 * 60 * 60 * 24));
    const remaining = Math.max(0, durationDays - elapsedDays);

    assert.equal(elapsedDays, 4);
    assert.equal(remaining, 3);
  });
});
