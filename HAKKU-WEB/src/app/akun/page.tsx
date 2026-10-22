"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  FolderLock,
  MessageSquare,
  Scale,
  FileText,
  Calculator,
  ShieldCheck,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface SavedCase {
  id: string;
  caseCode: string;
  title: string;
  categoryLabel: string;
  urgencyLevel: string;
  status: string;
  createdAt: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ user?: { name?: string; email?: string } } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<SavedCase[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const { data } = await authClient.getSession();
        setSession(data);

        // Muat perkara tersimpan jika ada di server penyimpanan
        const res = await fetch("/api/cases").catch(() => null);
        if (res && res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setCases(json.data.slice(0, 10));
          }
        }
      } catch (err) {
        console.error("Gagal memuat sesi:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      setSession(null);
      router.push("/");
    } catch (err) {
      console.error("Gagal keluar:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-brand-muted font-medium">Memuat data akun...</span>
        </div>
      </div>
    );
  }

  // Jika belum login
  if (!session?.user) {
    return (
      <div className="flex-1 min-h-[70vh] flex items-center justify-center p-4 sm:p-6 bg-brand-bg">
        <div className="w-full max-w-md bg-white border border-brand-border rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs animate-slide-up-fade">
          <div className="flex justify-center">
            <HakkiDuoInteractive mood="welcoming" size="sm" showSpeechBubble={false} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-bold text-brand-text">
              Belum Masuk ke Akun
            </h2>
            <p className="text-xs text-brand-muted leading-relaxed">
              Masuk atau buat akun baru untuk menyimpan dokumen somasi, bukti kasus, dan berkonsultasi langsung dengan Hakki.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/auth/masuk?callbackUrl=/akun"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors min-touch-target shadow-xs"
            >
              <span>Masuk Akun</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/daftar"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-brand-text bg-gray-50 hover:bg-gray-100 border border-brand-border rounded-lg transition-colors min-touch-target"
            >
              <span>Daftar Gratis</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-brand-bg py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumbs
          items={[
            { label: "Ruang Kerja & Akun" },
          ]}
        />

        {/* User Banner Card */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-brand-primary text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-sm">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-brand-success border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Akun Terverifikasi Neon Auth</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-brand-text">
                {session.user.name || "Warga Sadar Hukum"}
              </h1>
              <p className="text-xs text-brand-muted">
                {session.user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand-muted hover:text-brand-danger bg-gray-50 hover:bg-red-50 border border-brand-border hover:border-red-200 rounded-lg transition-colors min-touch-target"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isLoggingOut ? "Keluar..." : "Keluar Akun"}</span>
            </button>
          </div>
        </div>

        {/* Quick Hub Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/konsultasi"
            className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-white border border-blue-200 hover:border-brand-primary transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-primary text-white">
                Live AI
              </span>
            </div>
            <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              Ruang Wawancara & Diskusi Hukum
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Konsultasi dua arah bersama Hakki layaknya wawancara paralegal sungguhan.
            </p>
          </Link>

          <Link
            href="/pendampingan"
            className="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-primary transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary-light text-brand-primary flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-brand-muted">
                6 Tahap
              </span>
            </div>
            <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              Alur Pendampingan Terstruktur
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Penguraian kronologi, telaah pasal, dan rekomendasi langkah hukum terverifikasi.
            </p>
          </Link>

          <Link
            href="/kalkulator"
            className="p-5 rounded-2xl bg-white border border-brand-border hover:border-brand-primary transition-all shadow-xs group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                PP 35/2021
              </span>
            </div>
            <h3 className="text-sm font-bold text-brand-text group-hover:text-brand-primary transition-colors">
              Kalkulator Hak Pesangon
            </h3>
            <p className="text-xs text-brand-muted mt-1 leading-relaxed">
              Hitung hak pesangon, penghargaan masa kerja, dan ganti rugi pemutusan kontrak.
            </p>
          </Link>
        </div>

        {/* Saved Legal Cases Section */}
        <div className="bg-white border border-brand-border rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-brand-border pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
                <FolderLock className="w-5 h-5 text-brand-primary" />
                <span>Berkas Perkara Anda yang Tersimpan Aman</span>
              </h2>
              <p className="text-xs text-brand-muted mt-0.5">
                Daftar perkara yang tersimpan dengan enkripsi data pribadi.
              </p>
            </div>
            <Link
              href="/pendampingan"
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              <span>+ Buat Perkara Baru</span>
            </Link>
          </div>

          {cases.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-50 border border-brand-border mx-auto flex items-center justify-center text-brand-muted">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                Belum ada perkara yang disimpan. Mulai alur pendampingan atau ruang wawancara untuk mendokumentasikan fakta kasus Anda.
              </p>
              <Link
                href="/pendampingan"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs"
              >
                <span>Mulai Pendampingan Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {cases.map((c) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-brand-primary font-mono">
                        {c.caseCode}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-brand-primary border border-blue-200">
                        {c.categoryLabel}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Masa Tunggu 14 Hari</span>
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-brand-text">
                      {c.title}
                    </h4>
                    <span className="text-[11px] text-brand-muted flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(c.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <Link
                    href={`/kasus/${encodeURIComponent(c.caseCode)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-brand-primary hover:text-white hover:bg-brand-primary border border-brand-primary rounded-lg transition-colors"
                  >
                    <span>Buka Berkas</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
