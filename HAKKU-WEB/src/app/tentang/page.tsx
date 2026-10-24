import React from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  BookOpen,
  Lock,
  Database,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function TentangPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <Breadcrumbs
          items={[
            { label: "Tentang HAKKU & Batasan Layanan" },
          ]}
        />

        {/* Intro Hero */}
        <div className="space-y-3 border-b border-brand-border pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-light text-brand-primary text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Pendampingan Hukum Digital</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
            Tentang HAKKU & Batasan Layanan
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            HAKKU dirancang untuk membantu masyarakat memahami posisi hukumnya, menyusun kronologi perkara secara runtut, dan menyiapkan kelengkapan berkas sebelum menempuh musyawarah bipartit, mediasi, atau konsultasi dengan Lembaga Bantuan Hukum (LBH).
          </p>
        </div>

        {/* Section 1: Prinsip Produk & Batasan Layanan */}
        <section className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Ruang Lingkup & Batasan Hukum
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              HAKKU <strong>bukan kantor advokat, bukan aparat penegak hukum, dan bukan lembaga peradilan</strong>. Informasi yang disajikan merupakan pemetaan awal berdasarkan peraturan perundang-undangan yang berlaku dan tidak menggantikan nasihat hukum advokat berlisensi.
            </p>
            <p>
              Fokus layanan kami adalah membantu warga merapikan fakta kejadian, menghitung hak normatif secara terukur, menginventarisasi alat bukti sesuai Pasal 184 KUHAP & UU ITE, serta menyusun draf surat formil yang siap digunakan.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2 mt-2">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-warning block">
                Standar Akurasi & Verifikasi Regulasi
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-brand-text">
                <li>Seluruh rujukan pasal ditautkan pada dokumen peraturan resmi dalam jaringan JDIH nasional.</li>
                <li>Sistem memisahkan secara tegas antara fakta yang disampaikan pengguna dan ketentuan normatif undang-undang.</li>
                <li>Perhitungan kompensasi dan tenggat waktu mengacu pada rumus baku peraturan perundang-undangan.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Kebijakan Privasi (#privasi) */}
        <section id="privasi" className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Pelindungan Data Pribadi (UU No. 27 Tahun 2022)
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP), HAKKU menerapkan prinsip minimisasi data dan kendali penuh oleh pemilik perkara:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-brand-muted">
              <li>
                <strong className="text-brand-text">Minimisasi Data Identitas:</strong> Pengguna dapat melakukan telaah perkara dan simulasi pesangon tanpa wajib mencantumkan NIK atau nomor rekening pribadi.
              </li>
              <li>
                <strong className="text-brand-text">Akses Berbasis Kode Referensi:</strong> Setiap berkas yang disimpan memiliki kode referensi unik dan dapat diperbarui statusnya sewaktu-waktu.
              </li>
              <li>
                <strong className="text-brand-text">Hak Penghapusan Permanen (Right to Erasure):</strong> Pemilik berkas dapat menghapus seluruh rekaman kronologi, checklist, dan riwayat perkara secara permanen langsung dari ruang perkara.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Sumber Hukum Terkelola (#sumber) */}
        <section id="sumber" className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Basis Peraturan Perundang-Undangan
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Rujukan hukum di dalam sistem dikurasi dari lembaran negara dan Jaringan Dokumentasi dan Informasi Hukum (JDIH) instansi terkait:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">Ketenagakerjaan & Hubungan Industrial</span>
                <span className="text-brand-muted text-[11px]">UU No. 13/2003, UU No. 6/2023, UU No. 2/2004, PP No. 35/2021</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">Transaksi Elektronik & Siber</span>
                <span className="text-brand-muted text-[11px]">UU No. 1/2024 jo. UU No. 11/2008 (UU ITE), PP No. 71/2019</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">Jasa Keuangan & Perlindungan Konsumen</span>
                <span className="text-brand-muted text-[11px]">UU No. 8/1999 (UUPK), POJK No. 10/POJK.05/2022, POJK No. 22/2023</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">Hukum Perdata, Acara & Bantuan Hukum</span>
                <span className="text-brand-muted text-[11px]">KUHPerdata Buku III, Pasal 184 KUHAP, UU No. 16/2011</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Keamanan & Arsitektur Data */}
        <section className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <Database className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Keamanan Sistem & Pengelolaan Berkas
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Sistem penyimpanan berkas HAKKU memisahkan tabel identitas pengguna, catatan kronologi perkara, hasil evaluasi pasal, dan daftar kelengkapan bukti secara terstruktur disertai pencatatan jejak audit (<em>audit trail</em>).
            </p>
            <p className="text-brand-muted text-xs">
              Seluruh dokumen hasil unduhan (PDF maupun teks) diproses langsung pada perangkat pengguna untuk menjaga kerahasiaan isi surat sebelum dikirimkan kepada pihak terkait.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center py-6 space-y-3">
          <h3 className="text-base font-bold text-brand-text">
            Siap menyusun kronologi atau dokumen perkara Anda?
          </h3>
          <Link
            href="/pendampingan"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-sm min-touch-target"
          >
            <span>Mulai Pendampingan Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
