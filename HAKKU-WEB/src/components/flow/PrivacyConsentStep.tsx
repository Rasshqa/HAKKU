import React, { useState } from "react";
import { ShieldCheck, Lock, AlertTriangle, ArrowRight } from "lucide-react";

interface PrivacyConsentStepProps {
  onConsentGiven: () => void;
}

export function PrivacyConsentStep({ onConsentGiven }: PrivacyConsentStepProps) {
  const [agreed, setAgreed] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleContinue = () => {
    if (!agreed) {
      setErrorMsg("Mohon centang persetujuan privasi dan pemahaman batasan layanan untuk melanjutkan.");
      return;
    }
    setErrorMsg("");
    onConsentGiven();
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 max-w-2xl mx-auto space-y-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-center gap-3 border-b border-brand-border pb-4">
        <div className="w-10 h-10 rounded-lg bg-brand-primary-light text-brand-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-brand-text">
            Pemberitahuan Data & Batasan Layanan
          </h2>
          <p className="text-xs text-brand-muted">
            Transparansi sebelum Anda memulai sesi pendampingan hukum.
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs sm:text-sm text-brand-text leading-relaxed">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-brand-primary flex items-center gap-1.5 text-xs sm:text-sm">
            <Lock className="w-4 h-4 shrink-0" />
            Prinsip Perlindungan Privasi Anda
          </h3>
          <ul className="list-disc list-inside space-y-1 text-brand-text/80 text-xs">
            <li>Data yang Anda masukkan digunakan semata-mata untuk menghasilkan panduan informasi hukum pada sesi ini.</li>
            <li>HAKKU <strong>tidak pernah</strong> meminta kata sandi (password), PIN perbankan, nomor kartu kredit/debit, atau data sensitif yang tidak relevan.</li>
            <li>Sesi demo ini menggunakan data lokal sementara dan tidak dibagikan ke pihak ketiga tanpa izin Anda.</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-brand-warning flex items-center gap-1.5 text-xs sm:text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Batasan Hukum Penting
          </h3>
          <p className="text-xs text-brand-text/80">
            HAKKU menyediakan informasi awal dan checklist terstruktur berdasarkan peraturan hukum resmi. HAKKU <strong>bukan kantor hukum atau pengganti advokat</strong>, tidak menjamin kemenangan perkara, dan tidak secara otomatis mengirim laporan ke kepolisian atau pengadilan.
          </p>
        </div>
      </div>

      {/* Consent Checkbox */}
      <div className="pt-2 border-t border-brand-border space-y-3">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              if (errorMsg) setErrorMsg("");
            }}
            className="mt-0.5 w-4 h-4 text-brand-primary rounded border-brand-border focus:ring-brand-primary shrink-0"
          />
          <span className="text-xs text-brand-text leading-tight">
            Saya memahami bahwa HAKKU memberikan informasi awal navigasi hukum (bukan nasihat formal advokat), dan saya menyetujui pemrosesan data fakta perkara saya untuk sesi ini.
          </span>
        </label>

        {errorMsg && (
          <p className="text-xs text-brand-danger flex items-center gap-1 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {errorMsg}
          </p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-sm"
        >
          <span>Lanjutkan ke Cerita Masalah</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
