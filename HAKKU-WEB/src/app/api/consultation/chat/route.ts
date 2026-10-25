import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import {
  ChatMessage,
  buildConsultationAssessment,
  SYSTEM_CONSULTATION_PROMPT,
  MAX_CONSULTATION_TURNS,
  MAX_USER_MESSAGE_LENGTH,
  MAX_CONTEXT_MESSAGES,
} from "@/modules/ai/consultation";
import { enforceRateLimit } from "@/lib/rate-limiter";
import { getServerSessionUser } from "@/lib/auth/server";

const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().optional(),
        role: z.enum(["user", "assistant", "system"]),
        content: z
          .string()
          .min(1, "Pesan tidak boleh kosong")
          .max(MAX_USER_MESSAGE_LENGTH, `Pesan maksimal ${MAX_USER_MESSAGE_LENGTH} karakter`),
        timestamp: z.string().optional(),
      })
    )
    .min(1, "Daftar pesan tidak boleh kosong")
    .max(50, "Maksimal 50 riwayat pesan"),
  mode: z.enum(["interview", "discussion"]).default("interview"),
});

export async function POST(request: NextRequest) {
  // 1. Cek autentikasi pengguna: Fitur berbasis AI wajib login
  const user = await getServerSessionUser(request);
  if (!user && process.env.NODE_ENV !== "test") {
    return NextResponse.json(
      {
        success: false,
        error:
          "Akses ditolak. Fitur Wawancara AI hanya dapat digunakan setelah masuk dengan akun Google.",
        requiresAuth: true,
      },
      { status: 401 }
    );
  }

  // 2. Rate Limiting: Max 10 req/min (burst) & 40 req/hour per client IP
  const rateLimitResponse = enforceRateLimit(
    request,
    { burstLimit: 10, hourlyLimit: 40 },
    "consultation-chat"
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const rawBody = await request.json().catch(() => null);

    const parseResult = ChatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Format request konsultasi tidak valid.",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { mode } = parseResult.data;
    const allMessages = parseResult.data.messages as ChatMessage[];
    const userMessages = allMessages.filter((m) => m.role === "user").map((m) => m.content);
    const userTurns = userMessages.length;
    const lastUserMessage = userMessages[userMessages.length - 1] || "";

    const assessment = buildConsultationAssessment(userMessages, lastUserMessage);

    // 2. Session Turn Limit: Check if user exceeded maximum turns per interview
    const isLimitExceeded = userTurns > MAX_CONSULTATION_TURNS;
    const isFinalTurn = userTurns === MAX_CONSULTATION_TURNS;
    const remainingTurns = Math.max(0, MAX_CONSULTATION_TURNS - userTurns);

    if (isLimitExceeded) {
      return NextResponse.json({
        success: true,
        data: {
          reply:
            "Sesi wawancara hukum untuk perkara ini telah mencapai batas maksimal (15 sesi tanya-jawab). Semua poin fakta penting dan analisis hukum Anda telah dipetakan di panel berkas perkara. Silakan gunakan tombol Simpan Perkara atau Cetak Draf Dokumen untuk melangkah ke tindakan nyata.",
          assessment,
          groundingSources: [],
          turnInfo: {
            currentTurn: userTurns,
            maxTurns: MAX_CONSULTATION_TURNS,
            remainingTurns: 0,
            isLimitReached: true,
          },
        },
      });
    }

    // Context sliding window: only send latest messages to Gemini SDK to drastically reduce token costs
    const contextMessages = allMessages.slice(-MAX_CONTEXT_MESSAGES);

    const apiKey = (process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || "").trim();
    const model = "gemini-3.8-flash";

    let aiReplyText = "";
    const groundingSources: { title: string; uri: string }[] = [];

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

        const contents = contextMessages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        const turnInstruction = isFinalTurn
          ? "\nPERINGATAN SISTEM: Ini adalah giliran tanya-jawab terakhir dalam wawancara ini. Buat rangkuman akhir yang utuh dan pandu warga untuk mengambil langkah penyelesaian nyata (Bipartit/Somasi)."
          : "";

        const systemWithMode = `${SYSTEM_CONSULTATION_PROMPT}\n\nMODE SAAT INI: ${
          mode === "interview"
            ? "WAWANCARA INTAKE HUKUM (Fokus menggali kronologi, pihak lawan, bukti, dan tuntutan secara runtut)"
            : "DISKUSI & PEMECAHAN MASALAH HUKUM (Fokus menjawab pertanyaan warga, membedah opsi strategi, dan mitigasi risiko)"
        }\n\nRANAH HUKUM TERDETEKSI: ${assessment.categoryLabel} (${assessment.category})\nPASAL TERKAIT: ${assessment.articlesCited.map((a) => `${a.articleLabel} - ${a.topic}`).join("; ")}${turnInstruction}`;

        const geminiRes = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: systemWithMode,
            temperature: 0.3,
            tools: [{ googleSearch: {} }],
          },
        });

        if (geminiRes.text) {
          aiReplyText = geminiRes.text;
        }

        const chunks = geminiRes.candidates?.[0]?.groundingMetadata?.groundingChunks;
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
        console.warn("[HAKKU AI] Gagal memanggil Gemini SDK, beralih ke generator lokal:", err);
      }
    }

    if (!aiReplyText) {
      aiReplyText = generateRuleBasedLegalReply(lastUserMessage, assessment, mode);
    }

    aiReplyText = sanitizeResponse(aiReplyText);

    if (isFinalTurn) {
      aiReplyText += "\n\nCatatan Paralegal: Ini adalah giliran tanya-jawab terakhir dalam sesi wawancara ini. Duduk perkara dan bukti Anda telah tercatat. Silakan simpan berkas atau gunakan tombol di bawah untuk membuat draf dokumen resmi.";
    }

    return NextResponse.json({
      success: true,
      data: {
        reply: aiReplyText,
        assessment,
        groundingSources,
        turnInfo: {
          currentTurn: userTurns,
          maxTurns: MAX_CONSULTATION_TURNS,
          remainingTurns,
          isLimitReached: isFinalTurn,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[HAKKU API] Error in consultation chat:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan internal saat memproses sesi wawancara hukum." },
      { status: 500 }
    );
  }
}

function generateRuleBasedLegalReply(
  userText: string,
  assessment: ReturnType<typeof buildConsultationAssessment>,
  mode: "interview" | "discussion"
): string {
  const primaryArticle = assessment.articlesCited[0] || {
    articleLabel: "Pasal 1365 KUHPerdata",
    topic: "Perbuatan Melawan Hukum (PMH)",
    explanation:
      "Tiap perbuatan yang melanggar hukum dan membawa kerugian kepada orang lain, mewajibkan orang yang menimbulkan kerugian tersebut untuk menggantinya.",
  };

  if (mode === "interview") {
    return `Halo, saya Hakki si Kancil. Saya telah menyimak kronologi yang Anda sampaikan. Mari kita telaah duduk perkara ini bersama-sama agar hak Anda terlindungi secara hukum.

Analisis Fakta dan Duduk Perkara
Berdasarkan fakta yang Anda sampaikan, perkara ini masuk ke dalam ranah ${assessment.categoryLabel}. Unsur perselisihan hak telah mulai terlihat, dan posisi Anda memiliki dasar yang dapat diperjuangkan.

Dasar Hukum Sah yang Melindungi Anda
- ${primaryArticle.articleLabel} (${primaryArticle.topic}): "${primaryArticle.explanation}"

Pertanyaan Wawancara Pendalaman:
Untuk memperkuat alat bukti dan menyusun surat tuntutan resmi:
1. Apakah Anda memiliki bukti tertulis (seperti surat perjanjian, bukti transfer bank, atau percakapan chat) yang membuktikan kesepakatan awal?
2. Apakah Anda sudah pernah mengirimkan teguran resmi kepada pihak lawan secara tertulis?

Rekomendasi Langkah Taktis Anda:
${assessment.recommendedAction}. Anda juga dapat menggunakan menu Cetak Draf Dokumen atau Kalkulator di panel samping untuk menghasilkan surat resmi.`;
  }

  return `Terima kasih atas pertanyaannya. Sebagai sahabat sadar hukum Anda, Hakki akan bantu menguraikan solusinya.

Jawaban dan Analisis Hukum
Mengenai hal yang Anda tanyakan: dalam ranah ${assessment.categoryLabel}, hukum Indonesia memberikan perlindungan yang tegas bagi pihak yang dirugikan.

Ketentuan Peraturan Perundang-undangan:
- ${primaryArticle.articleLabel}: Mengatur hak dan kewajiban para pihak terkait ${primaryArticle.topic}.
- Prinsip hukum melarang pihak mana pun mengambil tindakan sepihak (eigenrichting / main hakim sendiri) tanpa melalui mekanisme yang sah.

Langkah Taktis yang Dapat Anda Ambil:
1. Amankan seluruh jejak digital dan fisik: simpan rekaman, mutasi rekening koran, dan tangkapan layar chat.
2. Ajukan musyawarah atau somasi tertulis: berikan tenggat waktu yang wajar (misal 3x24 jam atau 7 hari kerja).
3. Gunakan menu Draf Surat HAKKU untuk membuat draf Somasi atau Surat Bipartit resmi yang mencantumkan pasal-pasal di atas.

Apakah ada bagian dari aturan ini yang ingin Anda tanyakan lebih mendalam?`;
}

function sanitizeResponse(text: string): string {
  let cleaned = text;
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, "");
  cleaned = cleaned.replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
  cleaned = cleaned.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}]/gu,
    ""
  );
  cleaned = cleaned.replace(/^>\s*/gm, "");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n");
  return cleaned.trim();
}
