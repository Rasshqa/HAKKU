"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { HakkiDuoInteractive } from "@/components/mascot/HakkiDuoInteractive";

const SYSTEM_INIT_STEPS = [
  "Menyiapkan korpus hukum Indonesia (PP 35/2021, UU ITE, KUHPerdata)...",
  "Memuat kecerdasan asisten paralegal digital Hakki...",
  "Mengaktifkan modul perlindungan data pribadi (UU PDP)...",
  "Sistem siap mendampingi penanganan perkara hukum Anda.",
];

export default function SplashPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsReady(true);
          return 100;
        }
        const next = prev + 4;
        if (next >= 75) setStepIndex(3);
        else if (next >= 50) setStepIndex(2);
        else if (next >= 25) setStepIndex(1);
        return next;
      });
    }, 60);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      const redirectTimeout = setTimeout(() => {
        router.push("/");
      }, 1500);
      return () => clearTimeout(redirectTimeout);
    }
  }, [isReady, router]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden selection:bg-[#00F0FF] selection:text-black">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#1B365D_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.07] pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-4xl w-full mx-auto flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border-2 border-black bg-[#1B365D] flex items-center justify-center shadow-[2.5px_2.5px_0px_#000000] overflow-hidden">
            <img
              src="/HakkuIcon.png"
              alt="HAKKU Icon"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-black text-xl tracking-tight text-[#1B365D]">
            HAKKU
          </span>
        </div>

        <Link
          href="/"
          className="text-xs font-bold text-slate-600 hover:text-black border-2 border-black bg-white px-3 py-1.5 rounded-lg shadow-[2px_2px_0px_#000000] transition-transform active:translate-y-0.5"
        >
          Lewati Intro →
        </Link>
      </div>

      {/* Main Mascot & Loading Section */}
      <main className="max-w-xl w-full mx-auto my-auto flex flex-col items-center text-center z-10 py-8">
        <div className="relative mb-6">
          <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex items-center justify-center">
            <HakkiDuoInteractive
              mood={isReady ? "celebrating" : "welcoming"}
              size="lg"
              showSpeechBubble={false}
            />
          </div>
          {isReady && (
            <span className="absolute -top-2 -right-2 bg-[#00F0FF] text-black text-xs font-black px-2.5 py-1 rounded-full border-2 border-black shadow-[2px_2px_0px_#000000] animate-bounce">
              Siap! ✨
            </span>
          )}
        </div>

        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/80 border-2 border-black rounded-full text-xs font-black text-[#1B365D] shadow-[2px_2px_0px_#000000]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Paralegal Digital Mandiri</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Selamat Datang di <span className="text-[#1B365D]">HAKKU</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
            Pendamping hukum cerdas untuk menghitung pesangon, memeriksa klausul kontrak, dan menyusun dokumen formal secara mandiri.
          </p>
        </div>

        {/* Progress Bar & Status */}
        <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0px_#000000] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
              Inisialisasi Sistem
            </span>
            <span className="font-mono text-[#1B365D] font-black">
              {progress}%
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-100 border-2 border-black rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-[#00F0FF] to-[#1B365D] rounded-full transition-all duration-150 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 font-medium text-left truncate">
            {SYSTEM_INIT_STEPS[stepIndex]}
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 bg-[#1B365D] hover:bg-[#13294B] text-white font-black py-3 px-6 rounded-xl border-2 border-black shadow-[3px_3px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all text-sm"
          >
            <span>{isReady ? "Buka Beranda HAKKU" : "Lanjutkan Sekarang"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl w-full mx-auto text-center z-10 text-xs text-slate-500 font-medium pt-4 border-t border-slate-200">
        <p>
          Berdasarkan PP No. 35 Tahun 2021, UU No. 13 Tahun 2003, UU ITE No. 1 Tahun 2024, dan UU PDP No. 27 Tahun 2022.
        </p>
      </footer>
    </div>
  );
}
