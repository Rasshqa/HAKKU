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
  Building2,
} from "lucide-react";
import { CaseFactSummary } from "@/modules/intake/types";
import { triggerConfetti } from "@/lib/confetti";
import { downloadElementAsPdf } from "@/lib/pdf";
import { usePrinterStatus } from "@/lib/printer";
import {
  DocumentCustomFields,
  GeneratedLegalDocument,
  LegalDocumentType,
  LetterHeaderMode,
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
      "Status hubungan kerja: Karyawan Kontrak (PKWT) masa kerja 2 tahun",
      "Gaji tertunggak: 2 (dua) bulan berjalan senilai total Rp 11.000.000",
      "Pembayaran uang kompensasi PKWT sesuai Pasal 15 PP No. 35 Tahun 2021",
      "Penandatanganan Risalah Perundingan Bipartit secara tertulis",
    ],
    unknownFacts: [
      "Alasan keuangan internal perusahaan tidak pernah dijelaskan secara tertulis.",
    ],
    clarifications: [],
  },
  disnaker_tripartite: {
    originalStory:
      "Perundingan bipartit terkait PHK sepihak dan kompensasi PKWT di PT Sumber Makmur telah diajukan secara tertulis namun tidak mendapat tanggapan hingga batas waktu berakhir.",
    category: "labor",
    categoryLabel: "Ketenagakerjaan",
    urgencyLevel: "normal",
    knownFacts: [
      "Surat permohonan Bipartit telah dikirimkan patut namun tidak diindahkan manajemen",
      "Tuntutan pembayaran hak kompensasi PKWT dan gaji tertunggak Rp 11.000.000",
      "Permohonan pemanggilan sidang mediasi Tripartit oleh Mediator Hubungan Industrial",
      "Penerbitan Anjuran Tertulis sesuai Pasal 13 UU No. 2 Tahun 2004",
    ],
    unknownFacts: [],
    clarifications: [],
  },
  somasi_warning: {
    originalStory:
      "Saya menyewa kamar kos/kontrakan dan telah mengembalikan kunci dengan baik, namun pemilik menolak mengembalikan uang deposit sewa sebesar Rp 2.500.000 tanpa alasan sah.",
    category: "tenancy_contract",
    categoryLabel: "Sewa Menyewa & Kontrak",
    urgencyLevel: "normal",
    knownFacts: [
      "Perjanjian sewa berakhir sesuai tanggal jatuh tempo tanpa kerusakan properti",
      "Pengembalian uang jaminan (deposit) sewa senilai Rp 2.500.000 secara utuh",
      "Bukti transfer deposit awal dan berita acara serah terima kunci lengkap",
      "Penyelesaian kewajiban sebelum ditempuh gugatan wanprestasi Pasal 1238 KUHPerdata",
    ],
    unknownFacts: ["Pemilik belum memberikan klarifikasi rincian potongan apapun."],
    clarifications: [],
  },
  bpsk_complaint: {
    originalStory:
      "Saya membeli perangkat elektronik senilai Rp 4.800.000 dari toko resmi, namun barang yang dikirim rusak dan pelaku usaha menolak pengembalian dana dengan alasan klausul baku.",
    category: "consumer_digital",
    categoryLabel: "Perlindungan Konsumen",
    urgencyLevel: "normal",
    knownFacts: [
      "Pembelian barang elektronik senilai Rp 4.800.000 dengan bukti pembayaran sah",
      "Barang diterima dalam kondisi cacat fungsi disertai bukti video pembukaan paket",
      "Tuntutan pengembalian dana (refund) penuh sesuai Pasal 19 UU No. 8 Tahun 1999",
      "Pembatalan klausul baku sepihak yang melanggar Pasal 18 UU Perlindungan Konsumen",
    ],
    unknownFacts: [],
    clarifications: [],
  },
  legal_aid_chronology: {
    originalStory:
      "Saya mengalami perselisihan hak yang berlarut-larut dan berniat meminta bantuan advokat pro bono pada Lembaga Bantuan Hukum (LBH) atau Posbankum terdekat.",
    category: "general_dispute",
    categoryLabel: "Umum & Hak Perdata",
    urgencyLevel: "normal",
    knownFacts: [
      "Perselisihan hak telah berlangsung lebih dari 30 hari tanpa titik temu",
      "Tersedia dokumen bukti awal berupa korespondensi tertulis dan bukti transaksi",
      "Permohonan telaah berkas perkara dan pendampingan hukum cuma-cuma (pro bono)",
    ],
    unknownFacts: ["Memerlukan arahan mengenai langkah hukum formil yang tepat."],
    clarifications: [],
  },
};

