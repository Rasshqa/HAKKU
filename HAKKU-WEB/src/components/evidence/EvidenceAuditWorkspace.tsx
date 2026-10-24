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
  Share2,
  Link2,
  Lock,
  Globe,
  Sparkles,
  X,
  ExternalLink,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  FolderOpen,
  Calendar,
} from "lucide-react";
import {
  EvidenceItem,
  ChronologyEvent,
  EvidenceAuditInput,
  EvidenceType,
} from "@/modules/evidence/types";
import { triggerConfetti } from "@/lib/confetti";
import jsPDF from "jspdf";
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

type MatrixFilterCategory = "all" | "digital" | "physical" | "testimonial" | EvidenceType;

function getEvidenceMacroCategory(type: EvidenceType): {
  key: "digital" | "physical" | "testimonial";
  label: "Digital" | "Physical" | "Testimonial";
  badgeClass: string;
  statutoryBasis: string;
} {
  if (type === "digital_transaction" || type === "digital_communication") {
    return {
      key: "digital",
      label: "Digital",
      badgeClass: "bg-[#1B365D]/10 text-[#1B365D] border-[#1B365D]/25",
      statutoryBasis: "Pasal 5 ayat (1) & Pasal 6 UU ITE No. 1 Tahun 2024 (Dokumen & Informasi Elektronik)",
    };
  }
  if (type === "witness_testimony") {
    return {
      key: "testimonial",
      label: "Testimonial",
      badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
      statutoryBasis: "Pasal 184 ayat (1) huruf a KUHAP jo. Pasal 1895 KUHPerdata (Keterangan Saksi)",
    };
  }
  return {
    key: "physical",
    label: "Physical",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    statutoryBasis: "Pasal 184 ayat (1) huruf c KUHAP jo. Pasal 1867 KUHPerdata (Surat / Bukti Fisik & Rekaman)",
  };
}

