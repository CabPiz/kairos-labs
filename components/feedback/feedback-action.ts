"use server";

import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase-server";

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

  const supabase = await createServerSupabaseClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("feedback")
    .insert({ product_id, nome: nome ?? null, email, mensagem });

  if (error) {
    return { status: "error", message: "Não foi possível enviar a sugestão. Tente novamente." };
  }

  return { status: "success" };
}
