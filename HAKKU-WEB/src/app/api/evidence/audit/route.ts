import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  evaluateEvidenceReadiness,
  EVIDENCE_TYPE_LABELS,
} from "@/modules/evidence/evaluator";
import { enforceRateLimit } from "@/lib/rate-limiter";
import { getServerSessionUser } from "@/lib/auth/server";

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
  includeSearchGrounding: z.boolean().optional(),
});

export interface GroundingSourceItem {
  title: string;
  uri: string;
}

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      typeLabels: EVIDENCE_TYPE_LABELS,
    },
  });
}

export async function POST(request: NextRequest) {
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 10, hourlyLimit: 50 },
    "evidence-audit"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

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
    let groundingSummary = "";
    const groundingSources: GroundingSourceItem[] = [];

    if (parseResult.data.includeSearchGrounding) {
      const user = await getServerSessionUser(request);
      if (!user && process.env.NODE_ENV !== "test") {
        return NextResponse.json(
          {
            success: false,
            error:
              "Fitur AI Search Grounding memerlukan login. Silakan masuk dengan akun Google terlebih dahulu.",
            requiresAuth: true,
          },
          { status: 401 }
        );
      }

      const apiKey = (process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || "").trim();
      if (apiKey && apiKey !== "your_api_key_here") {
        try {
          const ai = new GoogleGenAI({
            apiKey,
            httpOptions: {
              headers: {
                "User-Agent": "aistudio-build",
              },
            },
          });

          const evidenceListText = parseResult.data.evidences
            .map((e) => `${e.code}: ${e.title} (${e.type})`)
            .join(", ");

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Berikan ringkasan verifikasi regulasi hukum positif Indonesia terbaru dan prosedur pelaporan resmi untuk perkara "${parseResult.data.caseTitle}" (kategori: ${parseResult.data.category}) di wilayah ${parseResult.data.incidentLocationCity || "Indonesia"} dengan daftar alat bukti: ${evidenceListText || "bukti elektronik & dokumen"}. Jelaskan secara singkat dalam 3 poin praktis untuk kuasa hukum atau pelapor.`,
            config: {
              tools: [{ googleSearch: {} }],
            },
          });

          if (response.text) {
            groundingSummary = response.text.trim();
          }

          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (Array.isArray(chunks)) {
            for (const chunk of chunks) {
              if (chunk?.web?.uri && chunk?.web?.title) {
                groundingSources.push({
                  title: chunk.web.title,
                  uri: chunk.web.uri,
                });
              }
            }
          }
        } catch (err) {
          console.warn("[HAKKU Search Grounding] Fallback used:", err);
        }
      }

      if (!groundingSummary) {
        groundingSummary = `Berdasarkan Pasal 184 KUHAP jo. Pasal 5 ayat (1) dan (2) UU No. 1 Tahun 2024 tentang Perubahan Kedua UU ITE, informasi elektronik dan/atau dokumen elektronik (termasuk bukti transfer digital, tangkapan layar percakapan, dan kontrak elektronik) merupakan alat bukti hukum yang sah di pengadilan maupun SPKT Kepolisian RI.`;
        groundingSources.push(
          {
            title: "JDIH BPK RI — UU No. 1 Tahun 2024 (Perubahan Kedua UU ITE)",
            uri: "https://peraturan.bpk.go.id/Details/274494/uu-no-1-tahun-2024",
          },
          {
            title: "JDIH Mahkamah Agung RI — Direktori Putusan & Hukum Pembuktian",
            uri: "https://putusan3.mahkamahagung.go.id/",
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...evaluation,
        groundingSummary,
        groundingSources,
      },
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
