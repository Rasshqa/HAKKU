import React, { useState } from "react";
import { ArrowLeft, ArrowRight, HelpCircle, CheckCircle, SkipForward } from "lucide-react";
import { ClarificationAnswer, ClarifyingQuestion } from "@/modules/intake/types";

interface ClarificationStepProps {
  questions: ClarifyingQuestion[];
  categoryLabel: string;
  onBack: () => void;
  onSubmitAnswers: (answers: ClarificationAnswer[]) => void;
}

export function ClarificationStep({
  questions,
  categoryLabel,
  onBack,
  onSubmitAnswers,
}: ClarificationStepProps) {
  // Simpan jawaban per questionId
  const [answersState, setAnswersState] = useState<Record<string, { answer: string; isSkipped: boolean }>>(() => {
    const initial: Record<string, { answer: string; isSkipped: boolean }> = {};
    questions.forEach((q) => {
      initial[q.id] = { answer: "", isSkipped: false };
    });
    return initial;
  });

  const handleSelectOption = (questionId: string, optionText: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: { answer: optionText, isSkipped: false },
    }));
  };

  const handleCustomTextChange = (questionId: string, text: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: { answer: text, isSkipped: false },
    }));
  };

  const handleSkipQuestion = (questionId: string) => {
    setAnswersState((prev) => ({
      ...prev,
      [questionId]: { answer: "Saya tidak tahu / Belum ada informasi", isSkipped: true },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted: ClarificationAnswer[] = questions.map((q) => {
      const state = answersState[q.id] || { answer: "", isSkipped: false };
      return {
        questionId: q.id,
        questionText: q.question,
        answer: state.answer,
        isSkipped: state.isSkipped || !state.answer.trim(),
      };
    });
    onSubmitAnswers(formatted);
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="border-b border-brand-border pb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-brand-primary uppercase tracking-wider">
            Ranah: {categoryLabel}
          </span>
          <span className="text-xs text-brand-muted">
            {questions.length} Pertanyaan Klarifikasi
          </span>
        </div>
        <h2 className="text-xl font-bold text-brand-text mt-1">
          Klarifikasi Fakta & Informasi Tambahan
        </h2>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">
          Pertanyaan berikut membantu sistem memetakan pasal peraturan yang tepat. Anda diperbolehkan melewati pertanyaan jika tidak mengetahui jawabannya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q, index) => {
          const current = answersState[q.id] || { answer: "", isSkipped: false };

          return (
            <div
              key={q.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all ${
                current.isSkipped
                  ? "bg-gray-50 border-gray-200 opacity-80"
                  : current.answer
                  ? "bg-blue-50/40 border-brand-primary/40"
                  : "bg-white border-brand-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-brand-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-brand-text">
                      {q.question}
                    </h3>
                  </div>
                  <p className="text-xs text-brand-muted pl-7">
                    {q.helperText}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleSkipQuestion(q.id)}
                  className={`text-xs px-2.5 py-1 rounded-md border transition-colors shrink-0 flex items-center gap-1 ${
                    current.isSkipped
                      ? "bg-gray-200 border-gray-300 text-brand-text font-semibold"
                      : "border-brand-border text-brand-muted hover:text-brand-text hover:bg-gray-50"
                  }`}
                  title="Lewati jika Anda tidak mengetahui atau belum memiliki informasi ini"
                >
                  <SkipForward className="w-3 h-3" />
                  <span>{current.isSkipped ? "Dilewati" : "Lewati"}</span>
                </button>
              </div>

              {/* Option Buttons jika ada daftar opsi */}
              {q.options && q.options.length > 0 && !current.isSkipped && (
                <div className="mt-3.5 pl-7 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q.options.map((opt) => {
                      const isSelected = current.answer === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`p-2.5 text-left rounded-lg text-xs font-medium border transition-all flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-brand-primary text-white border-brand-primary shadow-xs"
                              : "bg-white text-brand-text border-brand-border hover:border-brand-primary hover:bg-brand-primary-light/20"
                          }`}
                        >
                          <span>{opt}</span>
                          {isSelected && <CheckCircle className="w-3.5 h-3.5 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input Teks Tambahan / Bebas */}
              {!current.isSkipped && (
                <div className="mt-3 pl-7">
                  <input
                    type="text"
                    value={current.answer}
                    onChange={(e) => handleCustomTextChange(q.id, e.target.value)}
                    placeholder={q.placeholder || "Atau ketik penjelasan Anda sendiri di sini..."}
                    className="w-full px-3 py-2 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              )}

              {/* Penjelasan Mengapa Ditanyakan (FR-02) */}
              <div className="mt-3 pl-7 pt-2 border-t border-brand-border/60 flex items-center gap-1.5 text-[11px] text-brand-muted">
                <HelpCircle className="w-3 h-3 text-brand-primary shrink-0" />
                <span>
                  <strong>Mengapa ditanyakan:</strong> {q.whyWeAsk}
                </span>
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Cerita</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
          >
            <span>Tinjau Ringkasan Fakta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
