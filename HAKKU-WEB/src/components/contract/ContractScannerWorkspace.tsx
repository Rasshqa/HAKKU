"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  FileWarning,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Scale,
  FileText,
  SearchCheck,
  RotateCcw,
} from "lucide-react";
import {
  ClauseRiskSeverity,
  ContractAuditResult,
  ContractDomainType,
} from "@/modules/contract/types";
import {
  analyzeContractClauses,
  SAMPLE_CONTRACTS,
} from "@/modules/contract/analyzer";
import { triggerConfetti } from "@/lib/confetti";

const DOMAIN_OPTIONS: {
  id: ContractDomainType;
  label: string;
  regulation: string;
}[] = [
  {
    id: "pkwt_labor",
    label: "Kontrak Kerja (PKWT / PKWTT)",
    regulation: "UU 13/2003 · PP 35/2021",
  },
  {
    id: "tenancy_lease",
    label: "Perjanjian Sewa Properti / Kos",
    regulation: "Pasal 1338 & 1551 KUHPerdata",
  },
  {
    id: "loan_service",
    label: "Perjanjian Pinjaman & Layanan",
    regulation: "UU PDP 27/2022 · UU 8/1999",
  },
];

export function ContractScannerWorkspace() {
  const [selectedDomain, setSelectedDomain] =
    useState<ContractDomainType>("pkwt_labor");
  const [contractText, setContractText] = useState<string>(
    SAMPLE_CONTRACTS.pkwt_labor.text
  );
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [severityFilter, setSeverityFilter] = useState<
    ClauseRiskSeverity | "all"
  >("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const initialResult = useMemo(
    () =>
      analyzeContractClauses("pkwt_labor", SAMPLE_CONTRACTS.pkwt_labor.text),
    []
  );
  const [auditResult, setAuditResult] =
    useState<ContractAuditResult>(initialResult);

  const handleDomainSwitch = (domain: ContractDomainType) => {
    setSelectedDomain(domain);
    const sample = SAMPLE_CONTRACTS[domain].text;
    setContractText(sample);
    setErrorMsg("");
    setSeverityFilter("all");
    setAuditResult(analyzeContractClauses(domain, sample));
  };

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contractText.trim().length < 20) {
      setErrorMsg(
        "Masukkan minimal 20 karakter teks pasal atau klausul perjanjian untuk diperiksa."
      );
      return;
    }

    setErrorMsg("");
    setIsScanning(true);

    try {
      const res = await fetch("/api/contract/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractType: selectedDomain,
          contractText: contractText.trim(),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setAuditResult(json.data);
          setIsScanning(false);
          return;
        }
      }

      const fallback = analyzeContractClauses(
        selectedDomain,
        contractText.trim()
      );
      setAuditResult(fallback);
    } catch {
      const fallback = analyzeContractClauses(
        selectedDomain,
        contractText.trim()
      );
      setAuditResult(fallback);
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopyRevision = (id: string, text: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      triggerConfetti({ particleCount: 50, spread: 55 });
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredFindings = useMemo(() => {
    if (severityFilter === "all") return auditResult.findings;
    return auditResult.findings.filter((f) => f.severity === severityFilter);
  }, [auditResult.findings, severityFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <SearchCheck className="w-4 h-4 text-brand-primary" />
              <span>Pemeriksaan Pra-Tanda Tangan</span>
              <span aria-hidden="true">·</span>
              <span>Deteksi Klausul Timpang & Batal Demi Hukum</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              Pemeriksa Klausul Kontrak & Perjanjian
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Tempelkan isi draf kontrak kerja (PKWT), perjanjian sewa tempat tinggal, atau syarat layanan pinjaman sebelum Anda tanda tangani. Sistem memetakan klausul yang bertentangan dengan undang-undang beserta kalimat usulan revisinya.
            </p>
          </div>

          <div className="shrink-0 bg-gray-50 border border-brand-border rounded-xl p-3.5 sm:text-right">
            <span className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold block">
              Basis Evaluasi:
            </span>
            <span className="text-xs font-bold text-brand-primary">
              UU 13/2003 · PP 35/2021 · KUHPerdata
            </span>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contract Input & Domain Selector (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
          <div className="space-y-2">
            <label className="text-xs font-bold text-brand-text block">
              1. Pilih Jenis Kontrak / Perjanjian
            </label>
            <div className="space-y-2">
              {DOMAIN_OPTIONS.map((opt) => {
                const isSelected = selectedDomain === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleDomainSwitch(opt.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? "bg-brand-primary-light/60 border-brand-primary text-brand-primary font-bold"
                        : "bg-gray-50/70 border-brand-border text-brand-text hover:bg-gray-100"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold block">{opt.label}</span>
                      <span className="text-[10px] text-brand-muted font-mono">
                        {opt.regulation}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-brand-primary shrink-0">
                        Dipilih
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleRunScan} className="space-y-4 pt-2 border-t border-brand-border">
            <div className="flex items-center justify-between">
              <label
                htmlFor="contract-clause-input"
                className="text-xs font-bold text-brand-text"
              >
                2. Teks Pasal / Klausul Kontrak
              </label>
              <button
                type="button"
                onClick={() => {
                  const sample = SAMPLE_CONTRACTS[selectedDomain].text;
                  setContractText(sample);
                  setAuditResult(analyzeContractClauses(selectedDomain, sample));
                }}
                className="text-[11px] font-semibold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Muat Contoh Draf</span>
              </button>
            </div>

            <textarea
              id="contract-clause-input"
              rows={12}
              value={contractText}
              onChange={(e) => {
                setContractText(e.target.value);
                if (errorMsg) setErrorMsg("");
              }}
              placeholder="Tempelkan bunyi pasal kontrak kerja, perjanjian sewa, atau syarat layanan di sini..."
              className="w-full p-3.5 text-xs font-mono leading-relaxed bg-gray-50 border border-brand-border rounded-xl text-brand-text focus:bg-white focus:outline-hidden focus:border-brand-primary resize-y"
            />

            {errorMsg && (
              <p className="text-xs text-brand-danger font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </p>
            )}

            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-mono text-brand-muted tabular-nums">
                {contractText.length} karakter
              </span>
              <button
                type="submit"
                disabled={isScanning}
                className="px-5 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <SearchCheck className="w-4 h-4" />
                <span>
                  {isScanning ? "Memeriksa Klausul..." : "Periksa Klausul Kontrak"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Audit Findings & Revision Suggestions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Summary Banner */}
          <div
            className={`rounded-xl border p-5 sm:p-6 space-y-4 ${
              auditResult.overallRisk === "high_risk"
                ? "bg-red-50/70 border-red-200"
                : auditResult.overallRisk === "warning"
                  ? "bg-amber-50/70 border-amber-200"
                  : "bg-emerald-50/70 border-emerald-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                {auditResult.overallRisk === "high_risk" ? (
                  <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
                ) : auditResult.overallRisk === "warning" ? (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                )}
                <div>
                  <span className="text-[11px] font-semibold text-brand-muted block">
                    Hasil Pemeriksaan: {auditResult.contractTypeLabel}
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-brand-text">
                    {auditResult.overallRiskLabel}
                  </h2>
                </div>
              </div>
            </div>

            <p className="text-xs text-brand-text/90 leading-relaxed">
              {auditResult.summaryText}
            </p>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setSeverityFilter("all")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  severityFilter === "all"
                    ? "bg-brand-primary text-white"
                    : "bg-white/80 text-brand-text hover:bg-white"
                }`}
              >
                Semua Temuan ({auditResult.findings.length})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("high_risk")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  severityFilter === "high_risk"
                    ? "bg-red-600 text-white"
                    : "bg-white/80 text-red-700 hover:bg-white"
                }`}
              >
                Berbahaya / Batal ({auditResult.highRiskCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("warning")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  severityFilter === "warning"
                    ? "bg-amber-600 text-white"
                    : "bg-white/80 text-amber-800 hover:bg-white"
                }`}
              >
                Perlu Negosiasi ({auditResult.warningCount})
              </button>
              <button
                type="button"
                onClick={() => setSeverityFilter("safe")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  severityFilter === "safe"
                    ? "bg-emerald-600 text-white"
                    : "bg-white/80 text-emerald-800 hover:bg-white"
                }`}
              >
                Sesuai Regulasi ({auditResult.safeCount})
              </button>
            </div>
          </div>

          {/* Clause Findings List */}
          <div className="space-y-3">
            {filteredFindings.map((item) => {
              const isHigh = item.severity === "high_risk";
              const isWarn = item.severity === "warning";

              return (
                <div
                  key={item.id}
                  className="bg-white border border-brand-border rounded-xl p-5 space-y-3.5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border pb-3">
                    <div className="flex items-center gap-2">
                      {isHigh ? (
                        <FileWarning className="w-4 h-4 text-red-600 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      <h3 className="text-sm font-bold text-brand-text">
                        {item.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded border self-start sm:self-auto shrink-0 ${
                        isHigh
                          ? "bg-red-50 text-red-700 border-red-200"
                          : isWarn
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {item.severityLabel}
                    </span>
                  </div>

                  {/* Quoted Clause Excerpt */}
                  <div className="bg-gray-50 border border-brand-border rounded-lg p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted block">
                      Kutipan Klausul dalam Draf:
                    </span>
                    <p className="text-xs font-mono text-brand-text italic leading-relaxed">
                      &ldquo;{item.clauseExcerpt}&rdquo;
                    </p>
                  </div>

                  {/* Legal Basis & Explanation */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-brand-primary font-semibold">
                      <Scale className="w-3.5 h-3.5 shrink-0" />
                      <span>Dasar Hukum: {item.legalBasis}</span>
                    </div>
                    <p className="text-brand-muted leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>

                  {/* Recommended Revision Box */}
                  <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-brand-primary">
                        Usulan Kalimat Revisi / Negosiasi:
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyRevision(item.id, item.recommendedRevision)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-blue-200 rounded text-brand-primary hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Salin Usulan Revisi</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-brand-text leading-relaxed">
                      {item.recommendedRevision}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Escalation CTA to Formal Letter Generator */}
          <div className="bg-white border border-brand-border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h4 className="text-xs sm:text-sm font-bold text-brand-text">
                Kontrak Sudah Terlanjur Ditandatangani & Hak Anda Dilanggar?
              </h4>
              <p className="text-xs text-brand-muted">
                Klausul yang bertentangan dengan undang-undang (seperti peniadaan kompensasi PKWT atau masa percobaan PKWT) batal demi hukum. Anda tetap dapat menuntut hak normatif melalui Surat Bipartit atau Pengaduan Disnaker.
              </p>
            </div>
            <Link
              href="/dokumen"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const payload = {
                    originalStory: `Saya menandatangani ${auditResult.contractTypeLabel} yang memuat klausul merugikan, antara lain: ${auditResult.findings
                      .filter((f) => f.severity !== "safe")
                      .map((f) => f.title)
                      .join(", ")}.`,
                    category:
                      selectedDomain === "pkwt_labor"
                        ? "labor"
                        : selectedDomain === "tenancy_lease"
                          ? "tenancy_contract"
                          : "consumer_digital",
                    categoryLabel: auditResult.contractTypeLabel,
                    urgencyLevel: "normal",
                    knownFacts: auditResult.findings
                      .filter((f) => f.severity !== "safe")
                      .map((f) => `${f.title} (${f.legalBasis})`),
                    unknownFacts: [],
                    clarifications: [],
                  };
                  sessionStorage.setItem(
                    "hakku_calc_draft_payload",
                    JSON.stringify(payload)
                  );
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shrink-0"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Susun Surat Keberatan Resmi</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
