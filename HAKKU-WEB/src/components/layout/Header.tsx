"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, User, ArrowUpRight } from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface NavLink {
  href: string;
  label: string;
}

const PRIMARY_LINKS: NavLink[] = [
  { href: "/pendampingan", label: "Pendampingan" },
  { href: "/konsultasi", label: "Wawancara" },
  { href: "/kontrak", label: "Cek Kontrak" },
  { href: "/kalkulator", label: "Kalkulator PHK" },
  { href: "/dokumen", label: "Draf Surat" },
  { href: "/bukti", label: "Matriks Bukti" },
  { href: "/kasus", label: "Berkas Perkara" },
];

function AetherLogoMark() {
  return (
    <div className="relative w-9 h-9 rounded-xl bg-[#1B365D] border-2 border-black shadow-[2.5px_2.5px_0px_#000000] flex items-center justify-center shrink-0 overflow-hidden transition-transform group-hover:-translate-y-0.5">
      <svg viewBox="0 0 64 64" className="w-8 h-8" aria-hidden="true">
        <circle cx="32" cy="34" r="22" fill="#234575" opacity="0.55" />
        {/* Left & Right Kancil Ears */}
        <path
          d="M22 24 C 13 13, 10 5, 16 4 C 21 3, 26 12, 26 21 Z"
          fill="#D97724"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M21 21 C 16 13, 14 8, 17 7 C 19 6, 23 13, 24 19 Z" fill="#FDBA74" />
        <path
          d="M42 24 C 51 13, 54 5, 48 4 C 43 3, 38 12, 38 21 Z"
          fill="#D97724"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path d="M43 21 C 48 13, 50 8, 47 7 C 45 6, 41 13, 40 19 Z" fill="#FDBA74" />
        {/* Crown Fur Tuft */}
        <path
          d="M28 17 Q 32 10 35 16 Q 38 12 36 18 Z"
          fill="#F59E0B"
          stroke="#000000"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Sculpted Kancil Head */}
        <path
          d="M16 32 C 16 20, 48 20, 48 32 C 50 41, 41 49, 32 50 C 23 49, 14 41, 16 32 Z"
          fill="#E07A22"
          stroke="#000000"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Cream Muzzle */}
        <path
          d="M24 38 C 24 29, 40 29, 40 38 C 40 46, 36 49, 32 49 C 28 49, 24 46, 24 38 Z"
          fill="#FFFBEB"
        />
        {/* Cyber Visor Rim */}
        <rect
          x="17"
          y="27"
          width="30"
          height="10"
          rx="5"
          fill="#00F0FF"
          fillOpacity="0.22"
          stroke="#00F0FF"
          strokeWidth="1.8"
        />
        {/* Eyes */}
        <ellipse cx="24.5" cy="32.5" rx="3.4" ry="3.8" fill="#0F172A" />
        <circle cx="23.4" cy="31.2" r="1.3" fill="#FFFFFF" />
        <ellipse cx="39.5" cy="32.5" rx="3.4" ry="3.8" fill="#0F172A" />
        <circle cx="38.4" cy="31.2" r="1.3" fill="#FFFFFF" />
        {/* Nose & Smile */}
        <polygon points="29,39 35,39 32,42.5" fill="#0F172A" />
        <path
          d="M28.5 44.5 Q 32 46.8 35.5 44.5"
          stroke="#0F172A"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Paralegal Collar & Gold Pin */}
        <path
          d="M21 49 L 32 55 L 43 49 L 46 58 L 18 58 Z"
          fill="#0F172A"
          stroke="#000000"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="54" r="2.6" fill="#FBBF24" stroke="#000000" strokeWidth="1.2" />
      </svg>
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
                {link.label}
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
            <Link
              href="/pendampingan"
              className="aether-btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg whitespace-nowrap shrink-0"
            >
              <span>Mulai Pendampingan</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-white" />
            </Link>
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
                  {link.label}
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
            <Link
              href={user ? "/akun" : "/auth/masuk"}
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center px-4 py-2.5 text-xs font-bold text-black bg-[#F8F9FA] border-2 border-black rounded-lg"
            >
              {user ? `Akun (${user.name?.split(" ")[0] || "Warga"})` : "Masuk / Daftar"}
            </Link>
            <Link
              href="/pendampingan"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center px-4 py-2.5 text-xs font-bold text-white bg-[#1B365D] border-2 border-black rounded-lg"
            >
              Mulai Pendampingan
            </Link>
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
