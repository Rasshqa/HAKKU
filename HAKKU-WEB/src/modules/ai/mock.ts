import { AIProvider, IntakeAnalysisResultSchema } from "./types";
import { IntakeAnalysisResult } from "../intake/types";
import { analyzeUserStory } from "../intake/analyzer";

export class MockAIProvider implements AIProvider {
  public readonly name = "mock-rules-engine";

  async analyzeIntake(story: string): Promise<IntakeAnalysisResult> {
    const rawResult = analyzeUserStory(story);
    // Validasi skema untuk menjamin integritas output
    return IntakeAnalysisResultSchema.parse(rawResult);
  }
}
