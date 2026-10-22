"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Send,
  Scale,
  Sparkles,
  FileText,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  FolderPlus,
  Clock,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";
import { ChatMessage, ConsultationAssessment } from "@/modules/ai/consultation";
import { triggerConfetti } from "@/lib/confetti";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const DEFAULT_TACTICAL_CHIPS = [
  "Bagaimana jika perusahaan menolak perundingan bipartit?",
  "Kapan batas waktu lapor mediasi ke Disnaker?",
  "Berapa estimasi pesangon yang berhak saya terima?",
  "Apa langkah hukum jika ijazah asli ditahan perusahaan?",
  "Bagaimana cara somasi pemilik kontrakan yang menahan deposit?",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: `Halo! Saya Hakki si Kancil, sahabat sadar hukum dan pendamping paralegal digital Anda di HAKKU.

Selamat datang di Ruang Wawancara dan Konsultasi Hukum. Saya akan mendampingi Anda membedah duduk perkara, menelaah pasal undang-undang yang relevan, serta menyusun langkah taktis yang aman.

Ceritakan apa yang terjadi: siapa pihak yang terlibat, apa yang disepakati, dan apa kerugian yang Anda alami? Saya siap menyimak dan menganalisis dasar hukumnya.`,
    timestamp: "Baru saja",
  },
];

