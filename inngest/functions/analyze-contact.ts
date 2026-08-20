import { inngest } from "../client";
import { tracedLLMCall } from "@/lib/ai/observe";
import { extractStructured } from "@/lib/ai/structured";
import { extractAttachmentContent } from "@/lib/ai/attachment-extractor";
import { ContactAnalysisSchema, type ContactAnalysis } from "@/lib/ai/schemas/contact-analysis";
import { createServerAdminClient } from "@/lib/supabase-server";
import { logPipelineEvent } from "@/lib/ai/pipeline-logger";
import type { Database } from "@/lib/types";

type ContactRow = Database["public"]["Tables"]["contact_requests"]["Row"];
type AttachmentRow = Database["public"]["Tables"]["contact_attachments"]["Row"];

/** Portfólio de produtos Kairos Labs usado como contexto pelo agente. */
const PRODUCT_PORTFOLIO = `
- DevPrint: plataforma de geração automática de documentação técnica via IA
- AI SaaS: suite de automações inteligentes para pequenas e médias empresas
- Audio Tech: processamento e transcrição de áudio com modelos de linguagem
- Blockchain: soluções de contratos inteligentes e rastreabilidade para supply chain
`.trim();

const SYSTEM_PROMPT = `Você é um analista de produto da Kairos Labs. Seu papel é analisar solicitações de clientes e identificar oportunidades de negócio.

Portfólio atual de produtos:
${PRODUCT_PORTFOLIO}

Ao analisar uma solicitação:
1. Identifique o problema central do cliente
2. Decida se a solução é um novo produto ou aprimoramento de um produto existente
3. Identifique MÍNIMO 2 nichos/públicos adicionais que se beneficiariam da mesma solução
4. Gere draft(s) de issue(s) prontas para criar no GitHub, em português, com título, corpo detalhado e labels

Labels disponíveis: type: feature, type: enhancement, area: ai, area: backend, area: frontend, priority: high, priority: medium, priority: low`;

/**
 * Busca uma solicitação de contato e seus anexos no banco de dados.
 * @throws {Error} Se o contato não for encontrado.
 */
