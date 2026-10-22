"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calculator,
  MessageSquare,
} from "lucide-react";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

const EXAMPLE_TOPICS = [
  {
    title: "Ketenagakerjaan",
    sample: "Gaji saya sudah dua bulan belum dibayarkan oleh perusahaan.",
  },
  {
    title: "Penipuan Online",
    sample: "Saya mentransfer uang untuk pembelian barang online, tetapi barang tidak dikirim.",
  },
  {
    title: "Sewa & Kontrak",
    sample: "Pemilik kontrakan menolak mengembalikan uang deposit sewa.",
  },
  {
    title: "Pinjaman & Pinjol",
    sample: "Saya diteror oleh penagih pinjaman online ilegal padahal saya tidak meminjam.",
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

  const handleSelectExample = (sampleText: string) => {
    setStory(sampleText);
    setErrorMsg("");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="py-8 md:py-14 px-4 sm:px-6 bg-gradient-to-b from-white to-brand-bg border-b border-brand-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Headline */}
            <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-xs font-bold border border-blue-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Alur Pendampingan Hukum 6 Tahap</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-text tracking-tight leading-tight">
                Pendampingan Hukum.{" "}
                <span className="text-brand-primary">Pahami Hakmu, Tentukan Langkahmu.</span>
              </h1>
              <p className="text-base text-brand-muted max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Ceritakan masalah Anda dalam bahasa sehari-hari. HAKKU mendampingi Anda memetakan pasal undang-undang sah, mengklarifikasi fakta, dan mengaudit alat bukti.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1 text-xs font-semibold text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                  Regulasi Positif Terverifikasi
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
                  Privasi Aman Sesuai UU PDP
                </span>
              </div>
            </div>

            {/* Right: Hakki Mascot */}
            <div className="lg:col-span-5 flex justify-center">
              <HakkiDuoInteractive
                mood="welcoming"
                size="lg"
                characterCount={story.length}
                isTyping={story.length > 0}
              />
            </div>
          </div>

          {/* Intake Card */}
          <div className="mt-8 bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-3">
              <label htmlFor="user-problem" className="block text-sm font-semibold text-brand-text">
                Ceritakan apa yang sedang terjadi
              </label>

              <textarea
                id="user-problem"
                rows={3}
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                placeholder="Contoh: Saya sudah bekerja 1 tahun, tapi uang lembur dan hak saya belum dilunasi..."
                className="w-full px-4 py-3 text-sm text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-y placeholder:text-gray-400"
                aria-describedby={errorMsg ? "story-error" : undefined}
              />

              {errorMsg && (
                <p id="story-error" className="text-xs text-brand-danger flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {errorMsg}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-brand-muted">
                  <ShieldCheck className="w-4 h-4 text-brand-success shrink-0" />
                  <span>Data Anda diproses secara aman (UU PDP).</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <Link
                    href="/konsultasi"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-brand-text hover:text-brand-primary bg-gray-50 hover:bg-gray-100 border border-brand-border rounded-lg transition-colors min-touch-target"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Konsultasi Wawancara AI</span>
                  </Link>
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
                  >
                    <span>Mulai Pendampingan 6 Tahap</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Example topics */}
            <div className="mt-5 pt-4 border-t border-brand-border">
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider block mb-2">
                Contoh persoalan umum:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {EXAMPLE_TOPICS.map((topic) => (
                  <button
                    key={topic.title}
                    type="button"
                    onClick={() => handleSelectExample(topic.sample)}
                    className="p-2.5 text-left rounded-lg border border-brand-border hover:border-brand-primary hover:bg-blue-50/50 hover:shadow-xs hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-brand-primary block">
                      {topic.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-10 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <h2 className="text-xl font-bold text-brand-text text-center mb-8">
          Bagaimana HAKKU Bekerja
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FileText, bgClass: "bg-blue-50", textClass: "text-brand-primary", label: "1", title: "Ceritakan", desc: "Tuliskan kronologi dengan kata-kata Anda sendiri." },
            { icon: HelpCircle, bgClass: "bg-amber-50", textClass: "text-amber-700", label: "2", title: "Klarifikasi", desc: "Sistem menanyakan detail kunci dan menyusun fakta." },
            { icon: Scale, bgClass: "bg-emerald-50", textClass: "text-emerald-700", label: "3", title: "Analisis Hukum", desc: "Dapatkan pasal peraturan yang terverifikasi." },
            { icon: CheckCircle2, bgClass: "bg-indigo-50", textClass: "text-indigo-700", label: "4", title: "Tindak Lanjut", desc: "Daftar bukti, langkah, dan rujukan profesional." },
          ].map((step) => (
            <div key={step.label} className="bg-white p-4 rounded-xl border border-brand-border space-y-2 hover:-translate-y-1 hover:border-brand-primary/40 hover:shadow-xs transition-all duration-300 group cursor-default">
              <div className={`w-9 h-9 rounded-lg ${step.bgClass} flex items-center justify-center`}>
                <step.icon className={`w-4.5 h-4.5 ${step.textClass}`} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">Langkah {step.label}</span>
                <h3 className="font-bold text-sm text-brand-text">{step.title}</h3>
                <p className="text-xs text-brand-muted leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Three Innovation Cards */}
      <section className="py-10 px-4 sm:px-6 bg-white border-y border-brand-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-brand-text text-center mb-2">
            Tiga Instrumen Hukum HAKKU
          </h2>
          <p className="text-xs text-brand-muted text-center mb-8">
            Instrumen hukum nyata yang diakui regulasi Republik Indonesia.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-brand-border rounded-xl p-5 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                    <FileText className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Inovasi 1
                  </span>
                </div>
                <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  Generator Draf Surat Bipartit dan Somasi
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Susun draf permohonan musyawarah Bipartit (UU 2/2004) dan Somasi wanprestasi (Pasal 1238 KUHPerdata) siap cetak.
                </p>
              </div>
              <Link
                href="/dokumen"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary hover:text-white transition-all min-touch-target"
              >
                Buka Generator Surat
              </Link>
            </div>

            <div className="bg-white border border-brand-border rounded-xl p-5 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Calculator className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    Inovasi 2
                  </span>
                </div>
                <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  Kalkulator Hak Pesangon dan Kompensasi
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Hitung estimasi Uang Pesangon (UP), UPMK, dan kompensasi PKWT berlandaskan PP No. 35 Tahun 2021.
                </p>
              </div>
              <Link
                href="/kalkulator"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary hover:text-white transition-all min-touch-target"
              >
                Buka Kalkulator Hak
              </Link>
            </div>

            <div className="bg-white border border-brand-border rounded-xl p-5 hover:-translate-y-1.5 hover:border-brand-primary/60 hover:shadow-md transition-all duration-300 flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-brand-primary flex items-center justify-center">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    Inovasi 3
                  </span>
                </div>
                <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
                  Audit Matriks Bukti dan Berita Acara
                </h3>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Evaluasi kekuatan bukti digital (Pasal 184 KUHAP dan UU ITE) dan cetak naskah kronologi siap bawa.
                </p>
              </div>
              <Link
                href="/bukti"
                className="w-full inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-primary hover:text-white transition-all min-touch-target"
              >
                Buka Matriks Bukti
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer trust bar */}
      <section className="py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-muted text-center sm:text-left max-w-md">
            Kami mematuhi prinsip anti-halusinasi: sistem tidak mengarang pasal dan tidak menjamin kemenangan perkara.
          </p>
          <Link
            href="/tentang"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-brand-primary border border-brand-primary rounded-lg hover:bg-brand-primary-light transition-colors min-touch-target"
          >
            Pelajari Batasan Sistem
          </Link>
        </div>
      </section>
    </div>
  );
}
