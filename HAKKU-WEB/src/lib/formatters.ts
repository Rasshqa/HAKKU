import crypto from "crypto";

/**
 * Format nominal angka ke dalam format mata uang Rupiah Indonesia (IDR).
 * Contoh: 5000000 -> "Rp 5.000.000"
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const INDONESIAN_MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const;

/**
 * Format tanggal ke dalam format bahasa Indonesia resmi.
 * Contoh: Date -> "19 Oktober 2026"
 */
export function formatIndonesianDate(dateInput: Date | string | number = new Date()): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "-";
  }
  const day = date.getDate();
  const month = INDONESIAN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format tanggal singkat berformat id-ID.
 * Contoh: "19/10/2026"
 */
export function formatShortDate(dateInput: Date | string | number = new Date()): string {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleDateString("id-ID");
}

/**
 * Menghasilkan kode referensi perkara unik ramah manusia berstandar HAKKU (Contoh: HK-2026-X89B).
 * Menggunakan crypto.randomBytes untuk keacakan kriptografis yang aman.
 */
export function generateCaseCode(): string {
  const year = new Date().getFullYear();
  const randomPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `HK-${year}-${randomPart}`;
}
