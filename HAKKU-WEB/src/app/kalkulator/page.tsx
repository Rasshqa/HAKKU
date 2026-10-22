import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Scale, ShieldCheck, CheckCircle2, BookOpen } from "lucide-react";
import { CompensationCalculator } from "@/components/calculator/CompensationCalculator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Kalkulator Pesangon & Kompensasi PHK (PP 35/2021) | HAKKU",
  description:
    "Simulasi hitung hak normatif uang pesangon (UP), uang penghargaan masa kerja (UPMK), penggantian hak cuti, dan kompensasi PKWT sesuai PP No. 35 Tahun 2021.",
};

export default function KalkulatorPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Navigation & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <Breadcrumbs
            items={[
              { label: "Instrumen Ketenagakerjaan", href: "/pendampingan" },
              { label: "Kalkulator Hak Pesangon (PP 35/2021)" },
            ]}
          />
          <span className="self-start sm:self-auto text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
            Fitur Inovasi 2 • Ketenagakerjaan
          </span>
        </div>

        {/* The Calculator Component */}
        <Suspense
          fallback={
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-brand-muted">
                Memuat Kalkulator Simulasi Pesangon...
              </p>
            </div>
          }
        >
          <CompensationCalculator />
        </Suspense>

        {/* Rationale & Educational Depth Section */}
        <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs print:hidden">
          <div className="space-y-2 border-b border-brand-border pb-4">
            <h2 className="text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-primary" />
              <span>Memahami Hak Normatif Ketenagakerjaan di Indonesia</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Banyak pekerja tidak menyadari bahwa besaran pesangon dan kompensasi bukan ditentukan sepihak oleh perusahaan, melainkan dilindungi oleh peraturan perundang-undangan dengan sanksi pidana dan perdata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-brand-muted">
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand-primary" />
                <span>Kompensasi PKWT Wajib Dibayar</span>
              </div>
              <p>
                Berdasarkan <strong>Pasal 15 PP No. 35 Tahun 2021</strong>, setiap pekerja kontrak (PKWT) yang telah bekerja minimal 1 bulan terus-menerus berhak atas uang kompensasi saat kontrak berakhir atau diperpanjang.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-success" />
                <span>Dasar Upah yang Sah</span>
              </div>
              <p>
                Sesuai <strong>Pasal 40 ayat (5) PP No. 35/2021</strong>, dasar perhitungan pesangon adalah <strong>Upah Pokok dan Tunjangan Tetap</strong>. Tunjangan makan/transportasi yang tidak tergantung kehadiran termasuk tunjangan tetap.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Langkah Musyawarah Bipartit</span>
              </div>
              <p>
                Jika perusahaan menawarkan pesangon di bawah ketentuan PP 35/2021, gunakan hasil simulasi ini sebagai lampiran resmi dalam <strong>Surat Permohonan Perundingan Bipartit</strong> di HAKKU.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
