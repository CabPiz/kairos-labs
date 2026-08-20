import Anthropic from "@anthropic-ai/sdk";
import { google } from "@ai-sdk/google";

// Gemini — usado em extractStructured e no pipeline de contatos
export const analysisModel = google("gemini-3.6-flash");
export const fastModel = google("gemini-3.6-flash");

// Anthropic — mantido para agent.ts, /api/agent e /api/admin/analyze-feedback
export const anthropic = new Anthropic();

type ModelTier = "fast" | "balanced";

export const MODELS: Record<ModelTier, string> = {
  fast: "claude-haiku-4-5-20251001",
  balanced: "claude-sonnet-4-5",
};

export function routeModel(taskType: "classification" | "analysis"): string {
  return MODELS[taskType === "classification" ? "fast" : "balanced"];
}
