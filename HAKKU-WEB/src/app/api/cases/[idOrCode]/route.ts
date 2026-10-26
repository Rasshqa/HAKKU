import { NextRequest, NextResponse } from "next/server";
import { getCaseRepository } from "@/modules/db/repository";
import { UpdateCaseStatusSchema } from "@/modules/db/types";
import { getServerSessionUser } from "@/lib/auth/server";

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

    // BOLA/IDOR Check: Periksa apakah user memiliki akses ke perkara ini
    const sessionUser = await getServerSessionUser(request);
    if (caseData.caseRecord.userId && caseData.caseRecord.userId !== sessionUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Anda tidak memiliki izin untuk melihat perkara ini.",
        },
        { status: 403 }
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
    const existingCase =
      (await repository.getCaseByCode(idOrCode)) ||
      (await repository.getCaseById(idOrCode));

    if (!existingCase) {
      return NextResponse.json(
        { success: false, error: "Perkara tidak ditemukan." },
        { status: 404 }
      );
    }

    // BOLA/IDOR Check: Pastikan yang mengubah status adalah pemilik perkara
    const sessionUser = await getServerSessionUser(request);
    if (existingCase.caseRecord.userId && existingCase.caseRecord.userId !== sessionUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Anda tidak memiliki izin untuk mengubah status perkara ini.",
        },
        { status: 403 }
      );
    }

    const updated = await repository.updateCaseStatus(idOrCode, parsed.data.status);

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
    const existingCase =
      (await repository.getCaseByCode(idOrCode)) ||
      (await repository.getCaseById(idOrCode));

    if (!existingCase) {
      return NextResponse.json(
        {
          success: false,
          error: "Perkara tidak ditemukan atau telah dihapus.",
        },
        { status: 404 }
      );
    }

    // BOLA/IDOR Check: Hanya pemilik perkara yang berhak menghapus data (Hak Atas Penghapusan UU PDP)
    const sessionUser = await getServerSessionUser(request);
    if (existingCase.caseRecord.userId && existingCase.caseRecord.userId !== sessionUser?.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Akses ditolak. Anda tidak memiliki hak untuk menghapus perkara ini.",
        },
        { status: 403 }
      );
    }

    const deleted = await repository.deleteCase(idOrCode);

    return NextResponse.json({
      success: deleted,
      message: "Data perkara dan seluruh lampiran berhasil dihapus secara permanen.",
    });
  } catch (error: unknown) {
    console.error("[HAKKU API] Error deleting case:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menghapus perkara dari server." },
      { status: 500 }
    );
  }
}