const WEIGHT_LABELS: Record<EvidenceItem["weight"], string> = {
  primary: "Bukti Utama (Primary)",
  supporting: "Bukti Pendukung (Supporting)",
  corroborative: "Bukti Penguat (Corroborative)",
};

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
        sourceNotes: "Diunduh langsung dari aplikasi WhatsApp pelapor (Nomor Terlapor tampil utuh tanpa edit, mencantumkan metadata jam pesan).",
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
        sourceNotes: "Dokumen PDF asli dari mutasi resmi m-Banking BCA beserta nomor referensi transaksi yang dapat diverifikasi bank.",
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
        sourceNotes: "Diambil sebelum akun pelapor diblokir; mencakup URL profil toko dan kecocokan nama pemilik rekening.",
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
        sourceNotes: "Naskah asli bermeterai Rp 10.000 yang ditandatangani kedua belah pihak saat awal masa sewa.",
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
        sourceNotes: "Foto diambil menggunakan kamera ponsel pelapor dengan EXIF lokasi dan tanggal 1 Oktober 2026 pukul 11.00 WIB.",
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
        sourceNotes: "Ekspor riwayat percakapan WhatsApp yang menunjukkan pesan telah terbaca (centang biru) namun tidak diindahkan.",
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
  const defaultPreset = PRESET_SCENARIOS.online_scam;
  const [caseTitle, setCaseTitle] = useState(initialCaseTitle || defaultPreset.title);
  const [category, setCategory] = useState(initialCaseTitle ? initialCategory : defaultPreset.category);
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
  const [totalLossAmount, setTotalLossAmount] = useState<number>(
    initialCaseTitle ? 0 : defaultPreset.loss
  );

  const [evidences, setEvidences] = useState<EvidenceItem[]>(
    initialCaseTitle ? [] : defaultPreset.evidences
  );
  const [events, setEvents] = useState<ChronologyEvent[]>(
    initialCaseTitle ? [] : defaultPreset.events
  );
  const [lastAddedRowId, setLastAddedRowId] = useState<string | null>(null);

  // New evidence form inline state
  const [newEvidenceTitle, setNewEvidenceTitle] = useState("");
  const [newEvidenceType, setNewEvidenceType] = useState<EvidenceType>("digital_transaction");
  const [newEvidenceDate, setNewEvidenceDate] = useState("");
  const [newEvidenceDesc, setNewEvidenceDesc] = useState("");
  const [newEvidenceLocation, setNewEvidenceLocation] = useState("");
  const [newEvidenceSourceNotes, setNewEvidenceSourceNotes] = useState("");

  // New event inline state
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");

  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [copied, setCopied] = useState(false);
  const [userEditedReport, setUserEditedReport] = useState<string | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Share & Legal Counsel Export state inside #hakku-evidence-paper
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const [counselRecipient, setCounselRecipient] = useState("Tim Kuasa Hukum / LBH Posbankum");
  const [sharedCounselBanner, setSharedCounselBanner] = useState<string | null>(null);

  // Google Search Grounding state
  const [isGroundingLoading, setIsGroundingLoading] = useState(false);
  const [groundingSummary, setGroundingSummary] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<Array<{ title: string; uri: string }>>([]);

  // #hakku-evidence-paper Matrix Filter, Search & Row Expansion state
  const [matrixTypeFilter, setMatrixTypeFilter] = useState<MatrixFilterCategory>("all");
  const [matrixSearchQuery, setMatrixSearchQuery] = useState("");
  const [expandedEvidenceIds, setExpandedEvidenceIds] = useState<Record<string, boolean>>({});
  const [expandedEventIds, setExpandedEventIds] = useState<Record<string, boolean>>({});

  const toggleEvidenceRowExpand = useCallback((id: string) => {
    setExpandedEvidenceIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleEventRowExpand = useCallback((id: string) => {
    setExpandedEventIds((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const filteredPaperEvidences = useMemo(() => {
    const q = matrixSearchQuery.trim().toLowerCase();
    return evidences.filter((item) => {
      const macro = getEvidenceMacroCategory(item.type);
      const matchesType =
        matrixTypeFilter === "all" ||
        matrixTypeFilter === macro.key ||
        matrixTypeFilter === item.type;

      if (!matchesType) return false;
      if (!q) return true;

      const typeLabel = EVIDENCE_TYPE_LABELS[item.type].toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.storageLocation.toLowerCase().includes(q) ||
        typeLabel.includes(q) ||
        macro.label.toLowerCase().includes(q)
      );
    });
  }, [evidences, matrixTypeFilter, matrixSearchQuery]);

  const areAllFilteredEvidencesExpanded = useMemo(() => {
    if (filteredPaperEvidences.length === 0) return false;
    return filteredPaperEvidences.every((item) => Boolean(expandedEvidenceIds[item.id]));
  }, [filteredPaperEvidences, expandedEvidenceIds]);

  const handleToggleExpandAllEvidences = useCallback(() => {
    if (areAllFilteredEvidencesExpanded) {
      setExpandedEvidenceIds({});
    } else {
      const next: Record<string, boolean> = {};
      filteredPaperEvidences.forEach((item) => {
        next[item.id] = true;
      });
      setExpandedEvidenceIds(next);
    }
  }, [areAllFilteredEvidencesExpanded, filteredPaperEvidences]);

  // Hydrate evidence matrix if opened via a secure legal counsel share link (?share=...)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get("share");
    if (!shareParam) return;
    try {
      const decodedJson = decodeURIComponent(escape(window.atob(shareParam)));
      const payload = JSON.parse(decodedJson);
      if (payload && typeof payload === "object") {
        if (payload.caseTitle) setCaseTitle(payload.caseTitle);
        if (payload.category) setCategory(payload.category);
        if (payload.reporterName) setReporterName(payload.reporterName);
        if (payload.reportedPartyName) setReportedPartyName(payload.reportedPartyName);
        if (payload.incidentLocationCity) setIncidentLocationCity(payload.incidentLocationCity);
        if (typeof payload.totalLossAmount === "number") setTotalLossAmount(payload.totalLossAmount);
        if (Array.isArray(payload.evidences)) setEvidences(payload.evidences);
        if (Array.isArray(payload.events)) setEvents(payload.events);
        setSharedCounselBanner(
          payload.counselRecipient
            ? `Berkas Matriks Bukti dibuka melalui Tautan Aman Kuasa Hukum (${payload.counselRecipient})`
            : "Berkas Matriks Bukti dibuka melalui Tautan Aman Kuasa Hukum"
        );
      }
    } catch {
      // Ignore malformed share parameter
    }
  }, []);

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

  const secureShareUrl = useMemo(() => {
    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : "https://hakku.id/bukti";
    try {
      const sharePayload = {
        v: 1,
        hash: verificationHash,
        counselRecipient,
        caseTitle: caseTitle || "Perkara Hukum Warga",
        category,
        reporterName,
        reportedPartyName,
        incidentLocationCity,
        totalLossAmount,
        evidences,
        events,
      };
      const encoded =
        typeof window !== "undefined"
          ? window.btoa(unescape(encodeURIComponent(JSON.stringify(sharePayload))))
          : "";
      return encoded ? `${baseUrl}?share=${encodeURIComponent(encoded)}&ref=${verificationHash}` : baseUrl;
    } catch {
      return `${baseUrl}?ref=${verificationHash}`;
    }
  }, [
    verificationHash,
    counselRecipient,
    caseTitle,
    category,
    reporterName,
    reportedPartyName,
    incidentLocationCity,
    totalLossAmount,
    evidences,
    events,
  ]);

  const handleCopySecureShareLink = () => {
    if (typeof navigator === "undefined") return;
    navigator.clipboard.writeText(secureShareUrl);
    setShareLinkCopied(true);
    triggerConfetti({ particleCount: 65, spread: 60 });
    setTimeout(() => setShareLinkCopied(false), 2500);
  };

  const handleVerifyLegalGrounding = async () => {
    if (isGroundingLoading) return;
    setIsGroundingLoading(true);
    try {
      const response = await fetch("/api/evidence/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseTitle,
          category,
          reporterName,
          reportedPartyName,
          incidentLocationCity,
          totalLossAmount,
          evidences,
          events,
          includeSearchGrounding: true,
        }),
      });
      const result = await response.json();
      if (result?.data) {
        setGroundingSummary(result.data.groundingSummary || null);
        setGroundingSources(Array.isArray(result.data.groundingSources) ? result.data.groundingSources : []);
      }
    } catch {
      setGroundingSummary(
        "Mengacu pada Pasal 184 KUHAP dan Pasal 5 ayat (1) UU No. 1 Tahun 2024 (UU ITE), informasi/dokumen elektronik dan hasil cetaknya merupakan alat bukti hukum yang sah."
      );
    } finally {
      setIsGroundingLoading(false);
    }
  };

  const handleAddEvidence = () => {
    if (!newEvidenceTitle.trim()) return;
    const nextIndex = evidences.length + 1;
    const newId = `ev-${Date.now()}`;
    const item: EvidenceItem = {
      id: newId,
      code: `P-${nextIndex}`,
      title: newEvidenceTitle.trim(),
      type: newEvidenceType,
      dateObtained: newEvidenceDate.trim() || "Oktober 2026",
      description: newEvidenceDesc.trim() || "Alat bukti sah pendukung laporan.",
      weight: "primary",
      storageLocation: newEvidenceLocation.trim() || "Tersimpan di Penyimpanan Pelapor",
      sourceNotes:
        newEvidenceSourceNotes.trim() ||
        "Diperoleh langsung oleh pelapor dari sumber asli dan disimpan tanpa modifikasi.",
      isAvailable: true,
    };
    setLastAddedRowId(newId);
    setEvidences((prev) => [...prev, item]);
    setNewEvidenceTitle("");
    setNewEvidenceDate("");
    setNewEvidenceDesc("");
    setNewEvidenceLocation("");
    setNewEvidenceSourceNotes("");
    setUserEditedReport(null);
  };

  const handleUpdateEvidenceMetadata = (
    id: string,
    patch: Partial<Pick<EvidenceItem, "dateObtained" | "description" | "sourceNotes" | "storageLocation">>
  ) => {
    setEvidences((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
    );
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
    const newId = `evt-${Date.now()}`;
    const newEvt: ChronologyEvent = {
      id: newId,
      date: newEventDate.trim(),
      eventTitle: newEventTitle.trim(),
      description: newEventDesc.trim() || "Peristiwa kronologis kejadian.",
      associatedEvidenceCodes: evidences.map((e) => e.code),
    };
    setLastAddedRowId(newId);
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
    const batchStamp = Date.now();
    setLastAddedRowId(null);
    setCaseTitle(preset.title);
    setCategory(preset.category);
    setTotalLossAmount(preset.loss);
    setEvidences(
      preset.evidences.map((ev, idx) => ({
        ...ev,
        id: `${ev.id}-${batchStamp}-${idx}`,
      }))
    );
    setEvents(
      preset.events.map((evt, idx) => ({
        ...evt,
        id: `${evt.id}-${batchStamp}-${idx}`,
      }))
    );
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

  const exportEvidenceMatrixWithJsPdf = useCallback(async () => {
    if (typeof window === "undefined" || isGeneratingPdf) return;
    if (activeTab !== "preview") {
      setActiveTab("preview");
      await new Promise((resolve) => setTimeout(resolve, 80));
    }

    setIsGeneratingPdf(true);
    try {
      const paperEl = document.getElementById("hakku-evidence-paper");
      const bodyEl = document.getElementById("hakku-evidence-report-body");
      const renderedReportText =
        bodyEl?.innerText?.trim() ||
        effectiveReportText ||
        paperEl?.innerText?.trim() ||
        "";

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let cursorY = margin;

      const ensurePageSpace = (neededMm: number) => {
        if (cursorY + neededMm > pageHeight - 18) {
          doc.addPage();
          cursorY = margin;
          // Running header on continuation pages
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.setTextColor(100, 116, 139);
          doc.text(
            `HAKKU • BERITA ACARA & MATRIKS BUKTI (${caseCode || "BAP-HK/2026/0921"}) — ${verificationHash}`,
            margin,
            cursorY
          );
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.25);
          doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
          cursorY += 8;
        }
      };

      // 1. Official Kop Surat / Letterhead
      doc.setFillColor(27, 54, 93); // #1B365D Deep Navy
      doc.roundedRect(margin, cursorY, 12, 12, 2, 2, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("HK", margin + 6, cursorY + 7.5, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(
        "HAKKU • UNIT AUDIT BUKTI & INVESTIGASI MANDIRI",
        margin + 15,
        cursorY + 4.2
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        "Berita Acara Kronologis Kejadian & Matriks Alat Bukti Hukum Positif RI",
        margin + 15,
        cursorY + 8.4
      );

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Standar Formil Pasal 184 KUHAP jo. UU No. 1/2024 (ITE) • Keaslian Digital Terverifikasi",
        margin + 15,
        cursorY + 12
      );

      // Register BAP Box on Top Right
      const regCode = caseCode || "BAP-HK/2026/0921";
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(pageWidth - margin - 44, cursorY, 44, 12, 1.5, 1.5, "FD");
      doc.setFont("courier", "normal");
      doc.setFontSize(6.8);
      doc.setTextColor(100, 116, 139);
      doc.text("NO. REGISTER BAP:", pageWidth - margin - 22, cursorY + 4.2, {
        align: "center",
      });
      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(regCode, pageWidth - margin - 22, cursorY + 9.2, {
        align: "center",
      });

      cursorY += 15;
      // Double Formal Rule
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.65);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      doc.setLineWidth(0.25);
      doc.line(margin, cursorY + 1.2, pageWidth - margin, cursorY + 1.2);
      cursorY += 6;

      // 2. Audit Readiness Summary Strip
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(27, 54, 93);
      doc.setLineWidth(0.35);
      doc.roundedRect(margin, cursorY, contentWidth, 12, 1.5, 1.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(27, 54, 93);
      doc.text(
        `SKOR KESIAPAN PEMBUKTIAN: ${auditEvaluation.readinessScore}% — ${auditEvaluation.readinessLabel.toUpperCase()}`,
        margin + 3.5,
        cursorY + 5
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        `Perkara: ${caseTitle || "Laporan Perkara Hukum Warga"} | Pelapor: ${reporterName || "-"} | Terlapor: ${reportedPartyName || "-"}`,
        margin + 3.5,
        cursorY + 9.4
      );
      cursorY += 16;

      // 3. Structured Evidence Matrix Table (Captured from current matrix state)
      if (evidences.length > 0) {
        ensurePageSpace(24);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(
          `TABEL MATRIKS ALAT BUKTI SAH (${evidences.length} ITEM TERDAFTAR)`,
          margin,
          cursorY
        );
        cursorY += 3;

        // Table Header
        doc.setFillColor(27, 54, 93);
        doc.rect(margin, cursorY, contentWidth, 7, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text("KODE", margin + 2, cursorY + 4.8);
        doc.text("NAMA & DESKRIPSI ALAT BUKTI", margin + 16, cursorY + 4.8);
        doc.text("KATEGORI BUKTI", margin + 104, cursorY + 4.8);
        doc.text("STATUS / LOKASI", margin + 144, cursorY + 4.8);
        cursorY += 7;

        evidences.forEach((ev, idx) => {
          const titleLines = doc.splitTextToSize(
            `${ev.title} — ${ev.description}`,
            84
          );
          const typeLines = doc.splitTextToSize(
            EVIDENCE_TYPE_LABELS[ev.type] || ev.type,
            36
          );
          const statusText = `${ev.isAvailable ? "[Tersedia]" : "[Belum Ada]"} ${ev.storageLocation}`;
          const statusLines = doc.splitTextToSize(statusText, 34);
          const maxLines = Math.max(
            titleLines.length,
            typeLines.length,
            statusLines.length,
            1
          );
          const rowHeight = maxLines * 4 + 3.5;

          ensurePageSpace(rowHeight + 2);

          if (idx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
          } else {
            doc.setFillColor(255, 255, 255);
          }
          doc.setDrawColor(226, 232, 240);
          doc.rect(margin, cursorY, contentWidth, rowHeight, "FD");

          doc.setFont("courier", "bold");
          doc.setFontSize(8);
          doc.setTextColor(27, 54, 93);
          doc.text(ev.code, margin + 2, cursorY + 4.5);

          doc.setFont("helvetica", "normal");
          doc.setFontSize(7.5);
          doc.setTextColor(15, 23, 42);
          doc.text(titleLines, margin + 16, cursorY + 4.5);

          doc.setTextColor(51, 65, 85);
          doc.text(typeLines, margin + 104, cursorY + 4.5);

          doc.setTextColor(ev.isAvailable ? 13 : 180, ev.isAvailable ? 148 : 83, ev.isAvailable ? 136 : 9);
          doc.text(statusLines, margin + 144, cursorY + 4.5);

          cursorY += rowHeight;
        });

        cursorY += 6;
      }

      // 4. Rendered Berita Acara & Chronology Narrative from #hakku-evidence-paper
      const paragraphs = renderedReportText.split("\n");
      for (const rawLine of paragraphs) {
        const trimmed = rawLine.trimEnd();
        if (!trimmed) {
          cursorY += 2.8;
          continue;
        }

        const isHeading =
          /^[A-Z0-9\s.\-•—():/]{8,}$/.test(trimmed) ||
          /^(I+|V|IV|VI+)\.\s/.test(trimmed) ||
          trimmed.startsWith("===") ||
          trimmed.startsWith("---");

        if (trimmed.startsWith("===") || trimmed.startsWith("---")) {
          ensurePageSpace(4);
          doc.setDrawColor(203, 213, 225);
          doc.setLineWidth(0.25);
          doc.line(margin, cursorY, pageWidth - margin, cursorY);
          cursorY += 3.5;
          continue;
        }

        doc.setFont("times", isHeading ? "bold" : "normal");
        doc.setFontSize(isHeading ? 10 : 9.5);
        doc.setTextColor(15, 23, 42);

        const wrappedLines = doc.splitTextToSize(trimmed, contentWidth);
        for (const wLine of wrappedLines) {
          ensurePageSpace(5.5);
          doc.text(wLine, margin, cursorY);
          cursorY += 4.8;
        }
      }

      // 5. Grounded Legal Verification Summary (if present)
      if (groundingSummary) {
        ensurePageSpace(22);
        cursorY += 4;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        const groundLines = doc.splitTextToSize(groundingSummary, contentWidth - 8);
        const boxHeight = groundLines.length * 4.2 + 10;
        ensurePageSpace(boxHeight + 4);
        doc.roundedRect(margin, cursorY, contentWidth, boxHeight, 1.5, 1.5, "FD");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(27, 54, 93);
        doc.text(
          "VERIFIKASI RUJUKAN HUKUM TERKINI (GOOGLE SEARCH GROUNDING):",
          margin + 4,
          cursorY + 5
        );
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.8);
        doc.setTextColor(30, 41, 59);
        doc.text(groundLines, margin + 4, cursorY + 9.5);
        cursorY += boxHeight + 4;
      }

      // 6. Official Digital Integrity Stamp & Materai Signature Footer
      ensurePageSpace(30);
      cursorY += 6;
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 5;

      // Digital Seal Circle
      doc.setDrawColor(6, 95, 70);
      doc.setFillColor(236, 253, 245);
      doc.setLineWidth(0.6);
      doc.circle(margin + 9, cursorY + 9, 8.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(5.5);
      doc.setTextColor(6, 95, 70);
      doc.text("EVIDENCE", margin + 9, cursorY + 8, { align: "center" });
      doc.text("AUDITED", margin + 9, cursorY + 11, { align: "center" });

      // Seal Description & Verification Hash
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(6, 78, 59);
      doc.text(
        "AUDIT BERKAS MEMENUHI STANDAR PEMBUKTIAN",
        margin + 21,
        cursorY + 5
      );
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.2);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Disusun secara kronologis menurut kaidah pembuktian hukum acara untuk SPKT, Posbankum, atau Disnaker.",
        margin + 21,
        cursorY + 9.2
      );
      doc.setFont("courier", "bold");
      doc.setFontSize(7.8);
      doc.setTextColor(15, 23, 42);
      doc.text(
        `${verificationHash}  •  Terbit: ${new Date().toLocaleDateString("id-ID")}`,
        margin + 21,
        cursorY + 14.2
      );

      // Materai Box on Right
      doc.setDrawColor(148, 163, 184);
      doc.setFillColor(248, 250, 252);
      doc.setLineWidth(0.3);
      doc.roundedRect(pageWidth - margin - 36, cursorY + 1, 36, 16, 1.5, 1.5, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.setTextColor(51, 65, 85);
      doc.text("MATERAI RP 10.000", pageWidth - margin - 18, cursorY + 8, {
        align: "center",
      });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text("(Untuk Pelaporan Formil)", pageWidth - margin - 18, cursorY + 12, {
        align: "center",
      });

      // Add page numbers across all pages
      const totalPages = doc.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        doc.setPage(p);
        doc.setFont("courier", "normal");
        doc.setFontSize(7.2);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Dokumen Resmi HAKKU • ${verificationHash} • Halaman ${p} dari ${totalPages}`,
          pageWidth / 2,
          pageHeight - 8,
          { align: "center" }
        );
      }

      const filename = `HAKKU_Berita_Acara_Matriks_Bukti_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
      triggerConfetti({ particleCount: 75, spread: 70 });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [
    activeTab,
    isGeneratingPdf,
    effectiveReportText,
    caseCode,
    verificationHash,
    auditEvaluation.readinessScore,
    auditEvaluation.readinessLabel,
    caseTitle,
    reporterName,
    reportedPartyName,
    evidences,
    groundingSummary,
  ]);

  const handleDownloadPdf = async () => {
    await exportEvidenceMatrixWithJsPdf();
  };

  const handleSharePrintToPdf = async () => {
    if (typeof window === "undefined") return;
    setShowSharePanel(true);
    await exportEvidenceMatrixWithJsPdf();
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
              <span>Matriks Alat Bukti & Kronologi Perkara</span>
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
                evidences.map((e, idx) => {
                  const isLeftRowExpanded = Boolean(expandedEvidenceIds[e.id]);
                  const macro = getEvidenceMacroCategory(e.type);
                  return (
                    <div
                      key={e.id}
                      style={{ animationDelay: `${Math.min(idx * 45, 250)}ms` }}
                      className={`animate-evidence-row-slide-in p-3 rounded-lg border text-xs space-y-2 transition-all ${
                        e.isAvailable
                          ? "bg-gray-50 border-gray-200"
                          : "bg-red-50/50 border-red-200 opacity-70"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <button
                            type="button"
                            aria-expanded={isLeftRowExpanded}
                            aria-label={
                              isLeftRowExpanded
                                ? `Tutup detail bukti ${e.code}`
                                : `Buka detail bukti ${e.code}`
                            }
                            onClick={() => toggleEvidenceRowExpand(e.id)}
                            className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                              isLeftRowExpanded
                                ? "bg-brand-primary text-white border-brand-primary"
                                : "bg-white text-slate-600 border-gray-300 hover:border-brand-primary hover:text-brand-primary"
                            }`}
                            title="Buka/Tutup Detail Metadata Bukti"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isLeftRowExpanded ? "rotate-180" : "rotate-0"
                              }`}
                            />
                          </button>
                          <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-brand-primary text-white text-[10px] shrink-0">
                            {e.code}
                          </span>
                          <strong className="text-brand-text truncate">{e.title}</strong>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEvidence(e.id)}
                          className="text-gray-400 hover:text-red-600 p-1 shrink-0"
                          title="Hapus Bukti"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[10px] text-brand-muted pt-1 border-t border-gray-200/60">
                        <span className="font-medium text-brand-primary">
                          {EVIDENCE_TYPE_LABELS[e.type]}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleEvidenceAvailability(e.id)}
                          className={`font-semibold cursor-pointer ${
                            e.isAvailable ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {e.isAvailable ? "✓ Ada di Tangan" : "Belum Tersimpan"}
                        </button>
                      </div>

                      {isLeftRowExpanded && (
                        <div className="animate-evidence-row-slide-in pt-2 mt-1 border-t border-gray-200/80 space-y-1.5 text-[11px] bg-white p-2.5 rounded border border-gray-200">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>Tanggal Perolehan: <strong className="text-slate-800">{e.dateObtained}</strong></span>
                            <span className={`px-1.5 py-0.2 rounded border ${macro.badgeClass}`}>{macro.label}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 block">Deskripsi:</span>
                            <p className="text-slate-700 leading-relaxed">{e.description}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-mono uppercase text-slate-400 block">Catatan Sumber & Lokasi:</span>
                            <p className="text-slate-700 leading-relaxed">
                              {e.sourceNotes || e.storageLocation}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Form Tambah Bukti Baru */}
            <div className="pt-3 border-t border-brand-border space-y-2 bg-slate-50 p-3 rounded-lg">
              <span className="text-[11px] font-bold text-brand-text block">
                + Tambah Alat Bukti Baru:
              </span>
              <input
                type="text"
                placeholder="Judul Bukti (Contoh: Rekaman Suara Telepon Penagihan)"
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
                  placeholder="Tanggal (mis: 14 Okt 2026)"
                  value={newEvidenceDate}
                  onChange={(e) => setNewEvidenceDate(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>
              <input
                type="text"
                placeholder="Deskripsi singkat alat bukti..."
                value={newEvidenceDesc}
                onChange={(e) => setNewEvidenceDesc(e.target.value)}
                className="w-full text-[11px] px-2.5 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Lokasi Simpan (mis: File PDF HP)"
                  value={newEvidenceLocation}
                  onChange={(e) => setNewEvidenceLocation(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Catatan Sumber (mis: Asli m-BCA)"
                  value={newEvidenceSourceNotes}
                  onChange={(e) => setNewEvidenceSourceNotes(e.target.value)}
                  className="w-full text-[11px] px-2 py-1.5 border border-brand-border rounded bg-white text-brand-text placeholder:text-gray-400"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEvidence}
                className="w-full py-1.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded transition-colors cursor-pointer"
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
                    style={{ animationDelay: `${Math.min(idx * 45, 250)}ms` }}
                    className="animate-evidence-row-slide-in p-3 bg-gray-50 border border-brand-border rounded-lg space-y-1 text-xs"
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
                {/* Shared Legal Counsel Banner (if hydrated from secure URL) */}
                {sharedCounselBanner && (
                  <div
                    data-html2canvas-ignore="true"
                    className="mb-4 px-3.5 py-2.5 rounded-lg bg-[#1B365D] text-white border border-[#13294B] flex items-center justify-between gap-3 font-sans text-xs print:hidden"
                    style={{ whiteSpace: "normal" }}
                  >
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#93C5FD] shrink-0" />
                      <span className="font-medium">{sharedCounselBanner}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/15 text-white border border-white/25 shrink-0">
                      {verificationHash}
                    </span>
                  </div>
                )}

                {/* Kop Surat Resmi Berita Acara HAKKU */}
                <div className="border-b-2 border-slate-900 pb-3 mb-6 font-sans" style={{ whiteSpace: "normal" }}>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-[#1B365D] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                        <Scale className="w-6 h-6 text-amber-300" />
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

                    <div className="flex items-center gap-2.5 shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-[9px] font-mono text-slate-500 block uppercase">No. Register BAP:</span>
                        <span className="text-[11px] font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                          {caseCode || "BAP-HK/2026/0921"}
                        </span>
                      </div>

                      {/* Share Button inside #hakku-evidence-paper — triggers Print-to-PDF & Save Audit */}
                      <button
                        type="button"
                        data-html2canvas-ignore="true"
                        onClick={handleSharePrintToPdf}
                        disabled={isGeneratingPdf}
                        className="print:hidden inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-[#1B365D] text-white border border-[#13294B] hover:bg-[#13294B] disabled:opacity-60 transition-all shadow-xs cursor-pointer"
                        title="Share & Print-to-PDF: Simpan Matriks Bukti saat ini sebagai file PDF"
                      >
                        <Share2 className="w-3.5 h-3.5 text-white" />
                        <span>{isGeneratingPdf ? "Saving PDF..." : "Share"}</span>
                      </button>
                    </div>
                  </div>
                  {/* Garis Ganda Standar Surat Resmi */}
                  <div className="mt-3 border-t-2 border-slate-900" />
                  <div className="mt-0.5 border-t border-slate-700" />
                </div>

                {/* Interactive Legal Counsel Share & Print-to-PDF Drawer inside #hakku-evidence-paper */}
                {showSharePanel && (
                  <div
                    data-html2canvas-ignore="true"
                    className="print:hidden mb-6 rounded-xl bg-[#0F172A] text-white border border-[#1B365D] p-4 sm:p-5 font-sans space-y-4 shadow-md"
                    style={{ whiteSpace: "normal" }}
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-white/15 pb-3">
                      <div className="space-y-0.5">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#93C5FD]">
                          <Lock className="w-3 h-3" />
                          <span>Print-to-PDF & Legal Counsel Export</span>
                        </div>
                        <h4 className="text-sm font-bold text-white">
                          Simpan Audit PDF & Bagikan ke Kuasa Hukum
                        </h4>
                        <p className="text-[11px] text-slate-300">
                          Cetak ke PDF / unduh berkas Berita Acara (A4) atau salin tautan aman terverifikasi untuk kuasa hukum Anda.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSharePanel(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="Tutup panel bagikan"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Option 1: Print-to-PDF & Direct PDF Save */}
                      <div className="rounded-lg bg-white/5 border border-white/15 p-3.5 flex flex-col justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Printer className="w-3.5 h-3.5 text-[#93C5FD]" />
                              <span>Print-to-PDF / Unduh File Audit</span>
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                              A4 Standar BAP
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed">
                            Simpan tampilan matriks alat bukti saat ini sebagai berkas PDF resmi lengkap dengan segel verifikasi.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-[#1B365D] text-white hover:bg-[#234575] border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print to PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="flex-1 py-2 px-3 rounded-lg text-xs font-bold bg-white text-[#0F172A] hover:bg-slate-100 disabled:opacity-60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>
                              {isGeneratingPdf ? "Menyimpan..." : "Unduh PDF"}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Option 2: Secure Link for Legal Counsel */}
                      <div className="rounded-lg bg-white/5 border border-white/15 p-3.5 flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5 text-[#93C5FD]" />
                              <span>Tautan Aman Kuasa Hukum</span>
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1B365D] text-[#93C5FD]">
                              {verificationHash}
                            </span>
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 block mb-1">
                              Penerima Kuasa Hukum / Instansi:
                            </label>
                            <input
                              type="text"
                              value={counselRecipient}
                              onChange={(e) => setCounselRecipient(e.target.value)}
                              placeholder="Contoh: Advokat / LBH Posbankum"
                              className="w-full text-[11px] px-2.5 py-1.5 rounded bg-black/50 border border-white/20 text-white font-mono focus:outline-hidden focus:border-[#93C5FD]"
                            />
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 truncate bg-black/40 px-2 py-1 rounded border border-white/10">
                            {secureShareUrl}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopySecureShareLink}
                          className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-[#1B365D] text-white hover:bg-[#234575] border border-white/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {shareLinkCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-300" />
                              <span className="text-emerald-200">Tautan Kuasa Hukum Tersalin!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Salin Tautan Kuasa Hukum</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabel Ringkas Matriks Alat Bukti & Kronologi (Animated Slide-In Rows + Filter & Row Expansion inside #hakku-evidence-paper) */}
                {(evidences.length > 0 || events.length > 0) && (
                  <div
                    className="mb-6 font-sans space-y-4"
                    style={{ whiteSpace: "normal" }}
                  >
                    {evidences.length > 0 && (
                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                        {/* Header Bar */}
                        <div className="bg-[#1B365D] text-white px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
                          <div className="flex items-center gap-2">
                            <span>
                              Matriks Alat Bukti Terdaftar ({filteredPaperEvidences.length}/{evidences.length} Item)
                            </span>
                            <span className="font-mono text-[10px] text-[#93C5FD] hidden sm:inline">
                              · Pasal 184 KUHAP · UU ITE
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              data-html2canvas-ignore="true"
                              onClick={handleToggleExpandAllEvidences}
                              className="print:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] font-mono text-white transition-colors cursor-pointer"
                            >
                              {areAllFilteredEvidencesExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  <span>Tutup Semua Detail</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  <span>Buka Semua Detail</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Filter Dropdown & Search Input Toolbar */}
                        <div
                          data-html2canvas-ignore="true"
                          className="print:hidden bg-slate-100/90 border-b border-slate-200 px-3.5 py-2.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2"
                        >
                          {/* Search Input */}
                          <div className="relative flex-1 min-w-0">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              value={matrixSearchQuery}
                              onChange={(e) => setMatrixSearchQuery(e.target.value)}
                              placeholder="Cari kode (P-1), judul bukti, lokasi simpan, atau kata kunci..."
                              aria-label="Cari di matriks alat bukti"
                              className="w-full pl-8 pr-7 py-1.5 rounded-md bg-white border border-slate-300 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D]"
                            />
                            {matrixSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setMatrixSearchQuery("")}
                                aria-label="Hapus pencarian"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Evidence Type Filter Dropdown */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <Filter className="w-3.5 h-3.5 text-[#1B365D] shrink-0" />
                            <select
                              value={matrixTypeFilter}
                              onChange={(e) =>
                                setMatrixTypeFilter(e.target.value as MatrixFilterCategory)
                              }
                              aria-label="Filter berdasarkan jenis alat bukti"
                              className="py-1.5 px-2.5 rounded-md bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-hidden focus:border-[#1B365D] focus:ring-1 focus:ring-[#1B365D] cursor-pointer"
                            >
                              <option value="all">Semua Jenis Bukti ({evidences.length})</option>
                              <optgroup label="Kategori Utama (Macro)">
                                <option value="digital">Digital (Transaksi & Chat Elektronik)</option>
                                <option value="physical">Physical (Dokumen, Identitas & Rekaman)</option>
                                <option value="testimonial">Testimonial (Keterangan Saksi)</option>
                              </optgroup>
                              <optgroup label="Spesifik Pasal 184 KUHAP / UU ITE">
                                <option value="digital_transaction">Bukti Transaksi Finansial</option>
                                <option value="digital_communication">Komunikasi Elektronik</option>
                                <option value="written_contract">Dokumen Tertulis / Kontrak</option>
                                <option value="identity_document">Identitas Pihak Lawan</option>
                                <option value="witness_testimony">Keterangan Saksi</option>
                                <option value="audio_visual">Bukti Audio-Visual / Fisik</option>
                              </optgroup>
                            </select>
                          </div>
                        </div>

                        {/* Matrix Rows with Slide-In Animation & Click-to-Expand Details */}
                        {filteredPaperEvidences.length === 0 ? (
                          <div className="px-4 py-6 text-center text-xs text-slate-500 bg-slate-50/60">
                            Tidak ada baris alat bukti yang cocok dengan filter{" "}
                            <span className="font-semibold text-slate-700">
                              {matrixTypeFilter !== "all" ? `"${matrixTypeFilter}"` : ""}
                            </span>
                            {matrixSearchQuery ? ` dan kata kunci "${matrixSearchQuery}"` : ""}.{" "}
                            <button
                              type="button"
                              onClick={() => {
                                setMatrixTypeFilter("all");
                                setMatrixSearchQuery("");
                              }}
                              className="text-[#1B365D] font-semibold underline ml-1 cursor-pointer"
                            >
                              Reset Filter
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {filteredPaperEvidences.map((item, idx) => {
                              const isExpanded = Boolean(expandedEvidenceIds[item.id]);
                              const macro = getEvidenceMacroCategory(item.type);
                              const linkedEvents = events.filter((ev) =>
                                ev.associatedEvidenceCodes.includes(item.code)
                              );
                              const effectiveSourceNotes =
                                item.sourceNotes ||
                                `Tersimpan di ${item.storageLocation || "Penyimpanan Pelapor"} · Diverifikasi sebagai alat bukti ${macro.label.toLowerCase()} sesuai ${macro.statutoryBasis}.`;

                              return (
                                <div
                                  key={item.id}
                                  style={{
                                    animationDelay:
                                      lastAddedRowId === item.id
                                        ? "0ms"
                                        : `${Math.min(idx * 45, 250)}ms`,
                                  }}
                                  className="animate-evidence-row-slide-in bg-white transition-colors"
                                >
                                  {/* Summary Row with Explicit Chevron Toggle Button */}
                                  <div
                                    onClick={() => toggleEvidenceRowExpand(item.id)}
                                    className={`px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs cursor-pointer select-none transition-colors ${
                                      isExpanded
                                        ? "bg-[#1B365D]/[0.06]"
                                        : "hover:bg-slate-50/90"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2.5 min-w-0">
                                      {/* Chevron Toggle Button */}
                                      <button
                                        type="button"
                                        data-html2canvas-ignore="true"
                                        aria-expanded={isExpanded}
                                        aria-label={
                                          isExpanded
                                            ? `Tutup detail metadata bukti ${item.code}`
                                            : `Buka detail metadata bukti ${item.code}`
                                        }
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleEvidenceRowExpand(item.id);
                                        }}
                                        className={`print:hidden mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                          isExpanded
                                            ? "bg-[#1B365D] text-white border-[#1B365D] shadow-2xs"
                                            : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-[#1B365D]/10 hover:text-[#1B365D] hover:border-[#1B365D]/40"
                                        }`}
                                        title={
                                          isExpanded
                                            ? "Sembunyikan metadata bukti"
                                            : "Tampilkan metadata bukti (Tanggal, Deskripsi & Catatan Sumber)"
                                        }
                                      >
                                        <ChevronDown
                                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                            isExpanded ? "rotate-180" : "rotate-0"
                                          }`}
                                        />
                                      </button>

                                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#1B365D] text-white shrink-0 mt-0.5">
                                        {item.code}
                                      </span>
                                      <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="font-bold text-slate-900 leading-snug">
                                            {item.title}
                                          </span>
                                          <span
                                            className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded border ${macro.badgeClass}`}
                                          >
                                            {macro.label}
                                          </span>
                                          <span className="text-[10px] font-mono text-slate-500">
                                            · {item.dateObtained}
                                          </span>
                                        </div>
                                        <div className="text-[11px] text-slate-600 leading-snug line-clamp-1 mt-0.5">
                                          {item.description}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 text-[10px] pl-8 sm:pl-0">
                                      <div className="flex sm:flex-col items-center sm:items-end gap-1">
                                        <span className="font-semibold text-[#1B365D]">
                                          {EVIDENCE_TYPE_LABELS[item.type]}
                                        </span>
                                        <span
                                          className={`font-mono font-semibold px-1.5 py-0.5 rounded ${
                                            item.isAvailable
                                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                              : "bg-amber-50 text-amber-800 border border-amber-200"
                                          }`}
                                        >
                                          {item.isAvailable ? "✓ Tersedia" : "Belum Disimpan"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Expanded Evidence Metadata Panel (Date of Collection, Description & Source Notes) */}
                                  {isExpanded && (
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="animate-evidence-row-slide-in px-3.5 py-3.5 bg-slate-50/95 border-t border-slate-200/90 text-xs space-y-3"
                                    >
                                      {/* Metadata Grid: Date of Collection, Storage & Weight, Statutory Basis */}
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                        {/* 1. Date of Collection */}
                                        <div className="p-2.5 rounded-md bg-white border border-slate-200/90 shadow-2xs">
                                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                                            <Calendar className="w-3 h-3 text-[#1B365D]" />
                                            <span>Tanggal Pengumpulan (Date of Collection)</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={item.dateObtained}
                                            onChange={(e) =>
                                              handleUpdateEvidenceMetadata(item.id, {
                                                dateObtained: e.target.value,
                                              })
                                            }
                                            aria-label={`Tanggal pengumpulan ${item.code}`}
                                            className="mt-1 w-full text-xs font-bold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-[#1B365D] focus:outline-hidden transition-colors"
                                          />
                                          <div className="text-[10px] font-mono text-[#1B365D] mt-1">
                                            Bobot: {WEIGHT_LABELS[item.weight]}
                                          </div>
                                        </div>

                                        {/* 2. Storage Medium */}
                                        <div className="p-2.5 rounded-md bg-white border border-slate-200/90 shadow-2xs">
                                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                                            <FolderOpen className="w-3 h-3 text-[#1B365D]" />
                                            <span>Media & Lokasi Penyimpanan</span>
                                          </div>
                                          <input
                                            type="text"
                                            value={item.storageLocation}
                                            onChange={(e) =>
                                              handleUpdateEvidenceMetadata(item.id, {
                                                storageLocation: e.target.value,
                                              })
                                            }
                                            aria-label={`Lokasi penyimpanan ${item.code}`}
                                            className="mt-1 w-full text-xs font-semibold text-slate-900 bg-slate-50/70 hover:bg-slate-100/80 focus:bg-white px-2 py-1 rounded border border-transparent focus:border-[#1B365D] focus:outline-hidden transition-colors"
                                          />
                                          <div className="text-[10px] font-mono text-slate-500 mt-1">
                                            Kategori: {macro.label} ({item.code})
                                          </div>
                                        </div>

                                        {/* 3. Statutory Reference */}
                                        <div className="p-2.5 rounded-md bg-white border border-slate-200/90 shadow-2xs">
                                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                                            <Scale className="w-3 h-3 text-[#1B365D]" />
                                            <span>Dasar Akseptabilitas Hukum</span>
                                          </div>
                                          <div className="font-semibold text-slate-800 mt-1 leading-snug text-[11px]">
                                            {macro.statutoryBasis}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Detailed Description & Source Notes */}
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                        {/* Description */}
                                        <div className="p-2.5 rounded-md bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                                            <FileText className="w-3 h-3 text-[#1B365D]" />
                                            <span>Deskripsi Lengkap (Description)</span>
                                          </div>
                                          <textarea
                                            rows={2}
                                            value={item.description}
                                            onChange={(e) =>
                                              handleUpdateEvidenceMetadata(item.id, {
                                                description: e.target.value,
                                              })
                                            }
                                            aria-label={`Deskripsi bukti ${item.code}`}
                                            className="w-full text-xs text-slate-800 leading-relaxed bg-slate-50/60 hover:bg-slate-100/70 focus:bg-white p-1.5 rounded border border-transparent focus:border-[#1B365D] focus:outline-hidden resize-none transition-colors"
                                          />
                                        </div>

                                        {/* Source Notes */}
                                        <div className="p-2.5 rounded-md bg-white border border-slate-200/90 space-y-1 shadow-2xs">
                                          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1 font-semibold">
                                            <ShieldCheck className="w-3 h-3 text-[#1B365D]" />
                                            <span>Catatan Sumber & Keaslian (Source Notes)</span>
                                          </div>
                                          <textarea
                                            rows={2}
                                            value={effectiveSourceNotes}
                                            onChange={(e) =>
                                              handleUpdateEvidenceMetadata(item.id, {
                                                sourceNotes: e.target.value,
                                              })
                                            }
                                            aria-label={`Catatan sumber bukti ${item.code}`}
                                            className="w-full text-xs text-slate-800 leading-relaxed bg-slate-50/60 hover:bg-slate-100/70 focus:bg-white p-1.5 rounded border border-transparent focus:border-[#1B365D] focus:outline-hidden resize-none transition-colors"
                                          />
                                        </div>
                                      </div>

                                      {/* Linked Chronology & Quick Actions */}
                                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <span className="text-[10px] font-mono text-slate-500">
                                            Peristiwa Terkait:
                                          </span>
                                          {linkedEvents.length > 0 ? (
                                            linkedEvents.map((ev) => (
                                              <span
                                                key={ev.id}
                                                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                                              >
                                                {ev.date} — {ev.eventTitle}
                                              </span>
                                            ))
                                          ) : (
                                            <span className="text-[10px] font-mono text-slate-400">
                                              Seluruh rangkaian kronologi perkara
                                            </span>
                                          )}
                                        </div>

                                        <button
                                          type="button"
                                          data-html2canvas-ignore="true"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleEvidenceAvailability(item.id);
                                          }}
                                          className="print:hidden px-2.5 py-1 rounded text-[11px] font-semibold bg-[#1B365D] text-white hover:bg-[#13294B] transition-colors cursor-pointer"
                                        >
                                          {item.isAvailable
                                            ? "Tandai Belum Disimpan"
                                            : "Tandai Sudah Tersedia"}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {events.length > 0 && (
                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
                        <div className="bg-slate-800 text-white px-3.5 py-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                          <span>Matriks Rangkaian Kronologi ({events.length} Peristiwa)</span>
                          <span className="font-mono text-[10px] text-slate-300">
                            Klik chevron untuk rincian peristiwa
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {events.map((evt, idx) => {
                            const isEvtExpanded = Boolean(expandedEventIds[evt.id]);
                            const associatedItems = evidences.filter((e) =>
                              evt.associatedEvidenceCodes.includes(e.code)
                            );
                            return (
                              <div
                                key={evt.id}
                                style={{
                                  animationDelay:
                                    lastAddedRowId === evt.id
                                      ? "0ms"
                                      : `${Math.min(idx * 45, 250)}ms`,
                                }}
                                className="animate-evidence-row-slide-in bg-white transition-colors"
                              >
                                <div
                                  onClick={() => toggleEventRowExpand(evt.id)}
                                  className={`px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs cursor-pointer select-none transition-colors ${
                                    isEvtExpanded ? "bg-slate-100/80" : "hover:bg-slate-50/80"
                                  }`}
                                >
                                  <div className="flex items-start gap-2.5">
                                    <button
                                      type="button"
                                      data-html2canvas-ignore="true"
                                      aria-expanded={isEvtExpanded}
                                      aria-label={
                                        isEvtExpanded
                                          ? `Tutup rincian peristiwa #${idx + 1}`
                                          : `Buka rincian peristiwa #${idx + 1}`
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleEventRowExpand(evt.id);
                                      }}
                                      className={`print:hidden mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                        isEvtExpanded
                                          ? "bg-slate-800 text-white border-slate-800"
                                          : "bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200"
                                      }`}
                                    >
                                      <ChevronDown
                                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                          isEvtExpanded ? "rotate-180" : "rotate-0"
                                        }`}
                                      />
                                    </button>
                                    <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 shrink-0 mt-0.5">
                                      #{idx + 1}
                                    </span>
                                    <div>
                                      <div className="font-bold text-slate-900 leading-snug">
                                        {evt.eventTitle}
                                      </div>
                                      <div className="text-[11px] text-slate-600 leading-snug line-clamp-1">
                                        {evt.description}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 text-[10px] pl-8 sm:pl-0">
                                    <div className="flex sm:flex-col items-center sm:items-end gap-1">
                                      <span className="font-mono font-semibold text-[#1B365D]">
                                        {evt.date}
                                      </span>
                                      {evt.associatedEvidenceCodes.length > 0 && (
                                        <span className="font-mono text-[10px] text-slate-500">
                                          Bukti: {evt.associatedEvidenceCodes.join(", ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isEvtExpanded && (
                                  <div className="animate-evidence-row-slide-in px-3.5 py-3 bg-slate-50 border-t border-slate-200 text-xs space-y-2">
                                    <div className="text-[10px] font-mono uppercase text-slate-400">
                                      Kronologi Lengkap Peristiwa #{idx + 1} ({evt.date}
                                      {evt.time ? ` · ${evt.time}` : ""}):
                                    </div>
                                    <p className="text-xs text-slate-800 leading-relaxed">
                                      {evt.description}
                                    </p>
                                    {associatedItems.length > 0 && (
                                      <div className="pt-1.5 border-t border-slate-200/70 space-y-1">
                                        <div className="text-[10px] font-mono text-slate-500">
                                          Alat Bukti Pendukung Peristiwa Ini:
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                          {associatedItems.map((evItem) => (
                                            <span
                                              key={evItem.id}
                                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800"
                                            >
                                              <strong className="text-[#1B365D]">
                                                {evItem.code}
                                              </strong>
                                              <span>{evItem.title}</span>
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Isi Naskah Berita Acara (with subtle slide-in per rendered row) */}
                <div id="hakku-evidence-report-body" className="text-slate-900 font-serif leading-relaxed">
                  {effectiveReportText.split("\n").map((line, idx) => (
                    <div
                      key={`${idx}-${line.slice(0, 24)}`}
                      style={{ animationDelay: `${Math.min(idx * 12, 180)}ms` }}
                      className="animate-evidence-row-slide-in min-h-[1.25em]"
                    >
                      {line}
                    </div>
                  ))}
                </div>

                {/* Verifikasi Regulasi & Yurisprudensi Terkini (Google Search Grounding) */}
                <div
                  data-html2canvas-ignore="true"
                  className="print:hidden pt-4 mt-4 border-t border-dashed border-slate-300 font-sans space-y-3"
                  style={{ whiteSpace: "normal" }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#1B365D]" />
                      <span className="text-xs font-bold text-slate-900">
                        Verifikasi Rujukan Hukum Terkini (Google Search Grounding)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyLegalGrounding}
                      disabled={isGroundingLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-[#1B365D] text-white hover:bg-[#13294B] disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>
                        {isGroundingLoading
                          ? "Memverifikasi Regulasi..."
                          : "Periksa Rujukan UU & Putusan Terkini"}
                      </span>
                    </button>
                  </div>

                  {groundingSummary && (
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 space-y-2.5 leading-relaxed">
                      <div className="text-[11px] font-semibold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Hasil Verifikasi Kepatuhan Alat Bukti:</span>
                      </div>
                      <p className="text-xs text-slate-700 whitespace-pre-line">{groundingSummary}</p>
                      {groundingSources.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80 space-y-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                            Sumber Web Terverifikasi:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {groundingSources.map((src, idx) => (
                              <a
                                key={`${src.uri}-${idx}`}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-white border border-slate-300 text-slate-800 hover:border-[#1B365D] transition-colors"
                              >
                                <span className="truncate max-w-[220px]">{src.title}</span>
                                <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Stempel Digital Formil & Validasi Integritas HAKKU */}
                <div className="pt-8 mt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans" style={{ whiteSpace: "normal" }}>
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
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[9px] font-mono text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
                          {verificationHash}
                        </span>
                        <span>• Terbit: {new Date().toLocaleDateString("id-ID")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      data-html2canvas-ignore="true"
                      onClick={handleSharePrintToPdf}
                      className="print:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold bg-[#1B365D] text-white hover:bg-[#13294B] transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-white" />
                      <span>Share / Print PDF</span>
                    </button>

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
