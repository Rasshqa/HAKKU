"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  Menu,
  X,
  MessageSquare,
  User,
  Sparkles,
  Calculator,
  FileText,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Building2,
  ChevronRight,
} from "lucide-react";
import { authClient } from "@/lib/auth/client";

interface NavLink {
  href: string;
  label: string;
  desc?: string;
  icon: React.ComponentType<{ className?: string }>;
  isPrimary?: boolean;
}

const PRIMARY_LINKS: NavLink[] = [
  {
    href: "/pendampingan",
    label: "Pendampingan",
    desc: "Alur form 6 tahap navigasi & evaluasi perkara",
    icon: CheckCircle2,
    isPrimary: true,
  },
  {
    href: "/konsultasi",
    label: "Wawancara AI",
    desc: "Konsultasi & dialog hukum interaktif",
    icon: MessageSquare,
  },
  {
    href: "/kalkulator",
    label: "Kalkulator Hak",
    desc: "Hitung pesangon & hak PP 35/2021",
    icon: Calculator,
  },
  {
    href: "/dokumen",
    label: "Draf Surat",
    desc: "Generator somasi & risalah bipartit",
    icon: FileText,
  },
  {
    href: "/bukti",
    label: "Matriks Bukti",
    desc: "Audit kekuatan berkas & laporan siap bawa",
    icon: ShieldCheck,
  },
  {
    href: "/rujukan",
    label: "Cari LBH",
    desc: "Direktori bantuan hukum terverifikasi",
    icon: Building2,
  },
  {
    href: "/tentang",
    label: "Tentang",
    desc: "Batasan sistem & transparansi AI",
    icon: HelpCircle,
  },
];

