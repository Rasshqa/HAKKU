import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateLegalDocument, AVAILABLE_DOCUMENT_TEMPLATES } from "@/modules/document/generator";
import { LegalDocumentType } from "@/modules/document/types";
import { CaseCategorySchema, UrgencyLevelSchema } from "@/modules/ai/types";
import { enforceRateLimit } from "@/lib/rate-limiter";

const GenerateDocumentRequestSchema = z.object({
  type: z.enum(["bipartite_request", "somasi_warning", "legal_aid_chronology"]),
  factSummary: z.object({
    originalStory: z.string().min(1),
    category: CaseCategorySchema,
    categoryLabel: z.string().min(1),
    urgencyLevel: UrgencyLevelSchema,
    knownFacts: z.array(z.string()),
    unknownFacts: z.array(z.string()),
    clarifications: z.array(z.any()).default([]),
  }),
  customFields: z.object({
    senderName: z.string().default(""),
    senderPhone: z.string().default(""),
    senderAddress: z.string().default(""),
    recipientName: z.string().default(""),
    recipientRoleOrTitle: z.string().default(""),
    recipientAddress: z.string().default(""),
    letterCity: z.string().default("Jakarta"),
    proposedMeetingDate: z.string().optional(),
    responseDeadlineDays: z.number().default(7),
  }),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      templates: AVAILABLE_DOCUMENT_TEMPLATES,
    },
  });
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 15, hourlyLimit: 60 },
    "documents-generate"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json();
    const parseResult = GenerateDocumentRequestSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format data permohonan dokumen tidak valid.",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { type, factSummary, customFields } = parseResult.data;

    const document = generateLegalDocument(
      type as LegalDocumentType,
      factSummary,
      customFields
    );

    return NextResponse.json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error("[HAKKU Document API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal saat membuat draf dokumen hukum.",
      },
      { status: 500 }
    );
  }
}
