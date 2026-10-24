import React from "react";
import type { Metadata } from "next";
import { ContractScannerWorkspace } from "@/components/contract/ContractScannerWorkspace";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Pemeriksa Klausul Kontrak Kerja & Sewa | HAKKU",
  description:
    "Periksa draf kontrak kerja (PKWT), perjanjian sewa properti, atau perjanjian pinjaman untuk mendeteksi klausul yang bertentangan dengan UU Ketenagakerjaan, PP 35/2021, dan KUHPerdata.",
};

export default function KontrakPage() {
  return (
    <div className="flex-1 flex flex-col bg-brand-bg py-8 sm:py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Breadcrumbs
            items={[
              { label: "Instrumen Hukum", href: "/pendampingan" },
              { label: "Pemeriksa Klausul Kontrak & Perjanjian" },
            ]}
          />
          <span className="text-xs font-medium text-brand-muted">
            Ketenagakerjaan · Sewa · Konsumen
          </span>
        </div>

        <ContractScannerWorkspace />
      </div>
    </div>
  );
}