function HeaderInner() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    authClient
      .getSession()
      .then(({ data }) => {
        if (isMounted && data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Close mobile menu when route changes (React 19 render-time state adjustment)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border">
      {/* Top Banner Disclaimer */}
      <div className="bg-blue-50 text-brand-primary px-4 py-1 text-[11px] text-center font-medium border-b border-blue-100 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block shrink-0" />
        <span>Prototype Traspac 2027 — Informasi awal untuk navigasi hukum. Bukan pengganti nasihat advokat resmi.</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0" aria-label="Beranda HAKKU">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-xs group-hover:bg-brand-primary-hover transition-colors">
            <Scale className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-brand-text leading-none">
              HAKKU
            </span>
            <span className="text-[9px] font-semibold text-brand-muted tracking-wider uppercase">
              Digital Legal Companion
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden xl:flex items-center gap-1 text-xs font-semibold"
          aria-label="Navigasi Utama"
        >
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === "/"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            Beranda
          </Link>

          {PRIMARY_LINKS.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "bg-blue-50 text-brand-primary font-bold shadow-2xs"
                    : link.isPrimary
                    ? "text-brand-primary font-bold hover:bg-blue-50/70"
                    : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive || link.isPrimary ? "text-brand-primary" : "text-brand-muted"}`} />
                <span>{link.label}</span>
                {link.isPrimary && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand-primary text-white font-extrabold uppercase">
                    AI
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Compact Desktop Navigation for Medium Screens (lg to xl) */}
        <nav
          className="hidden lg:flex xl:hidden items-center gap-1 text-xs font-semibold"
          aria-label="Navigasi Ringkas"
        >
          <Link
            href="/pendampingan"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              pathname === "/pendampingan"
                ? "bg-blue-50 text-brand-primary font-bold shadow-2xs"
                : "text-brand-primary font-bold hover:bg-blue-50/70"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
            <span>Pendampingan</span>
          </Link>
          <Link
            href="/konsultasi"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === "/konsultasi"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            Wawancara AI
          </Link>
          <Link
            href="/kalkulator"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === "/kalkulator"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            Kalkulator
          </Link>
          <Link
            href="/dokumen"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === "/dokumen"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            Draf Surat
          </Link>
          <Link
            href="/bukti"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === "/bukti"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            Bukti
          </Link>
          <Link
            href="/rujukan"
            className={`px-2.5 py-1.5 rounded-lg transition-colors ${
              pathname === "/rujukan"
                ? "bg-blue-50 text-brand-primary font-bold"
                : "text-brand-muted hover:text-brand-text hover:bg-gray-50"
            }`}
          >
            LBH
          </Link>
        </nav>

        {/* Right: Auth & CTA */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {user ? (
            <Link
              href="/akun"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-brand-primary bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors shadow-2xs"
            >
              <User className="w-3.5 h-3.5" />
              <span>{user.name ? user.name.split(" ")[0] : "Akun"}</span>
            </Link>
          ) : (
            <Link
              href="/auth/masuk"
              className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold text-brand-text hover:text-brand-primary bg-white hover:bg-gray-50 border border-brand-border rounded-lg transition-colors shadow-2xs"
            >
              Masuk
            </Link>
          )}

          <Link
            href="/pendampingan"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Mulai Pendampingan</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden items-center gap-2">
          {user ? (
            <Link
              href="/akun"
              className="p-1.5 text-brand-primary bg-blue-50 rounded-lg border border-blue-200"
              aria-label="Akun Saya"
            >
              <User className="w-4 h-4" />
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-brand-text hover:bg-gray-50 border border-brand-border rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-colors"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            <span>Menu</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[calc(2.25rem+3.5rem)] bottom-0 z-50 bg-black/40 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white border-b border-brand-border shadow-xl max-h-[85vh] overflow-y-auto p-4 space-y-3 animate-slide-up-fade">
            {/* Quick Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">
                Pilih Fitur & Layanan Hukum
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 text-brand-muted hover:text-brand-text rounded-md"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Cards List */}
            <div className="space-y-1.5">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  pathname === "/"
                    ? "bg-blue-50 border border-blue-200 text-brand-primary"
                    : "hover:bg-gray-50 text-brand-text border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-brand-muted">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold block">Beranda</span>
                    <span className="text-[10px] text-brand-muted block">Halaman awal & pengantar masalah</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-brand-muted" />
              </Link>

              {PRIMARY_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-blue-50 border border-blue-200 text-brand-primary"
                        : link.isPrimary
                        ? "bg-blue-50/40 border border-blue-100/60 text-brand-primary hover:bg-blue-50"
                        : "hover:bg-gray-50 text-brand-text border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isActive || link.isPrimary
                            ? "bg-blue-100 text-brand-primary"
                            : "bg-gray-100 text-brand-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold ${isActive ? "text-brand-primary" : "text-brand-text"}`}>
                            {link.label}
                          </span>
                          {link.isPrimary && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brand-primary text-white font-extrabold uppercase">
                              AI
                            </span>
                          )}
                        </div>
                        {link.desc && (
                          <span className="text-[10px] text-brand-muted block line-clamp-1">
                            {link.desc}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-brand-muted shrink-0" />
                  </Link>
                );
              })}
            </div>

            {/* Mobile Footer CTAs */}
            <div className="pt-3 border-t border-brand-border space-y-2">
              {user ? (
                <Link
                  href="/akun"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-brand-primary bg-blue-50 border border-blue-200 rounded-xl min-h-[44px]"
                >
                  <User className="w-4 h-4" />
                  <span>Akun Saya ({user.name || "User"})</span>
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/auth/masuk"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-semibold text-brand-text bg-gray-50 border border-brand-border rounded-xl min-h-[44px]"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/auth/daftar"
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold text-brand-primary bg-blue-50 border border-blue-200 rounded-xl min-h-[44px]"
                  >
                    Daftar Baru
                  </Link>
                </div>
              )}

              <Link
                href="/pendampingan"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl shadow-xs min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Mulai Pendampingan 6 Tahap</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderFallback() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-border">
      <div className="bg-blue-50 text-brand-primary px-4 py-1 text-[11px] text-center font-medium border-b border-blue-100 flex items-center justify-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-primary inline-block shrink-0" />
        <span>Prototype Traspac 2027 — Informasi awal untuk navigasi hukum. Bukan pengganti nasihat advokat resmi.</span>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center text-white shadow-xs">
            <Scale className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-brand-text">HAKKU</span>
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
