import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient, createServerSupabaseClient } from "@/lib/supabase-server";
import { tracedLLMCall } from "@/lib/ai/observe";
import { IssueDraftSchema } from "@/lib/ai/schemas/issue-draft";
import { extractAttachment } from "@/lib/feedback/extract-attachments";
import { anthropic, routeModel } from "@/lib/ai/router";
import { zodToJsonSchema } from "zod-to-json-schema";
import type Anthropic from "@anthropic-ai/sdk";
import type { IssueDraftJson } from "@/lib/types";

/**
 * POST /api/admin/analyze-feedback — análise agêntica de um feedback.
 * Requer sessão de fundador. Baixa anexos, extrai conteúdo e chama Claude para
 * gerar um draft de issue pré-estruturado. Salva o resultado na tabela `feedback`.
 */
export async function POST(req: NextRequest) {
  const client = await createServerSupabaseClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { feedbackId?: string };
  if (!body.feedbackId) {
    return NextResponse.json({ error: "feedbackId é obrigatório" }, { status: 400 });
  }

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: feedback, error: feedbackError } = await (supabase as any)
    .from("feedback")
    .select("*")
    .eq("id", body.feedbackId)
    .single();

  if (feedbackError || !feedback) {
    return NextResponse.json({ error: "Feedback não encontrado" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attachments } = await (supabase as any)
    .from("feedback_attachments")
    .select("*")
    .eq("feedback_id", body.feedbackId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("feedback").update({ analysis_status: "analyzing" }).eq("id", body.feedbackId);

  const imageBlocks: Anthropic.ImageBlockParam[] = [];
  const textChunks: string[] = [];

  for (const attachment of (attachments ?? [])) {
    const { data: signedData } = await supabase.storage
      .from("feedback-attachments")
      .createSignedUrl(attachment.storage_path as string, 60);

    if (!signedData?.signedUrl) continue;

    const res = await fetch(signedData.signedUrl);
    if (!res.ok) continue;

    const buffer = Buffer.from(await res.arrayBuffer());
    const extracted = await extractAttachment(
      { filename: attachment.filename as string, mime_type: attachment.mime_type as string },
      buffer,
    );

    if (extracted.kind === "text") {
      textChunks.push(`### Anexo: ${extracted.filename}\n${extracted.content}`);
    } else {
      imageBlocks.push({
        type: "image",
        source: { type: "base64", media_type: extracted.mimeType, data: extracted.base64 },
      });
      textChunks.push(`### Anexo: ${extracted.filename} (imagem — enviada separadamente)`);
    }
  }

  const systemText = `Você é um assistente técnico analisando feedback de usuário para um produto SaaS.
Stack: Next.js 15, TypeScript, Tailwind CSS, Supabase. Produto: Kairos Labs — portal institucional com waitlist, feedback e módulo de IA.
Labels disponíveis: "type: bug", "type: feature", "area: frontend", "area: backend", "area: ai", "priority: high", "priority: medium", "priority: low".
Milestones disponíveis: M2, M3, M4, M5.`;

  const userText = `Produto: ${feedback.product_id as string}
Usuário: ${(feedback.nome as string | null) ?? "Anônimo"}
Mensagem: ${feedback.mensagem as string}

${textChunks.length > 0 ? `## Contexto dos anexos\n${textChunks.join("\n\n")}` : ""}

Classifique como bug, improvement, feature ou out-of-scope. Se válido, gere um draft de issue GitHub com título claro, body em markdown (Contexto, Comportamento Esperado, Critérios de Aceite), labels e milestone sugerida.`;

  const userContent: Anthropic.ContentBlockParam[] = [
    ...imageBlocks,
    { type: "text", text: userText },
  ];

  try {
    const draft = await tracedLLMCall<IssueDraftJson>(
      { agentName: "feedback-analyzer", model: routeModel("analysis"), metadata: { feedbackId: body.feedbackId } },
      async () => {
        const response = await anthropic.messages.create({
          model: routeModel("analysis"),
          max_tokens: 4096,
          system: systemText,
          tools: [{
            name: "issue_draft",
            description: "Draft de issue GitHub estruturado",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            input_schema: zodToJsonSchema(IssueDraftSchema as any) as Anthropic.Tool["input_schema"],
          }],
          tool_choice: { type: "tool", name: "issue_draft" },
          messages: [{ role: "user", content: userContent }],
        });

        const toolUse = response.content.find((b) => b.type === "tool_use");
        if (toolUse?.type !== "tool_use") throw new Error("LLM não retornou structured output");

        const result = IssueDraftSchema.parse(toolUse.input) as IssueDraftJson;
        return {
          result,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        };
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("feedback").update({
      analysis_status: "done",
      issue_draft: draft,
      analyzed_at: new Date().toISOString(),
    }).eq("id", body.feedbackId);

    return NextResponse.json({ status: "success", draft });
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("feedback").update({ analysis_status: "error" }).eq("id", body.feedbackId);
    return NextResponse.json({ error: "Análise falhou. Tente novamente." }, { status: 500 });
  }
}
