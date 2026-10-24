import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Scale, ShieldCheck, CheckCircle2, FileSearch } from "lucide-react";
import { EvidenceAuditWorkspace } from "@/components/evidence/EvidenceAuditWorkspace";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Audit Matriks Bukti & Berita Acara Kejadian | HAKKU",
  description:
    "Evaluasi kekuatan alat bukti hukum digital dan fisik Anda serta susun naskah Berita Acara Kronologis Kejadian resmi sesuai standar Pasal 184 KUHAP & UU ITE No. 1/2024.",
};

export default function BuktiPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6 print:p-0 print:m-0 print:bg-white">
      <div className="max-w-6xl mx-auto w-full space-y-8 print:p-0 print:m-0 print:space-y-0">
        {/* Navigation & Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
          <Breadcrumbs
            items={[
              { label: "Hukum Pembuktian", href: "/pendampingan" },
              { label: "Audit Matriks Alat Bukti (Pasal 184 KUHAP)" },
            ]}
          />
          <span className="self-start sm:self-auto text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
            Hukum Pembuktian • Pasal 184 KUHAP
          </span>
        </div>

        {/* Workspace Component wrapped in Suspense */}
        <Suspense
          fallback={
            <div className="bg-white border border-brand-border rounded-2xl p-12 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-medium text-brand-muted">
                Memuat Ruang Kerja Matriks Bukti Hukum...
              </p>
            </div>
          }
        >
          <EvidenceAuditWorkspace />
        </Suspense>

        {/* Educational Depth: Hukum Pembuktian Indonesia */}
        <div className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-6 shadow-xs print:hidden">
          <div className="space-y-2 border-b border-brand-border pb-4">
            <h2 className="text-base sm:text-lg font-bold text-brand-text flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-primary" />
              <span>Memahami Hukum Pembuktian & Standar Berkas di Indonesia</span>
            </h2>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Banyak laporan penipuan online, sengketa sewa, dan perselisihan kerja ditolak di Sentra Pelayanan Kepolisian Terpadu (SPKT) atau mediator bukan karena peristiwanya tidak terjadi, melainkan karena pelapor <strong>tidak membawa berkas pembuktian yang terstruktur</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-brand-muted">
            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <ShieldCheck className="w-4 h-4 text-brand-primary" />
                <span>Sahnya Bukti Elektronik (UU ITE)</span>
              </div>
              <p>
                Berdasarkan <strong>Pasal 5 & 6 UU ITE No. 1/2024 jo. UU 11/2008</strong>, tangkapan layar chat WhatsApp, email, dan mutasi m-banking adalah alat bukti hukum yang sah yang memperluas alat bukti petunjuk dalam <strong>Pasal 184 KUHAP</strong>.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <CheckCircle2 className="w-4 h-4 text-brand-success" />
                <span>Notasi Bukti Standar (P-1, P-2)</span>
              </div>
              <p>
                Penomoran kode bukti <strong>P-1, P-2, P-3</strong> (bukti Pelapor / Penggugat) merupakan konvensi baku peradilan dan kepolisian di Indonesia yang mempermudah penyidik mencocokkan setiap peristiwa dengan bukti pendukungnya.
              </p>
            </div>

            <div className="space-y-2 bg-gray-50 p-4 rounded-lg border border-brand-border/60">
              <div className="flex items-center gap-2 text-brand-text font-bold">
                <FileSearch className="w-4 h-4 text-blue-600" />
                <span>Mempercepat Penanganan Perkara</span>
              </div>
              <p>
                Membawa <strong>Laporan Kronologi Kejadian</strong> siap cetak bertanggal lengkap akan menghemat waktu pemeriksaan awal polisi atau mediator dari hitungan berjam-jam menjadi hitungan menit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
