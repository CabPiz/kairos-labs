import { inngest } from "../client";
import { runAgent } from "@/lib/ai/agent";
import { tracedLLMCall } from "@/lib/ai/observe";
import { sanitizeInput } from "@/lib/ai/guardrails";
import { contactAgentTools, executeContactTool, CONTACT_SYSTEM_PROMPT } from "@/lib/ai/tools";
import { extractStructured } from "@/lib/ai/structured";
import { ContactAnalysisSchema, type ContactAnalysis } from "@/lib/ai/schemas/contact-analysis";
import { createServerAdminClient } from "@/lib/supabase-server";

/**
 * Busca uma solicitação de contato pelo id na tabela `contact_requests`.
 * @throws {Error} Se o contato não for encontrado.
 */
export async function fetchContactFromDB(
  contactId: string,
): Promise<{ id: string; description: string; name: string; project_type: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (createServerAdminClient() as any)
    .from("contact_requests")
    .select("id, description, name, project_type")
    .eq("id", contactId)
    .single();
  if (error || !data) throw new Error(`Contato não encontrado: ${contactId}`);
  return data as { id: string; description: string; name: string; project_type: string };
}

/**
 * Grava o resultado da análise agêntica na tabela `contact_analysis`.
 * @throws {Error} Se o insert falhar.
 */
export async function saveContactAnalysis(
  contactId: string,
  analysis: ContactAnalysis,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (createServerAdminClient() as any).from("contact_analysis").insert({
    contact_request_id: contactId,
    intencao: analysis.intencao,
    urgencia: analysis.urgencia,
    resumo: analysis.resumo,
  });
  if (error) throw new Error(`Erro ao salvar análise de contato: ${error.message}`);
}

export const analyzeContact = inngest.createFunction(
  { id: "analyze-contact", retries: 3, triggers: [{ event: "contact/submitted" }] },
  async ({ event, step }) => {
    const { contactId } = event.data as { contactId: string };

    const contact = await step.run("fetch-contact", async () => {
      return fetchContactFromDB(contactId);
    });

    const analysis = await step.run("run-contact-agent", async () => {
      return tracedLLMCall(
        { agentName: "contact-analyzer", model: "claude-sonnet-4-5" },
        async () => {
          const safeMessage = sanitizeInput(contact.description);
          const { text, usage } = await runAgent(
            CONTACT_SYSTEM_PROMPT,
            safeMessage,
            contactAgentTools,
            executeContactTool,
          );
          const result = await extractStructured(text, ContactAnalysisSchema, "ContactAnalysis");
          return { result, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens };
        },
      );
    });

    await step.run("save-analysis", async () => {
      await saveContactAnalysis(contactId, analysis);
    });
  },
);
