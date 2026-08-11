"use server";

import { z } from "zod";
import { createServerAdminClient } from "@/lib/supabase-server";

// ─────────────────────────────────────────────────────────────
// Schema de validação (server-side — segunda camada de defesa)
// ─────────────────────────────────────────────────────────────
const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .refine(
      (val) => { const at = val.indexOf("@"); return at > 0 && val.indexOf(".", at) > at + 1; },
      { message: "Formato de e-mail inválido." }
    ),
  product_id: z.enum([
    "devprint",
    "ai-saas",
    "audio-tech",
    "blockchain",
    "ascend",
    "elucya-talk",
    "agora-global",
    "kairos-labs",
  ]),
});

// ─────────────────────────────────────────────────────────────
// Tipos de retorno
// ─────────────────────────────────────────────────────────────
export type WaitlistActionState =
  | { status: "idle" }
  | { status: "success"; email: string }
  | { status: "duplicate" }
  | { status: "error"; message: string };

// ─────────────────────────────────────────────────────────────
// Server Action
// ─────────────────────────────────────────────────────────────
/**
 * Insere um e-mail na waitlist do produto especificado.
 * Invocada via atributo `action` de `<form>` — recebe FormData nativo.
 * Trata código 23505 (violação UNIQUE email+product_id) retornando
 * `{ status: "duplicate" }` em vez de erro genérico.
 *
 * @param formData - Campos obrigatórios: `email`, `product_id`
 * @returns Estado da operação: idle | success | duplicate | error
 */
export async function joinWaitlistAction(
  formData: FormData
): Promise<WaitlistActionState> {
  // 1. Extrair e validar os dados
  const raw = {
    email: formData.get("email"),
    product_id: formData.get("product_id"),
  };

  const parsed = waitlistSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dados inválidos.",
    };
  }

  const { email, product_id } = parsed.data;

  // 2. Inserir no Supabase
  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await (supabase as any)
.from("waitlist")
.insert({ email, product_id });

  if (error) {
    console.error("[waitlist] error:", JSON.stringify(error));
    // Código 23505 = violação de constraint UNIQUE (email + product_id)
    if (error.code === "23505") {
      return { status: "duplicate" };
    }

    return {
      status: "error",
      message: "Erro interno. Tente novamente em instantes.",
    };
  }

  return { status: "success", email };
}