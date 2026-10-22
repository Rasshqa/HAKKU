"use client";

import React, { useState, useMemo, useEffect, useCallback, useId } from "react";
import Link from "next/link";
import {
  Coins,
  Scale,
  Calculator,
  Copy,
  Check,
  Printer,
  Calendar,
  Info,
  FileText,
} from "lucide-react";
import { triggerConfetti } from "@/lib/confetti";
import {
  EmploymentType,
  TerminationReason,
  CompensationCalculationInput,
  CompensationCalculationResult,
} from "@/modules/calculator/types";
import {
  calculateCompensation,
  formatRupiah,
  calculateTenureFromDates,
  TERMINATION_REASONS,
} from "@/modules/calculator/engine";

interface CompensationCalculatorProps {
  initialSalary?: number;
  initialYears?: number;
  initialMonths?: number;
  initialType?: EmploymentType;
  className?: string;
  onApplyToDocument?: (amount: number, summaryText: string) => void;
}

export function CompensationCalculator({
  initialSalary = 0,
  initialYears = 0,
  initialMonths = 0,
  initialType = "pkwtt",
  className = "",
  onApplyToDocument,
}: CompensationCalculatorProps) {
  const [employmentType, setEmploymentType] = useState<EmploymentType>(initialType);
  const [terminationReason, setTerminationReason] = useState<TerminationReason>(
    initialType === "pkwt" ? "pkwt_end" : "efficiency_loss"
  );
  const [monthlySalary, setMonthlySalary] = useState<number>(initialSalary);
  const [yearsOfService, setYearsOfService] = useState<number>(initialYears);
  const [monthsOfService, setMonthsOfService] = useState<number>(initialMonths);
  const [unusedLeaveDays, setUnusedLeaveDays] = useState<number>(0);
  const [unpaidWagesMonths, setUnpaidWagesMonths] = useState<number>(0);
  const [remainingContractMonths, setRemainingContractMonths] = useState<number>(0);
  const [voluntarySeparationPay, setVoluntarySeparationPay] = useState<number>(0);

  // Date calculation toggle
  const [useDateRange, setUseDateRange] = useState(false);
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");

  const [copied, setCopied] = useState(false);

  // Sync date range to years/months
  const handleDateChange = (start: string, end: string) => {
    setStartDateStr(start);
    setEndDateStr(end);
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    if (e >= s) {
      const tenure = calculateTenureFromDates(s, e);
      setYearsOfService(tenure.years);
      setMonthsOfService(tenure.months);
    }
  };

  // Switch employment type helper
  const handleTypeSwitch = (type: EmploymentType) => {
    setEmploymentType(type);
    if (type === "pkwt") {
      setTerminationReason("pkwt_end");
    } else {
      setTerminationReason("efficiency_loss");
    }
  };

  // Filter termination reasons based on employment type
  const availableReasons = useMemo(() => {
    return TERMINATION_REASONS.filter((r) =>
      r.applicableTo.includes(employmentType)
    );
  }, [employmentType]);

  // Current calculation result
  const result: CompensationCalculationResult = useMemo(() => {
    const input: CompensationCalculationInput = {
      employmentType,
      terminationReason,
      monthlySalary,
      yearsOfService,
      monthsOfService,
      unusedLeaveDays,
      unpaidWagesMonths,
      remainingContractMonths,
      voluntarySeparationPay,
    };
    return calculateCompensation(input);
  }, [
    employmentType,
    terminationReason,
    monthlySalary,
    yearsOfService,
    monthsOfService,
    unusedLeaveDays,
    unpaidWagesMonths,
    remainingContractMonths,
    voluntarySeparationPay,
  ]);

  // Rolling counter animation for smooth Rupiah calculation feedback
  const [animatedGrandTotal, setAnimatedGrandTotal] = useState(result.grandTotal);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startVal = animatedGrandTotal;
    const targetVal = result.grandTotal;
    const diff = targetVal - startVal;

    if (diff === 0) return;

    let animFrame: number;
    const duration = 500; // ms

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedGrandTotal(Math.round(startVal + diff * ease));

      if (progress < 1) {
        animFrame = requestAnimationFrame(step);
      }
    };

    animFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animFrame);
  }, [result.grandTotal]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopySummary = useCallback(() => {
    if (typeof navigator === "undefined") return;

    const lines: string[] = [
      `*RINGKASAN SIMULASI HAK PESANGON & KOMPENSASI HAKKU*`,
      `Dasar Hukum: PP No. 35 Tahun 2021 & UU Cipta Kerja`,
      `---------------------------------------`,
      `Status Kerja: ${employmentType === "pkwt" ? "Karyawan Kontrak (PKWT)" : "Karyawan Tetap (PKWTT)"}`,
      `Alasan PHK: ${result.reasonLabel}`,
      `Masa Kerja: ${result.tenureFormatted}`,
      `Upah Bulanan: ${formatRupiah(result.monthlySalary)}`,
      `---------------------------------------`,
      `RINCIAN HAK NORMATIF:`,
    ];

    result.breakdown.forEach((item) => {
      lines.push(`• ${item.title}: ${formatRupiah(item.amount)}`);
      lines.push(`  Formula: ${item.formula}`);
      lines.push(`  Dasar: ${item.legalBasis}`);
    });

    lines.push(`---------------------------------------`);
    lines.push(`*TOTAL ESTIMASI HAK: ${formatRupiah(result.grandTotal)}*`);
    lines.push(``);
    lines.push(
      `_Disusun secara otomatis melalui HAKKU Digital Legal Companion (http://localhost:3000/kalkulator)_`
    );

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    triggerConfetti({ particleCount: 65, spread: 60 });
    setTimeout(() => setCopied(false), 2000);
  }, [employmentType, result]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Keyboard Shortcut: Ctrl+S / Cmd+S to copy summary
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleCopySummary();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopySummary]);

  const salaryInputId = useId();
  const yearsInputId = useId();
  const monthsInputId = useId();
  const reasonSelectId = useId();
  const leaveInputId = useId();
  const unpaidInputId = useId();
  const remainingContractInputId = useId();
  const separationPayInputId = useId();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-xs font-semibold text-indigo-800 border border-indigo-200">
              <Calculator className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
              <span>Inovasi 2 • Kalkulator Simulasi Hak Normatif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              Kalkulator Pesangon & Kompensasi PHK (PP 35/2021)
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Hitung estimasi hak normatif Anda secara presisi dan deterministik berdasarkan Peraturan Pemerintah No. 35 Tahun 2021 (Uang Pesangon, UPMK, Penggantian Hak Cuti, dan Kompensasi PKWT).
            </p>
          </div>

          <div className="shrink-0 bg-gray-50 border border-brand-border rounded-xl p-3.5 sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold block">
              Regulasi Sah:
            </span>
            <span className="text-xs font-bold text-brand-primary">
              PP No. 35/2021 jo. UU No. 6/2023
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Controls vs Calculation Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Parameter (5 Kolom) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-6 shadow-xs print:hidden">
          {/* Segmented Control: PKWT vs PKWTT */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted block">
              1. Status Hubungan Kerja
            </label>
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => handleTypeSwitch("pkwt")}
                className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                  employmentType === "pkwt"
                    ? "bg-white text-brand-primary shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                Karyawan Kontrak (PKWT)
              </button>
              <button
                type="button"
                onClick={() => handleTypeSwitch("pkwtt")}
                className={`py-2 px-3 text-xs font-bold rounded-md transition-all ${
                  employmentType === "pkwtt"
                    ? "bg-white text-brand-primary shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                Karyawan Tetap (PKWTT)
              </button>
            </div>
            <p className="text-[11px] text-brand-muted">
              {employmentType === "pkwt"
                ? "Berhak atas Uang Kompensasi PKWT (Pasal 15 PP 35/2021)."
                : "Berhak atas Uang Pesangon (UP), UPMK, dan Penggantian Hak (Pasal 40 PP 35/2021)."}
            </p>
          </div>

          {/* Upah Bulanan */}
          <div className="space-y-2 pt-2 border-t border-brand-border">
            <div className="flex items-center justify-between">
              <label htmlFor={salaryInputId} className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted">
                2. Upah Bulanan (Pokok + Tunjangan Tetap)
              </label>
              <span className="text-[10px] text-brand-primary font-medium">Pasal 40 ayat 5</span>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-brand-muted">
                Rp
              </span>
              <input
                id={salaryInputId}
                type="number"
                min={0}
                step={100000}
                value={monthlySalary || ""}
                onChange={(e) => setMonthlySalary(Number(e.target.value) || 0)}
                placeholder="Contoh: 5000000"
                className="w-full text-xs font-mono font-bold pl-9 pr-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
              />
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {[4500000, 5500000, 8000000, 12000000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMonthlySalary(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                    monthlySalary === preset
                      ? "bg-brand-primary-light text-brand-primary border-brand-primary/30 font-bold"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
          </div>

          {/* Masa Kerja */}
          <div className="space-y-2 pt-2 border-t border-brand-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted">
                3. Durasi Masa Kerja
              </label>
              <button
                type="button"
                onClick={() => setUseDateRange((prev) => !prev)}
                className="text-[11px] text-brand-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Calendar className="w-3 h-3" />
                <span>{useDateRange ? "Input Tahun/Bulan" : "Hitung dari Tanggal"}</span>
              </button>
            </div>

            {useDateRange ? (
              <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg border border-brand-border">
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-brand-muted">Tanggal Mulai:</span>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => handleDateChange(e.target.value, endDateStr)}
                    className="w-full text-xs p-1.5 border border-brand-border rounded bg-white text-brand-text"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-medium text-brand-muted">Tanggal Selesai:</span>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => handleDateChange(startDateStr, e.target.value)}
                    className="w-full text-xs p-1.5 border border-brand-border rounded bg-white text-brand-text"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor={yearsInputId} className="text-[11px] font-medium text-brand-muted">
                    Tahun
                  </label>
                  <input
                    id={yearsInputId}
                    type="number"
                    min={0}
                    max={50}
                    value={yearsOfService || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setYearsOfService(Math.max(0, Number(e.target.value) || 0))
                    }
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor={monthsInputId} className="text-[11px] font-medium text-brand-muted">
                    Bulan Tambahan
                  </label>
                  <input
                    id={monthsInputId}
                    type="number"
                    min={0}
                    max={11}
                    value={monthsOfService || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setMonthsOfService(
                        Math.min(11, Math.max(0, Number(e.target.value) || 0))
                      )
                    }
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text font-bold"
                  />
                </div>
              </div>
            )}

            <div className="text-[11px] text-brand-muted font-medium bg-blue-50/60 p-2 rounded border border-blue-100 flex items-center justify-between">
              <span>Total Masa Kerja Dihitung:</span>
              <strong className="text-brand-primary">{result.tenureFormatted}</strong>
            </div>
          </div>

          {/* Alasan Pengakhiran Kerja */}
          <div className="space-y-2 pt-2 border-t border-brand-border">
            <label htmlFor={reasonSelectId} className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted block">
              4. Alasan Pemutusan Hubungan Kerja (PHK)
            </label>
            <select
              id={reasonSelectId}
              value={terminationReason}
              onChange={(e) =>
                setTerminationReason(e.target.value as TerminationReason)
              }
              className="w-full text-xs px-3 py-2.5 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text font-medium"
            >
              {availableReasons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Variabel Tambahan (Cuti, Tunggakan, dsb.) */}
          <div className="space-y-3 pt-2 border-t border-brand-border">
            <span className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted block">
              5. Hak Tambahan & Tunggakan (Opsional)
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor={leaveInputId} className="text-[11px] font-medium text-brand-muted">
                  Sisa Cuti Tahunan (Hari)
                </label>
                <input
                  id={leaveInputId}
                  type="number"
                  min={0}
                  value={unusedLeaveDays || ""}
                  onChange={(e) => setUnusedLeaveDays(Number(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={unpaidInputId} className="text-[11px] font-medium text-brand-muted">
                  Tunggakan Gaji (Bulan)
                </label>
                <input
                  id={unpaidInputId}
                  type="number"
                  min={0}
                  value={unpaidWagesMonths || ""}
                  onChange={(e) =>
                    setUnpaidWagesMonths(Number(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                />
              </div>
            </div>

            {employmentType === "pkwt" &&
              terminationReason === "pkwt_early_employer" && (
                <div className="space-y-1 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <label htmlFor={remainingContractInputId} className="text-[11px] font-bold text-amber-900 block">
                    Sisa Masa Kontrak yang Diputus Sepihak (Bulan)
                  </label>
                  <input
                    id={remainingContractInputId}
                    type="number"
                    min={1}
                    value={remainingContractMonths || ""}
                    onChange={(e) =>
                      setRemainingContractMonths(Number(e.target.value) || 0)
                    }
                    placeholder="Contoh: 4"
                    className="w-full text-xs px-3 py-2 border border-amber-300 rounded bg-white text-brand-text"
                  />
                  <p className="text-[10px] text-amber-800">
                    Sesuai Pasal 62 UU Ketenagakerjaan, pengusaha wajib membayar upah hingga batas waktu kontrak selesai.
                  </p>
                </div>
              )}

            {employmentType === "pkwtt" && terminationReason === "resignation" && (
              <div className="space-y-1">
                <label htmlFor={separationPayInputId} className="text-[11px] font-medium text-brand-muted">
                  Uang Pisah (Bila Diatur di PP / PKB) (Rp)
                </label>
                <input
                  id={separationPayInputId}
                  type="number"
                  min={0}
                  value={voluntarySeparationPay || ""}
                  onChange={(e) =>
                    setVoluntarySeparationPay(Number(e.target.value) || 0)
                  }
                  placeholder="0"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                />
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Dashboard Hasil Simulasi (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hero Calculation Card */}
          <div className="bg-blue-50/60 border-2 border-brand-primary/20 rounded-xl p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-brand-muted font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-brand-warning" />
                <span>Estimasi Total Hak Normatif Minimal</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 shadow-2xs">
                Pasal 40 PP 35/2021
              </span>
            </div>

            {monthlySalary === 0 ? (
              <div className="py-6 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-brand-primary flex items-center justify-center mx-auto shadow-2xs">
                  <Calculator className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-brand-text">
                  Masukkan Upah & Masa Kerja Anda
                </h4>
                <p className="text-xs text-brand-muted max-w-sm mx-auto leading-relaxed">
                  Silakan isi nominal upah bulanan dan durasi masa kerja pada formulir di sebelah kiri untuk melihat rincian perhitungan hak pesangon Anda sesuai PP 35/2021.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <div className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-brand-primary font-mono transition-all">
                    {formatRupiah(animatedGrandTotal)}
                  </div>
                  <p className="text-xs text-brand-muted mt-1">
                    Atas masa kerja {result.tenureFormatted} dengan alasan {result.reasonLabel}.
                  </p>
                </div>

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-brand-primary/10 print:hidden">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-gray-50 text-brand-text transition-colors border border-brand-border shadow-2xs min-touch-target"
                    title="Salin ringkasan teks untuk WhatsApp/Surat"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand-success" />
                        <span className="text-brand-success">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Rincian</span>
                        <kbd className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 bg-gray-100 border border-gray-300 rounded text-gray-500">
                          Ctrl+S
                        </kbd>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-gray-50 text-brand-text transition-colors border border-brand-border shadow-2xs min-touch-target"
                    title="Cetak lembar rincian simulasi"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak / Simpan PDF</span>
                  </button>

                  {onApplyToDocument ? (
                    <button
                      type="button"
                      onClick={() => {
                        const summary = `Tuntutan Hak Normatif PHK senilai total ${formatRupiah(result.grandTotal)} (${result.breakdown.map((b) => `${b.title}: ${formatRupiah(b.amount)}`).join(", ")})`;
                        triggerConfetti({ particleCount: 75, spread: 70 });
                        onApplyToDocument(result.grandTotal, summary);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors shadow-2xs min-touch-target"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Terapkan ke Draf Surat</span>
                    </button>
                  ) : (
                    <Link
                      href="/dokumen"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-primary hover:bg-brand-primary-hover text-white transition-colors shadow-2xs min-touch-target"
                    >
                      <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Masukkan ke Draf Surat Bipartit</span>
                    </Link>
                  )}
                </div>
              </>
            )}
            </div>

          {/* Itemized Breakdown Cards */}
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
                <Scale className="w-4 h-4 text-brand-primary" />
                <span>Rincian Komponen Hak Normatif</span>
              </h3>
              <span className="text-xs text-brand-muted">
                {monthlySalary === 0 ? "Menunggu Input" : `${result.breakdown.length} Komponen`}
              </span>
            </div>

            {monthlySalary === 0 ? (
              <div className="py-6 text-center text-xs text-brand-muted">
                Isi parameter upah dan masa kerja di sebelah kiri untuk melihat rincian dasar hukum dan formula perhitungan.
              </div>
            ) : (
              <div className="space-y-3">
                {result.breakdown.map((item) => (
                  <div
                    key={item.key}
                    className="p-4 bg-gray-50 border border-brand-border rounded-xl space-y-2 text-xs transition-all hover:border-gray-300"
                  >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <strong className="text-sm font-bold text-brand-text">
                      {item.title}
                    </strong>
                    <span className="text-base font-extrabold text-brand-primary font-mono">
                      {formatRupiah(item.amount)}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-gray-200 space-y-1 font-mono text-[11px] text-gray-700">
                    <div>
                      <span className="text-gray-500">Rumus: </span>
                      <span className="font-semibold">{item.formula}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-brand-muted pt-1">
                    <span className="leading-relaxed">{item.description}</span>
                  </div>
                  <div className="text-[10px] text-brand-primary font-semibold flex items-center gap-1">
                    <Scale className="w-3 h-3 shrink-0" />
                    <span>Dasar: {item.legalBasis}</span>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>

          {/* Catatan Hukum & Edukasi Transparansi */}
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 space-y-2 text-xs text-blue-900 print:hidden">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Pedoman Hukum Penting:</span>
            </div>
            <ul className="space-y-1.5 text-blue-800/90 leading-relaxed text-[11px]">
              {result.legalNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
