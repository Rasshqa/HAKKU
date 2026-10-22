"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, ArrowRight, AlertCircle, Eye, EyeOff, ShieldCheck, Check } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Mohon isi nama lengkap atau nama panggilan Anda.");
      return;
    }

    if (!email || !password) {
      setErrorMessage("Mohon lengkapi email dan kata sandi.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Kata sandi minimal 8 karakter demi keamanan data hukum Anda.");
      return;
    }

    if (!agreedPrivacy) {
      setErrorMessage("Mohon setujui prinsip perlindungan data pribadi untuk mendaftar.");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name: name.trim(),
      });

      if (error) {
        setErrorMessage(
          error.message || "Pendaftaran gagal. Alamat email mungkin sudah terdaftar."
        );
        setIsLoading(false);
        return;
      }

      if (data) {
        router.push("/akun");
      }
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Terjadi kendala saat menghubungkan ke server pendaftaran."
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
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[11px] font-semibold text-brand-success border border-emerald-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Pendaftaran Gratis & Terlindungi</span>
            </div>
            <h1 className="text-2xl font-extrabold text-brand-text tracking-tight">
              Buat Akun Warga HAKKU
            </h1>
            <p className="text-xs text-brand-muted mt-1 max-w-sm">
              Simpan kronologi perkara Anda secara aman dan diskusikan strategi hukum bersama Hakki kapan saja.
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

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="name-input"
                className="block text-xs font-semibold text-brand-text mb-1.5"
              >
                Nama Lengkap / Panggilan
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  required
                  autoComplete="name"
                  className="w-full pl-10 pr-4 py-2.5 text-xs text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
                />
              </div>
            </div>

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
              <label
                htmlFor="password-input"
                className="block text-xs font-semibold text-brand-text mb-1.5"
              >
                Kata Sandi (Minimal 8 Karakter)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
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

            {/* Privacy Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreedPrivacy}
                  onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary shrink-0"
                />
                <span className="text-[11px] text-brand-muted leading-relaxed">
                  Saya menyetujui pemrosesan data akun untuk pendampingan hukum sesuai prinsip privasi UU PDP No. 27/2022.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover disabled:opacity-60 rounded-lg transition-colors min-touch-target shadow-xs"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mendaftarkan Akun Anda...</span>
                </>
              ) : (
                <>
                  <span>Daftar Akun Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-brand-border text-center text-xs text-brand-muted">
            Sudah memiliki akun HAKKU?{" "}
            <Link
              href="/auth/masuk"
              className="font-bold text-brand-primary hover:underline ml-1"
            >
              Masuk di Sini
            </Link>
          </div>
        </div>

        {/* Security & Privacy Badges */}
        <div className="text-center text-[11px] text-brand-muted flex items-center justify-center gap-4">
          <span className="flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-brand-success" />
            <span>100% Bebas Biaya</span>
          </span>
          <span>•</span>
          <span>Data Terenkripsi</span>
        </div>
      </div>
    </div>
  );
}
