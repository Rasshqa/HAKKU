"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderLock,
  Search,
  Filter,
  ArrowRight,
  Clock,
  ExternalLink,
  Plus,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { CaseRecord, CaseStatus } from "@/modules/db/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const STATUS_LABELS: Record<CaseStatus, { label: string; badgeClass: string }> = {
  active: {
    label: "Dalam Proses",
    badgeClass: "bg-blue-50 text-[#1B365D] border-blue-200",
  },
  awaiting_help: {
    label: "Menunggu Mediasi / LBH",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
  },
  resolved: {
    label: "Selesai / Sepakat",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  closed: {
    label: "Diarsipkan",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

export default function KasusIndexPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<CaseStatus | "all">("all");
  const [directCodeInput, setDirectCodeInput] = useState("");
  const [codeError, setCodeError] = useState("");

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      params.set("limit", "30");

      const res = await fetch(`/api/cases?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCases(json.data);
        }
      }
    } catch (err) {
      console.error("Gagal memuat daftar perkara:", err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCases();
    }, 150);
    return () => clearTimeout(timer);
  }, [fetchCases]);

  const handleOpenByCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = directCodeInput.trim().toUpperCase();
    if (!cleaned) {
      setCodeError("Masukkan kode referensi perkara (contoh: HK-2026-8841).");
      return;
    }
    setCodeError("");
    router.push(`/kasus/${encodeURIComponent(cleaned)}`);
  };

  return (
    <div className="flex-1 bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs items={[{ label: "Berkas & Ruang Kerja Perkara" }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-border pb-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1B365D]/10 text-[#1B365D] text-xs font-bold">
              <FolderLock className="w-3.5 h-3.5" />
              <span>Manajemen Berkas Perkara</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
              Arsip & Pelacakan Perkara
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Buka kembali berkas perkara menggunakan kode referensi, pantau tenggat waktu langkah hukum, atau kelola checklist dokumen bukti Anda.
            </p>
          </div>

          <Link
            href="/pendampingan"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#13294B] rounded-lg transition-colors shrink-0 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Berkas Perkara Baru</span>
          </Link>
        </div>

        {/* Direct Case Code Lookup Card */}
        <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs">
          <form
            onSubmit={handleOpenByCode}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          >
            <div className="space-y-1 flex-1">
              <label
                htmlFor="direct-case-code"
                className="text-xs font-bold text-brand-text block"
              >
                Buka Cepat dengan Kode Referensi Perkara
              </label>
              <p className="text-[11px] text-brand-muted">
                Masukkan kode yang Anda simpan saat menyelesaikan alur pendampingan (misal:{" "}
                <button
                  type="button"
                  onClick={() => setDirectCodeInput("HK-2026-8841")}
                  className="font-mono font-bold text-[#1B365D] underline cursor-pointer"
                >
                  HK-2026-8841
                </button>
                ).
              </p>
            </div>

            <div className="flex items-center gap-2 sm:w-80">
              <input
                id="direct-case-code"
                type="text"
                value={directCodeInput}
                onChange={(e) => {
                  setDirectCodeInput(e.target.value);
                  if (codeError) setCodeError("");
                }}
                placeholder="HK-2026-8841"
                className="flex-1 px-3 py-2 text-xs font-mono font-bold uppercase bg-gray-50 border border-brand-border rounded-lg text-brand-text focus:bg-white focus:outline-hidden focus:border-[#1B365D]"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-bold text-white bg-[#1B365D] hover:bg-[#13294B] rounded-lg transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <span>Buka</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
          {codeError && (
            <p className="text-xs text-red-600 font-semibold mt-2">{codeError}</p>
          )}
        </div>

        {/* Search & Status Filter Bar */}
        <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari berdasarkan kode perkara, judul kasus, atau kategori hukum..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-brand-border rounded-lg text-brand-text focus:bg-white focus:outline-hidden focus:border-[#1B365D]"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Filter className="w-3.5 h-3.5 text-[#1B365D]" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as CaseStatus | "all")}
                aria-label="Filter status perkara"
                className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-brand-border rounded-lg text-brand-text focus:bg-white focus:outline-hidden focus:border-[#1B365D] cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="active">Dalam Proses</option>
                <option value="awaiting_help">Menunggu Mediasi / LBH</option>
                <option value="resolved">Selesai / Sepakat</option>
                <option value="closed">Diarsipkan</option>
              </select>
            </div>
          </div>

          {/* Case List */}
          {isLoading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-7 h-7 border-3 border-[#1B365D] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-brand-muted">Memuat daftar berkas perkara...</p>
            </div>
          ) : cases.length === 0 ? (
            <div className="py-12 text-center space-y-3 border border-dashed border-brand-border rounded-xl bg-gray-50/50">
              <Scale className="w-8 h-8 text-brand-muted mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-brand-text">
                  Tidak Ada Berkas Perkara yang Ditemukan
                </p>
                <p className="text-xs text-brand-muted max-w-md mx-auto">
                  Belum ada perkara yang sesuai dengan pencarian Anda, atau mulai alur pendampingan baru untuk menyusun berkas perkara.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {cases.map((item) => {
                const statusMeta =
                  STATUS_LABELS[item.status] || STATUS_LABELS.active;
                return (
                  <div
                    key={item.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/60 px-2 rounded-lg transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-extrabold text-[#1B365D] bg-[#1B365D]/10 px-2 py-0.5 rounded">
                          {item.caseCode}
                        </span>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-gray-100 text-brand-text border border-gray-200">
                          {item.categoryLabel}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${statusMeta.badgeClass}`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{statusMeta.label}</span>
                        </span>
                      </div>

                      <h2 className="text-sm font-bold text-brand-text">
                        {item.title}
                      </h2>

                      <div className="flex items-center gap-3 text-[11px] text-brand-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Dibuat:{" "}
                          {new Date(item.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/kasus/${encodeURIComponent(item.caseCode)}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#1B365D] hover:text-white bg-white hover:bg-[#1B365D] border border-[#1B365D] rounded-lg transition-colors shrink-0"
                    >
                      <span>Buka Ruang Perkara</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
