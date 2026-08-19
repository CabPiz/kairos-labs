import { inngest } from "../client";
import { tracedLLMCall } from "@/lib/ai/observe";
import { extractStructured } from "@/lib/ai/structured";
import { extractAttachmentContent } from "@/lib/ai/attachment-extractor";
import { ContactAnalysisSchema, type ContactAnalysis } from "@/lib/ai/schemas/contact-analysis";
import { createServerAdminClient } from "@/lib/supabase-server";
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
 * Cria ou atualiza o registro de análise com status 'analyzing'.
 */
export async function upsertAnalyzingStatus(contactId: string): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_analysis")
    .upsert({ contact_request_id: contactId, status: "analyzing" }, { onConflict: "contact_request_id" });
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
  },
  async ({ event, step }) => {
    const { contactId } = event.data as { contactId: string };

    const { contact, attachments } = await step.run("fetch-contact", async () => {
      return fetchContactWithAttachments(contactId);
    });

    const extracted = await step.run("extract-attachments", async () => {
      return extractAllAttachments(attachments);
    });

    await step.run("upsert-analyzing", async () => {
      await upsertAnalyzingStatus(contactId);
    });

    const analysis = await step.run("run-product-agent", async () => {
      return tracedLLMCall(
        {
          agentName: "contact-product-analyzer",
          model: "claude-sonnet-4-5",
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

          const result = await extractStructured(
            `${SYSTEM_PROMPT}\n\n${userMessage}`,
            ContactAnalysisSchema,
            "ContactAnalysis",
          );

          return { result, inputTokens: 0, outputTokens: 0 };
        },
      );
    });

    await step.run("save-analysis", async () => {
      await saveAnalysisResult(
        contactId,
        analysis,
        extracted.map((a) => a.filename),
      );
    });
  },
);
