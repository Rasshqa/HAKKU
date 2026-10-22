import { NextRequest, NextResponse } from "next/server";
import { getCaseRepository } from "@/modules/db/repository";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ idOrCode: string }> }
) {
  try {
    const { idOrCode } = await context.params;

    if (!idOrCode || idOrCode.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(idOrCode)) {
      return NextResponse.json(
        { success: false, error: "Parameter ID atau Kode Perkara tidak valid." },
        { status: 400 }
      );
    }

    const repository = getCaseRepository();
    // Cari berdasarkan kode (HK-2026-...) atau ID UUID
    let caseData = await repository.getCaseByCode(idOrCode);
    if (!caseData) {
      caseData = await repository.getCaseById(idOrCode);
    }

    if (!caseData) {
      return NextResponse.json(
        {
          success: false,
          error: "Perkara tidak ditemukan atau telah dihapus.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: caseData,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: unknown) {
    console.error("[HAKKU API] Error retrieving case:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data perkara dari server." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ idOrCode: string }> }
) {
  try {
    const { idOrCode } = await context.params;

    if (!idOrCode || idOrCode.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(idOrCode)) {
      return NextResponse.json(
        { success: false, error: "Parameter ID atau Kode Perkara tidak valid." },
        { status: 400 }
      );
    }

    const repository = getCaseRepository();
    const deleted = await repository.deleteCase(idOrCode);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Perkara tidak ditemukan atau sudah dihapus.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seluruh data perkara dan berkas terkait telah dihapus secara permanen.",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[HAKKU API] Error deleting case:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus data perkara." },
      { status: 500 }
    );
  }
}
