import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Plus,
  Trash2,
} from "lucide-react";
import { CaseFactSummary } from "@/modules/intake/types";

interface FactSummaryReviewStepProps {
  factSummary: CaseFactSummary;
  onBack: () => void;
  onConfirmSummary: (updatedSummary: CaseFactSummary) => void;
}

export function FactSummaryReviewStep({
  factSummary,
  onBack,
  onConfirmSummary,
}: FactSummaryReviewStepProps) {
  const [knownFacts, setKnownFacts] = useState<string[]>(factSummary.knownFacts);
  const [unknownFacts, setUnknownFacts] = useState<string[]>(factSummary.unknownFacts);
  const [newFactInput, setNewFactInput] = useState("");
  const [userNotes, setUserNotes] = useState(factSummary.userNotes || "");

  const handleAddFact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFactInput.trim()) {
      setKnownFacts((prev) => [...prev, newFactInput.trim()]);
      setNewFactInput("");
    }
  };

  const handleRemoveKnownFact = (index: number) => {
    setKnownFacts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveUnknownFact = (index: number) => {
    setUnknownFacts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirm = () => {
    onConfirmSummary({
      ...factSummary,
      knownFacts,
      unknownFacts,
      userNotes,
      confirmedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="border-b border-brand-border pb-4">
        <div className="flex items-center gap-2 text-brand-primary">
          <FileCheck className="w-5 h-5 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Konfirmasi Sebelum Analisis Hukum
          </span>
        </div>
        <h2 className="text-xl font-bold text-brand-text mt-1">
          Tinjau Ringkasan Fakta Perkara
        </h2>
        <p className="text-xs text-brand-muted mt-1 leading-relaxed">
          Sesuai prinsip etika HAKKU, kami membedakan secara tegas antara apa yang Anda nyatakan sebagai fakta dan apa yang belum diketahui. Silakan periksa atau tambahkan koreksi.
        </p>
      </div>

      {/* Bagian 1: Fakta yang Dinyatakan Pengguna (Known Facts) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" />
            <span>Fakta yang Anda Sampaikan ({knownFacts.length})</span>
          </h3>
          <span className="text-[11px] text-brand-muted">Dapat diedit atau dihapus</span>
        </div>

        <div className="space-y-2">
          {knownFacts.map((fact, idx) => (
            <div
              key={idx}
              className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-lg text-xs text-brand-text flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2">
                <span className="font-bold text-brand-success shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{fact}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveKnownFact(idx)}
                className="text-gray-400 hover:text-brand-danger transition-colors p-1"
                title="Hapus jika fakta ini keliru"
                aria-label={`Hapus fakta ${idx + 1}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Input Tambah Fakta Manual */}
        <form onSubmit={handleAddFact} className="flex gap-2 pt-1">
          <input
            type="text"
            value={newFactInput}
            onChange={(e) => setNewFactInput(e.target.value)}
            placeholder="Tambah fakta atau rincian penting lain..."
            className="flex-1 px-3 py-2 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
          />
          <button
            type="submit"
            className="px-3 py-2 text-xs font-semibold text-brand-primary bg-brand-primary-light hover:bg-brand-primary hover:text-white rounded-lg transition-colors flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </form>
      </div>

      {/* Bagian 2: Informasi yang Belum Diketahui / Dilewati (Unknowns) */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-brand-text flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-brand-warning shrink-0" />
            <span>Informasi yang Belum Tersedia / Dilewati ({unknownFacts.length})</span>
          </h3>
          <span className="text-[11px] text-brand-muted">Mempengaruhi ketepatan opsi hukum</span>
        </div>

        {unknownFacts.length === 0 ? (
          <p className="text-xs text-brand-muted italic bg-gray-50 p-3 rounded-lg border border-brand-border">
            Seluruh pertanyaan klarifikasi kunci telah Anda berikan informasi.
          </p>
        ) : (
          <div className="space-y-2">
            {unknownFacts.map((unknown, idx) => (
              <div
                key={idx}
                className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg text-xs text-brand-text flex items-start justify-between gap-3"
              >
                <div className="flex items-start gap-2">
                  <span className="font-bold text-brand-warning shrink-0 mt-0.5">?</span>
                  <span className="leading-relaxed">{unknown}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveUnknownFact(idx)}
                  className="text-gray-400 hover:text-brand-text transition-colors p-1"
                  title="Hapus poin ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bagian 3: Catatan Tambahan Pengguna */}
      <div className="space-y-2 pt-4 border-t border-brand-border">
        <label htmlFor="user-notes" className="block text-xs font-semibold text-brand-text">
          Catatan Tambahan untuk Konsultasi (Opsional):
        </label>
        <textarea
          id="user-notes"
          rows={2}
          value={userNotes}
          onChange={(e) => setUserNotes(e.target.value)}
          placeholder="Catatan khusus yang ingin Anda ingat saat nanti berkonsultasi dengan advokat/LBH..."
          className="w-full px-3 py-2 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-border">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors min-touch-target"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Pertanyaan</span>
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
        >
          <span>Konfirmasi & Lihat Opsi Hukum</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
