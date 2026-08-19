"use server";

import { createServerAdminClient } from "@/lib/supabase-server";
import { inngest } from "@/inngest/client";
import type { Database } from "@/lib/types";

type ContactAnalysisRow = Database["public"]["Tables"]["contact_analysis"]["Row"];

/**
 * Marca uma solicitação de contato como 'visualizado'.
 * Chamada automaticamente quando o drawer de detalhe é aberto.
 *
 * @param id - UUID da solicitação de contato
 */
export async function markContactViewed(id: string): Promise<void> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_requests")
    .update({ status: "visualizado" })
    .eq("id", id)
    .eq("status", "novo");
}

/**
 * Gera uma signed URL temporária (60 s) para download de um anexo privado.
 *
 * @param storagePath - Caminho do arquivo no bucket `contact-attachments`
 * @returns URL assinada ou null em caso de erro
 */
export async function getAttachmentSignedUrl(storagePath: string): Promise<string | null> {
  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).storage
    .from("contact-attachments")
    .createSignedUrl(storagePath, 60);

  if (error ?? !data?.signedUrl) return null;
  return (data as { signedUrl: string }).signedUrl;
}

/**
 * Dispara análise agêntica de uma solicitação de contato via Inngest.
 * Cria registro `contact_analysis` com status 'pending' antes de enfileirar.
 *
 * @param contactId - UUID da solicitação de contato
 */
export async function triggerContactAnalysis(contactId: string): Promise<void> {
  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("contact_analysis")
    .upsert({ contact_request_id: contactId, status: "pending" }, { onConflict: "contact_request_id" });

  try {
    await inngest.send({ name: "contact/analyze.requested", data: { contactId } });
  } catch (err) {
    // Se o enfileiramento falhar, marca imediatamente como erro para não deixar o registro preso em "pending"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("contact_analysis")
      .update({
        status: "error",
        error_message: err instanceof Error ? err.message : "Erro ao enfileirar análise",
      })
      .eq("contact_request_id", contactId);
    throw err;
  }
}

/**
 * Busca o resultado da análise agêntica de uma solicitação de contato.
 *
 * @param contactId - UUID da solicitação de contato
 * @returns Linha de `contact_analysis` ou null se ainda não existe
 */
export async function getContactAnalysis(contactId: string): Promise<ContactAnalysisRow | null> {
  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("contact_analysis")
    .select("*")
    .eq("contact_request_id", contactId)
    .single();

  return (data as ContactAnalysisRow | null) ?? null;
}

/**
 * Cria uma issue no GitHub após revisão humana da análise agêntica.
 * Marca a solicitação como 'respondido' e salva a referência da issue.
 *
 * @param contactId - UUID da solicitação de contato
 * @param issueData - Título, corpo e labels revisados pelo fundador
 * @returns URL e número da issue criada
 * @throws {Error} Se a criação da issue falhar ou GITHUB_TOKEN não estiver configurado
 */
export async function createGitHubIssue(
  contactId: string,
  issueData: { title: string; body: string; labels: string[] },
): Promise<{ url: string; number: number }> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN não configurado");

  const response = await fetch("https://api.github.com/repos/CabPiz/kairos-labs/issues", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: issueData.title,
      body: issueData.body,
      labels: issueData.labels,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }

  const issue = (await response.json()) as { html_url: string; number: number };

  const supabase = createServerAdminClient();

  await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("contact_analysis")
      .update({ github_issue_url: issue.html_url, github_issue_number: issue.number })
      .eq("contact_request_id", contactId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("contact_requests")
      .update({ status: "respondido" })
      .eq("id", contactId),
  ]);

  return { url: issue.html_url, number: issue.number };
}
