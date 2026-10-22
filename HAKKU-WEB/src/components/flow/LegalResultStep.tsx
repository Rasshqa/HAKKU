import React from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { LegalSourceItem } from "@/modules/legal/corpus";
import { CaseFactSummary } from "@/modules/intake/types";

interface LegalResultStepProps {
  factSummary: CaseFactSummary;
  legalSource: LegalSourceItem;
  onBack: () => void;
  onProceedToChecklist: () => void;
}

export function LegalResultStep({
  factSummary,
  legalSource,
  onBack,
  onProceedToChecklist,
}: LegalResultStepProps) {
  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-8 shadow-xs animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="border-b border-brand-border pb-4 space-y-1">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-brand-primary-light text-brand-primary">
            Ranah: {factSummary.categoryLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-brand-success font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sumber Terverifikasi Resmi
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-brand-text">
          Informasi & Dasar Hukum yang Relevan
        </h2>
        <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
          Berdasarkan fakta perkara yang telah Anda konfirmasi, berikut adalah ketentuan hukum normatif Indonesia dan opsi langkah yang dapat ditempuh.
        </p>
      </div>

      {/* Bagian 1: Sumber Hukum & Pasal Terkelola */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-brand-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Dasar Hukum & Peraturan Perundang-undangan Terkait</span>
          </h3>
          <span className="text-[11px] text-brand-muted hidden sm:inline">
            Status: {legalSource.legalStatus === "verified_current" ? "Berlaku Sah (2026)" : "Tinjauan"}
          </span>
        </div>

        {/* Legal Source Meta Card */}
        <div className="bg-gray-50 border border-brand-border rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
            <div>
              <h4 className="text-sm font-bold text-brand-text">
                {legalSource.title}
              </h4>
              <p className="text-xs text-brand-muted">
                Penerbit: {legalSource.issuer}
              </p>
            </div>
            <a
              href={legalSource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-primary hover:text-brand-primary-hover self-start sm:self-center"
            >
              <span>Verifikasi di JDIH Resmi</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <p className="text-xs text-brand-text/80 leading-relaxed">
            {legalSource.summary}
          </p>

          {/* List Pasal & Penjelasan */}
          <div className="space-y-3 pt-2">
            {legalSource.articles.map((art, idx) => (
              <div
                key={idx}
                className="bg-white border border-brand-border rounded-lg p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-primary">
                    {art.articleLabel}
                  </span>
                  <span className="text-[11px] text-brand-muted font-medium">
                    Topik: {art.topic}
                  </span>
                </div>
                <blockquote className="border-l-2 border-brand-primary pl-2.5 text-brand-text/90 italic bg-gray-50/60 py-1 rounded-r">
                  &ldquo;{art.officialContent}&rdquo;
                </blockquote>
                <p className="text-brand-muted leading-relaxed">
                  <strong className="text-brand-text">Artinya bagi Anda:</strong> {art.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bagian 2: Opsi Tindakan Nyata */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-brand-text flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-brand-warning shrink-0" />
          <span>Opsi Tindakan yang Dapat Anda Pertimbangkan</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {legalSource.actionOptions.map((opt, idx) => (
            <div
              key={idx}
              className="bg-white border border-brand-border rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider block">
                  Opsi {idx + 1}
                </span>
                <h4 className="text-sm font-bold text-brand-text leading-snug">
                  {opt.title}
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {opt.rationale}
                </p>
              </div>

              <div className="pt-2 border-t border-brand-border space-y-1.5 text-xs">
                <span className="text-[11px] font-semibold text-brand-text block">
                  Kebutuhan Persiapan:
                </span>
                <ul className="list-disc list-inside space-y-1 text-brand-muted text-[11px]">
                  {opt.preparation.map((prep, pIdx) => (
                    <li key={pIdx} className="line-clamp-2">{prep}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 3: Apa yang Belum Bisa Dipastikan (Caveats / Uncertainties) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 sm:p-5 space-y-2">
        <h4 className="text-xs font-bold text-brand-warning uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Keterbatasan & Hal yang Belum Bisa Dipastikan Sistem</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-xs text-brand-text/80 leading-relaxed">
          {legalSource.uncertainties.map((unc, idx) => (
            <li key={idx}>{unc}</li>
          ))}
          <li>
            Sistem HAKKU tidak dapat menggantikan penilaian hakim atau verifikasi forensik dokumen asli di persidangan.
          </li>
        </ul>
      </div>

      {/* Navigasi Bawah */}
      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Ringkasan Fakta</span>
        </button>

        <button
          type="button"
          onClick={onProceedToChecklist}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
        >
          <span>Buka Checklist Persiapan & Rujukan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
