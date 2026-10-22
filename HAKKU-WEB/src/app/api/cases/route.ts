import { NextRequest, NextResponse } from "next/server";
import { CreateCaseInputSchema } from "@/modules/db/types";
import { getCaseRepository } from "@/modules/db/repository";

export async function POST(request: NextRequest) {
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

    const parseResult = CreateCaseInputSchema.safeParse(rawBody);

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
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(Math.max(1, parseInt(limitParam, 10) || 20), 100) : 20;

    const repository = getCaseRepository();
    const cases = await repository.listCases(limit);

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
