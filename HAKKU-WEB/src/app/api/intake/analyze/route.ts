import { NextRequest, NextResponse } from "next/server";
import { IntakeRequestSchema } from "@/modules/ai/types";
import { getAIProvider } from "@/modules/ai/factory";
import { enforceRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 10, hourlyLimit: 50 },
    "intake-analyze"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json().catch(() => null);

    if (!rawBody) {
      return NextResponse.json(
        {
          success: false,
          error: "Format request tidak valid. Diperlukan JSON body.",
        },
        { status: 400 }
      );
    }

    const parseResult = IntakeRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMessages = parseResult.error.issues
        .map((issue) => issue.message)
        .join(", ");

      return NextResponse.json(
        {
          success: false,
          error: `Validasi gagal: ${errorMessages}`,
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const cleanedStory = parseResult.data.story.trim();

    const provider = getAIProvider();
    const analysis = await provider.analyzeIntake(cleanedStory);

    return NextResponse.json(
      {
        success: true,
        data: analysis,
        provider: provider.name,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[HAKKU API] Error processing intake analysis:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal pada server saat menganalisis cerita perkara.",
      },
      { status: 500 }
    );
  }
}
