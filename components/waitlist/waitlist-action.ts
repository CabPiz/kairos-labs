"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { ProductId } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Schema de validação (server-side — segunda camada de defesa)
// ─────────────────────────────────────────────────────────────
const waitlistSchema = z.object({
  email: z
    .string()
    .min(1, "E-mail é obrigatório.")
    .email("Formato de e-mail inválido."),
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
  const supabase = await createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
const { error } = await (supabase as any)
.from("waitlist")
.insert({ email, product_id });

  if (error) {
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