"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepProgress, StepItem } from "@/components/flow/StepProgress";
import { SafetyAlertBanner } from "@/components/flow/SafetyAlertBanner";
import { PrivacyConsentStep } from "@/components/flow/PrivacyConsentStep";
import { StoryInputStep } from "@/components/flow/StoryInputStep";
import { ClarificationStep } from "@/components/flow/ClarificationStep";
import { FactSummaryReviewStep } from "@/components/flow/FactSummaryReviewStep";
import { LegalResultStep } from "@/components/flow/LegalResultStep";
import { ChecklistAndReferralsStep } from "@/components/flow/ChecklistAndReferralsStep";
import { OutOfScopeModal } from "@/components/flow/OutOfScopeModal";

import { analyzeUserStory } from "@/modules/intake/analyzer";
import {
  ClarificationAnswer,
  IntakeAnalysisResult,
  CaseFactSummary,
} from "@/modules/intake/types";
import {
  buildCaseEvaluation,
  CaseFullEvaluation,
} from "@/modules/case/engine";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";
import { triggerConfetti } from "@/lib/confetti";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

const FLOW_STEPS: StepItem[] = [
  { number: 1, label: "Privasi & Batasan" },
  { number: 2, label: "Cerita Masalah" },
  { number: 3, label: "Klarifikasi Fakta" },
  { number: 4, label: "Konfirmasi Ringkasan" },
  { number: 5, label: "Dasar Hukum & Opsi" },
  { number: 6, label: "Checklist & Rujukan" },
];

