"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckSquare,
  Printer,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Scale,
  FileText,
  Building2,
  CheckCircle2,
  Calendar,
  Lock,
  Calculator,
  ShieldCheck,
} from "lucide-react";
import { SavedCaseDetails } from "@/modules/db/types";
import { LegalDocumentGenerator } from "@/components/document/LegalDocumentGenerator";
import { CompensationCalculator } from "@/components/calculator/CompensationCalculator";
import { EvidenceAuditWorkspace } from "@/components/evidence/EvidenceAuditWorkspace";
import { StatutoryCountdownTracker } from "@/components/case/StatutoryCountdownTracker";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface ActionOptionItem {
  title: string;
  rationale: string;
}

function CaseWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [workspaceTab, setWorkspaceTab] = useState<
    "overview" | "document" | "calculator" | "evidence"
  >("overview");
  const [caseDetails, setCaseDetails] = useState<SavedCaseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (!code) return;

    async function loadCase() {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const res = await fetch(`/api/cases/${encodeURIComponent(code)}`);
        const json = await res.json();
        if (res.ok && json.success && json.data) {
          setCaseDetails(json.data);
        } else {
          setErrorMsg(json.error || "Perkara tidak ditemukan.");
        }
      } catch {
        setErrorMsg("Gagal memuat data perkara dari server.");
      } finally {
        setIsLoading(false);
      }
    }

    loadCase();
  }, [code]);

  const handleToggleCheck = async (itemKey: string, currentStatus: boolean) => {
    if (!caseDetails) return;

    const newStatus = !currentStatus;

    // Optimistic UI Update
    setCaseDetails((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        checklists: prev.checklists.map((c) =>
          c.itemKey === itemKey ? { ...c, isCompleted: newStatus } : c
        ),
      };
    });

    try {
      await fetch(`/api/cases/${encodeURIComponent(code)}/checklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemKey, isCompleted: newStatus }),
      });
    } catch (err) {
      console.warn("Gagal sinkronisasi checklist ke server:", err);
    }
  };

  const handleDeleteCase = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/cases/${encodeURIComponent(code)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/?deleted=true");
      } else {
        alert("Gagal menghapus perkara dari server.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan saat menghapus perkara.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-brand-bg">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-brand-muted">
          Memuat Ruang Kerja Perkara...
        </p>
      </div>
    );
  }

  if (errorMsg || !caseDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-brand-bg">
        <div className="bg-white border border-brand-border rounded-xl p-8 max-w-md text-center space-y-4 shadow-xs">
          <AlertTriangle className="w-10 h-10 text-brand-danger mx-auto" />
          <h2 className="text-lg font-bold text-brand-text">
            Perkara Tidak Ditemukan
          </h2>
          <p className="text-xs text-brand-muted leading-relaxed">
            {errorMsg || "Nomor referensi perkara yang Anda tuju tidak terdaftar atau telah dihapus oleh pemiliknya."}
          </p>
          <Link
            href="/pendampingan"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors"
          >
            <span>Mulai Pendampingan Baru</span>
          </Link>
        </div>
      </div>
    );
  }

  const { caseRecord, intake, evaluation, checklists, referrals } = caseDetails;
  const completedCount = checklists.filter((c) => c.isCompleted).length;

  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Navigation & Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-border pb-4 print:hidden">
          <Breadcrumbs
            items={[
              { label: "Ruang Kerja", href: "/akun" },
              { label: `Perkara #${caseRecord.caseCode || code}` },
            ]}
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => typeof window !== "undefined" && window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Berkas</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-brand-danger bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Perkara (UU PDP)</span>
            </button>
          </div>
        </div>

        {/* Case Header Card */}
        <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-primary-light text-brand-primary">
                  {caseRecord.categoryLabel}
                </span>
                <span className="text-xs text-brand-muted flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(caseRecord.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-brand-text">
                {caseRecord.title}
              </h1>
            </div>

            <div className="flex flex-col sm:items-end">
              <span className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider">
                Kode Referensi Kasus
              </span>
              <code className="text-base font-extrabold text-brand-primary font-mono tracking-wider bg-brand-primary-light/50 px-2.5 py-0.5 rounded border border-brand-primary/20">
                {caseRecord.caseCode}
              </code>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-brand-muted">
            <Lock className="w-3.5 h-3.5 text-brand-success shrink-0" />
            <span>
              Perkara privat • Tersimpan di sistem terenkripsi terisolasi • Hak privasi terjamin
            </span>
          </div>
        </div>

        {/* Workspace Tab Selector */}
        <div className="flex items-center gap-2 border-b border-brand-border pb-1 print:hidden">
          <button
            type="button"
            onClick={() => setWorkspaceTab("overview")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
              workspaceTab === "overview"
                ? "bg-white text-brand-primary border border-brand-border shadow-2xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Ringkasan & Checklist Perkara</span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab("document")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors min-touch-target ${
              workspaceTab === "document"
                ? "bg-white text-brand-primary border border-brand-border shadow-2xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <FileText className="w-4 h-4 text-brand-primary" aria-hidden="true" />
            <span>Generator Draf Surat</span>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
              Inovasi 1
            </span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab("calculator")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
              workspaceTab === "calculator"
                ? "bg-white text-indigo-700 border border-brand-border shadow-2xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Kalkulator Hak Pesangon</span>
            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-full border border-indigo-200">
              Inovasi 2
            </span>
          </button>
          <button
            type="button"
            onClick={() => setWorkspaceTab("evidence")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg transition-colors ${
              workspaceTab === "evidence"
                ? "bg-white text-blue-700 border border-brand-border shadow-2xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Matriks Alat Bukti</span>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full border border-blue-200">
              Inovasi 3
            </span>
          </button>
        </div>

        {/* Tab 2: Document Generator */}
        {workspaceTab === "document" && (
          <LegalDocumentGenerator
            initialFactSummary={intake.factsSummary}
            caseCode={caseRecord.caseCode}
          />
        )}

        {/* Tab 3: Compensation Calculator */}
        {workspaceTab === "calculator" && (
          <CompensationCalculator />
        )}

        {/* Tab 4: Evidence Matrix Workspace */}
        {workspaceTab === "evidence" && (
          <EvidenceAuditWorkspace
            initialCaseTitle={caseRecord.title}
            initialCategory={caseRecord.category}
            caseCode={caseRecord.caseCode}
          />
        )}

        {/* Tab 1: Overview Grid Layout */}
        {workspaceTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Kolom Kiri: Fakta & Analisis Hukum (2 Kolom) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Statutory Response Window Countdown Tracker */}
              <StatutoryCountdownTracker
                caseCode={caseRecord.caseCode}
                category={caseRecord.category}
                createdAt={caseRecord.createdAt}
                onSwitchTab={setWorkspaceTab}
              />

              {/* Quick Action Banner for Innovation 1 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs print:hidden">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-brand-primary">
                    <FileText className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
                    <span>Butuh Mengajukan Surat Resmi ke Pihak Lawan?</span>
                  </div>
                  <p className="text-[11px] text-brand-text/80">
                    Susun draf Surat Permohonan Bipartit atau Somasi berbasis fakta perkara ini secara otomatis.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWorkspaceTab("document")}
                  className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shrink-0 shadow-2xs min-touch-target"
                >
                  <span>Buka Generator Surat</span>
                </button>
              </div>

              {/* Kronologi Asli */}
              <div className="bg-white border border-brand-border rounded-xl p-6 space-y-3 shadow-xs">
                <h2 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-primary" />
                  <span>Kronologi Awal Pengguna</span>
                </h2>
                <blockquote className="text-xs sm:text-sm text-brand-text/90 italic bg-gray-50 p-4 rounded-lg border-l-4 border-brand-primary">
                  &ldquo;{intake.userStatement}&rdquo;
                </blockquote>
              </div>

            {/* Fakta yang Dinyatakan & Belum Diketahui */}
            <div className="bg-white border border-brand-border rounded-xl p-6 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-brand-text flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-success" />
                <span>Fakta yang Dikonfirmasi ({intake.factsSummary.knownFacts.length})</span>
              </h2>
              <ul className="space-y-2 text-xs text-brand-text">
                {intake.factsSummary.knownFacts.map((fact, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg border border-brand-border/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-success shrink-0 mt-1.5" />
                    <span className="leading-relaxed">{fact}</span>
                  </li>
                ))}
              </ul>

              {intake.factsSummary.unknownFacts.length > 0 && (
                <div className="pt-3 border-t border-brand-border space-y-2">
                  <h3 className="text-xs font-bold text-brand-muted">
                    Informasi yang Belum Diketahui / Dilewati:
                  </h3>
                  <ul className="space-y-1.5 text-xs text-brand-muted">
                    {intake.factsSummary.unknownFacts.map((uf, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                        <span>{uf}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Rujukan Hukum & Opsi Tindakan */}
            <div className="bg-white border border-brand-border rounded-xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h2 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <Scale className="w-4 h-4 text-brand-primary" />
                  <span>Dasar Peraturan Hukum Terkait</span>
                </h2>
                <a
                  href={evaluation.legalSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
                >
                  <span>Cek JDIH Resmi</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold text-brand-text">
                  {evaluation.legalSourceTitle}
                </h3>
              </div>

              {/* Opsi Tindakan */}
              <div className="pt-2 space-y-3">
                <h4 className="text-xs font-bold text-brand-text">
                  Opsi Langkah yang Dapat Ditempuh:
                </h4>
                <div className="space-y-2.5">
                  {(evaluation.actionOptions as ActionOptionItem[]).map((opt, idx) => (
                    <div key={idx} className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 space-y-1 text-xs">
                      <strong className="text-brand-primary block">{opt.title}</strong>
                      <p className="text-brand-text/80">{opt.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Checklist Bukti & Rujukan (1 Kolom) */}
          <div className="space-y-6">
            {/* Checklist Sync */}
            <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-brand-border pb-3">
                <h2 className="text-sm font-bold text-brand-text flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-brand-primary" />
                  <span>Checklist Dokumen</span>
                </h2>
                <span className="text-xs font-semibold text-brand-primary">
                  {completedCount}/{checklists.length} Siap
                </span>
              </div>

              <div className="space-y-2">
                {checklists.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleCheck(item.itemKey, item.isCompleted)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                      item.isCompleted
                        ? "bg-emerald-50/70 border-emerald-300 line-through text-brand-muted"
                        : "bg-white border-brand-border hover:border-brand-primary text-brand-text"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                        item.isCompleted ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-400"
                      }`}>
                        {item.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-semibold block">{item.title}</span>
                        <p className="text-[11px] text-brand-muted mt-0.5">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rujukan Bantuan Hukum */}
            <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
              <h2 className="text-sm font-bold text-brand-text flex items-center gap-2 border-b border-brand-border pb-3">
                <Building2 className="w-4 h-4 text-brand-primary" />
                <span>Rujukan Bantuan Resmi</span>
              </h2>

              <div className="space-y-3">
                {referrals.slice(0, 3).map((ref) => (
                  <div key={ref.id} className="p-3 bg-gray-50 border border-brand-border rounded-lg space-y-1 text-xs">
                    <strong className="text-brand-text block">{ref.name}</strong>
                    <span className="text-[11px] text-brand-success font-medium block">{ref.feePolicy}</span>
                    <a
                      href={ref.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-primary hover:text-brand-primary-hover pt-1"
                    >
                      <span>Kunjungi Situs</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Modal Konfirmasi Hapus Kasus (UU PDP) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 text-brand-danger">
              <Trash2 className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-brand-text">
                Hapus Data Perkara Permanen?
              </h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Sesuai dengan <strong>Undang-Undang Pelindungan Data Pribadi (UU PDP No. 27/2022)</strong>, tindakan ini akan menghapus seluruh rekaman kronologi, fakta, evaluasi, dan checklist perkara <strong>{code}</strong> secara permanen dari server penyimpanan kami. Data tidak dapat dipulihkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-text rounded-lg"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteCase}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-danger hover:bg-red-700 disabled:bg-gray-400 rounded-lg transition-colors"
              >
                {isDeleting ? "Menghapus..." : "Ya, Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CaseWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 bg-brand-bg">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm font-medium text-brand-muted">
            Memuat Ruang Kerja Perkara...
          </p>
        </div>
      }
    >
      <CaseWorkspaceContent />
    </Suspense>
  );
}

