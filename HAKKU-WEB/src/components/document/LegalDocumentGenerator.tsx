"use client";

import React, { useState, useMemo, useId, useEffect, useCallback } from "react";
import {
  Copy,
  Check,
  Printer,
  Download,
  Scale,
  FileText,
  User,
  Edit3,
  Eye,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { CaseFactSummary } from "@/modules/intake/types";
import { triggerConfetti } from "@/lib/confetti";
import { downloadElementAsPdf } from "@/lib/pdf";
import { usePrinterStatus } from "@/lib/printer";
import {
  DocumentCustomFields,
  GeneratedLegalDocument,
  LegalDocumentType,
} from "@/modules/document/types";
import {
  AVAILABLE_DOCUMENT_TEMPLATES,
  generateLegalDocument,
  getRecommendedTemplate,
} from "@/modules/document/generator";

interface LegalDocumentGeneratorProps {
  initialFactSummary?: CaseFactSummary;
  caseCode?: string;
  className?: string;
}

const DEFAULT_SAMPLE_FACTS: Record<LegalDocumentType, CaseFactSummary> = {
  bipartite_request: {
    originalStory:
      "Saya telah bekerja selama 2 tahun dengan status PKWT di PT Sumber Makmur, namun gaji 2 bulan terakhir belum dibayarkan dan manajemen menolak berdialog.",
    category: "labor",
    categoryLabel: "Ketenagakerjaan",
    urgencyLevel: "normal",
    knownFacts: [
      "Status hubungan kerja: Karyawan Kontrak (PKWT) masa kerja 2 tahun.",
      "Gaji tertunggak: 2 (dua) bulan berjalan senilai total Rp 11.000.000.",
      "Upaya penyampaian pesan informal via WhatsApp tidak mendapat respon resmi.",
    ],
    unknownFacts: ["Alasan keuangan internal perusahaan tidak pernah dijelaskan secara tertulis."],
    clarifications: [],
  },
  somasi_warning: {
    originalStory:
      "Saya menyewa kamar kos/kontrakan dan telah mengembalikan kunci dengan baik, namun pemilik kos menolak mengembalikan uang deposit sewa sebesar Rp 2.500.000 tanpa alasan sah.",
    category: "tenancy_contract",
    categoryLabel: "Sewa Menyewa & Kontrak",
    urgencyLevel: "normal",
    knownFacts: [
      "Perjanjian sewa berakhir sesuai tanggal jatuh tempo tanpa ada kerusakan properti.",
      "Uang jaminan (deposit) senilai Rp 2.500.000 belum dikembalikan melebihi 14 hari.",
      "Bukti transfer deposit awal dan foto serah terima kunci kamar lengkap tersimpan.",
    ],
    unknownFacts: ["Pemilik belum memberikan klarifikasi rincian potongan apapun."],
    clarifications: [],
  },
  legal_aid_chronology: {
    originalStory:
      "Saya mengalami perselisihan hak yang berlarut-larut dan berniat meminta bantuan advokat pro bono pada Lembaga Bantuan Hukum (LBH) atau Posbankum terdekat.",
    category: "general_dispute",
    categoryLabel: "Umum & Hak Perdata",
    urgencyLevel: "normal",
    knownFacts: [
      "Perselisihan hak telah berlangsung lebih dari 30 hari tanpa titik temu.",
      "Tersedia dokumen bukti awal berupa korespondensi chat dan bukti pembayaran.",
    ],
    unknownFacts: ["Memerlukan arahan mengenai langkah hukum formil yang tepat."],
    clarifications: [],
  },
};

export function LegalDocumentGenerator({
  initialFactSummary,
  caseCode,
  className = "",
}: LegalDocumentGeneratorProps) {
  // Determine initial template based on category if provided
  const initialType = useMemo<LegalDocumentType>(() => {
    if (initialFactSummary) {
      return getRecommendedTemplate(initialFactSummary.category).id;
    }
    return "bipartite_request";
  }, [initialFactSummary]);

  const [selectedType, setSelectedType] = useState<LegalDocumentType>(initialType);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);

  // Form Fields State
  const [fields, setFields] = useState<DocumentCustomFields>({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    recipientName: "",
    recipientRoleOrTitle: "",
    recipientAddress: "",
    letterCity: "Jakarta",
    proposedMeetingDate: "",
    responseDeadlineDays: 7,
  });

  // Effective Fact Summary
  const factSummary = useMemo<CaseFactSummary>(() => {
    if (initialFactSummary) return initialFactSummary;
    return DEFAULT_SAMPLE_FACTS[selectedType];
  }, [initialFactSummary, selectedType]);

  // Generated Document
  const generatedDoc: GeneratedLegalDocument = useMemo(() => {
    return generateLegalDocument(selectedType, factSummary, fields);
  }, [selectedType, factSummary, fields]);

  // User manual override text (null means follow generatedDoc dynamically)
  const [userEditedText, setUserEditedText] = useState<string | null>(null);

  // Derived effective text
  const effectiveText = userEditedText !== null ? userEditedText : generatedDoc.fullText;

  const verificationHash = useMemo(() => {
    const raw = `${caseCode || "HK-PLG"}-${selectedType}-${fields.senderName}-${fields.recipientName}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
    return `HK-VERIF-${hex}`;
  }, [caseCode, selectedType, fields.senderName, fields.recipientName]);

  const selectedTemplateMeta = AVAILABLE_DOCUMENT_TEMPLATES.find(
    (t) => t.id === selectedType
  )!;

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { isPrinterConnected, printerName, connectPrinter } = usePrinterStatus();

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(effectiveText);
      setCopied(true);
      triggerConfetti({ particleCount: 70, spread: 65 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    if (typeof window === "undefined") return;
    if (activeTab !== "preview") {
      setActiveTab("preview");
      setTimeout(() => {
        triggerConfetti({ particleCount: 60, spread: 60 });
        window.print();
      }, 120);
      return;
    }
    triggerConfetti({ particleCount: 60, spread: 60 });
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (typeof window === "undefined" || isGeneratingPdf) return;
    if (activeTab !== "preview") {
      setActiveTab("preview");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    setIsGeneratingPdf(true);
    const sanitizedTitle = selectedTemplateMeta.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    const filename = `HAKKU_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.pdf`;

    await downloadElementAsPdf("hakku-legal-document-paper", { filename });
    setIsGeneratingPdf(false);
  };

  const handleDownloadTxt = useCallback(() => {
    if (typeof window === "undefined") return;
    const blob = new Blob([effectiveText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const sanitizedTitle = selectedTemplateMeta.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_");
    link.download = `HAKKU_${sanitizedTitle}_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti({ particleCount: 80, spread: 75 });
  }, [effectiveText, selectedTemplateMeta.title]);

  // Keyboard Shortcut: Ctrl+S / Cmd+S to download document (Company-grade productivity)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleDownloadTxt();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDownloadTxt]);

  const senderNameId = useId();
  const senderPhoneId = useId();
  const senderAddressId = useId();
  const recipientNameId = useId();
  const recipientRoleId = useId();
  const recipientAddressId = useId();
  const letterCityId = useId();
  const deadlineDaysId = useId();
  const meetingDateId = useId();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner / Feature Card */}
      <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-7 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-xs font-semibold text-amber-800 border border-amber-200">
              <FileText className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>Inovasi 1 • Generator Draf Surat Formil</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              Generator Draf Surat Hukum Siap Pakai
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Otomatisasi penyusunan draf surat resmi berkekuatan formil (Permohonan Bipartit, Somasi Perdata, atau Lembar Fakta LBH) yang disesuaikan secara presisi dengan fakta perkara Anda tanpa halusinasi hukum.
            </p>
          </div>

          {caseCode && (
            <div className="shrink-0 bg-gray-50 border border-brand-border rounded-xl p-3 sm:text-right">
              <span className="text-[11px] uppercase tracking-wider text-brand-muted font-semibold block">
                Terkait Perkara:
              </span>
              <code className="text-sm font-bold text-brand-primary font-mono">
                {caseCode}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Template Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:hidden">
        {AVAILABLE_DOCUMENT_TEMPLATES.map((tpl) => {
          const isSelected = selectedType === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelectedType(tpl.id);
                setUserEditedText(null);
                setActiveTab("preview");
              }}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-brand-primary ring-2 ring-brand-primary/20 shadow-xs"
                  : "bg-white/80 hover:bg-white border-brand-border text-brand-muted hover:border-gray-300"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isSelected
                        ? "bg-brand-primary-light text-brand-primary"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tpl.id === "bipartite_request"
                      ? "Ketenagakerjaan"
                      : tpl.id === "somasi_warning"
                      ? "Somasi Perdata"
                      : "Bantuan Advokat"}
                  </span>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-brand-primary" />
                  )}
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-brand-text">
                  {tpl.title}
                </h3>
                <p className="text-[11px] text-brand-muted line-clamp-2 leading-relaxed">
                  {tpl.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-brand-border/60 text-[10px] text-brand-primary font-medium flex items-center gap-1">
                <Scale className="w-3 h-3 shrink-0" />
                <span className="truncate">{tpl.legalBasis}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout: Form Parameter vs Paper Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Parameter (5 Kolom) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-6 shadow-xs print:hidden">
          <div className="border-b border-brand-border pb-3">
            <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              <span>Parameter & Identitas Pihak</span>
            </h3>
            <p className="text-[11px] text-brand-muted mt-0.5">
              Identitas ini akan langsung disematkan ke dalam format resmi surat.
            </p>
          </div>

          {/* Bagian Pihak Pengirim (Pemohon) */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-brand-text flex items-center gap-1.5 uppercase tracking-wider text-brand-muted">
              <span>1. Identitas Anda (Pengirim)</span>
            </h4>

            <div className="space-y-1">
              <label htmlFor={senderNameId} className="text-xs font-medium text-brand-text">
                Nama Lengkap Anda
              </label>
              <input
                id={senderNameId}
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={fields.senderName}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, senderName: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor={senderPhoneId} className="text-xs font-medium text-brand-text">
                  Nomor Telepon / WA
                </label>
                <input
                  id={senderPhoneId}
                  type="text"
                  placeholder="0812-xxxx-xxxx"
                  value={fields.senderPhone}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, senderPhone: e.target.value }))
                  }
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={letterCityId} className="text-xs font-medium text-brand-text">
                  Kota Pembuatan Surat
                </label>
                <input
                  id={letterCityId}
                  type="text"
                  placeholder="Contoh: Jakarta"
                  value={fields.letterCity}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, letterCity: e.target.value }))
                  }
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor={senderAddressId} className="text-xs font-medium text-brand-text">
                Alamat Domisili Lengkap
              </label>
              <textarea
                id={senderAddressId}
                rows={2}
                placeholder="Contoh: Jl. Merpati No. 12, RT 01/RW 04, Kel. Cilandak"
                value={fields.senderAddress}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, senderAddress: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text resize-none"
              />
            </div>
          </div>

          {/* Bagian Pihak Penerima (Lawan) */}
          <div className="space-y-3 pt-3 border-t border-brand-border">
            <h4 className="text-xs font-bold text-brand-text flex items-center gap-1.5 uppercase tracking-wider text-brand-muted">
              <span>2. Identitas Pihak Lawan / Tujuan</span>
            </h4>

            <div className="space-y-1">
              <label htmlFor={recipientNameId} className="text-xs font-medium text-brand-text">
                {selectedType === "legal_aid_chronology"
                  ? "Nama Lembaga Bantuan Hukum (LBH/Posbankum)"
                  : "Nama Perusahaan / Individu Lawan"}
              </label>
              <input
                id={recipientNameId}
                type="text"
                placeholder={
                  selectedType === "legal_aid_chronology"
                    ? "Contoh: Pos Bantuan Hukum PN Jakarta Selatan"
                    : "Contoh: PT Sumber Makmur Abadi / Bapak Hendra"
                }
                value={fields.recipientName}
                onChange={(e) =>
                  setFields((prev) => ({ ...prev, recipientName: e.target.value }))
                }
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
              />
            </div>

            {selectedType !== "legal_aid_chronology" && (
              <div className="space-y-1">
                <label htmlFor={recipientRoleId} className="text-xs font-medium text-brand-text">
                  Jabatan Anda di Perusahaan (Khusus Bipartit) / Hubungan
                </label>
                <input
                  id={recipientRoleId}
                  type="text"
                  placeholder="Contoh: Staf Operasional / Penyewa Kamar 204"
                  value={fields.recipientRoleOrTitle}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      recipientRoleOrTitle: e.target.value,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor={recipientAddressId} className="text-xs font-medium text-brand-text">
                Alamat Surat Tujuan
              </label>
              <textarea
                id={recipientAddressId}
                rows={2}
                placeholder="Contoh: Gedung Menara Sudirman Lt. 10, Jakarta Pusat"
                value={fields.recipientAddress}
                onChange={(e) =>
                  setFields((prev) => ({
                    ...prev,
                    recipientAddress: e.target.value,
                  }))
                }
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text resize-none"
              />
            </div>
          </div>

          {/* Parameter Khusus Template */}
          <div className="space-y-3 pt-3 border-t border-brand-border">
            <h4 className="text-xs font-bold text-brand-text flex items-center gap-1.5 uppercase tracking-wider text-brand-muted">
              <span>3. Parameter Khusus Formil</span>
            </h4>

            {selectedType === "bipartite_request" && (
              <div className="space-y-1">
                <label htmlFor={meetingDateId} className="text-xs font-medium text-brand-text flex items-center justify-between">
                  <span>Usulan Tanggal Pertemuan Bipartit</span>
                  <span className="text-[10px] text-brand-muted">Pasal 3 UU 2/2004</span>
                </label>
                <input
                  id={meetingDateId}
                  type="text"
                  placeholder="Contoh: Senin, 28 Oktober 2026, Pukul 10.00 WIB"
                  value={fields.proposedMeetingDate || ""}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      proposedMeetingDate: e.target.value,
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
                />
              </div>
            )}

            {selectedType === "somasi_warning" && (
              <div className="space-y-1">
                <label htmlFor={deadlineDaysId} className="text-xs font-medium text-brand-text flex items-center justify-between">
                  <span>Batas Waktu Tanggapan Somasi</span>
                  <span className="text-[10px] text-brand-muted">Pasal 1238 KUHPerdata</span>
                </label>
                <select
                  id={deadlineDaysId}
                  value={fields.responseDeadlineDays}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      responseDeadlineDays: Number(e.target.value),
                    }))
                  }
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white text-brand-text"
                >
                  <option value={3}>3 (tiga) hari kalender - Sangat Mendesak</option>
                  <option value={7}>7 (tujuh) hari kalender - Standar Somasi Formil</option>
                  <option value={14}>14 (empat belas) hari kalender - Kasus Kompleks</option>
                </select>
              </div>
            )}

            {/* Quick preset button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setFields({
                    senderName: "Budi Santoso",
                    senderPhone: "0812-3456-7890",
                    senderAddress: "Jl. Merdeka No. 10, Jakarta Selatan",
                    recipientName:
                      selectedType === "bipartite_request"
                        ? "PT Sumber Makmur Sejahtera"
                        : "Bapak Hendra (Pemilik Sewa)",
                    recipientRoleOrTitle: "Staf Operasional",
                    recipientAddress: "Gedung Cyber Lt. 5, Jakarta Selatan",
                    letterCity: "Jakarta Selatan",
                    proposedMeetingDate: "Senin, 28 Oktober 2026",
                    responseDeadlineDays: 7,
                  });
                }}
                className="text-[11px] font-semibold text-brand-primary hover:text-brand-primary-hover flex items-center gap-1"
              >
                <span>Gunakan Contoh Isian Cepat</span>
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Kertas Surat Resmi (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white border border-brand-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs print:hidden">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "preview"
                    ? "bg-white text-brand-text shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Kertas</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "edit"
                    ? "bg-white text-brand-text shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Sesuaikan Kalimat</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs"
                title="Salin seluruh teks surat ke papan klip (clipboard)"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-success" />
                    <span className="text-brand-success">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              {/* Unduh Berkas PDF Resmi (Terpisah dari Cetak) */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 rounded-lg transition-colors shadow-2xs"
                title="Unduh draf surat langsung sebagai berkas PDF resmi (A4)"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyiapkan PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF</span>
                  </>
                )}
              </button>

              {/* Unduh File Teks TXT */}
              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs"
                title="Unduh draf dalam format file teks (.txt) (Pintasan: Ctrl+S)"
              >
                <FileText className="w-3.5 h-3.5 text-brand-muted" />
                <span className="hidden sm:inline">Unduh</span> .TXT
                <kbd className="hidden sm:inline text-[9px] font-mono px-1 py-0.2 bg-gray-100 border border-gray-300 rounded text-gray-500">
                  Ctrl+S
                </kbd>
              </button>

              {/* Tombol Cetak Fisik: HANYA MUNCUL JIKA DEVICE TERSAMBUNG DENGAN PRINTER */}
              {isPrinterConnected ? (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 hover:text-brand-primary rounded-lg transition-colors shadow-2xs"
                  title={`Cetak dokumen ke printer fisik (${printerName || "Printer Terhubung"})`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Cetak Surat</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectPrinter}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Klik untuk mendeteksi / menyambungkan perangkat printer fisik"
                >
                  <Printer className="w-3 h-3 text-slate-400" />
                  <span className="hidden md:inline text-[10px]">Hubungkan Printer</span>
                </button>
              )}
            </div>
          </div>

          {/* Paper View Container */}
          <div className="bg-slate-100 p-4 sm:p-6 rounded-2xl border border-slate-200 print:bg-transparent print:border-none print:p-0 print:m-0 print:rounded-none">
            {activeTab === "preview" ? (
              <div
                id="hakku-legal-document-paper"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-slate-800 font-serif leading-relaxed text-xs sm:text-[13px] space-y-4 print:p-0 print:border-none print:shadow-none print:m-0 relative"
                style={{
                  minHeight: "650px",
                  whiteSpace: "pre-wrap",
                  fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                }}
              >
                {/* Kop Surat Resmi HAKKU Pra-Litigasi */}
                <div className="border-b-2 border-slate-900 pb-3 mb-6 font-sans">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Scale className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[13px] font-black tracking-wider text-slate-900 uppercase">
                          HAKKU • ADVOKASI & PRA-LITIGASI WARGA
                        </div>
                        <div className="text-[10px] text-slate-600 leading-tight">
                          Sistem Pendampingan Hukum & Standarisasi Korespondensi Formil Positif RI
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Standar Formil KUHPerdata jo. UU No. 2/2004 • Verifikasi Keabsahan Terdaftar
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">No. Registrasi:</span>
                      <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {caseCode || "HK-PLG/2026/0429"}
                      </span>
                    </div>
                  </div>
                  {/* Garis Ganda Standar Surat Resmi */}
                  <div className="mt-3 border-t-2 border-slate-900" />
                  <div className="mt-0.5 border-t border-slate-700" />
                </div>

                {/* Isi Naskah Surat */}
                <div className="text-slate-900 font-serif leading-relaxed">{effectiveText}</div>

                {/* Stempel Digital Formil & Validasi Integritas HAKKU */}
                <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-2 border-blue-800 p-0.5 flex items-center justify-center bg-blue-50/50 shrink-0">
                      <div className="w-full h-full rounded-full border border-dashed border-blue-700 flex flex-col items-center justify-center text-center p-1">
                        <Scale className="w-3.5 h-3.5 text-blue-800" />
                        <span className="text-[7px] font-bold text-blue-950 uppercase tracking-tighter leading-none mt-0.5">
                          HAKKU RI
                        </span>
                        <span className="text-[6px] font-mono text-blue-700 font-bold leading-none mt-0.5">
                          VERIFIED
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-950 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Draf Terverifikasi Standar Formil</span>
                      </div>
                      <p className="text-[9px] text-slate-500 max-w-sm leading-tight mt-0.5">
                        Draf ini diakui sebagai alat bukti permulaan tertulis yang sah sesuai Pasal 1866 KUHPerdata jo. UU No. 2/2004.
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                          {verificationHash}
                        </span>
                        <span>• Terbit: {new Date().toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center border border-dashed border-slate-300 rounded-lg p-2.5 bg-slate-50/70 min-w-[130px]">
                    <div className="text-[9px] font-bold text-slate-700 uppercase tracking-wider">
                      Materai Rp 10.000
                    </div>
                    <div className="text-[8px] text-slate-500 mt-0.5">
                      (Jika nilai sengketa &gt; Rp 5 Juta)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>Anda dapat menyesuaikan isi kalimat langsung di bawah ini:</span>
                  <button
                    type="button"
                    onClick={() => setUserEditedText(null)}
                    className="text-brand-primary hover:underline"
                  >
                    Reset ke Template Asli
                  </button>
                </div>
                <textarea
                  value={effectiveText}
                  onChange={(e) => setUserEditedText(e.target.value)}
                  rows={24}
                  className="w-full bg-white rounded-lg border border-brand-border p-4 text-xs font-mono text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Panduan Resmi & Legal Disclaimer */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2 text-xs text-amber-900 print:hidden">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Petunjuk Penggunaan & Penandatanganan Sah:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-amber-800/90 leading-relaxed text-[11px]">
              <li>
                <strong>Cetak 2 Rangkap:</strong> 1 rangkap asli dikirimkan ke pihak lawan/tujuan, dan 1 rangkap sebagai arsip pembuktian Anda.
              </li>
              <li>
                <strong>Materai Rp 10.000:</strong> Untuk tuntutan bernilai di atas Rp 5.000.000 atau somasi resmi, tempelkan meterai Rp 10.000 pada kolom tanda tangan, lalu tanda tangani melintasi sebagian meterai dan kertas.
              </li>
              <li>
                <strong>Kirim Melalui Pos/Kurir Tercatat:</strong> Sangat dianjurkan dikirim melalui ekspedisi dengan nomor resi tercatat (misal: Pos Indonesia / JNE) agar Anda memegang bukti serah terima resmi (Pasal 1238 KUHPerdata).
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
