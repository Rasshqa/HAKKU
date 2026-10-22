import React from "react";
import Link from "next/link";
import {
  Scale,
  ShieldCheck,
  BookOpen,
  Lock,
  Trophy,
  ArrowRight,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function TentangPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <Breadcrumbs
          items={[
            { label: "Tentang HAKKU & Batasan Sistem" },
          ]}
        />

        {/* Intro Hero */}
        <div className="space-y-3 border-b border-brand-border pb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary-light text-brand-primary text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            <span>Digital Legal Companion</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-text">
            Tentang HAKKU & Batasan Sistem
          </h1>
          <p className="text-sm sm:text-base text-brand-muted leading-relaxed">
            HAKKU lahir untuk menjembatani kesenjangan akses keadilan di Indonesia. Kami membantu masyarakat memahami hak-hak hukumnya melalui proses pendampingan digital yang terstruktur, transparan, dan berlandaskan sumber hukum resmi.
          </p>
        </div>

        {/* Section 1: Prinsip Produk & Batasan Layanan */}
        <section className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <ShieldCheck className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Prinsip Kerja & Batasan Hukum HAKKU
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              HAKKU <strong>bukan kantor hukum, bukan advokat, bukan kepolisian, dan bukan pengadilan</strong>. HAKKU tidak menyediakan representasi hukum di persidangan dan tidak memberikan nasihat hukum formal yang mengikat.
            </p>
            <p>
              Tujuan utama HAKKU adalah memberikan <em>informasi awal (initial legal guidance)</em>, merapikan kronologi fakta pengguna, memetakan potensi pasal perundang-undangan, dan membantu pengguna menyiapkan dokumen sebelum menempuh jalur musyawarah atau berkonsultasi dengan advokat profesional.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2 mt-2">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-warning block">
                Komitmen Etika & Anti-Halusinasi HAKKU
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-brand-text">
                <li>Sistem tidak pernah mengarang nomor undang-undang, pasal, kutipan peraturan, atau kontak lembaga fiktif.</li>
                <li>Sistem tidak pernah menjamin kemenangan perkara atau kepastian hasil peradilan.</li>
                <li>Sistem tidak menyediakan tombol pengajuan palsu seolah-olah laporan resmi telah dikirim ke instansi negara.</li>
                <li>Fakta yang diberikan pengguna dipisahkan secara tegas dari interpretasi dan rujukan normatif sistem.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2: Kebijakan Privasi (#privasi) */}
        <section id="privasi" className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <Lock className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Kebijakan Privasi & Perlindungan Data Pribadi
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Sesuai dengan amanat Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP), HAKKU menerapkan prinsip <em>privacy by default</em> dan minimisasi data:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-brand-muted">
              <li>
                <strong className="text-brand-text">Minimisasi Pengumpulan:</strong> Anda tidak diwajibkan memasukkan NIK, nomor rekening bank pribadi, atau identitas sensitif lainnya untuk menggunakan layanan pendampingan ini.
              </li>
              <li>
                <strong className="text-brand-text">Isolasi Sesi:</strong> Cerita dan data klarifikasi Anda tersimpan di lingkungan sesi lokal dan tidak pernah dibagikan kepada pengguna lain.
              </li>
              <li>
                <strong className="text-brand-text">Tidak Ada Pelatihan Model Publik:</strong> Isi percakapan dan kasus Anda tidak digunakan untuk melatih model AI publik tanpa persetujuan eksplisit.
              </li>
            </ul>
          </div>
        </section>

        {/* Section 3: Sumber Hukum Terkelola (#sumber) */}
        <section id="sumber" className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <BookOpen className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Integritas Sumber Hukum Terkelola
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Setiap pasal dan kutipan yang muncul di HAKKU dikurasi langsung dari jaringan Jaringan Dokumentasi dan Informasi Hukum (JDIH) resmi Republik Indonesia, meliputi:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">JDIH Kemenaker RI</span>
                <span className="text-brand-muted text-[11px]">UU 13/2003, UU 6/2023, PP 35/2021, PP 36/2021</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">JDIH Kominfo & BSSN</span>
                <span className="text-brand-muted text-[11px]">UU ITE (UU 1/2024 jo. UU 11/2008), Regulasi Siber</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">JDIH Otoritas Jasa Keuangan (OJK)</span>
                <span className="text-brand-muted text-[11px]">POJK 10/2022, Regulasi Fintech Lending & Etika Penagihan</span>
              </div>
              <div className="p-3 bg-gray-50 border border-brand-border rounded-lg">
                <span className="font-bold text-brand-text block">JDIHN & Mahkamah Agung</span>
                <span className="text-brand-muted text-[11px]">KUHPerdata Buku III, KUHP, Kompilasi Hukum Islam</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Target Lomba Traspac 2027 (#kompetisi) */}
        <section id="kompetisi" className="bg-white border border-brand-border rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2.5 text-brand-primary border-b border-brand-border pb-3">
            <Trophy className="w-5 h-5" />
            <h2 className="text-lg font-bold text-brand-text">
              Traspac Competition 2027 (Kategori Web/Mobile Apps)
            </h2>
          </div>

          <div className="space-y-3 text-xs sm:text-sm text-brand-text/90 leading-relaxed">
            <p>
              Proyek ini dipersiapkan untuk <strong>Traspac Competition 2027</strong> di bawah tema utama <strong>Sosial</strong>. Fokus proyek adalah membuktikan bahwa teknologi kecerdasan buatan dapat diterapkan secara bertanggung jawab dalam ranah bantuan hukum tanpa mengorbankan keamanan, akurasi, dan keselamatan pengguna.
            </p>
            <p className="text-brand-muted text-xs">
              Seluruh kode sumber terbuka, terstruktur secara modular monolith, memiliki tingkat keterbacaan tinggi, dan dapat diuji secara mandiri mengikuti instruksi di repositori GitHub.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="text-center py-6 space-y-3">
          <h3 className="text-base font-bold text-brand-text">
            Siap untuk mencoba pendampingan hukum HAKKU?
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
