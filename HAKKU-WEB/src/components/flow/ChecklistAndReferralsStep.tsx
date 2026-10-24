import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Square,
  Printer,
  ExternalLink,
  Phone,
  RotateCcw,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Bookmark,
  Copy,
  Check,
  ArrowRight,
  AlertTriangle,
  FileText,
  Calculator,
} from "lucide-react";
import { InteractiveChecklistItem } from "@/modules/case/engine";
import { ReferralOrganization } from "@/modules/referral/directory";
import { CaseFactSummary } from "@/modules/intake/types";
import { LegalSourceItem } from "@/modules/legal/corpus";
import { LegalDocumentGenerator } from "@/components/document/LegalDocumentGenerator";

interface ChecklistAndReferralsStepProps {
  factSummary: CaseFactSummary;
  legalSource: LegalSourceItem;
  initialChecklist: InteractiveChecklistItem[];
  referrals: ReferralOrganization[];
  onReset: () => void;
}

export function ChecklistAndReferralsStep({
  factSummary,
  legalSource,
  initialChecklist,
  referrals,
  onReset,
}: ChecklistAndReferralsStepProps) {
  const [checklist, setChecklist] = useState<InteractiveChecklistItem[]>(initialChecklist);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCaseCode, setSavedCaseCode] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showDocGenerator, setShowDocGenerator] = useState(false);

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.isCompleted).length;

  const handleSaveCase = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const payload = {
        factSummary,
        legalSource,
        checklistItems: checklist,
      };
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setSavedCaseCode(data.data.caseCode);
      } else {
        setSaveError(data.error || "Gagal menyimpan perkara.");
      }
    } catch {
      setSaveError("Koneksi gagal saat menyimpan data perkara.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCode = () => {
    if (savedCaseCode && typeof navigator !== "undefined") {
      navigator.clipboard.writeText(savedCaseCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-4xl mx-auto space-y-8 shadow-xs animate-in fade-in duration-200 print:shadow-none print:border-none print:p-0">
      {/* Header & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4">
        <div>
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider block">
            Langkah Terakhir & Persiapan Nyata
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-brand-text mt-0.5">
            Checklist Bukti & Rujukan Bantuan Hukum
          </h2>
          <p className="text-xs sm:text-sm text-brand-muted mt-1">
            Gunakan checklist ini untuk merapikan berkas sebelum berkonsultasi atau menempuh tindakan formal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          {!savedCaseCode && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveCase}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:bg-gray-400 rounded-lg transition-colors min-touch-target shadow-sm"
            >
              <Bookmark className="w-4 h-4" />
              <span>{isSaving ? "Menyimpan Perkara..." : "Simpan ke Ruang Kasus"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-brand-text bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors min-touch-target"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Ringkasan</span>
          </button>
        </div>
      </div>

      {/* Case Saved Notification Banner */}
      {savedCaseCode && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-200 text-emerald-900">
                Tersimpan dengan Aman
              </span>
              <span className="text-xs text-brand-muted">
                Kode Referensi Kasus:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-base font-extrabold text-brand-text bg-white px-3 py-1 rounded border border-emerald-200 font-mono tracking-wider">
                {savedCaseCode}
              </code>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-medium p-1 rounded"
                title="Salin Kode Kasus"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copiedCode ? "Disalin!" : "Salin"}</span>
              </button>
            </div>
            <p className="text-xs text-emerald-800">
              Data perkara Anda tersimpan aman dengan ID privat. Anda dapat membuka atau menghapus data ini kapan saja.
            </p>
          </div>

          <Link
            href={`/kasus/${savedCaseCode}`}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shrink-0 shadow-sm"
          >
            <span>Buka Ruang Kasus</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-brand-danger flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Generator Draf Surat Hukum Siap Pakai */}
      <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-[11px] font-semibold text-amber-800 border border-amber-200">
              <FileText className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>Instrumen Dokumen Formil</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-brand-text">
              Generator Draf Surat Hukum Siap Pakai
            </h3>
            <p className="text-xs text-brand-muted max-w-xl leading-relaxed">
              Susun draf resmi Surat Permohonan Bipartit (UU 2/2004), Somasi Perdata (KUHPerdata 1238), atau Lembar Fakta LBH siap cetak langsung dari data kasus Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDocGenerator((prev) => !prev)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shrink-0 shadow-xs min-touch-target"
          >
            <FileText className="w-4 h-4" />
            <span>{showDocGenerator ? "Sembunyikan Draf Surat" : "Buat Draf Surat Sekarang"}</span>
          </button>
        </div>

        {showDocGenerator && (
          <div className="pt-4 border-t border-brand-border text-brand-text">
            <LegalDocumentGenerator initialFactSummary={factSummary} />
          </div>
        )}
      </div>

      {/* Shortcut Khusus Kasus Ketenagakerjaan: Kalkulator Pesangon PP 35/2021 */}
      {factSummary.category === "labor" && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs print:hidden">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Simulasi Hitung Pesangon & Kompensasi Kontrak</span>
            </div>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Ketahui estimasi hak uang pesangon, UPMK, atau uang kompensasi PKWT secara akurat berdasarkan PP No. 35/2021.
            </p>
          </div>
          <Link
            href="/kalkulator"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shrink-0 shadow-2xs"
          >
            <span>Buka Kalkulator Hak</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Bagian 1: Checklist Bukti Interaktif */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-brand-text flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Daftar Periksa Bukti yang Perlu Disimpan</span>
          </h3>
          <span className="text-xs font-medium text-brand-muted">
            {completedCount} dari {checklist.length} dokumen siap
          </span>
        </div>

        <div className="space-y-2.5">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                item.isCompleted
                  ? "bg-emerald-50/50 border-emerald-300"
                  : "bg-white border-brand-border hover:border-brand-primary"
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-brand-primary shrink-0 p-0.5 focus:outline-hidden"
                aria-label={`Tandai ${item.title}`}
              >
                {item.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-brand-success" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs sm:text-sm font-bold ${
                      item.isCompleted ? "line-through text-gray-500" : "text-brand-text"
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.required && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-brand-warning">
                      Penting
                    </span>
                  )}
                </div>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian 2: Ringkasan Fakta Terkonfirmasi (Tampak saat cetak / review) */}
      <div className="p-4 bg-gray-50 border border-brand-border rounded-xl space-y-2 text-xs">
        <h4 className="font-bold text-brand-text text-xs uppercase tracking-wider">
          Ringkasan Kasus Anda:
        </h4>
        <p className="text-brand-text/90 italic">
          &ldquo;{factSummary.originalStory}&rdquo;
        </p>
        <div className="pt-2 border-t border-brand-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-brand-muted">
          <div>
            <strong>Kategori:</strong> {factSummary.categoryLabel}
          </div>
          <div>
            <strong>Dasar Hukum:</strong> {legalSource.title}
          </div>
        </div>
      </div>

      {/* Bagian 3: Direktori Rujukan Layanan Terverifikasi */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-brand-text flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Rujukan Bantuan Hukum & Layanan Publik Resmi Terverifikasi</span>
          </h3>
          <span className="text-[11px] text-brand-success font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terverifikasi 2026
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {referrals.map((ref) => (
            <div
              key={ref.id}
              className="bg-white border border-brand-border rounded-xl p-4 space-y-3 flex flex-col justify-between hover:border-brand-primary transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-primary">
                    {ref.serviceType}
                  </span>
                  <span className="text-[11px] text-brand-success font-semibold">
                    {ref.feePolicy}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-brand-text">
                  {ref.name}
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  {ref.description}
                </p>
                <div className="text-[11px] text-brand-text/70 pt-1">
                  <strong>Wilayah Layanan:</strong> {ref.jurisdiction}
                </div>
              </div>

              <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                {ref.phone ? (
                  <div className="flex items-center gap-1 text-brand-muted font-mono text-[11px]">
                    <Phone className="w-3 h-3 text-brand-primary" />
                    <span>{ref.phone}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-brand-muted">Layanan Online & Fisik</span>
                )}

                <a
                  href={ref.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:text-brand-primary-hover"
                >
                  <span>Kunjungi Situs Resmi</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selesai / Reset Session */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-brand-border print:hidden">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Mulai Pendampingan Perkara Baru</span>
        </button>

        <p className="text-[11px] text-brand-muted text-center sm:text-right">
          Sesi ini dapat Anda simpan atau cetak untuk bahan konsultasi langsung dengan advokat.
        </p>
      </div>
    </div>
  );
}
