import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Scale, CheckCircle2, ShieldCheck, FileCheck } from "lucide-react";
import { LegalDocumentGenerator } from "@/components/document/LegalDocumentGenerator";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Generator Draf Surat Hukum Siap Pakai | HAKKU",
  description:
    "Susun draf resmi surat permohonan perundingan Bipartit (UU No. 2/2004), surat somasi wanprestasi (KUHPerdata 1238), atau lembar kronologi LBH siap cetak.",
};

export default function DokumenPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6 print:p-0 print:m-0 print:bg-white">
      <div className="max-w-6xl mx-auto w-full space-y-8 print:p-0 print:m-0 print:space-y-0">
        {/* Navigation & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <Breadcrumbs
            items={[
              { label: "Instrumen Hukum", href: "/pendampingan" },
              { label: "Generator Draf Somasi & Bipartit" },
            ]}
          />
          <span className="self-start sm:self-auto text-xs font-semibold text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-full">
            Fitur Inovasi 1 • Instrumen Surat
          </span>
        </div>

        {/* The Generator Component wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-brand-muted">
                Memuat Generator Surat Hukum Resmi...
              </p>
            </div>
          }
        >
          <LegalDocumentGenerator />
        </Suspense>

        {/* Rationale & Educational Depth Section */}
        <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs print:hidden">
          <div className="space-y-2 border-b border-brand-border pb-4">
            <h2 className="text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-primary" />
              <span>Mengapa HAKKU Menyediakan Generator Surat Hukum Otomatis?</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Di Indonesia, ribuan perselisihan perdata dan ketenagakerjaan gugur di meja mediasi atau pengadilan bukan karena pihak yang dirugikan salah, melainkan akibat <strong>cacat formil</strong> (formal procedural defect).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-brand-muted">
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand-success" />
                <span>Syarat Wajib Mediasi Bipartit</span>
              </div>
              <p>
                Berdasarkan <strong>Pasal 3 & 4 UU No. 2 Tahun 2004</strong>, Dinas Tenaga Kerja akan menolak mediasi jika tidak ada bukti telah dilakukannya musyawarah Bipartit secara patut dan tertulis selama 30 hari kerja.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>Pembuktian Wanprestasi Somasi</span>
              </div>
              <p>
                Sesuai <strong>Pasal 1238 KUHPerdata</strong>, seseorang belum dinyatakan lalai (in mora) sebelum ada surat teguran atau somasi resmi yang memberikan tenggat waktu nyata untuk memenuhi kewajibannya.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <FileCheck className="w-4 h-4 text-brand-accent" />
                <span>Efisiensi Konsultasi Pro Bono LBH</span>
              </div>
              <p>
                Advokat publik dan Posbankum di bawah <strong>UU No. 16 Tahun 2011</strong> membutuhkan ringkasan kronologi dan alat bukti yang sistematis agar dapat langsung menyusun strategi pembelaan tanpa membuang waktu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
