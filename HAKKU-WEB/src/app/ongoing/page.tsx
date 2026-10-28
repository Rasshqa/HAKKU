"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderLock,
  Clock,
  ArrowRight,
  MessageSquare,
  Scale,
  CheckCircle2,
  Plus,
  Search,
  ChevronRight,
  Building2,
} from "lucide-react";
import { CaseRecord } from "@/modules/db/types";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface CaseMilestone {
  title: string;
  desc: string;
  done: boolean;
  active: boolean;
}

export default function OngoingCasesPage() {
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/cases?limit=20");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCases(json.data);
          setIsLoading(false);
          return;
        }
      }
      setCases(getSampleOngoingCases());
    } catch (err) {
      console.error("Gagal memuat kasus berjalan:", err);
      setCases(getSampleOngoingCases());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const filteredCases = cases.filter((c) => {
    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "active" && c.status === "active") ||
      (selectedFilter === "awaiting" && c.status === "awaiting_help") ||
      (selectedFilter === "resolved" && c.status === "resolved");

    const matchesSearch =
      searchQuery === "" ||
      c.caseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header Banner */}
      <section className="bg-white border-b-2 border-black pt-8 pb-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <Breadcrumbs
            items={[
              { label: "Beranda", href: "/" },
              { label: "Perkara Berjalan", href: "/ongoing" },
            ]}
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 border-2 border-black rounded-full text-xs font-black text-amber-900 shadow-[2px_2px_0px_#000000]">
                <Clock className="w-3.5 h-3.5" />
                <span>Pelacak Advokasi & Tenggat Waktu Hukum</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Perkara Berjalan <span className="text-[#1B365D]">(Ongoing Cases)</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-medium max-w-2xl">
                Pantau progres negosiasi bipartit, masa tunggu somasi 14 hari sesuai KUHPerdata, dan jadwal mediasi resmi secara terukur.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pendampingan"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00F0FF] hover:bg-[#00D8E6] text-black font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Perkara Baru</span>
              </Link>
              <Link
                href="/konsultasi"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1B365D] hover:bg-[#13294B] text-white font-black text-sm rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Tanya Hakki AI</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* Controls: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Semua Perkara" },
              { id: "active", label: "Aktif Berjalan" },
              { id: "awaiting", label: "Menunggu Mediasi" },
              { id: "resolved", label: "Selesai" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg border-2 border-black text-xs font-black whitespace-nowrap transition-all ${
                  selectedFilter === tab.id
                    ? "bg-[#1B365D] text-white shadow-[2px_2px_0px_#000000]"
                    : "bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari kode atau judul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border-2 border-black rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#00F0FF]"
            />
          </div>
        </div>

        {/* Case Cards Grid */}
        {isLoading ? (
          <div className="bg-white border-2 border-black rounded-2xl p-12 text-center shadow-[4px_4px_0px_#000000]">
            <div className="w-8 h-8 border-4 border-black border-t-[#00F0FF] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Memuat status perkara berjalan...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-2xl p-12 text-center shadow-[4px_4px_0px_#000000] space-y-4">
            <FolderLock className="w-12 h-12 text-slate-400 mx-auto" />
            <div className="space-y-1">
              <h3 className="font-black text-lg text-slate-800">Tidak ada perkara yang cocok</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto font-medium">
                Belum ada berkas advokasi aktif untuk kriteria pencarian ini. Anda dapat membuat aduan perkara baru melalui alur pendampingan.
              </p>
            </div>
            <Link
              href="/pendampingan"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B365D] text-white text-xs font-black rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000]"
            >
              Mulai Analisis Kasus Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCases.map((c) => (
              <OngoingCaseCard key={c.id} record={c} />
            ))}
          </div>
        )}

        {/* Legal Knowledge Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-black rounded-2xl p-6 shadow-[4px_4px_0px_#000000] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-black text-base text-[#1B365D] flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Ketentuan Hukum Tenggat Waktu Somasi
            </h4>
            <p className="text-xs text-slate-600 max-w-2xl font-medium leading-relaxed">
              Berdasarkan <strong>Pasal 1238 KUHPerdata</strong>, debitur dinyatakan lalai dengan surat perintah atau akta sejenis. Berikan batas waktu wajar <strong>(7 sampai 14 hari kalender)</strong> bagi pihak lawan untuk merespons sebelum melangkah ke gugatan pengadilan atau laporan pidana.
            </p>
          </div>
          <Link
            href="/dokumen"
            className="shrink-0 px-4 py-2 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs rounded-xl border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
          >
            <span>Lihat Template Somasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
}

function OngoingCaseCard({ record }: { record: CaseRecord }) {
  const milestones: CaseMilestone[] = [
    {
      title: "1. Pengumpulan Bukti",
      desc: "Kronologi & berkas validasi awal",
      done: true,
      active: false,
    },
    {
      title: "2. Somasi / Perundingan Bipartit",
      desc: "Pemberian tenggat waktu resmi",
      done: record.status !== "active",
      active: record.status === "active",
    },
    {
      title: "3. Mediasi Disnaker / Tripartit",
      desc: "Eskalasi ke instansi berwenang",
      done: record.status === "resolved",
      active: record.status === "awaiting_help",
    },
    {
      title: "4. Kesepakatan Bersama",
      desc: "Penandatanganan PB & pemenuhan hak",
      done: record.status === "resolved",
      active: false,
    },
  ];

  return (
    <div className="bg-white border-2 border-black rounded-2xl p-5 sm:p-6 shadow-[4px_4px_0px_#000000] space-y-5 transition-transform hover:-translate-y-0.5">
      {/* Top Card Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono font-black text-xs px-2.5 py-0.5 bg-[#1B365D] text-white rounded-md border border-black">
              {record.caseCode}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-[#1B365D] border border-blue-200 rounded-md">
              {record.categoryLabel}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Dibuat: {new Date(record.createdAt).toLocaleDateString("id-ID")}
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            {record.title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {record.status === "active" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border-2 border-amber-300 rounded-xl text-xs font-black shadow-[2px_2px_0px_#D97706]">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Masa Somasi Aktif</span>
            </div>
          ) : record.status === "awaiting_help" ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-900 border-2 border-blue-300 rounded-xl text-xs font-black">
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Menunggu Jadwal Mediasi</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-900 border-2 border-emerald-300 rounded-xl text-xs font-black">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Selesai & Arsip</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border-2 transition-all ${
              m.done
                ? "bg-emerald-50/60 border-emerald-400 text-emerald-950"
                : m.active
                ? "bg-[#00F0FF]/15 border-black shadow-[2px_2px_0px_#000000] text-slate-900"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {m.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : m.active ? (
                <span className="w-2.5 h-2.5 rounded-full bg-[#1B365D] animate-ping shrink-0" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
              )}
              <span className="text-xs font-black leading-tight truncate">
                {m.title}
              </span>
            </div>
            <p className="text-[11px] font-medium leading-tight">
              {m.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Facts & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">
            Tingkat Urgensi: <span className="font-semibold text-[#1B365D] uppercase">{record.urgencyLevel}</span>
          </p>
          <p className="text-slate-500 font-medium truncate max-w-lg">
            Terakhir diperbarui: {new Date(record.updatedAt).toLocaleDateString("id-ID")}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/konsultasi?code=${record.caseCode}`}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#1B365D]" />
            <span>Tanya AI</span>
          </Link>

          <Link
            href={`/kasus/${record.caseCode}`}
            className="px-3.5 py-1.5 bg-[#1B365D] hover:bg-[#13294B] text-white font-black text-xs rounded-lg border-2 border-black shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <span>Detail Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function getSampleOngoingCases(): CaseRecord[] {
  return [
    {
      id: "demo-case-01",
      caseCode: "HK-2026-PHK01",
      title: "Sengketa Pemutusan Hubungan Kerja (PHK Sepihak Tanpa Pesangon)",
      category: "labor",
      categoryLabel: "Ketenagakerjaan",
      urgencyLevel: "high",
      status: "active",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-case-02",
      caseCode: "HK-2026-SEW02",
      title: "Wanprestasi Pengembalian Uang Jaminan / Deposit Sewa Rumah",
      category: "contract",
      categoryLabel: "Sengketa Kontrak & Sewa",
      urgencyLevel: "medium",
      status: "active",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-case-03",
      caseCode: "HK-2026-ITE03",
      title: "Penipuan Transaksi Digital & Belanja Online Barang Fiktif",
      category: "digital",
      categoryLabel: "Transaksi Digital & ITE",
      urgencyLevel: "high",
      status: "awaiting_help",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
