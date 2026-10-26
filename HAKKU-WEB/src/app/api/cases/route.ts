import { NextRequest, NextResponse } from "next/server";
import { CreateCaseInputSchema, CaseStatus } from "@/modules/db/types";
import { getCaseRepository } from "@/modules/db/repository";
import { getServerSessionUser } from "@/lib/auth/server";
import { enforceRateLimit } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 15, hourlyLimit: 60 },
    "cases-create"
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

    const sessionUser = await getServerSessionUser(request);
    // Cegah IDOR / user impersonation: userId harus berasal dari sesi terautentikasi
    const bodyWithUser = {
      ...rawBody,
      userId: sessionUser?.id ?? null,
    };

    const parseResult = CreateCaseInputSchema.safeParse(bodyWithUser);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi data perkara gagal.",
          details: parseResult.error.issues,
        },
        { status: 400 }
      );
    }

    const repository = getCaseRepository();
    const savedCase = await repository.createCase(parseResult.data);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: savedCase.caseRecord.id,
          caseCode: savedCase.caseRecord.caseCode,
          title: savedCase.caseRecord.title,
          status: savedCase.caseRecord.status,
          createdAt: savedCase.caseRecord.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[HAKKU API] Error saving case:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat menyimpan data perkara.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getServerSessionUser(request);
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const statusParam = (searchParams.get("status") || "all") as CaseStatus | "all";
    const categoryParam = searchParams.get("category") || "all";
    const searchQuery = searchParams.get("search") || "";
    const limit = limitParam
      ? Math.min(Math.max(1, parseInt(limitParam, 10) || 20), 100)
      : 20;

    const repository = getCaseRepository();
    const cases = await repository.listCases({
      limit,
      status: statusParam,
      category: categoryParam,
      search: searchQuery,
      userId: sessionUser?.id ?? null,
    });

    return NextResponse.json(
      {
        success: true,
        data: cases,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, must-revalidate",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[HAKKU API] Error listing cases:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan server saat memuat daftar perkara.",
      },
      { status: 500 }
    );
  }
}
