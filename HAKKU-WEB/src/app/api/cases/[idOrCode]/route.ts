import { NextRequest, NextResponse } from "next/server";
import { getCaseRepository } from "@/modules/db/repository";
import { UpdateCaseStatusSchema } from "@/modules/db/types";

export async function GET(
  _request: NextRequest,
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

export async function PATCH(
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

    const body = await request.json().catch(() => null);
    const parsed = UpdateCaseStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Status perkara tidak valid." },
        { status: 400 }
      );
    }

    const repository = getCaseRepository();
    const updated = await repository.updateCaseStatus(idOrCode, parsed.data.status);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Perkara tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    console.error("[HAKKU API] Error updating case status:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status perkara." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
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
