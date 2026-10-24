import React from "react";
import { Check } from "lucide-react";

export interface StepItem {
  number: number;
  label: string;
}

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  steps: StepItem[];
}

export function StepProgress({ currentStep, steps }: StepProgressProps) {
  return (
    <div className="w-full bg-white border-b-2 border-black py-3.5 px-4 sm:px-6 print:hidden">
      <div className="max-w-5xl mx-auto">
        {/* Mobile View */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-black">
            <span>TAHAP 0{currentStep} / 0{steps.length}</span>
            <span>{steps[currentStep - 1]?.label}</span>
          </div>
          <div className="w-full bg-[#E9ECEF] h-2 rounded-full overflow-hidden border border-black">
            <div
              className="bg-[#00F0FF] h-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold transition-colors border border-black ${
                      isCompleted
                        ? "bg-black text-[#00F0FF]"
                        : isCurrent
                        ? "bg-[#00F0FF] text-black shadow-[2px_2px_0px_#000000]"
                        : "bg-[#F8F9FA] text-brand-muted border-[#E9ECEF]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : `0${step.number}`}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isCurrent
                        ? "text-black font-extrabold"
                        : isCompleted
                        ? "text-black font-semibold"
                        : "text-brand-muted font-medium"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.number ? "bg-black" : "bg-[#E9ECEF]"
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
