"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Phone,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
} from "lucide-react";
import {
  VERIFIED_REFERRAL_SERVICES,
  ReferralOrganization,
} from "@/modules/referral/directory";
import { CaseCategory } from "@/modules/intake/types";
import { CATEGORY_LABELS } from "@/modules/intake/analyzer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function RujukanPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CaseCategory | "all">("all");

  const filteredServices = VERIFIED_REFERRAL_SERVICES.filter((svc) => {
    const matchesSearch =
      svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      svc.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || svc.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Bantuan Hukum", href: "/pendampingan" },
            { label: "Direktori LBH & Posbankum" },
          ]}
          className="print:hidden"
        />

        {/* Header */}
        <div className="space-y-2 border-b border-brand-border pb-6">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-brand-primary-light text-brand-primary">
              Direktori Layanan Resmi
            </span>
            <span className="flex items-center gap-1 text-xs text-brand-success font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Terverifikasi Nasional (2026)
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-text">
            Direktori Bantuan Hukum & Layanan Publik
          </h1>
          <p className="text-xs sm:text-sm text-brand-muted max-w-3xl leading-relaxed">
            Daftar institusi bantuan hukum cuma-cuma (pro bono), pos bantuan hukum pengadilan, dan kanal pengaduan resmi kementerian/lembaga negara untuk masyarakat Indonesia.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-brand-border rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama lembaga, kota, atau jenis bantuan..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-brand-text bg-white border border-brand-border rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-semibold text-brand-muted flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Filter Ranah Masalah:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-brand-primary text-white"
                    : "bg-gray-100 text-brand-muted hover:bg-gray-200"
                }`}
              >
                Semua Layanan ({VERIFIED_REFERRAL_SERVICES.length})
              </button>

              {(Object.keys(CATEGORY_LABELS) as CaseCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-brand-primary text-white"
                      : "bg-gray-100 text-brand-muted hover:bg-gray-200"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Referral Organizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredServices.length === 0 ? (
            <div className="md:col-span-2 text-center py-12 bg-white rounded-xl border border-brand-border space-y-2">
              <Building2 className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-semibold text-brand-text">
                Tidak ada layanan yang cocok dengan pencarian Anda.
              </p>
              <p className="text-xs text-brand-muted">
                Coba gunakan kata kunci yang lebih umum atau pilih filter &quot;Semua Layanan&quot;.
              </p>
            </div>
          ) : (
            filteredServices.map((svc: ReferralOrganization) => (
              <div
                key={svc.id}
                className="bg-white border border-brand-border rounded-xl p-5 space-y-3.5 flex flex-col justify-between hover:border-brand-primary transition-all shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-brand-primary">
                      {svc.serviceType}
                    </span>
                    <span className="text-xs text-brand-success font-semibold">
                      {svc.feePolicy}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-brand-text">
                    {svc.name}
                  </h2>

                  <p className="text-xs text-brand-muted leading-relaxed">
                    {svc.description}
                  </p>

                  <div className="text-xs text-brand-text/80 space-y-1 pt-1">
                    <div>
                      <strong>Cakupan Wilayah:</strong> {svc.jurisdiction}
                    </div>
                    {svc.addressSummary && (
                      <div className="text-[11px] text-brand-muted">
                        <strong>Alamat:</strong> {svc.addressSummary}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between text-xs">
                  {svc.phone ? (
                    <div className="flex items-center gap-1.5 text-brand-text font-mono text-xs">
                      <Phone className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                      <span>{svc.phone}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-brand-muted">Portal Aduan Online</span>
                  )}

                  <a
                    href={svc.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-brand-primary hover:text-brand-primary-hover"
                  >
                    <span>Situs Resmi</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating / Bottom CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-white border border-brand-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-brand-text">
              Belum yakin layanan mana yang paling tepat untuk masalah Anda?
            </h3>
            <p className="text-xs text-brand-muted">
              Gunakan fitur pendampingan HAKKU untuk mengidentifikasi persoalan dan mendapatkan rekomendasi rujukan terarah.
            </p>
          </div>
          <Link
            href="/pendampingan"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-lg transition-colors shrink-0 shadow-sm min-touch-target"
          >
            <span>Mulai Pendampingan</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
