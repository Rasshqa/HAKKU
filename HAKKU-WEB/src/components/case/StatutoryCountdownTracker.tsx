"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Building2,
  FileCheck2,
  Info,
} from "lucide-react";

interface StatutoryCountdownTrackerProps {
  caseCode: string;
  category: string;
  createdAt: string;
  onSwitchTab?: (tab: "overview" | "document" | "calculator" | "evidence") => void;
  className?: string;
}

// Cross-tab and external store listener for tracker state
const trackerListeners = new Set<() => void>();
function notifyTrackerListeners() {
  trackerListeners.forEach((l) => {
    try {
      l();
    } catch {
      // non-fatal
    }
  });
}

function subscribeTracker(callback: () => void) {
  trackerListeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    trackerListeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

export function StatutoryCountdownTracker({
  caseCode,
  category,
  createdAt,
  onSwitchTab,
  className = "",
}: StatutoryCountdownTrackerProps) {
  // Safe client date reading via useSyncExternalStore (prevents SSR hydration mismatch & effect cascading renders)
  const now = useSyncExternalStore(
    (callback) => {
      const timer = setInterval(callback, 60000);
      return () => clearInterval(timer);
    },
    () => Date.now(),
    () => null
  );

  const isLaborCase = category === "labor";
  const storageKey = `hakku_tracker_${caseCode}`;

  const defaultDeliveryDate = useMemo(() => {
    return createdAt ? new Date(createdAt).toISOString().slice(0, 10) : "";
  }, [createdAt]);

  const rawStorage = useSyncExternalStore(
    subscribeTracker,
    () => {
      try {
        return localStorage.getItem(storageKey) || "";
      } catch {
        return "";
      }
    },
    () => ""
  );

  const trackerData = useMemo(() => {
    let parsed: {
      deliveryDateStr?: string;
      durationDays?: number;
      stepsCompleted?: { letterSent: boolean; receiptSaved: boolean; followupPrepared: boolean };
    } = {};

    if (rawStorage) {
      try {
        parsed = JSON.parse(rawStorage);
      } catch {
        // fallback
      }
    }

    return {
      deliveryDateStr: parsed.deliveryDateStr !== undefined ? parsed.deliveryDateStr : defaultDeliveryDate,
      durationDays: typeof parsed.durationDays === "number" ? parsed.durationDays : 14,
      stepsCompleted: parsed.stepsCompleted || {
        letterSent: true,
        receiptSaved: false,
        followupPrepared: false,
      },
    };
  }, [rawStorage, defaultDeliveryDate]);

  const deliveryDateStr = trackerData.deliveryDateStr;
  const durationDays = trackerData.durationDays;
  const stepsCompleted = trackerData.stepsCompleted;

  // Save state on change
  const saveState = (updated: {
    deliveryDateStr?: string;
    durationDays?: number;
    stepsCompleted?: { letterSent: boolean; receiptSaved: boolean; followupPrepared: boolean };
  }) => {
    try {
      const next = {
        deliveryDateStr: updated.deliveryDateStr !== undefined ? updated.deliveryDateStr : deliveryDateStr,
        durationDays: updated.durationDays !== undefined ? updated.durationDays : durationDays,
        stepsCompleted: updated.stepsCompleted !== undefined ? updated.stepsCompleted : stepsCompleted,
      };
      localStorage.setItem(storageKey, JSON.stringify(next));
      notifyTrackerListeners();
    } catch {
      // LocalStorage error non-fatal
    }
  };

  const handleDeliveryDateChange = (val: string) => {
    saveState({ deliveryDateStr: val });
  };

  const handleDurationChange = (val: number) => {
    saveState({ durationDays: val });
  };

  const toggleStep = (stepKey: "letterSent" | "receiptSaved" | "followupPrepared") => {
    const updated = {
      ...stepsCompleted,
      [stepKey]: !stepsCompleted[stepKey],
    };
    saveState({ stepsCompleted: updated });
  };

  // Statutory Calculations
  const calculations = useMemo(() => {
    if (!now || !deliveryDateStr) {
      return {
        daysElapsed: 0,
        daysRemaining: durationDays,
        progressPercent: 0,
        isExpired: false,
        deadlineFormatted: "Menghitung...",
      };
    }

    const deliveryTime = new Date(deliveryDateStr).getTime();
    const elapsedMs = now - deliveryTime;
    const elapsedDays = Math.max(0, Math.floor(elapsedMs / (1000 * 60 * 60 * 24)));
    const remaining = Math.max(0, durationDays - elapsedDays);
    const progress = Math.min(100, Math.max(0, Math.round((elapsedDays / durationDays) * 100)));

    const deadlineDate = new Date(deliveryTime + durationDays * 24 * 60 * 60 * 1000);
    const deadlineFormatted = deadlineDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return {
      daysElapsed: elapsedDays,
      daysRemaining: remaining,
      progressPercent: progress,
      isExpired: remaining === 0,
      deadlineFormatted,
    };
  }, [now, deliveryDateStr, durationDays]);

  return (
    <div className={`bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-6 shadow-xs ${className}`}>
      {/* Header Pipeline Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-bold text-brand-primary border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Pelacak Masa Tunggu Formil (UU 2/2004 & KUHPerdata 1238)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-brand-text">
            Status Perjalanan Dokumen & Batas Waktu Tanggapan
          </h3>
        </div>

        {/* Dynamic Countdown Badge */}
        <div className="text-left sm:text-right shrink-0">
          {calculations.isExpired ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              <ShieldAlert className="w-4 h-4 text-red-600 animate-pulse" />
              <span>Batas Waktu Terpenuhi (Hak Lapor Aktif)</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Sisa {calculations.daysRemaining} Hari Kalender</span>
            </div>
          )}
        </div>
      </div>

      {/* 3-Stage Progress Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1 */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700">Tahap 1</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Penyusunan & Pengiriman</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Draf surat resmi dicetak dan dikirimkan dengan bukti nomor resi tercatat.
          </p>
        </div>

        {/* Step 2 */}
        <div
          className={`p-3.5 rounded-xl border space-y-1.5 relative ${
            calculations.isExpired
              ? "border-emerald-200 bg-emerald-50/50"
              : "border-blue-300 bg-blue-50/60 ring-2 ring-blue-500/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700">Tahap 2 • Aktif</span>
            <Clock className={`w-4 h-4 ${calculations.isExpired ? "text-emerald-600" : "text-blue-600 animate-spin"}`} />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Masa Tunggu {durationDays} Hari</h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Hari ke-{calculations.daysElapsed} dari {durationDays}. Tenggat: <strong>{calculations.deadlineFormatted}</strong>.
          </p>
        </div>

        {/* Step 3 */}
        <div
          className={`p-3.5 rounded-xl border space-y-1.5 relative ${
            calculations.isExpired
              ? "border-amber-300 bg-amber-50/70 ring-2 ring-amber-500/30"
              : "border-slate-200 bg-slate-50 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600">Tahap 3</span>
            {calculations.isExpired ? (
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            ) : (
              <Building2 className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <h4 className="text-xs font-bold text-slate-900">
            {isLaborCase ? "Eskalasi Tripartit Disnaker" : "Langkah Hukum Formil"}
          </h4>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {calculations.isExpired
              ? "Pihak lawan terbukti tidak merespons. Berhak lapor mediasi resmi."
              : "Menunggu tenggat waktu 14 hari sebelum hak lapor terbuka."}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Progres Masa Tunggu Tanggapan</span>
          <span className="font-mono">{calculations.progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              calculations.isExpired ? "bg-red-500" : "bg-brand-primary"
            }`}
            style={{ width: `${calculations.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Date Configuration Form */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Tanggal Surat Diterima Pihak Lawan:
          </label>
          <input
            type="date"
            value={deliveryDateStr}
            onChange={(e) => handleDeliveryDateChange(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-hidden focus:border-brand-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Masa Tenggat Tanggapan Sesuai Surat:
          </label>
          <select
            value={durationDays}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
            className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white text-slate-800 focus:outline-hidden focus:border-brand-primary"
          >
            <option value={7}>7 Hari Kalender (Standar Somasi Teguran)</option>
            <option value={14}>14 Hari Kalender (Standar Formil Pra-Litigasi)</option>
            <option value={30}>30 Hari Kerja (Maksimal Bipartit UU 2/2004)</option>
          </select>
        </div>
      </div>

      {/* Interactive Action Checklist for Citizen */}
      <div className="space-y-2.5 pt-1">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider text-brand-muted">
          <FileCheck2 className="w-4 h-4 text-brand-primary" />
          <span>Langkah Tindakan Selama Masa Tunggu:</span>
        </h4>

        <div className="space-y-2">
          <label
            onClick={() => toggleStep("letterSent")}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer select-none text-xs transition-colors"
          >
            <input
              type="checkbox"
              checked={stepsCompleted.letterSent}
              readOnly
              className="mt-0.5 rounded text-brand-primary focus:ring-brand-primary"
            />
            <span className={stepsCompleted.letterSent ? "line-through text-slate-400" : "text-slate-800 font-medium"}>
              Surat permohonan bipartit / somasi telah dicetak dan dikirimkan ke alamat resmi.
            </span>
          </label>

          <label
            onClick={() => toggleStep("receiptSaved")}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer select-none text-xs transition-colors"
          >
            <input
              type="checkbox"
              checked={stepsCompleted.receiptSaved}
              readOnly
              className="mt-0.5 rounded text-brand-primary focus:ring-brand-primary"
            />
            <span className={stepsCompleted.receiptSaved ? "line-through text-slate-400" : "text-slate-800 font-medium"}>
              Foto nomor resi ekspedisi atau tanda terima fisik tersimpan di Matriks Alat Bukti.
            </span>
          </label>

          <label
            onClick={() => toggleStep("followupPrepared")}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer select-none text-xs transition-colors"
          >
            <input
              type="checkbox"
              checked={stepsCompleted.followupPrepared}
              readOnly
              className={stepsCompleted.followupPrepared ? "line-through text-slate-400" : "text-slate-800 font-medium"}
            />
            <span className={stepsCompleted.followupPrepared ? "line-through text-slate-400" : "text-slate-800 font-medium"}>
              Berita Acara Kronologis Kejadian (BAP-Mandiri) telah disiapkan jika lawan tidak merespons.
            </span>
          </label>
        </div>
      </div>

      {/* Tactical Guidance Banner */}
      {calculations.isExpired ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-red-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Pihak Lawan Mengabaikan Batas Waktu Formil</span>
            </span>
            <p className="text-red-800/90 text-[11px] leading-relaxed">
              Berdasarkan Pasal 3 ayat (2) UU No. 2/2004 atau Pasal 1238 KUHPerdata, penolakan atau ketiadaan jawaban membuktikan iktikad tidak baik. Anda kini memiliki kedudukan hukum kuat untuk memohon perundingan tripartit atau mediasi Posbankum.
            </p>
          </div>
          {onSwitchTab && (
            <button
              type="button"
              onClick={() => onSwitchTab("evidence")}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <span>Cetak Berita Acara</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-blue-900">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-800/90 leading-relaxed">
            <strong>Petunjuk:</strong> Selama {calculations.daysRemaining} hari ke depan, jangan terpancing intimidasi verbal. Jika pihak lawan menghubungi lewat telepon, mintalah agar tanggapan dituangkan secara tertulis demi kepastian hukum.
          </p>
        </div>
      )}
    </div>
  );
}
