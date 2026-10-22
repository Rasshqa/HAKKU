"use client";

import React, { useState, useMemo, useId, useEffect, useCallback } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  Printer,
  Download,
  Scale,
  Trash2,
  Eye,
  Edit3,
  AlertTriangle,
  Clock,
  User,
  FileText,
} from "lucide-react";
import {
  EvidenceItem,
  ChronologyEvent,
  EvidenceAuditInput,
  EvidenceType,
} from "@/modules/evidence/types";
import { triggerConfetti } from "@/lib/confetti";
import { downloadElementAsPdf } from "@/lib/pdf";
import { usePrinterStatus } from "@/lib/printer";
import {
  evaluateEvidenceReadiness,
  EVIDENCE_TYPE_LABELS,
} from "@/modules/evidence/evaluator";

interface EvidenceAuditWorkspaceProps {
  initialCaseTitle?: string;
  initialCategory?: string;
  caseCode?: string;
  className?: string;
}

const PRESET_SCENARIOS: Record<string, { title: string; category: string; loss: number; events: ChronologyEvent[]; evidences: EvidenceItem[] }> = {
  online_scam: {
    title: "Penipuan Pembelian Barang Elektronik Online",
    category: "consumer_digital",
    loss: 3500000,
    evidences: [
      {
        id: "ev-1",
        code: "P-1",
        title: "Tangkapan Layar Chat WhatsApp & Penawaran Toko",
        type: "digital_communication",
        dateObtained: "10 Oktober 2026",
        description: "Percakapan kesepakatan harga dan instruksi pembayaran nomor rekening.",
        weight: "primary",
        storageLocation: "Tangkapan Layar Galeri HP / Google Drive",
        isAvailable: true,
      },
      {
        id: "ev-2",
        code: "P-2",
        title: "Struk Transfer Resmi m-Banking BCA",
        type: "digital_transaction",
        dateObtained: "10 Oktober 2026",
        description: "Bukti transfer senilai Rp 3.500.000 ke rekening terlapor.",
        weight: "primary",
        storageLocation: "File PDF Resi Pembayaran m-BCA",
        isAvailable: true,
      },
      {
        id: "ev-3",
        code: "P-3",
        title: "Profil Akun Media Sosial & Nomor Rekening Terlapor",
        type: "identity_document",
        dateObtained: "10 Oktober 2026",
        description: "Tangkapan layar akun Instagram toko dan rincian rekening penerima.",
        weight: "supporting",
        storageLocation: "Screenshot PNG",
        isAvailable: true,
      },
    ],
    events: [
      {
        id: "evt-1",
        date: "10 Oktober 2026",
        time: "13.00 WIB",
        eventTitle: "Kesepakatan Transaksi dan Transfer Dana",
        description: "Pelapor menyetujui pembelian handphone dan mentransfer dana Rp 3.500.000 ke rekening yang diberikan.",
        associatedEvidenceCodes: ["P-1", "P-2"],
      },
      {
        id: "evt-2",
        date: "12 Oktober 2026",
        time: "09.30 WIB",
        eventTitle: "Nomor Pelapor Diblokir dan Resi Fiktif",
        description: "Penjual memberikan nomor resi yang tidak terlacak di sistem kurir, lalu memblokir nomor WhatsApp pelapor.",
        associatedEvidenceCodes: ["P-1", "P-3"],
      },
    ],
  },
  tenancy_deposit: {
    title: "Sengketa Penahanan Uang Deposit Sewa Rumah/Kamar",
    category: "tenancy_contract",
    loss: 2500000,
    evidences: [
      {
        id: "ev-1",
        code: "P-1",
        title: "Kuitansi / Perjanjian Sewa Bertanda Tangan",
        type: "written_contract",
        dateObtained: "1 Januari 2025",
        description: "Bukti perjanjian sewa yang memuat klausul pengembalian deposit selambatnya 14 hari.",
        weight: "primary",
        storageLocation: "Dokumen Asli Fisik & Foto",
        isAvailable: true,
      },
      {
        id: "ev-2",
        code: "P-2",
        title: "Foto Berita Acara Serah Terima Kunci Tanpa Kerusakan",
        type: "audio_visual",
        dateObtained: "1 Oktober 2026",
        description: "Kondisi kamar bersih dan kunci diserahkan langsung kepada pemilik.",
        weight: "primary",
        storageLocation: "Foto Digital dengan Timestamp",
        isAvailable: true,
      },
      {
        id: "ev-3",
        code: "P-3",
        title: "Chat WhatsApp Penagihan Deposit yang Diabaikan",
        type: "digital_communication",
        dateObtained: "15 Oktober 2026",
        description: "Pesan penagihan pengembalian deposit yang tidak dibalas atau ditolak tanpa alasan.",
        weight: "supporting",
        storageLocation: "Screenshot WA",
        isAvailable: true,
      },
    ],
    events: [
      {
        id: "evt-1",
        date: "1 Oktober 2026",
        time: "11.00 WIB",
        eventTitle: "Pengembalian Kunci & Masa Sewa Selesai",
        description: "Pelapor mengosongkan properti tepat waktu dan menyerahkan kunci kepada pihak pemilik.",
        associatedEvidenceCodes: ["P-1", "P-2"],
      },
      {
        id: "evt-2",
        date: "15 Oktober 2026",
        time: "14.00 WIB",
        eventTitle: "Batas Waktu Pengembalian Deposit Terlewati",
        description: "Tenggat waktu 14 hari terlampaui tanpa ada itikad pengembalian deposit Rp 2.500.000.",
        associatedEvidenceCodes: ["P-3"],
      },
    ],
  },
};

