import { NextRequest, NextResponse } from "next/server";
import { AnalyzeContractInputSchema } from "@/modules/contract/types";
import { analyzeContractClauses } from "@/modules/contract/analyzer";
import { enforceRateLimit } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    req,
    { burstLimit: 15, hourlyLimit: 60 },
    "contract-analyze"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await req.json();
    const parsed = AnalyzeContractInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            parsed.error.issues[0]?.message ||
            "Input teks kontrak tidak valid.",
        },
        { status: 400 }
      );
    }

    const { contractType, contractText } = parsed.data;
    const result = analyzeContractClauses(contractType, contractText);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[POST /api/contract/analyze] Error:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan saat menganalisis klausul kontrak.",
      },
      { status: 500 }
    );
  }
}
