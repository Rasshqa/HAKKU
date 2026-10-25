"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  Scale,
  Calculator,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

const EXAMPLE_TOPICS = [
  {
    code: "01",
    title: "Ketenagakerjaan & PHK",
    law: "PP No. 35/2021 · UU 13/2003",
    sample:
      "Gaji saya sudah dua bulan belum dibayarkan oleh perusahaan dan saya diberhentikan sepihak tanpa pesangon.",
  },
  {
    code: "02",
    title: "Penipuan Transaksi Digital",
    law: "UU ITE No. 1/2024 · Pasal 378 KUHP",
    sample:
      "Saya mentransfer uang Rp 4.500.000 untuk pembelian barang online, tetapi barang tidak dikirim dan penjual memblokir nomor saya.",
  },
  {
    code: "03",
    title: "Sengketa Sewa & Kontrak",
    law: "Pasal 1238 & 1365 KUHPerdata",
    sample:
      "Pemilik kontrakan menolak mengembalikan uang deposit sewa Rp 5.000.000 meskipun masa sewa berakhir dengan kondisi rumah baik.",
  },
  {
    code: "04",
    title: "Intimidasi Pinjaman Online",
    law: "POJK 10/2022 · UU PDP 27/2022",
    sample:
      "Saya diteror dan diancam penyebaran data pribadi oleh penagih pinjaman online ilegal padahal saya tidak pernah meminjam.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [story, setStory] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim()) {
      setErrorMsg("Mohon ceritakan persoalan Anda agar sistem dapat memandu.");
      return;
    }
    setErrorMsg("");
    if (typeof window !== "undefined") {
      sessionStorage.setItem("hakku_initial_story", story.trim());
    }
    router.push("/pendampingan");
  };

  const handleConsultAI = () => {
    if (story.trim() && typeof window !== "undefined") {
      sessionStorage.setItem("hakku_initial_story", story.trim());
    }
    router.push("/konsultasi");
  };

  const handleSelectExample = (sampleText: string) => {
    setStory(sampleText);
    setErrorMsg("");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F8F9FA]">
      {/* Architectural Hero Section */}
      <section className="py-10 md:py-16 px-4 sm:px-6 border-b-2 border-black bg-[#F8F9FA]">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: High-Contrast Display Typography */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="w-8 h-1 bg-[#1B365D]" />
                <p className="font-mono text-xs font-semibold uppercase tracking-widest text-[#1B365D]">
                  HUKUM × AI × DAMPAK NYATA
                </p>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-black tracking-tight leading-[1.08] text-balance">
                Solusi Hukum Cerdas.{" "}
                <span className="inline-block bg-[#1B365D] text-white px-3 py-0.5 border-2 border-black shadow-[4px_4px_0px_#000000]">
                  Pahami Hakmu.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-brand-muted max-w-2xl leading-relaxed">
                Ceritakan persoalan Anda dengan bahasa sehari-hari. HAKKU memadukan kecerdasan buatan dengan korpus perundang-undangan resmi Republik Indonesia untuk memetakan pasal sah, mengaudit bukti, dan menyusun dokumen hukum siap pakai.
              </p>

              {/* Unboxed Editorial Metadata */}
              <div className="flex flex-wrap items-center gap-3 pt-1 font-mono text-xs text-black font-medium">
                <span>JDIH Terverifikasi</span>
                <span aria-hidden="true" className="text-brand-muted">·</span>
                <span>Kepatuhan UU PDP No. 27/2022</span>
                <span aria-hidden="true" className="text-brand-muted">·</span>
                <span>6 Tahap Pendampingan</span>
              </div>
            </div>

            {/* Right Column: Studio Hakki Mascot */}
            <div className="lg:col-span-5 flex justify-center">
              <HakkiDuoInteractive
                mood="welcoming"
                size="lg"
                characterCount={story.length}
                isTyping={story.length > 0}
              />
            </div>
          </div>

          {/* Primary Intake Workspace Card */}
          <div className="aether-card rounded-2xl p-6 sm:p-8 max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label
                  htmlFor="user-problem"
                  className="text-sm font-extrabold text-black uppercase tracking-tight flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 bg-[#1B365D] border border-black inline-block" />
                  <span>Ceritakan Duduk Perkara Anda</span>
                </label>
                <span className="font-mono text-xs text-brand-muted tabular-nums">
                  {story.length} karakter
                </span>
              </div>

              <textarea
                id="user-problem"
                rows={3}
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Contoh: Saya sudah bekerja 2 tahun dengan kontrak PKWT, tetapi saat kontrak berakhir perusahaan menolak membayar uang kompensasi dan menahan ijazah asli saya..."
                className="w-full px-4 py-3.5 text-sm text-black bg-[#F8F9FA] border-2 border-black rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1B365D] transition-colors resize-y placeholder:text-zinc-400"
                aria-describedby={errorMsg ? "story-error" : undefined}
              />

              {errorMsg && (
                <p id="story-error" className="text-xs text-brand-danger flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-2 text-xs text-brand-muted">
                  <ShieldCheck className="w-4 h-4 text-[#1B365D] shrink-0" />
                  <span>Diproses secara privat sesuai prinsip perlindungan data pribadi.</span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    type="button"
                    onClick={handleConsultAI}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 text-xs font-bold text-black bg-white hover:bg-[#F8F9FA] border-2 border-black rounded-xl transition-colors min-touch-target whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Wawancara AI Paralegal</span>
                  </button>
                  <button
                    type="submit"
                    className="aether-btn-primary inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold rounded-xl min-touch-target whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Mulai Pendampingan 6 Tahap</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Case Scenarios */}
            <div className="mt-6 pt-5 border-t border-[#E9ECEF]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                  Pilih Skenario Perkara Umum (Klik untuk Mengisi Otomatis)
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {EXAMPLE_TOPICS.map((topic) => (
                  <button
                    key={topic.code}
                    type="button"
                    onClick={() => handleSelectExample(topic.sample)}
                    className="p-3.5 text-left rounded-xl bg-[#F8F9FA] border border-black/20 hover:border-[#1B365D] hover:bg-[#E8EEF5] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between font-mono text-[11px] text-brand-muted mb-1">
                      <span>KASUS {topic.code}</span>
                      <span className="text-[#1B365D] font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                    </div>
                    <span className="text-xs font-extrabold text-black block">
                      {topic.title}
                    </span>
                    <span className="font-mono text-[10px] text-brand-muted block mt-1">
                      {topic.law}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architectural Bento Grid: Legal Instruments & Workflow */}
      <section className="py-14 px-4 sm:px-6 max-w-7xl mx-auto w-full space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/15 pb-6">
          <div className="space-y-2">
            <div className="w-6 h-1 bg-[#1B365D]" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-black tracking-tight">
              Ekosistem Instrumen Hukum HAKKU
            </h2>
          </div>
          <p className="font-mono text-xs text-brand-muted">
            LOGIKA LEBIH TAJAM · BUKTI LEBIH TERSTRUKTUR
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Signature Deep Navy Poster Card */}
          <div className="lg:col-span-5 aether-card-cyan rounded-2xl p-7 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between border-b border-white/20 pb-3 font-mono text-xs font-bold text-[#93C5FD]">
              <span>HAKKU CORE</span>
              <span>01 / 04</span>
            </div>

            <div className="my-8 space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white uppercase">
                INSTRUMEN HUKUM PRESISI UNTUK SETIAP WARGA.
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                Jangan menghadapi sengketa kerja, penipuan, atau wanprestasi tanpa persiapan berkas. Susun strategi berbasis undang-undang dalam hitungan menit.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">
                MULAI TELAAH KASUS SEKARANG
              </span>
              <Link
                href="/pendampingan"
                className="w-10 h-10 rounded-xl bg-white text-[#1B365D] flex items-center justify-center hover:scale-105 transition-transform"
                aria-label="Mulai Pendampingan"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right: 2x2 Architectural Tool Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/dokumen"
              className="aether-card rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-brand-muted">02 / 05</span>
                </div>
                <h3 className="text-base font-extrabold text-black group-hover:text-[#1B365D] group-hover:underline">
                  Generator Surat Resmi (Bipartit, Tripartit & Somasi)
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Susun surat sesuai tata naskah resmi Indonesia: Bipartit, Mediasi Tripartit Disnaker, Somasi KUHPerdata, Pengaduan BPSK, dan LBH siap cetak A4.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center justify-between font-mono text-xs font-bold text-[#1B365D]">
                <span>BUAT DRAF SURAT</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/kontrak"
              className="aether-card rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-brand-muted">03 / 05</span>
                </div>
                <h3 className="text-base font-extrabold text-black group-hover:text-[#1B365D] group-hover:underline">
                  Pemeriksa Klausul Kontrak (PKWT & Sewa)
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Deteksi klausul berbahaya atau batal demi hukum dalam kontrak kerja (penahanan ijazah, probation PKWT) maupun sewa beserta usulan revisinya.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center justify-between font-mono text-xs font-bold text-[#1B365D]">
                <span>PERIKSA KONTRAK</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/kalkulator"
              className="aether-card rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-white flex items-center justify-center">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-brand-muted">04 / 05</span>
                </div>
                <h3 className="text-base font-extrabold text-black group-hover:text-[#1B365D] group-hover:underline">
                  Kalkulator Pesangon (PP 35/2021)
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Hitung estimasi Uang Pesangon (UP), Uang Penghargaan Masa Kerja (UPMK), UPH, dan Kompensasi PKWT secara presisi sesuai regulasi.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-[#E9ECEF] flex items-center justify-between font-mono text-xs font-bold text-[#1B365D]">
                <span>HITUNG KOMPENSASI</span>
                <span>→</span>
              </div>
            </Link>

            <Link
              href="/bukti"
              className="bg-[#0F172A] text-white border-2 border-black shadow-[4px_4px_0px_#1B365D] rounded-2xl p-6 flex flex-col justify-between hover:-translate-y-1 transition-transform group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#1B365D] text-white border border-white/20 flex items-center justify-center">
                    <Scale className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-xs text-[#93C5FD]">05 / 05</span>
                </div>
                <h3 className="text-base font-extrabold text-white group-hover:text-[#93C5FD] transition-colors">
                  Audit Matriks Alat Bukti (P-1, P-2)
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Evaluasi kelengkapan bukti elektronik dan surat sesuai Pasal 184 KUHAP & Pasal 5 UU ITE serta cetak Berita Acara Kronologis Kejadian.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/15 flex items-center justify-between font-mono text-xs font-bold text-[#93C5FD]">
                <span>AUDIT ALAT BUKTI</span>
                <span>→</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