export default function KonsultasiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"interview" | "discussion">("interview");
  const [assessment, setAssessment] = useState<ConsultationAssessment | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savedCaseCode, setSavedCaseCode] = useState("");
  const [mobileTab, setMobileTab] = useState<"chat" | "dossier">("chat");
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  const messagesRef = useRef<ChatMessage[]>(INITIAL_MESSAGES);
  const isSendingRef = useRef(false);
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep messagesRef in sync with messages state without triggering re-renders
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Smooth scroll ONLY the chat messages container — never jolting the whole browser window
  const scrollToBottom = useCallback((smooth = true) => {
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  }, []);

  // Auto-scroll chat container when messages or loading state changes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Reliable, single-dispatch message handler (prevents duplicate responses)
  const handleSendMessage = useCallback(async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text || isSendingRef.current) return;

    // Set locks & state immediately
    isSendingRef.current = true;
    setIsLoading(true);
    setInputText("");
    setIsTyping(false);

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...messagesRef.current, userMsg];
    setMessages(nextMessages);

    try {
      const response = await fetch("/api/consultation/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          mode,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const assistantMsg: ChatMessage = {
            id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            role: "assistant",
            content: json.data.reply,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          };
          setMessages((current) => [...current, assistantMsg]);
          if (json.data.assessment) {
            setAssessment(json.data.assessment);
          }
          return;
        }
      }

      // Safe fallback response if backend response is unsuccessful
      const fallbackMsg: ChatMessage = {
        id: `assistant-fallback-${Date.now()}`,
        role: "assistant",
        content: `Saya menerima pesan Anda. Berdasarkan regulasi hukum positif Indonesia, pastikan Anda selalu mengamankan bukti tertulis, bukti transfer, dan riwayat percakapan sebelum mengambil langkah perundingan bipartit atau somasi resmi.`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((current) => [...current, fallbackMsg]);
    } catch (err) {
      console.error("Error in consultation chat:", err);
      const networkErrorMsg: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: `Koneksi ke asisten hukum terputus sementara. Silakan periksa jaringan internet Anda lalu kirim ulang pesan Anda.`,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((current) => [...current, networkErrorMsg]);
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [inputText, mode]);

  // Initial story ingestion from sessionStorage (runs once on mount)
  const hasIngestedRef = useRef(false);
  useEffect(() => {
    if (typeof window !== "undefined" && !hasIngestedRef.current) {
      hasIngestedRef.current = true;
      const stored = sessionStorage.getItem("hakku_initial_story");
      if (stored && stored.trim().length > 5) {
        sessionStorage.removeItem("hakku_initial_story");
        handleSendMessage(stored.trim());
      }
    }
  }, [handleSendMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSaveToCase = async () => {
    if (!assessment) return;
    try {
      const res = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Konsultasi: ${assessment.categoryLabel}`,
          category: assessment.category,
          categoryLabel: assessment.categoryLabel,
          urgencyLevel: assessment.urgencyLevel,
          userStatement: messages.filter((m) => m.role === "user").map((m) => m.content).join("\n\n"),
          clarificationData: [],
          factsSummary: {
            chronology: messages.filter((m) => m.role === "user").map((m) => m.content).join(" "),
            knownFacts: assessment.confirmedFacts,
            unknownFacts: assessment.missingEvidence,
          },
          applicableRules: assessment.articlesCited.map((a) => `${a.articleLabel}: ${a.explanation}`),
          actionOptions: [{ title: assessment.recommendedAction, rationale: "Hasil wawancara Hakki", preparation: [] }],
          evidenceChecklist: assessment.missingEvidence.map((ev, i) => ({
            id: `item-${i}`,
            title: ev,
            description: "Dianjurkan dilengkapi untuk memperkuat pembuktian",
            required: false,
            isCompleted: false,
          })),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setIsSaved(true);
          setSavedCaseCode(json.data.caseCode);
          triggerConfetti({ particleCount: 70, spread: 60 });
        }
      }
    } catch (err) {
      console.error("Gagal menyimpan berkas:", err);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_MESSAGES);
    setAssessment(null);
    setIsSaved(false);
    setSavedCaseCode("");
    setInputText("");
    setIsLoading(false);
    isSendingRef.current = false;
  };

  return (
    <div className="flex-1 bg-brand-bg flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Subheader Toolbar */}
      <div className="bg-white border-b border-brand-border px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto space-y-2">
          <Breadcrumbs
            items={[
              { label: "Ruang Konsultasi & Wawancara" },
            ]}
          />
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-bold text-brand-text leading-tight">
                    Ruang Wawancara & Konsultasi Hukum Hakki
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-brand-primary border border-blue-200">
                    AI Paralegal
                  </span>
                </div>
                <p className="text-[11px] text-brand-muted hidden sm:block">
                  Wawancara interaktif dua arah berlandaskan hukum positif Indonesia
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
              {/* Mode Toggle Switcher */}
              <div className="inline-flex rounded-lg border border-brand-border p-0.5 bg-gray-50 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMode("interview")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    mode === "interview"
                      ? "bg-white text-brand-primary shadow-xs"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Wawancara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("discussion")}
                  className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    mode === "discussion"
                      ? "bg-white text-brand-primary shadow-xs"
                      : "text-brand-muted hover:text-brand-text"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Diskusi Terbuka</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowResetConfirmModal(true)}
                className="p-2 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-brand-border min-touch-target"
                title="Reset Sesi Wawancara"
                aria-label="Reset Sesi Wawancara"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Switcher (Visible only on screens below lg) */}
      <div className="lg:hidden max-w-7xl mx-auto w-full px-4 pt-3 pb-1">
        <div className="flex items-center p-1 bg-gray-100 border border-brand-border rounded-xl">
          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
              mobileTab === "chat"
                ? "bg-white text-brand-primary shadow-xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Obrolan Wawancara</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("dossier")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
              mobileTab === "dossier"
                ? "bg-white text-brand-primary shadow-xs"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Berkas & Hasil Hukum</span>
            {assessment && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-brand-primary font-bold">
                {assessment.strengthScore}%
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace: Split-Screen Chat & Live Legal Assessment Panel */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-3 sm:py-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chat Conversation Stream (7 Cols on desktop, tab-controlled on mobile) */}
        <div
          className={`lg:col-span-7 flex flex-col bg-white border border-brand-border rounded-2xl shadow-xs overflow-hidden h-[68vh] sm:h-[74vh] lg:h-[78vh] ${
            mobileTab === "chat" ? "flex" : "hidden lg:flex"
          }`}
        >
          {/* Messages Scroll Area — strictly isolated scroll container to prevent page jumping */}
          <div
            ref={chatScrollContainerRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          >
            {messages.map((m) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 sm:gap-3 ${
                    isAssistant ? "justify-start" : "justify-end"
                  }`}
                >
                  {isAssistant && (
                    <div className="shrink-0 mt-0.5">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-primary shadow-2xs">
                        <Scale className="w-4 h-4" />
                      </div>
                    </div>
                  )}

                  <div
                    className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                      isAssistant
                        ? "bg-gray-50 border border-brand-border text-brand-text"
                        : "bg-brand-primary text-white shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {m.content}
                    </div>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                        isAssistant ? "text-brand-muted" : "text-white/80"
                      }`}
                    >
                      <Clock className="w-2.5 h-2.5" />
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-brand-primary shadow-2xs shrink-0">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="bg-gray-50 border border-brand-border rounded-2xl p-3.5 text-xs text-brand-muted flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Hakki sedang menelaah pasal hukum dan fakta perkara Anda...</span>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Quick Action Chips */}
          {!isLoading && (
            <div className="px-4 py-2 border-t border-brand-border bg-gray-50/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Tanya Taktis:
              </span>
              {(assessment?.quickPrompts && assessment.quickPrompts.length > 0
                ? assessment.quickPrompts
                : DEFAULT_TACTICAL_CHIPS
              ).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(prompt)}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white hover:bg-blue-50 border border-brand-border hover:border-brand-primary text-brand-text hover:text-brand-primary transition-all whitespace-nowrap shrink-0 shadow-2xs min-h-[32px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-brand-border bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    mode === "interview"
                      ? "Jawab pertanyaan Hakki atau jelaskan kronologi lanjutan..."
                      : "Tanyakan apa saja seputar hak hukum dan strategi Anda..."
                  }
                  /* text-base on mobile prevents iOS Safari from automatically zooming into the input */
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm text-brand-text bg-gray-50 border border-brand-border rounded-xl focus:bg-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-none placeholder:text-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="inline-flex items-center justify-center p-3 rounded-xl text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-40 transition-colors shadow-xs shrink-0 min-w-[44px] min-h-[44px]"
                aria-label="Kirim Pesan"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] text-brand-muted">
              <span>Tekan Enter untuk kirim, Shift + Enter baris baru</span>
              <span>Kerahasiaan dilindungi UU PDP</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Legal Assessment Dossier (5 Cols on desktop, tab-controlled on mobile) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileTab === "dossier" ? "block" : "hidden lg:block"
          }`}
        >
          {/* Mascot Status Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-5 shadow-xs flex items-center gap-4">
            <HakkiDuoInteractive
              mood={
                isLoading
                  ? "analyzing"
                  : isTyping
                  ? "listening"
                  : assessment?.urgencyLevel === "urgent_safety"
                  ? "empathetic"
                  : (assessment?.strengthScore || 0) >= 75
                  ? "encouraging"
                  : "welcoming"
              }
              size="sm"
              showSpeechBubble={false}
            />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-primary">
                Hakki si Kancil • Asisten Paralegal
              </span>
              <h3 className="text-sm font-bold text-brand-text leading-tight">
                {isLoading
                  ? "Sedang Menelaah Regulasi Sah..."
                  : isTyping
                  ? "Menyimak Penjelasan Anda..."
                  : assessment?.urgencyLevel === "urgent_safety"
                  ? "Mendampingi Kondisi Mendesak"
                  : "Mendampingi Wawancara Hukum"}
              </h3>
              <p className="text-[11px] text-brand-muted leading-relaxed">
                Setiap detail fakta yang Anda ceritakan otomatis dipetakan ke korpus hukum sah Republik Indonesia.
              </p>
            </div>
          </div>

          {/* Dossier Card */}
          <div className="bg-white border border-brand-border rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs font-bold text-brand-text uppercase tracking-wider">
                  Berkas Analisis Wawancara
                </h3>
              </div>
              {assessment && (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-primary border border-blue-200">
                  {assessment.categoryLabel}
                </span>
              )}
            </div>

            {/* Real-time Bargaining Power & Legal Position Score */}
            <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-brand-text flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-brand-primary" />
                  <span>Bargaining Power (Kekuatan Posisi):</span>
                </span>
                <span
                  className={`font-mono text-sm font-black ${
                    (assessment?.strengthScore || 50) >= 75
                      ? "text-emerald-600"
                      : (assessment?.strengthScore || 50) >= 50
                      ? "text-blue-600"
                      : "text-amber-600"
                  }`}
                >
                  {assessment ? `${assessment.strengthScore}%` : "50% (Awal)"}
                </span>
              </div>

              {/* Multi-tier colored progress bar */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    (assessment?.strengthScore || 50) >= 75
                      ? "bg-emerald-600"
                      : (assessment?.strengthScore || 50) >= 50
                      ? "bg-brand-primary"
                      : "bg-amber-500"
                  }`}
                  style={{ width: `${assessment ? assessment.strengthScore : 50}%` }}
                />
              </div>

              {/* Sub-breakdown indicators */}
              <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
                <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                  <span className="text-slate-500 block">Alat Bukti</span>
                  <strong className="text-slate-800">
                    {assessment && assessment.confirmedFacts.length > 1 ? "Tercatat" : "Diperlukan"}
                  </strong>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                  <span className="text-slate-500 block">Kesesuaian UU</span>
                  <strong className="text-slate-800">
                    {assessment && assessment.articlesCited.length > 0 ? "Valid" : "Proses"}
                  </strong>
                </div>
                <div className="bg-white p-1.5 rounded border border-slate-200 text-center">
                  <span className="text-slate-500 block">Status Daluwarsa</span>
                  <strong className="text-emerald-700">Aman</strong>
                </div>
              </div>

              <p className="text-[10px] text-slate-600 leading-tight">
                {assessment && assessment.strengthScore >= 75
                  ? "Posisi hukum Anda sangat kuat untuk mengajukan somasi tertulis atau permohonan bipartit."
                  : assessment && assessment.strengthScore >= 50
                  ? "Fakta dasar telah terpenuhi. Tambahkan bukti percakapan atau tanda terima agar posisi semakin kokoh."
                  : "Ceritakan kronologi, nominal kerugian, dan bukti yang Anda miliki untuk menaikkan skor posisi tawar."}
              </p>
            </div>

            {/* Confirmed Facts Checklist */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text block">
                Fakta Hukum Terkonfirmasi:
              </span>
              <div className="space-y-1.5">
                {(assessment?.confirmedFacts || ["Uraian kronologi awal disampaikan"]).map((fact, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-brand-text">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" />
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Evidence Warning */}
            {assessment?.missingEvidence && assessment.missingEvidence.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Bukti yang Dianjurkan Dilengkapi:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-950 text-[11px]">
                  {assessment.missingEvidence.map((ev, idx) => (
                    <li key={idx}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Articles Cited Box */}
            {assessment?.articlesCited && assessment.articlesCited.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-brand-border">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text block">
                  Dasar Hukum Sah yang Relevan:
                </span>
                <div className="space-y-2">
                  {assessment.articlesCited.slice(0, 2).map((art, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-blue-50/40 border border-blue-200/60 text-xs space-y-1">
                      <div className="font-bold text-brand-primary text-[11px] flex items-center gap-1.5">
                        <Scale className="w-3 h-3 shrink-0" />
                        <span>{art.articleLabel}</span>
                      </div>
                      <p className="text-[11px] text-brand-muted line-clamp-2">
                        {art.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons to Integrated Modules */}
            <div className="space-y-2 pt-2 border-t border-brand-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted block">
                Tindakan Konkret Pemecahan Masalah:
              </span>

              <div className="grid grid-cols-1 gap-2">
                <Link
                  href="/dokumen"
                  className="p-3 rounded-xl border border-brand-border hover:border-brand-primary bg-white hover:bg-blue-50/30 transition-all text-xs flex items-center justify-between group min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-brand-primary shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-brand-text group-hover:text-brand-primary block">
                        Cetak Draf Surat Somasi / Bipartit
                      </span>
                      <span className="text-[10px] text-brand-muted">
                        Format resmi berlandaskan pasal sah
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary shrink-0" />
                </Link>

                <Link
                  href="/kalkulator"
                  className="p-3 rounded-xl border border-brand-border hover:border-brand-primary bg-white hover:bg-blue-50/30 transition-all text-xs flex items-center justify-between group min-h-[44px]"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-brand-text group-hover:text-brand-primary block">
                        Hitung Hak Pesangon (PP 35/2021)
                      </span>
                      <span className="text-[10px] text-brand-muted">
                        Simulasi nominal kompensasi & pesangon
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-muted group-hover:text-brand-primary shrink-0" />
                </Link>

                <button
                  type="button"
                  onClick={handleSaveToCase}
                  disabled={!assessment || isSaved}
                  className="w-full inline-flex items-center justify-center gap-2 p-3 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors text-xs font-bold disabled:opacity-60 min-h-[44px]"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>
                    {isSaved ? `Tersimpan! (Kode: ${savedCaseCode})` : "Simpan Berkas Wawancara ke Akun"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal Konfirmasi Reset Wawancara (Error Prevention & Safety - Prinsip 6) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-brand-border max-w-md w-full p-6 space-y-4 shadow-lg animate-in fade-in">
            <div className="flex items-center gap-3 text-brand-warning">
              <RotateCcw className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-brand-text">
                Mulai Sesi Wawancara Baru?
              </h3>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Seluruh riwayat dialog percakapan dan telaah berkas sementara saat ini akan direset. Tindakan ini tidak dapat dibatalkan jika berkas belum disimpan ke Ruang Kerja.
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
                  handleResetChat();
                  setShowResetConfirmModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target"
              >
                Ya, Reset Sesi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
