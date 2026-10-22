import { NextResponse } from "next/server";
import { z } from "zod";
import {
  evaluateEvidenceReadiness,
  EVIDENCE_TYPE_LABELS,
} from "@/modules/evidence/evaluator";

const EvidenceItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string().min(1),
  type: z.enum([
    "digital_transaction",
    "digital_communication",
    "written_contract",
    "identity_document",
    "witness_testimony",
    "audio_visual",
  ]),
  dateObtained: z.string().default(""),
  description: z.string().default(""),
  weight: z.enum(["primary", "supporting", "corroborative"]),
  storageLocation: z.string().default(""),
  isAvailable: z.boolean().default(true),
});

const ChronologyEventSchema = z.object({
  id: z.string(),
  date: z.string().min(1),
  time: z.string().optional(),
  eventTitle: z.string().min(1),
  description: z.string().default(""),
  associatedEvidenceCodes: z.array(z.string()).default([]),
});

const EvidenceAuditInputSchema = z.object({
  caseTitle: z.string().min(1),
  category: z.string().default("general_dispute"),
  reporterName: z.string().default(""),
  reporterNik: z.string().optional(),
  reporterPhone: z.string().default(""),
  reporterAddress: z.string().default(""),
  reportedPartyName: z.string().default(""),
  reportedPartyContact: z.string().optional(),
  reportedPartyDetails: z.string().optional(),
  incidentLocationCity: z.string().default("Jakarta"),
  incidentDateStart: z.string().default(""),
  incidentDateEnd: z.string().optional(),
  totalLossAmount: z.number().min(0).optional(),
  events: z.array(ChronologyEventSchema).default([]),
  evidences: z.array(EvidenceItemSchema).default([]),
});

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      typeLabels: EVIDENCE_TYPE_LABELS,
    },
  });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.json();
    const parseResult = EvidenceAuditInputSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format input audit alat bukti tidak valid.",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const evaluation = evaluateEvidenceReadiness(parseResult.data);

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("[HAKKU Evidence Audit API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Terjadi kesalahan internal saat mengevaluasi kekuatan alat bukti.",
      },
      { status: 500 }
    );
  }
}
