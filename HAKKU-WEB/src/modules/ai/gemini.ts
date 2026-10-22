import { AIProvider, IntakeAnalysisResultSchema } from "./types";
import { IntakeAnalysisResult } from "../intake/types";
import { SYSTEM_INTAKE_PROMPT } from "./prompts";
import { MockAIProvider } from "./mock";
import { CATEGORY_LABELS } from "../intake/analyzer";

export class GeminiAIProvider implements AIProvider {
  public readonly name = "google-gemini";
  private apiKey: string;
  private modelName: string;
  private fallbackProvider: MockAIProvider;

  constructor(apiKey: string, modelName: string = "gemini-2.0-flash") {
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.fallbackProvider = new MockAIProvider();
  }

  async analyzeIntake(story: string): Promise<IntakeAnalysisResult> {
    if (!this.apiKey || this.apiKey === "your_api_key_here") {
      console.warn("[HAKKU AI] Gemini API key not configured. Falling back to rule-based engine.");
      return this.fallbackProvider.analyzeIntake(story);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        this.modelName
      )}:generateContent?key=${this.apiKey}`;

      const requestBody = {
        systemInstruction: {
          parts: [{ text: SYSTEM_INTAKE_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analisis cerita persoalan hukum berikut dan hasilkan JSON analisis lengkap:\n\n"${story}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(15000), // 15 detik batas waktu produksi
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        console.warn(
          `[HAKKU AI] Gemini API returned status ${response.status}. Falling back to rule engine. Details: ${errorText.slice(
            0,
            200
          )}`
        );
        return this.fallbackProvider.analyzeIntake(story);
      }

      const responseData = await response.json();
      const rawText =
        responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        console.warn("[HAKKU AI] Empty response from Gemini. Falling back to rule engine.");
        return this.fallbackProvider.analyzeIntake(story);
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        console.warn("[HAKKU AI] JSON parse failed on Gemini response. Falling back to rule engine.");
        return this.fallbackProvider.analyzeIntake(story);
      }

      // Pastikan categoryLabel terisi sesuai kategori bila model tidak menyertakan
      if (parsedJson && typeof parsedJson === "object" && "category" in parsedJson) {
        const record = parsedJson as Record<string, unknown>;
        if (typeof record.category === "string" && !record.categoryLabel) {
          const cat = record.category as keyof typeof CATEGORY_LABELS;
          record.categoryLabel = CATEGORY_LABELS[cat] || "Perkara Hukum";
        }
      }

      // Validasi ketat menggunakan skema Zod
      const validated = IntakeAnalysisResultSchema.safeParse(parsedJson);
      if (!validated.success) {
        console.warn(
          "[HAKKU AI] Zod schema validation failed for Gemini output. Falling back to rule engine.",
          validated.error.issues
        );
        return this.fallbackProvider.analyzeIntake(story);
      }

      return validated.data;
    } catch (err: unknown) {
      console.warn(
        "[HAKKU AI] Network or execution error calling Gemini API. Falling back to rule engine.",
        err instanceof Error ? err.message : String(err)
      );
      return this.fallbackProvider.analyzeIntake(story);
    }
  }
}
