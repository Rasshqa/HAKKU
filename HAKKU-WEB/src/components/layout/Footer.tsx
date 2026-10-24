import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black text-white border-t-2 border-black mt-auto print:hidden">
      {/* Legal Disclaimer Strip */}
      <div className="bg-[#0F172A] border-b border-white/10 py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start gap-4">
          <div className="p-2 bg-[#1B365D] text-white border border-white/20 rounded-lg shrink-0">
            <AlertCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="text-xs text-zinc-400 leading-relaxed space-y-1">
            <p className="font-bold text-white text-sm">
              Pernyataan Batasan Layanan (Legal Disclaimer)
            </p>
            <p>
              HAKKU adalah platform pendamping hukum digital yang bertujuan memberikan edukasi awal, merapikan fakta, dan memfasilitasi navigasi langkah hukum. HAKKU <strong className="text-white">bukan kantor hukum dan bukan advokat</strong>, serta tidak mewakili Anda dalam proses peradilan.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          <div className="sm:col-span-2 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/HakkuIcon.png"
                alt="Ikon HAKKU"
                className="w-8 h-8 rounded-lg border border-white/20 shrink-0 object-cover"
              />
              <span className="font-extrabold text-lg tracking-tight text-white">HAKKU</span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              Platform pendampingan hukum warga berbasis regulasi positif Republik Indonesia. Membantu memetakan hak normatif, mengaudit kelengkapan bukti, dan menyiapkan dokumen hukum secara terstruktur.
            </p>
            <div className="pt-1">
              <div className="w-6 h-0.5 bg-[#3B82F6] mb-2" />
              <p className="font-mono text-[11px] tracking-widest text-zinc-300 uppercase">
                PENDAMPING HUKUM WARGA
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-[#93C5FD] uppercase tracking-wider mb-3">
              Perangkat Hukum
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/konsultasi" className="hover:text-white transition-colors">
                  Ruang Wawancara Kasus
                </Link>
              </li>
              <li>
                <Link href="/dokumen" className="hover:text-white transition-colors">
                  Draf Surat Somasi & Bipartit
                </Link>
              </li>
              <li>
                <Link href="/kalkulator" className="hover:text-white transition-colors">
                  Kalkulator Pesangon PP 35/2021
                </Link>
              </li>
              <li>
                <Link href="/bukti" className="hover:text-white transition-colors">
                  Matriks Alat Bukti (Pasal 184 KUHAP)
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-[#93C5FD] uppercase tracking-wider mb-3">
              Alur & Berkas
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/pendampingan" className="hover:text-white transition-colors">
                  Pendampingan 6 Tahap
                </Link>
              </li>
              <li>
                <Link href="/kasus" className="hover:text-white transition-colors">
                  Arsip & Pencarian Perkara
                </Link>
              </li>
              <li>
                <Link href="/rujukan" className="hover:text-white transition-colors">
                  Direktori LBH & Posbankum
                </Link>
              </li>
              <li>
                <Link href="/akun" className="hover:text-white transition-colors">
                  Akun & Ruang Kerja
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-mono font-bold text-[#93C5FD] uppercase tracking-wider mb-3">
              Transparansi
            </h3>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/tentang" className="hover:text-white transition-colors">
                  Tentang HAKKU
                </Link>
              </li>
              <li>
                <Link href="/tentang#privasi" className="hover:text-white transition-colors">
                  Kebijakan Privasi (UU PDP)
                </Link>
              </li>
              <li>
                <Link href="/tentang#sumber" className="hover:text-white transition-colors">
                  Korpus Hukum JDIH
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono text-zinc-400">
          <p>© 2026–2027 HAKKU · DIGITAL LEGAL COMPANION</p>
          <p>KEPATUHAN UU PDP NO. 27/2022 · SUMBER JDIH RESMI</p>
        </div>
      </div>
    </footer>
  );
}