export function EvidenceAuditWorkspace({
  initialCaseTitle = "",
  initialCategory = "consumer_digital",
  caseCode,
  className = "",
}: EvidenceAuditWorkspaceProps) {
  const [caseTitle, setCaseTitle] = useState(initialCaseTitle);
  const [category, setCategory] = useState(initialCategory);
  const [reporterName, setReporterName] = useState("");
  const [reporterNik, setReporterNik] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [reporterAddress, setReporterAddress] = useState("");
  const [reportedPartyName, setReportedPartyName] = useState("");
  const [reportedPartyContact, setReportedPartyContact] = useState("");
  const [reportedPartyDetails, setReportedPartyDetails] = useState("");
  const [incidentLocationCity, setIncidentLocationCity] = useState("");
  const [incidentDateStart, setIncidentDateStart] = useState("");
  const [incidentDateEnd, setIncidentDateEnd] = useState("");
  const [totalLossAmount, setTotalLossAmount] = useState<number>(0);

  const [evidences, setEvidences] = useState<EvidenceItem[]>([]);
  const [events, setEvents] = useState<ChronologyEvent[]>([]);

  // New evidence form inline state
  const [newEvidenceTitle, setNewEvidenceTitle] = useState("");
  const [newEvidenceType, setNewEvidenceType] = useState<EvidenceType>("digital_transaction");
  const [newEvidenceDesc, setNewEvidenceDesc] = useState("");
  const [newEvidenceLocation, setNewEvidenceLocation] = useState("");

  // New event inline state
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");

  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [userEditedReport, setUserEditedReport] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Dynamic evaluation calculation
  const auditEvaluation = useMemo(() => {
    const input: EvidenceAuditInput = {
      caseTitle,
      category,
      reporterName,
      reporterNik,
      reporterPhone,
      reporterAddress,
      reportedPartyName,
      reportedPartyContact,
      reportedPartyDetails,
      incidentLocationCity,
      incidentDateStart,
      incidentDateEnd,
      totalLossAmount,
      events,
      evidences,
    };
    return evaluateEvidenceReadiness(input);
  }, [
    caseTitle,
    category,
    reporterName,
    reporterNik,
    reporterPhone,
    reporterAddress,
    reportedPartyName,
    reportedPartyContact,
    reportedPartyDetails,
    incidentLocationCity,
    incidentDateStart,
    incidentDateEnd,
    totalLossAmount,
    events,
    evidences,
  ]);

  const effectiveReportText =
    userEditedReport !== null
      ? userEditedReport
      : auditEvaluation.formattedReportText;

  const verificationHash = useMemo(() => {
    const raw = `${caseCode || "BAP-HK"}-${caseTitle}-${reporterName}-${reportedPartyName}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, "0").toUpperCase();
    return `BAP-VERIF-${hex}`;
  }, [caseCode, caseTitle, reporterName, reportedPartyName]);

  const handleAddEvidence = () => {
    if (!newEvidenceTitle.trim()) return;
    const nextIndex = evidences.length + 1;
    const item: EvidenceItem = {
      id: `ev-${Date.now()}`,
      code: `P-${nextIndex}`,
      title: newEvidenceTitle.trim(),
      type: newEvidenceType,
      dateObtained: "Oktober 2026",
      description: newEvidenceDesc.trim() || "Alat bukti sah pendukung laporan.",
      weight: "primary",
      storageLocation: newEvidenceLocation.trim() || "Tersimpan di Penyimpanan Pelapor",
      isAvailable: true,
    };
    setEvidences((prev) => [...prev, item]);
    setNewEvidenceTitle("");
    setNewEvidenceDesc("");
    setNewEvidenceLocation("");
    setUserEditedReport(null);
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidences((prev) => prev.filter((e) => e.id !== id));
    setUserEditedReport(null);
  };

  const handleToggleEvidenceAvailability = (id: string) => {
    setEvidences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isAvailable: !e.isAvailable } : e))
    );
    setUserEditedReport(null);
  };

  const handleAddEvent = () => {
    if (!newEventDate.trim() || !newEventTitle.trim()) return;
    const newEvt: ChronologyEvent = {
      id: `evt-${Date.now()}`,
      date: newEventDate.trim(),
      eventTitle: newEventTitle.trim(),
      description: newEventDesc.trim() || "Peristiwa kronologis kejadian.",
      associatedEvidenceCodes: evidences.map((e) => e.code),
    };
    setEvents((prev) => [...prev, newEvt]);
    setNewEventDate("");
    setNewEventTitle("");
    setNewEventDesc("");
    setUserEditedReport(null);
  };

  const handleRemoveEvent = (id: string) => {
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
    setUserEditedReport(null);
  };

  const handleLoadPreset = (presetKey: string) => {
    const preset = PRESET_SCENARIOS[presetKey];
    if (!preset) return;
    setCaseTitle(preset.title);
    setCategory(preset.category);
    setTotalLossAmount(preset.loss);
    setEvidences(preset.evidences);
    setEvents(preset.events);
    setUserEditedReport(null);
  };

  const handleResetForm = () => {
    setCaseTitle("");
    setCategory("consumer_digital");
    setReporterName("");
    setReporterNik("");
    setReporterPhone("");
    setReporterAddress("");
    setReportedPartyName("");
    setReportedPartyContact("");
    setReportedPartyDetails("");
    setIncidentLocationCity("");
    setIncidentDateStart("");
    setIncidentDateEnd("");
    setTotalLossAmount(0);
    setEvidences([]);
    setEvents([]);
    setUserEditedReport(null);
  };

  const handleCopy = () => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(effectiveReportText);
      setCopied(true);
      triggerConfetti({ particleCount: 70, spread: 65 });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const { isPrinterConnected, printerName, connectPrinter } = usePrinterStatus();

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
    const filename = `HAKKU_Berita_Acara_Bukti_${new Date().toISOString().slice(0, 10)}.pdf`;

    await downloadElementAsPdf("hakku-evidence-paper", { filename });
    setIsGeneratingPdf(false);
  };

  const handleDownloadTxt = useCallback(() => {
    if (typeof window === "undefined") return;
    const blob = new Blob([effectiveReportText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `HAKKU_Matriks_Bukti_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti({ particleCount: 80, spread: 75 });
  }, [effectiveReportText]);

  // Keyboard Shortcut: Ctrl+S / Cmd+S to download or save document (Company-grade productivity)
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

  const caseTitleId = useId();
  const reporterNameId = useId();
  const reporterNikId = useId();
  const reporterPhoneId = useId();
  const reporterAddressId = useId();
  const reportedPartyId = useId();
  const reportedContactId = useId();
  const reportedPartyDetailsId = useId();
  const dateStartId = useId();
  const dateEndId = useId();
  const lossAmountId = useId();
  const cityId = useId();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner */}
      <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-7 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-xs font-semibold text-brand-primary border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" aria-hidden="true" />
              <span>Inovasi 3 • Matriks Bukti & Laporan Siap Lapor</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-brand-text tracking-tight">
              Audit Jejak Bukti & Berita Acara Kejadian
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted max-w-2xl leading-relaxed">
              Strukturkan alat bukti Anda sesuai standar Pasal 184 KUHAP & UU ITE No. 1/2024. Evaluasi kekuatan berkas secara real-time dan susun Berita Acara Kronologis siap bawa ke SPKT Polisi, BPSK, atau Disnaker.
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

      {/* Preset Scenario Selector with accessible tap targets */}
      <div className="flex flex-wrap items-center gap-2 print:hidden">
        <span className="text-xs font-bold text-brand-muted uppercase tracking-wider">
          Muat Contoh Kasus Nyata:
        </span>
        <button
          type="button"
          onClick={() => handleLoadPreset("online_scam")}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-text transition-colors shadow-2xs min-touch-target flex items-center justify-center"
        >
          Contoh: Penipuan Online
        </button>
        <button
          type="button"
          onClick={() => handleLoadPreset("tenancy_deposit")}
          className="text-xs font-semibold px-3.5 py-1.5 rounded-lg border border-brand-border bg-white hover:bg-gray-50 text-brand-text transition-colors shadow-2xs min-touch-target flex items-center justify-center"
        >
          Contoh: Deposit Sewa
        </button>
        {(evidences.length > 0 || events.length > 0 || reporterName || caseTitle) && (
          <button
            type="button"
            onClick={() => setShowResetConfirmModal(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors shadow-2xs min-touch-target flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan Form</span>
          </button>
        )}
      </div>

      {/* Main Grid: Management Controls vs Audit Result & Formal Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kolom Kiri: Form Identitas, Matriks Bukti & Kronologi (5 Kolom) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Identitas Kasus & Pihak */}
          <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted flex items-center gap-2 border-b border-brand-border pb-2">
              <User className="w-4 h-4 text-brand-primary" />
              <span>1. Identitas Kasus & Pihak Terlibat</span>
            </h3>

            <div className="space-y-1">
              <label htmlFor={caseTitleId} className="text-xs font-medium text-brand-text">
                Judul Perkara / Dugaan Masalah
              </label>
              <input
                id={caseTitleId}
                type="text"
                placeholder="Contoh: Penipuan Pembelian Barang Elektronik Online"
                value={caseTitle}
                onChange={(e) => {
                  setCaseTitle(e.target.value);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text font-bold placeholder:font-normal placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor={reporterNameId} className="text-[11px] font-medium text-brand-muted">
                  Nama Anda (Pelapor)
                </label>
                <input
                  id={reporterNameId}
                  type="text"
                  placeholder="Nama lengkap Anda"
                  value={reporterName}
                  onChange={(e) => {
                    setReporterName(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={reporterNikId} className="text-[11px] font-medium text-brand-muted">
                  NIK KTP Pelapor
                </label>
                <input
                  id={reporterNikId}
                  type="text"
                  placeholder="16 digit NIK KTP"
                  value={reporterNik}
                  onChange={(e) => {
                    setReporterNik(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text font-mono placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor={reporterPhoneId} className="text-[11px] font-medium text-brand-muted">
                  Nomor Kontak HP / WA
                </label>
                <input
                  id={reporterPhoneId}
                  type="text"
                  placeholder="Contoh: 0812-9988-7766"
                  value={reporterPhone}
                  onChange={(e) => {
                    setReporterPhone(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={cityId} className="text-[11px] font-medium text-brand-muted">
                  Kota Kejadian (Locus)
                </label>
                <input
                  id={cityId}
                  type="text"
                  placeholder="Contoh: Jakarta Selatan"
                  value={incidentLocationCity}
                  onChange={(e) => {
                    setIncidentLocationCity(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor={reporterAddressId} className="text-[11px] font-medium text-brand-muted">
                Alamat Domisili Pelapor
              </label>
              <input
                id={reporterAddressId}
                type="text"
                placeholder="Contoh: Jl. Tebet Barat No. 15, Jakarta Selatan"
                value={reporterAddress}
                onChange={(e) => {
                  setReporterAddress(e.target.value);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={reportedPartyId} className="text-[11px] font-medium text-brand-muted">
                Nama Pihak Terlapor / Toko / Perusahaan Lawan
              </label>
              <input
                id={reportedPartyId}
                type="text"
                placeholder="Contoh: Toko Digital Sejahtera / Akun @gadget_ori"
                value={reportedPartyName}
                onChange={(e) => {
                  setReportedPartyName(e.target.value);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={reportedContactId} className="text-[11px] font-medium text-brand-muted">
                No. Rekening / Kontak / Akun Media Sosial Terlapor
              </label>
              <input
                id={reportedContactId}
                type="text"
                placeholder="Contoh: 0858-1122-3344 / Rekening BCA: 1234567890"
                value={reportedPartyContact}
                onChange={(e) => {
                  setReportedPartyContact(e.target.value);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor={reportedPartyDetailsId} className="text-[11px] font-medium text-brand-muted">
                Keterangan / Ciri Tambahan Terlapor
              </label>
              <input
                id={reportedPartyDetailsId}
                type="text"
                placeholder="Contoh: Akun penjual online, kontak sekarang diblokir"
                value={reportedPartyDetails}
                onChange={(e) => {
                  setReportedPartyDetails(e.target.value);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label htmlFor={dateStartId} className="text-[11px] font-medium text-brand-muted">
                  Waktu Mulai Kejadian
                </label>
                <input
                  id={dateStartId}
                  type="text"
                  placeholder="Contoh: 10 Okt 2026"
                  value={incidentDateStart}
                  onChange={(e) => {
                    setIncidentDateStart(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor={dateEndId} className="text-[11px] font-medium text-brand-muted">
                  Waktu Akhir Kejadian
                </label>
                <input
                  id={dateEndId}
                  type="text"
                  placeholder="Contoh: 15 Okt 2026"
                  value={incidentDateEnd}
                  onChange={(e) => {
                    setIncidentDateEnd(e.target.value);
                    setUserEditedReport(null);
                  }}
                  className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor={lossAmountId} className="text-[11px] font-medium text-brand-muted">
                Estimasi Total Kerugian Finansial (Rp)
              </label>
              <input
                id={lossAmountId}
                type="number"
                min={0}
                placeholder="Contoh: 3500000"
                value={totalLossAmount || ""}
                onChange={(e) => {
                  setTotalLossAmount(Number(e.target.value) || 0);
                  setUserEditedReport(null);
                }}
                className="w-full text-xs px-3 py-2 border border-brand-border rounded-lg bg-white text-brand-text font-mono font-bold placeholder:font-normal placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Bagian 2: Kelola Daftar Alat Bukti Sah (P-1, P-2, dsb.) */}
          <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-brand-border pb-2">
              <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-brand-primary" />
                <span>2. Matriks Alat Bukti Sah ({evidences.length})</span>
              </h3>
              <span className="text-[10px] text-brand-primary font-semibold">
                Pasal 184 KUHAP
              </span>
            </div>

            {/* List Bukti */}
            <div className="space-y-2.5">
              {evidences.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-brand-border bg-gray-50/70 text-center space-y-1">
                  <p className="text-xs font-bold text-brand-text">
                    Belum Ada Bukti Dimasukkan
                  </p>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    Daftar alat bukti masih kosong. Tambahkan bukti fisik atau berkas digital melalui form di bawah.
                  </p>
                </div>
              ) : (
                evidences.map((e) => (
                  <div
                    key={e.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                      e.isAvailable
                        ? "bg-gray-50 border-gray-200"
                        : "bg-red-50/50 border-red-200 opacity-60 line-through"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-brand-primary text-white text-[10px]">
                          {e.code}
                        </span>
                        <strong className="text-brand-text">{e.title}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(e.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Hapus Bukti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[11px] text-brand-muted leading-relaxed">
                      {e.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-[10px] text-brand-muted pt-1 border-t border-gray-200/60">
                      <span className="font-medium text-brand-primary">
                        {EVIDENCE_TYPE_LABELS[e.type]}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleEvidenceAvailability(e.id)}
                        className={`font-semibold ${
                          e.isAvailable ? "text-emerald-700" : "text-amber-700"
                        }`}
                      >
                        {e.isAvailable ? "✓ Ada di Tangan" : "Belum Tersimpan"}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form Tambah Bukti Baru */}
            <div className="pt-3 border-t border-brand-border space-y-2 bg-slate-50 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-brand-text block">
                + Tambah Alat Bukti Baru:
              </span>
              <input
                type="text"
                placeholder="Contoh: Rekaman Suara Telepon Penagihan"
                value={newEvidenceTitle}
                onChange={(e) => setNewEvidenceTitle(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value as EvidenceType)}
                  className="w-full text-[11px] p-1.5 border border-brand-border rounded bg-white text-brand-text"
                >
                  <option value="digital_transaction">Bukti Transaksi Finansial</option>
                  <option value="digital_communication">Chat WhatsApp / Email</option>
                  <option value="written_contract">Dokumen Tertulis / Surat</option>
                  <option value="identity_document">Identitas / No. Rekening</option>
                  <option value="audio_visual">Foto / Video / Audio</option>
                  <option value="witness_testimony">Keterangan Saksi</option>
                </select>
                <input
                  type="text"
                  placeholder="Lokasi (mis: File PDF HP)"
                  value={newEvidenceLocation}
                  onChange={(e) => setNewEvidenceLocation(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEvidence}
                className="w-full py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded transition-colors"
              >
                Simpan Bukti ke Matriks
              </button>
            </div>
          </div>

          {/* Bagian 3: Kelola Rangkaian Kronologi Waktu */}
          <div className="bg-white border border-brand-border rounded-xl p-5 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider text-brand-muted flex items-center gap-1.5 border-b border-brand-border pb-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>3. Rangkaian Kronologi Kejadian ({events.length})</span>
            </h3>

            <div className="space-y-2.5">
              {events.length === 0 ? (
                <div className="p-4 rounded-lg border border-dashed border-brand-border bg-gray-50/70 text-center space-y-1">
                  <p className="text-xs font-bold text-brand-text">
                    Belum Ada Rangkaian Peristiwa
                  </p>
                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    Kronologi waktu masih kosong. Masukkan tanggal dan kejadian awal hingga akhir melalui form di bawah.
                  </p>
                </div>
              ) : (
                events.map((ev, idx) => (
                  <div
                    key={ev.id}
                    className="p-3 bg-gray-50 border border-brand-border rounded-lg space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <strong className="text-brand-text">{ev.date}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvent(ev.id)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="font-semibold text-brand-text pl-6">
                      {ev.eventTitle}
                    </div>
                    <p className="text-[11px] text-brand-muted pl-6 leading-relaxed">
                      {ev.description}
                    </p>
                    {ev.associatedEvidenceCodes && ev.associatedEvidenceCodes.length > 0 && (
                      <div className="pl-6 pt-1 flex items-center gap-1 text-[10px] text-brand-primary font-medium">
                        <span>Didukung Bukti:</span>
                        {ev.associatedEvidenceCodes.map((code) => (
                          <span key={code} className="bg-brand-primary/10 px-1.5 py-0.2 rounded font-bold">
                            {code}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Tambah Event Baru */}
            <div className="pt-2 border-t border-brand-border space-y-2 bg-slate-50 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-brand-text block">
                + Tambah Peristiwa Kronologi:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Tanggal (mis: 14 Okt 2026)"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full text-[11px] px-2.5 py-1.5 border border-brand-border rounded bg-white text-brand-text"
                />
                <input
                  type="text"
                  placeholder="Peristiwa Singkat"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full text-[11px] px-2.5 py-1.5 border border-brand-border rounded bg-white text-brand-text"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Uraian apa yang terjadi secara detail..."
                value={newEventDesc}
                onChange={(e) => setNewEventDesc(e.target.value)}
                className="w-full text-[11px] p-2 border border-brand-border rounded bg-white text-brand-text resize-none"
              />
              <button
                type="button"
                onClick={handleAddEvent}
                className="w-full py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded transition-colors"
              >
                Tambah ke Kronologi
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Skor Kesiapan & Pratinjau Kertas Berita Acara (7 Kolom) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Skor Kesiapan Pembuktian (Readiness Meter) */}
          <div className="bg-white border border-brand-border rounded-xl p-5 sm:p-6 space-y-4 shadow-xs print:hidden">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                  Penilaian Kekuatan Berkas
                </span>
                <h3 className="text-base font-bold text-brand-text mt-0.5">
                  Skor Kesiapan Pembuktian Hukum
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-brand-primary font-mono">
                  {auditEvaluation.readinessScore}%
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`p-3 rounded-lg border text-xs font-bold ${auditEvaluation.readinessColor}`}>
              {auditEvaluation.readinessLabel}
            </div>

            {/* Kekuatan vs Hal yang Masih Kurang */}
            <div className="space-y-3 pt-2 text-xs">
              {auditEvaluation.strengths.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Poin Bukti yang Sudah Kuat:</span>
                  </span>
                  <ul className="space-y-1 text-slate-700 pl-5 list-disc text-[11px]">
                    {auditEvaluation.strengths.map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {auditEvaluation.missingCriticalItems.length > 0 && (
                <div className="space-y-1.5 bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Celah Bukti yang Wajib Dilengkapi:</span>
                  </span>
                  <ul className="space-y-1 text-amber-900/90 pl-5 list-disc text-[11px]">
                    {auditEvaluation.missingCriticalItems.map((mis, i) => (
                      <li key={i}>{mis}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Action Toolbar Pratinjau Kertas */}
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
                <span>Pratinjau Kertas Berita Acara</span>
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
                title="Salin seluruh teks naskah ke papan klip (clipboard)"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-success" />
                    <span className="text-brand-success">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-brand-muted" />
                    <span>Salin Laporan</span>
                  </>
                )}
              </button>

              {/* Unduh Berkas PDF Resmi (Terpisah dari Cetak) */}
              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 rounded-lg transition-colors shadow-2xs"
                title="Unduh Berita Acara langsung sebagai berkas PDF resmi (A4)"
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
                title="Unduh file naskah teks (Pintasan: Ctrl + S)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-text bg-white border border-brand-border hover:bg-gray-50 rounded-lg transition-colors shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-brand-muted" />
                <span className="hidden sm:inline">Unduh</span> .TXT
                <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.2 bg-gray-100 border border-gray-300 rounded text-gray-500">
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
                  <span>Cetak Berita Acara</span>
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
                id="hakku-evidence-paper"
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-slate-800 font-serif leading-relaxed text-xs sm:text-[13px] space-y-4 print:p-0 print:border-none print:shadow-none print:m-0 relative"
                style={{
                  minHeight: "650px",
                  whiteSpace: "pre-wrap",
                  fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif',
                }}
              >
                {/* Kop Surat Resmi Berita Acara HAKKU */}
                <div className="border-b-2 border-slate-900 pb-3 mb-6 font-sans">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Scale className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[13px] font-black tracking-wider text-slate-900 uppercase">
                          HAKKU • UNIT AUDIT BUKTI & INVESTIGASI MANDIRI
                        </div>
                        <div className="text-[10px] text-slate-600 leading-tight">
                          Berita Acara Kronologis Kejadian & Matriks Alat Bukti Hukum Positif RI
                        </div>
                        <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                          Standar Formil Pasal 184 KUHAP jo. UU No. 1/2024 (ITE) • Keaslian Digital Terverifikasi
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <span className="text-[9px] font-mono text-slate-500 block uppercase">No. Register BAP:</span>
                      <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                        {caseCode || "BAP-HK/2026/0921"}
                      </span>
                    </div>
                  </div>
                  {/* Garis Ganda Standar Surat Resmi */}
                  <div className="mt-3 border-t-2 border-slate-900" />
                  <div className="mt-0.5 border-t border-slate-700" />
                </div>

                {/* Isi Naskah Berita Acara */}
                <div className="text-slate-900 font-serif leading-relaxed">{effectiveReportText}</div>

                {/* Stempel Digital Formil & Validasi Integritas HAKKU */}
                <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-2 border-emerald-800 p-0.5 flex items-center justify-center bg-emerald-50/50 shrink-0">
                      <div className="w-full h-full rounded-full border border-dashed border-emerald-700 flex flex-col items-center justify-center text-center p-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                        <span className="text-[7px] font-bold text-emerald-950 uppercase tracking-tighter leading-none mt-0.5">
                          EVIDENCE
                        </span>
                        <span className="text-[6px] font-mono text-emerald-700 font-bold leading-none mt-0.5">
                          AUDITED
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Audit Berkas Memenuhi Standar Pembuktian</span>
                      </div>
                      <p className="text-[9px] text-slate-500 max-w-sm leading-tight mt-0.5">
                        Laporan Berita Acara disusun secara kronologis dan berantai menurut kaidah pembuktian hukum acara untuk SPKT Kepolisian, Posbankum, maupun mediasi Disnaker.
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
                      (Untuk Pelaporan Formil)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-brand-muted">
                  <span>Sesuaikan redaksi naskah laporan di bawah ini:</span>
                  <button
                    type="button"
                    onClick={() => setUserEditedReport(null)}
                    className="text-brand-primary hover:underline"
                  >
                    Reset ke Template Asli
                  </button>
                </div>
                <textarea
                  value={effectiveReportText}
                  onChange={(e) => setUserEditedReport(e.target.value)}
                  rows={24}
                  className="w-full bg-white rounded-lg border border-brand-border p-4 text-xs font-mono text-brand-text focus:outline-hidden focus:ring-2 focus:ring-brand-primary/20 leading-relaxed"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Kosongkan Form (Error Prevention & Safety - Prinsip 6) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 text-brand-danger">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-brand-text">
                Kosongkan Matriks Bukti & Laporan?
              </h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Tindakan ini akan mengosongkan identitas pihak, daftar alat bukti yang telah ditambahkan, serta rangkaian kronologi kejadian. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-text rounded-lg min-touch-target"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-danger hover:bg-red-700 rounded-lg transition-colors min-touch-target"
              >
                Ya, Kosongkan Form
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
