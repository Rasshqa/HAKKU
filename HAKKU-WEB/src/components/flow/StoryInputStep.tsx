import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight, HelpCircle, AlertTriangle, Scale } from "lucide-react";
import { analyzeUserStory } from "@/modules/intake/analyzer";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

interface StoryInputStepProps {
  initialStory: string;
  onBack: () => void;
  onSubmitStory: (story: string) => void;
}

export function StoryInputStep({
  initialStory,
  onBack,
  onSubmitStory,
}: StoryInputStepProps) {
  const [story, setStory] = useState(initialStory);
  const [errorMsg, setErrorMsg] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const analysis = story.trim().length > 10 ? analyzeUserStory(story) : null;

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    };
  }, []);

  const handleStoryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setStory(val);
    if (errorMsg) setErrorMsg("");
    setIsTyping(true);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!story.trim() || story.trim().length < 15) {
      setErrorMsg("Mohon ceritakan lebih jelas permasalahan Anda (minimal 15 karakter).");
      return;
    }
    setErrorMsg("");
    onSubmitStory(story.trim());
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xs animate-slide-up-fade">
      <div className="border-b border-brand-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-brand-primary border border-blue-200 mb-1.5">
            <Scale className="w-3.5 h-3.5" />
            <span>Langkah 2 • Penguraian Fakta Masalah</span>
          </div>
          <h2 className="text-xl font-bold text-brand-text">
            Ceritakan Masalah Hukum Anda
          </h2>
          <p className="text-xs text-brand-muted mt-1 max-w-lg leading-relaxed">
            Gunakan bahasa sehari-hari. Jelaskan apa yang terjadi, pihak yang terlibat, serta kronologi yang Anda alami.
          </p>
        </div>
        <div className="shrink-0 self-center sm:self-auto">
          <HakkiDuoInteractive
            mood={
              /pecat|phk|ancam|takut|tipu|intimidasi|hilang|usir|kekerasan|aniaya/i.test(story)
                ? "empathetic"
                : isTyping
                ? "analyzing"
                : story.length > 20
                ? "encouraging"
                : "listening"
            }
            size="sm"
            characterCount={story.length}
            isTyping={isTyping}
            showSpeechBubble={false}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="companion-story" className="block text-xs font-semibold text-brand-text mb-1">
            Uraian Masalah:
          </label>
          <textarea
            id="companion-story"
            rows={6}
            value={story}
            onChange={handleStoryChange}
            placeholder="Tuliskan kronologi di sini... Contoh: Saya sudah bekerja 2 tahun di sebuah toko, tapi saat toko tutup pemilik menolak membayar pesangon dan menahan ijazah asli saya..."
            className="w-full px-4 py-3 text-sm text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors resize-y placeholder:text-gray-400"
          />
        </div>

        {errorMsg && (
          <p className="text-xs text-brand-danger flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </p>
        )}

        {/* Real-time Category Detection Preview */}
        {analysis && (
          <div className="p-3 bg-brand-primary-light/40 border border-brand-primary/20 rounded-lg flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-brand-primary shrink-0" aria-hidden="true" />
              <span className="text-brand-muted">
                Perkiraan ranah hukum terdeteksi:{" "}
                <strong className="text-brand-primary">{analysis.categoryLabel}</strong>
              </span>
            </div>
            {analysis.urgencyLevel === "urgent_safety" && (
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-brand-danger">
                Perlu Perhatian Darurat
              </span>
            )}
          </div>
        )}

        <div className="bg-gray-50 p-3.5 rounded-lg border border-brand-border flex items-start gap-2.5 text-xs text-brand-muted">
          <HelpCircle className="w-4 h-4 text-brand-muted shrink-0 mt-0.5" />
          <span>
            <strong>Tips:</strong> Tidak perlu khawatir salah menyebut istilah hukum. HAKKU akan membantu membedah apakah perkara ini masuk ranah perdata, pidana, atau ketenagakerjaan pada langkah berikutnya.
          </span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-brand-border">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
          >
            <span>Lanjutkan ke Klarifikasi Fakta</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
