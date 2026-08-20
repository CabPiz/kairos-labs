import { inngest } from "../client";
import { runAgent } from "@/lib/ai/agent";
import { tracedLLMCall } from "@/lib/ai/observe";
import { sanitizeInput } from "@/lib/ai/guardrails";
import { feedbackAgentTools, executeFeedbackTool, FEEDBACK_SYSTEM_PROMPT } from "@/lib/ai/tools";
import { extractStructured } from "@/lib/ai/structured";
import { FeedbackAnalysisSchema, type FeedbackAnalysis } from "@/lib/ai/schemas/feedback-analysis";
import { createServerAdminClient } from "@/lib/supabase-server";

/**
 * Busca um registro de feedback pelo id na tabela `feedback`.
 * @throws {Error} Se o feedback não for encontrado.
 */
export async function fetchFeedbackFromDB(
  feedbackId: string,
): Promise<{ id: string; mensagem: string; product_id: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createServerAdminClient() as any)
    .from("feedback")
    .select("id, mensagem, product_id")
    .eq("id", feedbackId)
    .single();
  if (error || !data) throw new Error(`Feedback não encontrado: ${feedbackId}`);
  return data as { id: string; mensagem: string; product_id: string };
}

/**
 * Grava o resultado da análise agêntica na tabela `feedback`.
 * Atualiza `analysis_status`, `sentiment_analysis` e `analyzed_at`.
 * @throws {Error} Se o update falhar.
 */
export async function saveFeedbackAnalysis(
  feedbackId: string,
  analysis: FeedbackAnalysis,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (createServerAdminClient() as any)
    .from("feedback")
    .update({
      analysis_status: "done",
      sentiment_analysis: analysis,
      analyzed_at: new Date().toISOString(),
    })
    .eq("id", feedbackId);
  if (error) throw new Error(`Erro ao salvar análise de feedback: ${error.message}`);
}

export const analyzeFeedback = inngest.createFunction(
  { id: "analyze-feedback", retries: 3, triggers: [{ event: "feedback/submitted" }] },
  async ({ event, step }) => {
    const { feedbackId } = event.data as { feedbackId: string };

    const feedback = await step.run("fetch-feedback", async () => {
      return fetchFeedbackFromDB(feedbackId);
    });

    const analysis = await step.run("run-feedback-agent", async () => {
      return tracedLLMCall(
        { agentName: "feedback-analyzer", model: "claude-sonnet-4-5" },
        async () => {
          const safeMessage = sanitizeInput(feedback.mensagem);
          const { text, usage } = await runAgent(
            FEEDBACK_SYSTEM_PROMPT,
            safeMessage,
            feedbackAgentTools,
            executeFeedbackTool,
          );
          const result = await extractStructured(text, FeedbackAnalysisSchema);
          return { result, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens };
        },
      );
    });

    await step.run("save-analysis", async () => {
      await saveFeedbackAnalysis(feedbackId, analysis);
    });
  },
);
