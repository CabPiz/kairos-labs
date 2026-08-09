"use server";

import { z } from "zod";
import { createServerAdminClient } from "@/lib/supabase-server";

const schema = z.object({
  product_id: z.string().min(1),
  nome: z.string().optional(),
  email: z.union([z.literal(""), z.string().email("Formato de e-mail inválido.")]),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

export type FeedbackActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Registra um feedback de produto na tabela `feedback`.
 * Invocada via atributo `action` de `<form>` — recebe FormData nativo.
 * `nome` e `email` são opcionais; e-mail vazio é normalizado para `null`
 * antes do insert para manter consistência no banco.
 *
 * @param formData - Campos: `product_id` (obrigatório), `mensagem` (obrigatório, mín. 10 chars), `nome` (opcional), `email` (opcional)
 * @returns Estado da operação: idle | success | error
 */
export async function sendFeedbackAction(
  formData: FormData
): Promise<FeedbackActionState> {
  const parsed = schema.safeParse({
    product_id: formData.get("product_id"),
    nome: formData.get("nome") || undefined,
    email: formData.get("email") ?? "",
    mensagem: formData.get("mensagem"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first.message };
  }

  const { product_id, nome, mensagem } = parsed.data;
  const email = parsed.data.email || null;

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("feedback")
    .insert({ product_id, nome: nome ?? null, email, mensagem });

  if (error) {
    return { status: "error", message: "Não foi possível enviar a sugestão. Tente novamente." };
  }

  return { status: "success" };
}
