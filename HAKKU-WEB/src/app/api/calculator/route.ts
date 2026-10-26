import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  calculateCompensation,
  TERMINATION_REASONS,
} from "@/modules/calculator/engine";
import { enforceRateLimit } from "@/lib/rate-limiter";

const CalculateCompensationSchema = z.object({
  employmentType: z.enum(["pkwtt", "pkwt"]),
  terminationReason: z.enum([
    "efficiency_loss",
    "efficiency_prevent",
    "merger_worker_refuse",
    "merger_company_refuse",
    "bankruptcy",
    "force_majeure",
    "violation_sp3",
    "prolonged_illness",
    "retirement",
    "death",
    "resignation",
    "pkwt_end",
    "pkwt_early_employer",
  ]),
  monthlySalary: z.number().min(0).max(10_000_000_000, "Gaji bulanan maksimal Rp 10 Miliar"),
  yearsOfService: z.number().min(0).max(60),
  monthsOfService: z.number().min(0).max(11),
  unusedLeaveDays: z.number().min(0).max(365).optional().default(0),
  unpaidWagesMonths: z.number().min(0).max(120).optional().default(0),
  remainingContractMonths: z.number().min(0).max(60).optional().default(0),
  voluntarySeparationPay: z.number().min(0).max(100_000_000_000).optional().default(0),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      reasons: TERMINATION_REASONS,
    },
  });
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 30, hourlyLimit: 120 },
    "calculator-post"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json();
    const parseResult = CalculateCompensationSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format parameter kalkulator tidak valid.",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const result = calculateCompensation(parseResult.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[HAKKU Calculator API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal pada kalkulator hak normatif.",
      },
      { status: 500 }
    );
  }
}
