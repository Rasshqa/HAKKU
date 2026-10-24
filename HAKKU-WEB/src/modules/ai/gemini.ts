import { GoogleGenAI } from "@google/genai";
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

  constructor(apiKey: string, modelName: string = "gemini-3.8-flash") {
    this.apiKey = apiKey;
    this.modelName =
      !modelName || modelName.startsWith("gemini-2.0") || modelName.startsWith("gemini-1.5")
        ? "gemini-3.8-flash"
        : modelName;
    this.fallbackProvider = new MockAIProvider();
  }

  async analyzeIntake(story: string): Promise<IntakeAnalysisResult> {
    if (!this.apiKey || this.apiKey === "your_api_key_here") {
      return this.fallbackProvider.analyzeIntake(story);
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: `Analisis cerita persoalan hukum berikut dan hasilkan JSON analisis lengkap:\n\n"${story}"`,
        config: {
          systemInstruction: SYSTEM_INTAKE_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const rawText = response.text;
      if (!rawText) {
        return this.fallbackProvider.analyzeIntake(story);
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        return this.fallbackProvider.analyzeIntake(story);
      }

      if (parsedJson && typeof parsedJson === "object" && "category" in parsedJson) {
        const record = parsedJson as Record<string, unknown>;
        if (typeof record.category === "string" && !record.categoryLabel) {
          const cat = record.category as keyof typeof CATEGORY_LABELS;
          record.categoryLabel = CATEGORY_LABELS[cat] || "Perkara Hukum";
        }
      }

      const validated = IntakeAnalysisResultSchema.safeParse(parsedJson);
      if (!validated.success) {
        return this.fallbackProvider.analyzeIntake(story);
      }

      return validated.data;
    } catch (err: unknown) {
      console.warn(
        "[HAKKU AI] Falling back to rule engine:",
        err instanceof Error ? err.message : String(err)
      );
      return this.fallbackProvider.analyzeIntake(story);
    }
  }
}