export default function PendampinganPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [story, setStory] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<IntakeAnalysisResult | null>(null);
  const [evaluation, setEvaluation] = useState<CaseFullEvaluation | null>(null);
  const [bypassOutOfScope, setBypassOutOfScope] = useState<boolean>(false);

  // Ambil initial story dari sessionStorage jika pengguna mengetik dari beranda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("hakku_initial_story");
        if (stored) {
          setStory(stored);
          const res = analyzeUserStory(stored);
          setAnalysis(res);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Handler Step 1 -> Step 2
  const handleConsentGiven = () => {
    setCurrentStep(2);
  };

  // Handler Step 2 -> Step 3 (Memanggil Server-Side AI Engine)
  const handleSubmitStory = async (submittedStory: string) => {
    setStory(submittedStory);
    setIsAnalyzing(true);
    setBypassOutOfScope(false);

    try {
      const response = await fetch("/api/intake/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ story: submittedStory }),
      });

      if (response.status === 401) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("hakku_initial_story", submittedStory);
        }
        router.push("/auth/masuk?callbackUrl=/pendampingan");
        return;
      }

      let resData: IntakeAnalysisResult | null = null;
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          resData = result.data;
        }
      }

      if (!resData) {
        // Fallback ke rule-based local analyzer
        resData = analyzeUserStory(submittedStory);
      }

      setAnalysis(resData);

      // Cek apakah kasus di luar koridor hukum (non-legal, illegal_intent, insufficient_info)
      if (resData.scopeAssessment && resData.scopeAssessment.status !== "valid_legal_case") {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } catch {
      // Fallback ke rule-based local analyzer bila koneksi jaringan bermasalah
      const fallbackAnalysis = analyzeUserStory(submittedStory);
      setAnalysis(fallbackAnalysis);
      if (fallbackAnalysis.scopeAssessment && fallbackAnalysis.scopeAssessment.status !== "valid_legal_case") {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handler Step 3 -> Step 4
  const handleSubmitAnswers = (submittedAnswers: ClarificationAnswer[]) => {
    if (!analysis) return;

    // Susun evaluasi fakta awal
    const evalData = buildCaseEvaluation(story, analysis, submittedAnswers);
    setEvaluation(evalData);
    setCurrentStep(4);
  };

  // Handler Step 4 -> Step 5
  const handleConfirmFactSummary = (updatedSummary: CaseFactSummary) => {
    if (!evaluation) return;
    setEvaluation({
      ...evaluation,
      factSummary: updatedSummary,
    });
    setCurrentStep(5);
  };

  // Handler Step 5 -> Step 6
  const handleProceedToChecklist = () => {
    setCurrentStep(6);
    triggerConfetti({ particleCount: 90, spread: 75 });
  };

  // Reset alur
  const handleReset = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("hakku_initial_story");
    }
    setStory("");
    setAnalysis(null);
    setEvaluation(null);
    setBypassOutOfScope(false);
    setCurrentStep(1);
  };

  return (
    <div className="flex-1 flex flex-col bg-brand-bg">
      {/* Visual Stepper Bar */}
      <StepProgress
        currentStep={currentStep}
        totalSteps={FLOW_STEPS.length}
        steps={FLOW_STEPS}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <Breadcrumbs
          items={[
            { label: "Pendampingan Terpandu", href: "/pendampingan" },
            { label: `Tahap ${currentStep}: ${FLOW_STEPS[currentStep - 1]?.label || ""}` },
          ]}
        />

        {/* Banner Kedaruratan / Keselamatan (jika terdeteksi sinyal kekerasan/ancaman fisik) */}
        {analysis?.safetyWarning && (
          <SafetyAlertBanner warning={analysis.safetyWarning} />
        )}

        {/* Step 1: Pemberitahuan Data & Privasi */}
        {currentStep === 1 && (
          <PrivacyConsentStep onConsentGiven={handleConsentGiven} />
        )}

        {/* Step 2: Cerita Masalah / Status Menganalisis AI / Modal Belum Masuk Klasifikasi Alur Terpandu */}
        {currentStep === 2 && (
          isAnalyzing ? (
            <div className="bg-white border border-brand-border rounded-xl p-8 sm:p-10 max-w-xl mx-auto text-center space-y-6 shadow-xs animate-slide-up-fade">
              <div className="flex justify-center">
                <HakkiDuoInteractive
                  mood="analyzing"
                  size="md"
                  showSpeechBubble={false}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-brand-text">
                  Hakki & AI Sedang Menelaah Cerita Anda...
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed max-w-md mx-auto">
                  Sistem sedang memetakan kronologi ke korpus hukum Indonesia, mengevaluasi cakupan perkara, mendeteksi urgensi keselamatan, dan menyiapkan pertanyaan klarifikasi fakta secara objektif.
                </p>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full w-3/4 rounded-full animate-pulse" />
              </div>
              <p className="text-[11px] text-brand-muted font-medium">
                Kerahasiaan Anda terjamin • Analisis server-side bebas halusinasi
              </p>
            </div>
          ) : analysis?.scopeAssessment && analysis.scopeAssessment.status !== "valid_legal_case" && !bypassOutOfScope ? (
            <OutOfScopeModal
              scopeAssessment={analysis.scopeAssessment}
              story={story}
              onRetryWithNewStory={() => {
                setAnalysis(null);
                setBypassOutOfScope(false);
              }}
              onProceedAnyway={() => {
                setBypassOutOfScope(true);
                setCurrentStep(3);
              }}
              onSelectExample={(sampleStory) => {
                setStory(sampleStory);
                handleSubmitStory(sampleStory);
              }}
            />
          ) : (
            <StoryInputStep
              initialStory={story}
              onBack={() => setCurrentStep(1)}
              onSubmitStory={handleSubmitStory}
            />
          )
        )}

        {/* Step 3: Klarifikasi Fakta Minimum */}
        {currentStep === 3 && analysis && (
          <ClarificationStep
            questions={analysis.suggestedQuestions}
            categoryLabel={analysis.categoryLabel}
            onBack={() => setCurrentStep(2)}
            onSubmitAnswers={handleSubmitAnswers}
          />
        )}

        {/* Step 4: Konfirmasi Ringkasan Fakta */}
        {currentStep === 4 && evaluation && (
          <FactSummaryReviewStep
            factSummary={evaluation.factSummary}
            onBack={() => setCurrentStep(3)}
            onConfirmSummary={handleConfirmFactSummary}
          />
        )}

        {/* Step 5: Hasil Analisis Hukum Bersumber */}
        {currentStep === 5 && evaluation && (
          <LegalResultStep
            factSummary={evaluation.factSummary}
            legalSource={evaluation.legalSource}
            onBack={() => setCurrentStep(4)}
            onProceedToChecklist={handleProceedToChecklist}
          />
        )}

        {/* Step 6: Checklist Bukti & Rujukan Bantuan Terverifikasi */}
        {currentStep === 6 && evaluation && (
          <ChecklistAndReferralsStep
            factSummary={evaluation.factSummary}
            legalSource={evaluation.legalSource}
            initialChecklist={evaluation.checklistItems}
            referrals={evaluation.referrals}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}
