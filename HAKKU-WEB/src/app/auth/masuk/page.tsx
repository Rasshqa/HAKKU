"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Scale, Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/akun";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Mohon masukkan alamat email dan kata sandi Anda.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setErrorMessage(
          error.message || "Gagal masuk. Periksa kembali alamat email dan kata sandi Anda."
        );
        setIsLoading(false);
        return;
      }

      if (data) {
        router.push(callbackUrl);
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungkan ke server autentikasi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 sm:p-6 bg-brand-bg">
      <div className="w-full max-w-md space-y-6">
        {/* Mascot & Welcome Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <HakkiDuoInteractive
            mood="welcoming"
            size="sm"
            showSpeechBubble={false}
          />
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[11px] font-semibold text-brand-primary border border-blue-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Autentikasi Terenkripsi Neon Auth</span>
            </div>
            <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
              Masuk ke Akun HAKKU
            </h1>
            <p className="text-xs text-brand-muted mt-1 max-w-sm">
              Akses kembali riwayat konsultasi hukum, draf surat resmi, dan pelacakan alat bukti Anda.
            </p>
          </div>
        </div>

        {/* Card Form */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-brand-danger flex items-start gap-2.5 animate-slide-up-fade">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email-input"
                className="block text-xs font-semibold text-brand-text mb-1.5"
              >
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password-input"
                  className="block text-xs font-semibold text-brand-text"
                >
                  Kata Sandi
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 rounded-lg transition-colors min-touch-target shadow-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akun...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-border text-center text-xs text-brand-muted">
            Belum memiliki akun HAKKU?{" "}
            <Link
              href="/auth/daftar"
              className="font-bold text-brand-primary hover:underline ml-1"
            >
              Daftar Gratis di Sini
            </Link>
          </div>
        </div>

        {/* Security & Privacy Badges */}
        <div className="text-center text-[11px] text-brand-muted flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Scale className="w-3.5 h-3.5 text-brand-primary" />
            <span>Kepatuhan UU PDP No. 27/2022</span>
          </span>
          <span>•</span>
          <span>Data Terenkripsi</span>
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
