import React from "react";
import { AlertOctagon, PhoneCall, ShieldAlert } from "lucide-react";
import { IntakeAnalysisResult } from "@/modules/intake/types";

interface SafetyAlertBannerProps {
  warning: NonNullable<IntakeAnalysisResult["safetyWarning"]>;
}

export function SafetyAlertBanner({ warning }: SafetyAlertBannerProps) {
  return (
    <div className="bg-red-50 border-2 border-brand-danger/30 rounded-xl p-5 sm:p-6 mb-6 shadow-xs animate-in fade-in duration-200">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 bg-brand-danger text-white rounded-lg shrink-0 mt-0.5">
          <AlertOctagon className="w-6 h-6" aria-hidden="true" />
        </div>
        <div className="space-y-3 flex-1">
          <div>
            <span className="text-[11px] font-bold text-brand-danger uppercase tracking-wider block">
              Peringatan Keamanan Utama
            </span>
            <h3 className="text-base sm:text-lg font-bold text-brand-text mt-0.5">
              {warning.title}
            </h3>
            <p className="text-xs sm:text-sm text-brand-text/80 leading-relaxed mt-1">
              {warning.description}
            </p>
          </div>

          {/* Hotline Contacts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {warning.recommendedHelplines.map((helpline) => (
              <div
                key={helpline.name}
                className="bg-white border border-red-200 rounded-lg p-3 space-y-1"
              >
                <div className="flex items-center gap-1.5 text-brand-danger">
                  <PhoneCall className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold">{helpline.contact}</span>
                </div>
                <h4 className="text-xs font-semibold text-brand-text">
                  {helpline.name}
                </h4>
                <p className="text-[11px] text-brand-muted leading-tight">
                  {helpline.description}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-brand-muted pt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-brand-danger shrink-0" />
            <span>
              Anda tetap dapat melanjutkan alur informasi HAKKU, namun prioritaskan keselamatan fisik Anda terlebih dahulu.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