function OfficialShieldEmblem() {
  return (
    <svg
      viewBox="0 0 88 96"
      className="w-16 h-20 sm:w-20 sm:h-24 shrink-0"
      aria-hidden="true"
    >
      {/* Outer Shield Banner */}
      <path
        d="M12 10 H76 V52 C76 72 44 86 44 86 C44 86 12 72 12 52 Z"
        fill="#F8FAFC"
        stroke="#0F172A"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Top Header Ribbon */}
      <rect
        x="15"
        y="13"
        width="58"
        height="12"
        fill="#FFFFFF"
        stroke="#0F172A"
        strokeWidth="1.8"
      />
      <text
        x="44"
        y="22"
        textAnchor="middle"
        fill="#0F172A"
        fontSize="7.5"
        fontWeight="800"
        fontFamily="Georgia, serif"
        letterSpacing="1.2"
      >
        KEADILAN
      </text>
      {/* Inner Emblem Field */}
      <path
        d="M18 28 H70 V51 C70 67 44 79 44 79 C44 79 18 67 18 51 Z"
        fill="#1B365D"
        stroke="#0F172A"
        strokeWidth="1.8"
      />
      {/* Scales of Justice Pillar */}
      <line x1="44" y1="34" x2="44" y2="66" stroke="#F8FAFC" strokeWidth="2.5" />
      <line x1="28" y1="42" x2="60" y2="42" stroke="#F8FAFC" strokeWidth="2.2" />
      <polygon points="44,31 40,36 48,36" fill="#FBBF24" />
      {/* Left & Right Scale Pans */}
      <path d="M28 42 L23 53 H33 Z" fill="none" stroke="#F8FAFC" strokeWidth="1.6" />
      <path d="M60 42 L55 53 H65 Z" fill="none" stroke="#F8FAFC" strokeWidth="1.6" />
      <rect x="35" y="66" width="18" height="3.5" rx="1" fill="#FBBF24" />
      {/* Bottom Scroll Ribbon */}
      <path
        d="M14 82 Q44 93 74 82 L70 89 Q44 98 18 89 Z"
        fill="#FDE68A"
        stroke="#0F172A"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function LegalDocumentGenerator({
  initialFactSummary,
  caseCode,
  className = "",
}: LegalDocumentGeneratorProps) {
  const initialType = useMemo<LegalDocumentType>(() => {
    if (initialFactSummary) {
      return getRecommendedTemplate(initialFactSummary.category).id;
    }
    return "bipartite_request";
  }, [initialFactSummary]);

  const [selectedType, setSelectedType] = useState<LegalDocumentType>(initialType);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);

  const [fields, setFields] = useState<DocumentCustomFields>({
    headerMode: "institutional",
    institutionLine1: "SERIKAT PEKERJA & PERWAKILAN HUKUM WARGA",
    institutionLine2: "SEKRETARIAT PENDAMPINGAN HAK & ADVOKASI HUKUM",
    institutionAddress: "Gedung Layanan Advokasi Warga, Jl. Gatot Subroto Kav. 51, Jakarta",
    letterNumber: "",
    attachmentText: "1 (satu) berkas",
    senderName: "Budi Santoso",
    senderPhone: "0812-3456-7890",
    senderAddress: "Jl. Merdeka No. 10, Jakarta Selatan",
    recipientName: "PT Sumber Makmur Sejahtera",
    recipientRoleOrTitle: "Koordinator Pekerja / Pemohon",
    recipientAddress: "di tempat",
    letterCity: "Jakarta",
    proposedMeetingDate: "28-29 Oktober 2026",
    proposedMeetingTime: "09.00 WIB - 15.00 WIB",
    proposedMeetingDay: "Rabu-Kamis",
    responseDeadlineDays: 7,
  });

  const [hydratedCalcFact, setHydratedCalcFact] = useState<CaseFactSummary | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || initialFactSummary) return;
    try {
      const storedCalc = sessionStorage.getItem("hakku_calc_draft_payload");
      if (storedCalc) {
        const parsed = JSON.parse(storedCalc) as CaseFactSummary;
        if (parsed && parsed.originalStory && Array.isArray(parsed.knownFacts)) {
          setHydratedCalcFact(parsed);
          setSelectedType("bipartite_request");
          sessionStorage.removeItem("hakku_calc_draft_payload");
        }
      }
    } catch {
      // Ignore malformed session data
    }
  }, [initialFactSummary]);

  const factSummary = useMemo<CaseFactSummary>(() => {
    if (initialFactSummary) return initialFactSummary;
    if (hydratedCalcFact && selectedType === "bipartite_request") {
      return hydratedCalcFact;
    }
    return DEFAULT_SAMPLE_FACTS[selectedType];
  }, [initialFactSummary, hydratedCalcFact, selectedType]);

  const generatedDoc: GeneratedLegalDocument = useMemo(() => {
    return generateLegalDocument(selectedType, factSummary, fields);
  }, [selectedType, factSummary, fields]);

  const [userEditedText, setUserEditedText] = useState<string | null>(null);
  const effectiveText =
    userEditedText !== null ? userEditedText : generatedDoc.fullText;

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
  const letterNumberId = useId();
  const instLine1Id = useId();
  const instLine2Id = useId();

  const s = generatedDoc.structured;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-7 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary">
              <FileText className="w-4 h-4 text-brand-primary" aria-hidden="true" />
              <span>Tata Naskah Surat Resmi Indonesia</span>
              <span aria-hidden="true">·</span>
              <span>Siap Cetak A4 & PDF</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              Generator Draf Surat Hukum Resmi
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Susun naskah surat resmi sesuai kaidah tata naskah Indonesia (dilengkapi pilihan Kop Instansi/Organisasi maupun Surat Perorangan, penomoran sejajar, hingga blok tanda tangan kanan bawah).
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

      {/* Template Selector Grid (5 Formal Templates) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 print:hidden">
        {AVAILABLE_DOCUMENT_TEMPLATES.map((tpl) => {
          const isSelected = selectedType === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => {
                setSelectedType(tpl.id);
                setUserEditedText(null);
              }}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                isSelected
                  ? "bg-brand-primary-light/60 border-brand-primary ring-2 ring-brand-primary/15 shadow-2xs"
                  : "bg-white border-brand-border hover:border-gray-300"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-bold text-brand-text leading-snug">
                    {tpl.title}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-brand-primary shrink-0">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-brand-muted leading-relaxed line-clamp-2">
                  {tpl.description}
                </p>
              </div>
              <div className="pt-2 border-t border-brand-border/60 flex items-center gap-1 text-[10px] font-medium text-brand-primary">
                <Scale className="w-3 h-3 shrink-0" />
                <span className="truncate">{tpl.legalBasis}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Split Workspace: Left Form Controls, Right Official Letter Paper */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Pengisian Data Surat (5 Kolom) */}
        <div className="lg:col-span-5 bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-5 shadow-xs print:hidden">
          {/* Pilihan Mode Kop Surat */}
          <div className="space-y-2 pb-4 border-b border-brand-border">
            <label className="text-xs font-bold text-brand-text block">
              Format Kepala Surat (Kop Surat)
            </label>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() =>
                  setFields((prev) => ({ ...prev, headerMode: "institutional" }))
                }
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  (fields.headerMode || "institutional") === "institutional"
                    ? "bg-white text-brand-primary shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Kop Instansi / Serikat</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFields((prev) => ({ ...prev, headerMode: "personal" }))
                }
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  fields.headerMode === "personal"
                    ? "bg-white text-brand-primary shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Surat Perorangan</span>
              </button>
            </div>

            {(fields.headerMode || "institutional") === "institutional" && (
              <div className="space-y-2.5 pt-2">
                <div className="space-y-1">
                  <label
                    htmlFor={instLine1Id}
                    className="text-[11px] font-medium text-brand-text"
                  >
                    Baris Utama Kop Instansi / Organisasi
                  </label>
                  <input
                    id={instLine1Id}
                    type="text"
                    value={fields.institutionLine1 || ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        institutionLine1: e.target.value,
                      }))
                    }
                    placeholder="Contoh: SERIKAT PEKERJA / PERWAKILAN WARGA"
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor={instLine2Id}
                    className="text-[11px] font-medium text-brand-text"
                  >
                    Baris Unit / Divisi Kop Surat
                  </label>
                  <input
                    id={instLine2Id}
                    type="text"
                    value={fields.institutionLine2 || ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        institutionLine2: e.target.value,
                      }))
                    }
                    placeholder="Contoh: DIVISI ADVOKASI & BANTUAN HUKUM"
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-b border-brand-border pb-3">
            <h3 className="text-sm font-bold text-brand-text flex items-center gap-2">
              <User className="w-4 h-4 text-brand-primary" />
              <span>Data Pengirim, Nomor & Tujuan Surat</span>
            </h3>
            <span className="text-[11px] text-brand-muted">Lokal di Perangkat</span>
          </div>

          <div className="space-y-4">
            {/* Nomor Surat & Lampiran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor={letterNumberId}
                  className="text-xs font-medium text-brand-text"
                >
                  Nomor Surat
                </label>
                <input
                  id={letterNumberId}
                  type="text"
                  value={fields.letterNumber || ""}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, letterNumber: e.target.value }))
                  }
                  placeholder="251/ADV/X/2026"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor={letterCityId}
                  className="text-xs font-medium text-brand-text"
                >
                  Kota Pembuatan Surat
                </label>
                <input
                  id={letterCityId}
                  type="text"
                  value={fields.letterCity}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, letterCity: e.target.value }))
                  }
                  placeholder="Contoh: Serang / Jakarta"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Pengirim */}
            <div className="space-y-3 pt-2 border-t border-brand-border">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
                1. Penanda Tangan / Pengirim
              </span>

              <div className="space-y-1">
                <label
                  htmlFor={senderNameId}
                  className="text-xs font-medium text-brand-text"
                >
                  Nama Terang Penanda Tangan
                </label>
                <input
                  id={senderNameId}
                  type="text"
                  value={fields.senderName}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, senderName: e.target.value }))
                  }
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor={recipientRoleId}
                    className="text-xs font-medium text-brand-text"
                  >
                    Jabatan / Peran Pengirim
                  </label>
                  <input
                    id={recipientRoleId}
                    type="text"
                    value={fields.recipientRoleOrTitle || ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        recipientRoleOrTitle: e.target.value,
                      }))
                    }
                    placeholder="Contoh: Koordinator Pekerja / Pemohon"
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor={senderPhoneId}
                    className="text-xs font-medium text-brand-text"
                  >
                    Nomor Telepon / Kontak
                  </label>
                  <input
                    id={senderPhoneId}
                    type="text"
                    value={fields.senderPhone || ""}
                    onChange={(e) =>
                      setFields((prev) => ({ ...prev, senderPhone: e.target.value }))
                    }
                    placeholder="Contoh: 0254-267064 / 0812..."
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor={senderAddressId}
                  className="text-xs font-medium text-brand-text"
                >
                  Alamat Kantor / Domisili Pengirim
                </label>
                <input
                  id={senderAddressId}
                  type="text"
                  value={fields.senderAddress || ""}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      senderAddress: e.target.value,
                      institutionAddress: e.target.value,
                    }))
                  }
                  placeholder="Contoh: Jl. Syeh Nawawi Al Bantani KP3B Palima – Serang"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Penerima */}
            <div className="space-y-3 pt-3 border-t border-brand-border">
              <span className="text-xs font-bold text-brand-muted uppercase tracking-wider block">
                2. Pihak yang Dituju (Kepada Yth.)
              </span>

              <div className="space-y-1">
                <label
                  htmlFor={recipientNameId}
                  className="text-xs font-medium text-brand-text"
                >
                  Nama Instansi / Perusahaan / Pihak Tujuan
                </label>
                <input
                  id={recipientNameId}
                  type="text"
                  value={fields.recipientName}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      recipientName: e.target.value,
                    }))
                  }
                  placeholder="Contoh: PT Sumber Makmur Sejahtera"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor={recipientAddressId}
                  className="text-xs font-medium text-brand-text"
                >
                  Tempat / Alamat Tujuan
                </label>
                <input
                  id={recipientAddressId}
                  type="text"
                  value={fields.recipientAddress}
                  onChange={(e) =>
                    setFields((prev) => ({
                      ...prev,
                      recipientAddress: e.target.value,
                    }))
                  }
                  placeholder="Contoh: di tempat / Jl. Sudirman No. 45"
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text focus:outline-hidden focus:border-brand-primary"
                />
              </div>
            </div>

            {/* Pengaturan Spesifik Template */}
            {selectedType === "bipartite_request" && (
              <div className="space-y-3 pt-3 border-t border-brand-border">
                <label
                  htmlFor={meetingDateId}
                  className="text-xs font-medium text-brand-text block"
                >
                  Usulan Tanggal & Waktu Perundingan Bipartit
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    id={meetingDateId}
                    type="text"
                    value={fields.proposedMeetingDate || ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        proposedMeetingDate: e.target.value,
                      }))
                    }
                    placeholder="28-29 Oktober 2026"
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                  />
                  <input
                    type="text"
                    value={fields.proposedMeetingTime || ""}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        proposedMeetingTime: e.target.value,
                      }))
                    }
                    placeholder="09.00 WIB - Selesai"
                    className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                  />
                </div>
              </div>
            )}

            {selectedType === "somasi_warning" && (
              <div className="space-y-2 pt-3 border-t border-brand-border">
                <label
                  htmlFor={deadlineDaysId}
                  className="text-xs font-medium text-brand-text flex items-center justify-between"
                >
                  <span>Batas Waktu Tanggapan Somasi</span>
                  <span className="text-[10px] text-brand-muted">
                    Pasal 1238 KUHPerdata
                  </span>
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
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text"
                >
                  <option value={3}>3 (tiga) hari kalender - Mendesak</option>
                  <option value={7}>7 (tujuh) hari kalender - Standar Formil</option>
                  <option value={14}>14 (empat belas) hari kalender</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Pratinjau Kertas Surat Resmi Indonesia (7 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Action Toolbar */}
          <div className="bg-white border border-brand-border rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-2xs print:hidden">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white text-brand-text shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Kertas A4</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("edit")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === "edit"
                    ? "bg-white text-brand-text shadow-2xs"
                    : "text-brand-muted hover:text-brand-text"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Teks Manual</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-success" />
                    <span className="text-brand-success">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Salin Teks</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyiapkan PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Unduh PDF A4</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-brand-muted" />
                <span>.TXT</span>
              </button>

              {isPrinterConnected ? (
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
                  title={`Cetak ke ${printerName || "Printer"}`}
                >
                  <Printer className="w-3.5 h-3.5 text-slate-700" />
                  <span>Cetak</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={connectPrinter}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Printer className="w-3 h-3 text-slate-400" />
                  <span className="hidden md:inline text-[10px]">Printer</span>
                </button>
              )}
            </div>
          </div>

          {/* Paper View Container — Authentic Indonesian Formal Letter Format */}
          <div className="bg-slate-200/70 p-4 sm:p-7 rounded-2xl border border-slate-300 print:bg-transparent print:border-none print:p-0 print:m-0 print:rounded-none">
            {activeTab === "preview" && userEditedText === null ? (
              <div
                id="hakku-legal-document-paper"
                className="bg-white shadow-md border border-slate-300 px-8 py-10 sm:px-14 sm:py-12 text-black text-[13px] sm:text-[14px] leading-[1.6] print:p-0 print:border-none print:shadow-none print:m-0 mx-auto max-w-[794px]"
                style={{
                  minHeight: "920px",
                  fontFamily: '"Times New Roman", Times, Georgia, Cambria, serif',
                }}
              >
                {/* 1. KOP SURAT RESMI (Jika Mode Instansi / Organisasi) */}
                {s.headerMode === "institutional" && (
                  <div className="mb-3">
                    <div className="flex items-center gap-4 pb-2.5">
                      <OfficialShieldEmblem />
                      <div className="flex-1 text-center space-y-0.5 pr-2">
                        <div className="text-[16px] sm:text-[19px] font-bold tracking-wide uppercase text-black leading-tight">
                          {s.letterhead.line1}
                        </div>
                        <div className="text-[14px] sm:text-[17px] font-bold uppercase text-black leading-tight">
                          {s.letterhead.line2}
                        </div>
                        <div className="text-[11.5px] sm:text-[12.5px] text-black leading-snug pt-0.5">
                          {s.letterhead.address}
                        </div>
                        <div className="text-[11.5px] sm:text-[12.5px] text-black leading-snug">
                          {s.letterhead.phone}
                        </div>
                      </div>
                    </div>
                    {/* Garis Ganda Standar Tata Naskah Dinas (Tebal di atas, tipis di bawah) */}
                    <div className="border-t-[3px] border-black" />
                    <div className="mt-[2px] border-t border-black" />
                  </div>
                )}

                {/* 2. TITIMANGSA (Tempat & Tanggal Surat Rata Kanan) */}
                <div className="text-right mb-2">
                  <span>
                    {s.city}, {s.dateFormatted}
                  </span>
                </div>

                {/* 3. BLOK NOMOR, LAMPIRAN, PERIHAL (Sejajar Titik Dua) */}
                <div className="space-y-0.5 mb-3">
                  <div className="flex items-start">
                    <span className="w-24 shrink-0">Nomor</span>
                    <span className="w-3 shrink-0">:</span>
                    <span>{s.letterNumber}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0">Lampiran</span>
                    <span className="w-3 shrink-0">:</span>
                    <span>{s.attachment}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="w-24 shrink-0">Perihal</span>
                    <span className="w-3 shrink-0">:</span>
                    <span className="font-semibold">{s.subject}</span>
                  </div>
                </div>

                {/* 4. TUJUAN SURAT (Kepada Yth. ... di tempat) */}
                <div className="mb-4 leading-snug">
                  <div>Kepada :</div>
                  <div>Yth. {s.recipientTitle}</div>
                  <div>{s.recipientAddress}</div>
                </div>

                {/* 5. SALAM PEMBUKA */}
                <div className="mb-3">{s.salutation}</div>

                {/* 6. ALINEA PEMBUKA (Indented & Rata Kiri-Kanan / Justify) */}
                <p className="indent-10 text-justify mb-3 leading-relaxed">
                  {s.openingParagraph}
                </p>

                {/* 7. ALINEA DASAR HUKUM */}
                <p className="text-justify mb-3 leading-relaxed">
                  {s.legalBasisParagraph}
                </p>

                {/* 8. PENGANTAR RINCIAN JADWAL / KETENTUAN */}
                <p className="text-justify mb-2 leading-relaxed">
                  {s.detailIntroText}
                </p>

                {/* 9. TABEL RINCIAN JADWAL / KETENTUAN (Tanggal, Pukul, Hari, Tempat) */}
                <div className="space-y-0.5 mb-4 pl-1">
                  {s.detailRows.map((row, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="w-28 shrink-0">{row.label}</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* 10. SUSUNAN ACARA / POKOK BAHASAN (a, b, c, d) */}
                <div className="mb-4">
                  <div className="indent-10 mb-1.5">{s.agendaTitle}</div>
                  <div className="space-y-0.5 pl-1">
                    {s.agendaItems.map((item, idx) => {
                      const letter = String.fromCharCode(97 + (idx % 26));
                      return (
                        <div key={idx} className="flex items-start gap-1.5">
                          <span className="w-4 shrink-0">{letter}.</span>
                          <span className="flex-1 text-justify">{item}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 11. ALINEA PENUTUP */}
                <p className="text-justify mb-8 leading-relaxed">
                  {s.closingParagraph}
                </p>

                {/* 12. BLOK TANDA TANGAN KANAN BAWAH */}
                <div className="flex justify-end mt-6 mb-8">
                  <div className="w-64 text-center space-y-16">
                    <div>{s.signatoryRole}</div>
                    <div className="font-semibold underline underline-offset-4">
                      {s.signatoryName}
                    </div>
                  </div>
                </div>

                {/* 13. TEMBUSAN RESMI DI KIRI BAWAH */}
                {s.ccList.length > 0 && (
                  <div className="pt-2 text-[11.5px] text-black leading-snug">
                    <div className="underline mb-0.5">Tembusan Yth. :</div>
                    <ol className="list-decimal list-inside space-y-0.5">
                      {s.ccList.map((cc, idx) => (
                        <li key={idx}>{cc}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ) : activeTab === "preview" && userEditedText !== null ? (
              <div
                id="hakku-legal-document-paper"
                className="bg-white shadow-md border border-slate-300 px-8 py-10 sm:px-14 sm:py-12 text-black text-[13px] leading-relaxed whitespace-pre-wrap mx-auto max-w-[794px]"
                style={{
                  minHeight: "920px",
                  fontFamily: '"Times New Roman", Times, Georgia, Cambria, serif',
                }}
              >
                {effectiveText}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>
                    Anda dapat menyesuaikan kalimat secara bebas di bawah ini:
                  </span>
                  <button
                    type="button"
                    onClick={() => setUserEditedText(null)}
                    className="text-brand-primary font-semibold hover:underline cursor-pointer"
                  >
                    Kembalikan ke Format Tata Naskah Resmi
                  </button>
                </div>
                <textarea
                  value={effectiveText}
                  onChange={(e) => setUserEditedText(e.target.value)}
                  rows={26}
                  className="w-full bg-white rounded-lg border border-brand-border p-4 text-xs font-mono text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Panduan Pengiriman Surat */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 space-y-2 text-xs text-amber-900 print:hidden">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Petunjuk Pengiriman Dokumen Formil:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-800/90 leading-relaxed text-[11px]">
              <li>
                Cetak surat dalam rangkap 2 (dua): 1 rangkap diserahkan kepada pihak tujuan dan 1 rangkap disimpan sebagai arsip bukti tanda terima.
              </li>
              <li>
                Jika dikirim melalui kurir tercatat/pos, simpan resi pengiriman dan masukkan ke dalam <strong>Matriks Alat Bukti</strong> sebagai bukti sah pengiriman.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
