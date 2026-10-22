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
    <div className="w-full bg-white border-b border-brand-border py-3.5 px-4 sm:px-6 shadow-2xs">
      <div className="max-w-4xl mx-auto">
        {/* Mobile View: Simple Progress Text & Bar */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-muted">
            <span>Langkah {currentStep} dari {steps.length}</span>
            <span className="text-brand-primary">{steps[currentStep - 1]?.label}</span>
          </div>
          <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-primary h-full transition-all duration-300"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Desktop View: Stepper with Icons */}
        <div className="hidden sm:flex items-center justify-between">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      isCompleted
                        ? "bg-brand-success text-white"
                        : isCurrent
                        ? "bg-brand-primary text-white ring-4 ring-brand-primary-light"
                        : "bg-gray-100 text-brand-muted border border-brand-border"
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.number}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      isCurrent
                        ? "text-brand-primary font-bold"
                        : isCompleted
                        ? "text-brand-text"
                        : "text-brand-muted"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      currentStep > step.number ? "bg-brand-success" : "bg-gray-200"
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
