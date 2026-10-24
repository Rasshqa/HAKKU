import { AIProvider } from "./types";
import { GeminiAIProvider } from "./gemini";
import { MockAIProvider } from "./mock";

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const apiKey = (process.env.GEMINI_API_KEY || process.env.LLM_API_KEY || "").trim();
  const providerEnv = (process.env.LLM_PROVIDER || "").toLowerCase().trim();
  const rawModelName = (process.env.LLM_MODEL_NAME || "").trim();
  const modelName =
    !rawModelName || rawModelName.startsWith("gemini-2.0") || rawModelName.startsWith("gemini-1.5")
      ? "gemini-3.8-flash"
      : rawModelName;

  if (providerEnv === "mock") {
    cachedProvider = new MockAIProvider();
  } else if (providerEnv === "gemini" || Boolean(apiKey)) {
    cachedProvider = new GeminiAIProvider(apiKey, modelName);
  } else {
    cachedProvider = new MockAIProvider();
  }

  return cachedProvider;
}

export function resetAIProviderCache(): void {
  cachedProvider = null;
}