export async function fetchContactWithAttachments(contactId: string): Promise<{
  contact: ContactRow;
  attachments: AttachmentRow[];
}> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: contact, error: contactError } = await (supabase as any)
    .from("contact_requests")
    .select("*")
    .eq("id", contactId)
    .single();

  if (contactError || !contact) {
    throw new Error(`Contato não encontrado: ${contactId}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attachments } = await (supabase as any)
    .from("contact_attachments")
    .select("*")
    .eq("contact_request_id", contactId);

  return { contact: contact as ContactRow, attachments: (attachments ?? []) as AttachmentRow[] };
}

/**
 * Gera signed URLs para um conjunto de anexos e extrai seu conteúdo textual.
 * Processamento paralelo; falhas individuais retornam mensagem de erro no conteúdo.
 */
export async function extractAllAttachments(
  attachments: AttachmentRow[],
): Promise<{ filename: string; content: string; mediaType?: string; base64Data?: string }[]> {
  const supabase = createServerAdminClient();

  return Promise.all(
    attachments.map(async (att) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).storage
          .from("contact-attachments")
          .createSignedUrl(att.storage_path, 120);

        if (error ?? !data?.signedUrl) {
          return { filename: att.filename, content: `[Erro ao obter URL: ${att.filename}]` };
        }

        return await extractAttachmentContent(
          (data as { signedUrl: string }).signedUrl,
          att.filename,
          att.mime_type,
        );
      } catch {
        return { filename: att.filename, content: `[Erro ao processar: ${att.filename}]` };
      }
    }),
  );
}

/**
 * Atualiza o passo atual do pipeline na linha existente de contact_analysis.
 * No-op se a linha ainda não existir (path de submissão automática).
 */
export async function updateCurrentStep(contactId: string, step: string): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_analysis")
    .update({ current_step: step })
    .eq("contact_request_id", contactId);
}

/**
 * Cria ou atualiza o registro de análise com status 'analyzing'.
 * Define current_step como 'run-product-agent' (próximo passo após este).
 */
export async function upsertAnalyzingStatus(contactId: string): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_analysis")
    .upsert(
      { contact_request_id: contactId, status: "analyzing", current_step: "run-product-agent" },
      { onConflict: "contact_request_id" },
    );
}

/**
 * Persiste o resultado da análise agêntica na tabela `contact_analysis`.
 * @throws {Error} Se o update falhar.
 */
export async function saveAnalysisResult(
  contactId: string,
  analysis: ContactAnalysis,
  attachmentsUsed: string[],
): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("contact_analysis")
    .update({
      status: "done",
      problema: analysis.problema,
      solucao_tipo: analysis.solucao_tipo,
      solucao_titulo: analysis.solucao_titulo,
      solucao_descricao: analysis.solucao_descricao,
      nichos: analysis.nichos,
      draft_issues: analysis.draft_issues,
      attachments_used: attachmentsUsed,
      error_message: null,
    })
    .eq("contact_request_id", contactId);

  if (error) throw new Error(`Erro ao salvar análise: ${error.message}`);
}

/**
 * Marca análise com status 'error' e registra a mensagem.
 */
export async function saveAnalysisError(contactId: string, message: string): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_analysis")
    .update({ status: "error", error_message: message })
    .eq("contact_request_id", contactId);
}

/**
 * Função Inngest: analisa uma solicitação de contato com IA e salva resultado estruturado.
 * Disparada pelo evento `contact/submitted` ou manualmente via `contact/analyze.requested`.
 */
export const analyzeContact = inngest.createFunction(
  {
    id: "analyze-contact",
    retries: 3,
    triggers: [
      { event: "contact/submitted" },
      { event: "contact/analyze.requested" },
    ],
    onFailure: async ({ event, error }) => {
      // Chamado após esgotar todas as retentativas — garante que o status nunca fica preso em "analyzing"
      const originalEvent = event.data.event as { data: { contactId: string } };
      const contactId = originalEvent.data.contactId;
      await logPipelineEvent(contactId, "pipeline-error", "error", {
        message: error.message,
        metadata: { errorName: error.name },
      });
      await saveAnalysisError(contactId, error.message);
    },
  },
  async ({ event, step }) => {
    const { contactId } = event.data as { contactId: string };

    const { contact, attachments } = await step.run("fetch-contact", async () => {
      const t0 = Date.now();
      await logPipelineEvent(contactId, "fetch-contact", "start");
      await updateCurrentStep(contactId, "fetch-contact");
      const result = await fetchContactWithAttachments(contactId);
      await logPipelineEvent(contactId, "fetch-contact", "success", {
        durationMs: Date.now() - t0,
        metadata: { attachmentCount: result.attachments.length },
      });
      return result;
    });

    const extracted = await step.run("extract-attachments", async () => {
      const t0 = Date.now();
      await logPipelineEvent(contactId, "extract-attachments", "start", {
        metadata: { attachmentCount: attachments.length },
      });
      await updateCurrentStep(contactId, "extract-attachments");
      const result = await extractAllAttachments(attachments);
      await logPipelineEvent(contactId, "extract-attachments", "success", {
        durationMs: Date.now() - t0,
      });
      return result;
    });

    await step.run("upsert-analyzing", async () => {
      await logPipelineEvent(contactId, "upsert-analyzing", "start");
      await upsertAnalyzingStatus(contactId);
      await logPipelineEvent(contactId, "upsert-analyzing", "success");
    });

    const analysis = await step.run("run-product-agent", async () => {
      const t0 = Date.now();
      await logPipelineEvent(contactId, "run-product-agent", "start", {
        metadata: { model: "claude-haiku-4-5-20251001", attachmentCount: attachments.length },
      });
      const result = await tracedLLMCall(
        {
          agentName: "contact-product-analyzer",
          model: "claude-haiku-4-5-20251001",
          metadata: { contactId, attachmentCount: attachments.length },
        },
        async () => {
          const attachmentContext = extracted
            .map((a) => `--- Anexo: ${a.filename} ---\n${a.content}`)
            .join("\n\n");

          const userMessage = `Solicitação do cliente:
Nome: ${contact.name}
Tipo de projeto: ${contact.project_type}
Descrição: ${contact.description}

${extracted.length > 0 ? `Conteúdo dos anexos:\n${attachmentContext}` : "Sem anexos."}`;

          const llmResult = await extractStructured(
            `${SYSTEM_PROMPT}\n\n${userMessage}`,
            ContactAnalysisSchema,
            "ContactAnalysis",
          );

          return { result: llmResult, inputTokens: 0, outputTokens: 0 };
        },
      );
      await logPipelineEvent(contactId, "run-product-agent", "success", {
        durationMs: Date.now() - t0,
      });
      return result;
    });

    await step.run("save-analysis", async () => {
      const t0 = Date.now();
      await logPipelineEvent(contactId, "save-analysis", "start");
      await updateCurrentStep(contactId, "save-analysis");
      await saveAnalysisResult(
        contactId,
        analysis,
        extracted.map((a) => a.filename),
      );
      await logPipelineEvent(contactId, "save-analysis", "success", {
        durationMs: Date.now() - t0,
      });
    });
  },
);
