"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Scale,
  FileQuestion,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { ScopeAssessment } from "@/modules/intake/types";
import { HakkiKancil } from "@/components/mascot/HakkiKancil";

interface OutOfScopeModalProps {
  scopeAssessment: ScopeAssessment;
  story: string;
  onRetryWithNewStory: () => void;
  onProceedAnyway: () => void;
  onSelectExample?: (sampleStory: string) => void;
}

const SAMPLE_LEGAL_STORIES = [
  {
    title: "Sengketa Gaji & Ketenagakerjaan (PP 35/2021)",
    story: "Saya sudah bekerja selama 2 tahun di PT Maju, namun 2 bulan gaji saya belum dibayarkan dan atasan menghindar.",
  },
  {
    title: "Penipuan Belanja Online / Konsumen Digital (UU ITE)",
    story: "Saya mentransfer Rp 1.500.000 untuk pembelian handphone di toko online, namun nomor saya diblokir dan resi palsu.",
  },
  {
    title: "Sengketa Uang Deposit Sewa Rumah (KUHPerdata)",
    story: "Pemilik kontrakan menolak mengembalikan uang deposit sewa Rp 3.000.000 padahal rumah sudah diserahkan bersih.",
  },
];

export function OutOfScopeModal({
  scopeAssessment,
  story,
  onRetryWithNewStory,
  onProceedAnyway,
  onSelectExample,
}: OutOfScopeModalProps) {
  const router = useRouter();
  const isIllegal = scopeAssessment.status === "illegal_intent";
  const isInsufficient = scopeAssessment.status === "insufficient_info";

  const handleGoToAiInterview = () => {
    if (typeof window !== "undefined" && story) {
      sessionStorage.setItem("hakku_initial_story", story);
    }
    router.push("/konsultasi");
  };

  return (
    <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-md animate-slide-up-fade">
      {/* Header with Mascot & Badge */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 border-b border-brand-border pb-6 text-center sm:text-left">
        <div className="shrink-0">
          <HakkiKancil
            mood={isIllegal ? "analyzing" : "listening"}
            size="sm"
            showSpeechBubble={false}
            interactive={false}
          />
        </div>

        <div className="space-y-1.5 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-1">
            {isIllegal ? (
              <span className="text-brand-danger bg-red-50 border-red-200 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Peringatan Kebijakan Hukum</span>
              </span>
            ) : isInsufficient ? (
              <span className="text-amber-800 bg-amber-50 border-amber-200 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                <FileQuestion className="w-3.5 h-3.5" />
                <span>Informasi Kasus Belum Lengkap</span>
              </span>
            ) : (
              <span className="text-indigo-800 bg-indigo-50 border-indigo-200 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                <span>Belum Masuk Klasifikasi Alur Terpandu</span>
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-brand-text">
            {scopeAssessment.headline}
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            {scopeAssessment.reason}
          </p>
        </div>
      </div>

      {story && (
        <div className="bg-gray-50 border border-brand-border rounded-xl p-3.5 text-xs text-brand-muted space-y-1">
          <span className="font-semibold text-brand-text block">Uraian Masalah Anda:</span>
          <p className="italic line-clamp-2">&quot;{story}&quot;</p>
        </div>
      )}

      {/* Primary Recommendation: Wawancara AI (jika bukan indikasi ilegal) */}
      {!isIllegal && (
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/70 border border-blue-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-primary text-white">
                Rekomendasi Utama
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-brand-text flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                <span>Bahas di Ruang Wawancara AI Hakki</span>
              </h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Masalah Anda mungkin memiliki aspek hukum sah namun membutuhkan dialog interaktif dua arah yang fleksibel tanpa dibatasi klasifikasi form kaku. Hakki siap membedah duduk perkara Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={handleGoToAiInterview}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs min-touch-target"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Mulai Wawancara AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Guidance Box */}
      <div className={`p-4 sm:p-5 rounded-xl border text-xs leading-relaxed space-y-2 ${
        isIllegal
          ? "bg-red-50/70 border-red-200 text-red-950"
          : isInsufficient
          ? "bg-amber-50/70 border-amber-200 text-amber-950"
          : "bg-blue-50/60 border-blue-200 text-blue-950"
      }`}>
        <div className="font-bold flex items-center gap-2">
          <Scale className="w-4 h-4 text-brand-primary shrink-0" />
          <span>Panduan Pendampingan Hakki:</span>
        </div>
        <p className="text-brand-text/90">
          {scopeAssessment.guidance}
        </p>
      </div>

      {/* Suggested Case Examples if Not Illegal */}
      {!isIllegal && onSelectExample && (
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-muted block">
            Atau Ingin Mencoba Alur Terpandu dengan Contoh Kasus Berikut?
          </span>
          <div className="grid grid-cols-1 gap-2.5">
            {SAMPLE_LEGAL_STORIES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectExample(sample.story)}
                className="p-3 text-left rounded-xl border border-brand-border hover:border-brand-primary bg-white hover:bg-blue-50/30 transition-all text-xs flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <span className="font-bold text-brand-text group-hover:text-brand-primary transition-colors block">
                    {sample.title}
                  </span>
                  <span className="text-brand-muted text-[11px] line-clamp-1">
                    {sample.story}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-brand-border">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRetryWithNewStory}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors min-touch-target shadow-2xs"
          >
            <RotateCcw className="w-4 h-4 text-brand-muted" />
            <span>Tulis Ulang Kronologi</span>
          </button>

          {!isIllegal && (
            <button
              type="button"
              onClick={onProceedAnyway}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
            >
              <span>Tetap Lanjut ke Form Terpandu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Link
          href="/tentang"
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Batasan Sistem</span>
        </Link>
      </div>
    </div>
  );
}
