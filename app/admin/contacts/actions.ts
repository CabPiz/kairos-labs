"use server";

import { createServerAdminClient } from "@/lib/supabase-server";

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
