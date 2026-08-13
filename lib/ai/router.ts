import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic();

type ModelTier = "fast" | "balanced";

export const MODELS: Record<ModelTier, string> = {
  fast: "claude-haiku-4-5-20251001",
  balanced: "claude-sonnet-4-5",
};

/**
 * Roteia para o modelo adequado conforme a complexidade da tarefa.
 * "classification" → haiku (rápido, barato); "analysis" → sonnet (mais capaz).
 */
export function routeModel(taskType: "classification" | "analysis"): string {
  return MODELS[taskType === "classification" ? "fast" : "balanced"];
}
