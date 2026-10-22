import { AIProvider } from "./types";
import { GeminiAIProvider } from "./gemini";
import { MockAIProvider } from "./mock";

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) {
    return cachedProvider;
  }

  const providerType = (process.env.LLM_PROVIDER || "mock").toLowerCase().trim();
  const apiKey = process.env.LLM_API_KEY || "";
  const modelName = process.env.LLM_MODEL_NAME || "gemini-2.0-flash";

  if (providerType === "gemini") {
    cachedProvider = new GeminiAIProvider(apiKey, modelName);
  } else {
    cachedProvider = new MockAIProvider();
  }

  return cachedProvider;
}

/**
 * Reset provider cache (khusus untuk testing/mocking)
 */
export function resetAIProviderCache(): void {
  cachedProvider = null;
}
