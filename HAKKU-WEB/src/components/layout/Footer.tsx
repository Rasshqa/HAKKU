import React from "react";
import Link from "next/link";
import { Scale, ShieldCheck, AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-brand-border mt-auto">
      {/* Disclaimer Section as required by FR-09 */}
      <div className="bg-gray-50 border-b border-brand-border py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-4">
          <div className="p-2 bg-amber-100 text-brand-warning rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-xs text-brand-muted leading-relaxed space-y-1">
            <p className="font-semibold text-brand-text text-sm">
              Pernyataan Batasan Layanan (Legal Disclaimer)
            </p>
            <p>
              HAKKU adalah platform pendamping hukum digital yang bertujuan memberikan edukasi awal, merapikan fakta, dan memfasilitasi navigasi langkah hukum. HAKKU <strong>bukan kantor hukum, bukan advokat</strong>, dan tidak mewakili Anda dalam proses peradilan atau penyelidikan kepolisian.
            </p>
            <p>
              Informasi yang dihasilkan tidak menjamin hasil akhir perkara dan tidak boleh ditafsirkan sebagai nasihat hukum formal yang mengikat. Setiap perkara memiliki keunikan fakta yang memerlukan konsultasi langsung dengan advokat berlisensi atau lembaga bantuan hukum resmi.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          <div className="sm:col-span-2 md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-brand-primary flex items-center justify-center text-white">
                <Scale className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="font-bold text-base text-brand-text">HAKKU</span>
            </div>
            <p className="text-xs text-brand-muted max-w-sm">
              Pahami Hakmu. Tentukan Langkahmu. Membantu masyarakat Indonesia mengakses informasi hukum berkeadilan dan terstruktur.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-muted">
              <ShieldCheck className="w-4 h-4 text-brand-success" />
              <span>Privasi Terjaga • Sumber Hukum Terverifikasi</span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">
              Perangkat Hukum
            </h3>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <Link href="/konsultasi" className="hover:text-brand-primary transition-colors">
                  Wawancara Tanya AI
                </Link>
              </li>
              <li>
                <Link href="/dokumen" className="hover:text-brand-primary transition-colors">
                  Draf Surat Formil
                </Link>
              </li>
              <li>
                <Link href="/kalkulator" className="hover:text-brand-primary transition-colors">
                  Kalkulator Kompensasi
                </Link>
              </li>
              <li>
                <Link href="/bukti" className="hover:text-brand-primary transition-colors">
                  Audit Matriks Bukti
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">
              Alur Pendampingan
            </h3>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <Link href="/pendampingan" className="hover:text-brand-primary transition-colors">
                  Ceritakan Masalah
                </Link>
              </li>
              <li>
                <Link href="/pendampingan?step=clarify" className="hover:text-brand-primary transition-colors">
                  Klarifikasi Fakta
                </Link>
              </li>
              <li>
                <Link href="/pendampingan?step=review" className="hover:text-brand-primary transition-colors">
                  Konfirmasi Ringkasan
                </Link>
              </li>
              <li>
                <Link href="/rujukan" className="hover:text-brand-primary transition-colors">
                  Cari Bantuan & LBH
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-brand-text uppercase tracking-wider mb-3">
              Informasi & Ketentuan
            </h3>
            <ul className="space-y-2 text-xs text-brand-muted">
              <li>
                <Link href="/tentang" className="hover:text-brand-primary transition-colors">
                  Tentang HAKKU
                </Link>
              </li>
              <li>
                <Link href="/tentang#privasi" className="hover:text-brand-primary transition-colors">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/tentang#sumber" className="hover:text-brand-primary transition-colors">
                  Sumber Hukum Terkelola
                </Link>
              </li>
              <li>
                <Link href="/tentang#kompetisi" className="hover:text-brand-primary transition-colors">
                  Traspac Competition 2027
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-border mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-brand-muted">
          <p>© 2026–2027 HAKKU. Dirancang untuk Traspac Competition 2027.</p>
          <p>Dibuat dengan komitmen keselamatan & transparansi hukum.</p>
        </div>
      </div>
    </footer>
  );
}
