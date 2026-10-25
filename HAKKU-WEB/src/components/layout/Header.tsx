"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface NavLink {
  href: string;
  label: string;
  isAi?: boolean;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: "/pendampingan", label: "Pendampingan", isAi: true },
  { href: "/konsultasi", label: "Wawancara", isAi: true },
  { href: "/kontrak", label: "Cek Kontrak" },
  { href: "/kalkulator", label: "Kalkulator PHK" },
  { href: "/dokumen", label: "Draf Surat" },
  { href: "/bukti", label: "Matriks Bukti" },
  { href: "/kasus", label: "Berkas Perkara" },
];

function AetherLogoMark() {
  return (
    <div className="relative w-9 h-9 rounded-xl border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center shrink-0 overflow-hidden transition-transform group-hover:-translate-y-0.5 bg-[#1B365D]">
      <img
        src="/HakkuIcon.png"
        alt="Logo HAKKU"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const syncAuth = () => {
      authClient
        .getSession()
        .then(({ data }) => {
          if (isMounted) {
            setUser(data?.user || null);
          }
        })
        .catch(() => {});
    };
    syncAuth();
    window.addEventListener("hakku-auth-change", syncAuth);
    return () => {
      isMounted = false;
      window.removeEventListener("hakku-auth-change", syncAuth);
    };
  }, []);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F8F9FA]/95 backdrop-blur-md border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-3 group whitespace-nowrap shrink-0"
          aria-label="Beranda HAKKU"
        >
          <AetherLogoMark />
          <span className="font-extrabold text-xl tracking-tight text-black">
            HAKKU
          </span>
        </Link>

        {/* Zone 2: Clean Single-Line Text Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-6 text-sm font-medium"
          aria-label="Navigasi Utama"
        >
          {PRIMARY_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-[#1B365D] font-bold after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-1 after:h-[3px] after:bg-[#1B365D]"
                    : "text-brand-muted hover:text-black"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <span>{link.label}</span>
                  {link.isAi && (
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-[#1B365D] border border-blue-200 uppercase tracking-wider">
                      AI
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              href="/akun"
              className="aether-btn-cyan inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user.name ? user.name.split(" ")[0] : "Ruang Akun"}</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/masuk"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-black transition-colors whitespace-nowrap shrink-0"
              >
                <span>Masuk</span>
              </Link>
              <Link
                href="/auth/daftar"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border-2 border-black rounded-lg transition-colors shadow-[2px_2px_0px_#000000] whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Daftar Akun</span>
              </Link>
              <Link
                href="/pendampingan"
                className="aether-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0"
              >
                <span>Mulai Pendampingan</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-white" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Trigger */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-2 text-black bg-white border-2 border-black shadow-[2px_2px_0px_#000000] rounded-lg flex items-center gap-1.5 text-xs font-bold whitespace-nowrap shrink-0"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b-2 border-black bg-white px-4 py-5 space-y-4 animate-slide-up-fade">
          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-bold ${
                pathname === "/" ? "bg-[#1B365D] text-white border border-black" : "text-black hover:bg-[#F8F9FA]"
              }`}
            >
              Beranda
            </Link>
            {PRIMARY_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-bold ${
                    isActive
                      ? "bg-[#1B365D] text-white border border-black"
                      : "text-black hover:bg-[#F8F9FA]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{link.label}</span>
                    {link.isAi && (
                      <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-blue-100 text-[#1B365D] border border-blue-200 uppercase tracking-wider">
                        AI
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
            <Link
              href="/tentang"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-lg text-sm font-medium text-brand-muted hover:text-black"
            >
              Tentang & Privasi
            </Link>
          </div>

          <div className="pt-3 border-t border-brand-border flex items-center gap-2">
            {user ? (
              <Link
                href="/akun"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2.5 text-xs font-bold text-black bg-[#F8F9FA] border-2 border-black rounded-lg"
              >
                Akun ({user.name?.split(" ")[0] || "Warga"})
              </Link>
            ) : (
              <>
                <Link
                  href="/auth/masuk"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-3 py-2.5 text-xs font-bold text-slate-800 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#000000]"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/daftar"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center px-3 py-2.5 text-xs font-bold text-white bg-[#1B365D] border-2 border-black rounded-lg shadow-[2px_2px_0px_#000000]"
                >
                  Daftar Baru
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 bg-[#F8F9FA] border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="flex items-center gap-3">
          <AetherLogoMark />
          <span className="font-extrabold text-xl tracking-tight text-black">HAKKU</span>
        </Link>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={<HeaderFallback />}>
      <HeaderInner />
    </Suspense>
  );
}
