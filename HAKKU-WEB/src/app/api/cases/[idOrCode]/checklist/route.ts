import { NextRequest, NextResponse } from "next/server";
import { ToggleChecklistInputSchema } from "@/modules/db/types";
import { getCaseRepository } from "@/modules/db/repository";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ idOrCode: string }> }
) {
  try {
    const { idOrCode } = await context.params;

    if (!idOrCode || idOrCode.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(idOrCode)) {
      return NextResponse.json(
        { success: false, error: "Parameter ID perkara tidak valid." },
        { status: 400 }
      );
    }

    const rawBody = await request.json().catch(() => null);
    const parseResult = ToggleChecklistInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Payload toggle checklist tidak valid." },
        { status: 400 }
      );
    }

    const repository = getCaseRepository();
    const updated = await repository.toggleChecklistItem(
      idOrCode,
      parseResult.data.itemKey,
      parseResult.data.isCompleted
    );

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: "Perkara atau item checklist tidak ditemukan.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Status checklist berhasil diperbarui.",
    });
  } catch (error: unknown) {
    console.error("[HAKKU API] Error updating checklist:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui status checklist di server." },
      { status: 500 }
    );
  }
}
