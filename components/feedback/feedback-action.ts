"use server";

import { z } from "zod";
import { createServerAdminClient } from "@/lib/supabase-server";
import { translateFeedback } from "@/lib/admin/translate-feedback";
import { type Locale } from "@/i18n/routing";

const schema = z.object({
  product_id: z.string().min(1),
  nome: z.string().optional(),
  email: z.union([
    z.literal(""),
    z.string().refine(
      (val) => {
        const at = val.indexOf("@");
        return at > 0 && val.indexOf(".", at) > at + 1;
      },
      { message: "Formato de e-mail inválido." }
    ),
  ]),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  locale: z.string().optional().default("pt"),
});

export type FeedbackActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

/**
 * Registra um feedback de produto na tabela `feedback` com tradução automática.
 * Traduz o texto via Gemini antes do insert; se a tradução falhar, o insert prossegue
 * com `mensagem_traduzida: null` — o admin vê o texto original como fallback.
 * `nome` e `email` são opcionais; e-mail vazio é normalizado para `null`.
 *
 * @param formData - Campos: `product_id`, `mensagem` (mín. 10 chars), `nome`, `email`, `locale` (opcional, default "pt")
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
    locale: formData.get("locale") ?? "pt",
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first.message };
  }

  const { product_id, nome, mensagem, locale } = parsed.data;
  const email = parsed.data.email || null;

  const translations = await translateFeedback(mensagem, locale as Locale);

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("feedback")
    .insert({
      product_id,
      nome: nome ?? null,
      email,
      mensagem,
      mensagem_locale: locale,
      mensagem_traduzida: translations ?? null,
    });

  if (error) {
    return { status: "error", message: "Não foi possível enviar a sugestão. Tente novamente." };
  }

  return { status: "success" };
}
