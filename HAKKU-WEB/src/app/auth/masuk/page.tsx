"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Scale,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { signInWithGoogle } from "@/lib/auth/client";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

function GoogleIcon() {
  return (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/akun";

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleGoogleSignIn = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await signInWithGoogle(callbackUrl);
      if (result && "error" in result && result.error) {
        setErrorMessage(
          (result.error as { message?: string })?.message ||
            "Gagal menginisialisasi login Google melalui Neon Auth."
        );
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error("[HAKKU AUTH] Error during Google OAuth:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Gagal menghubungkan ke layanan Neon Auth. Periksa koneksi internet Anda atau coba lagi."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 bg-brand-bg">
      <div className="w-full max-w-md space-y-6">
        {/* Mascot & Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <HakkiDuoInteractive
            mood="welcoming"
            size="sm"
            showSpeechBubble={false}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[11px] font-bold text-brand-primary border border-blue-200 mb-2 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-primary" />
              <span>Neon Auth • Google Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text tracking-tight">
              Masuk ke HAKKU
            </h1>
            <p className="text-xs text-brand-muted mt-1.5 max-w-sm leading-relaxed">
              Platform pendamping hukum warga Indonesia. Masuk praktis dengan akun Google untuk mengakses riwayat perkara dan draf dokumen hukum Anda.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000000] space-y-6">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* AI Feature Access Notice */}
          {(callbackUrl.includes("konsultasi") || callbackUrl.includes("pendampingan")) && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-[#1B365D] flex items-start gap-2.5 animate-slide-up-fade">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#1B365D]" />
              <div className="space-y-0.5">
                <span className="font-bold block">Autentikasi Diperlukan untuk Fitur Berbasis AI</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Fitur Wawancara Hukum dan Pendampingan Terpandu menggunakan mesin AI cerdas untuk membedah kronologi kasus. Silakan masuk dengan akun Google untuk memulai dan mengamankan riwayat analisis Anda.
                </p>
              </div>
            </div>
          )}

          {/* Value Highlights */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-brand-text">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Akses Penuh Akun Warga:</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-600 pl-5 list-disc">
              <li>Penyimpanan otomatis berkas perkara & nomor kode perkara</li>
              <li>Unduh berkas draf somasi & bipartit resmi berstempel digital</li>
              <li>Riwayat konsultasi wawancara hukum paralegal terlindungi</li>
            </ul>
          </div>

          {/* Google Only Sign In CTA */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3.5 text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-60 border-2 border-black rounded-xl transition-all shadow-[3px_3px_0px_#000000] hover:shadow-[1.5px_1.5px_0px_#000000] hover:translate-x-[1.5px] hover:translate-y-[1.5px] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full animate-spin" />
                  <span>Mengarahkan ke Google OAuth...</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Lanjutkan dengan Google</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                </>
              )}
            </button>

            <p className="text-[11px] text-center text-slate-500 leading-relaxed">
              Autentikasi langsung dengan Google OAuth via Neon Auth. Pendaftaran akun baru berlangsung otomatis saat pertama kali masuk.
            </p>
          </div>

          {/* Domain Verification Badge */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>Domain Resmi Layanan:</span>
            <span className="font-mono font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              hakku.biz.id
            </span>
          </div>
        </div>

        {/* Security & Privacy Badges */}
        <div className="text-center text-[11px] text-brand-muted flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-brand-primary" />
            <span>Kepatuhan UU PDP No. 27/2022</span>
          </span>
          <span>•</span>
          <span>Enkripsi Database Neon</span>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
