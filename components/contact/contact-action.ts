"use server";

import { z } from "zod";
import { createServerAdminClient } from "@/lib/supabase-server";
import { PROJECT_TYPES, isValidEmail } from "./contact-schema";

const schema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().min(1, "E-mail é obrigatório.").refine(
    isValidEmail,
    { message: "Formato de e-mail inválido." }
  ),
  project_type: z.enum(PROJECT_TYPES, { message: "Selecione um tipo de projeto." }),
  description: z
    .string()
    .min(1, "Descrição é obrigatória.")
    .max(500, "A descrição deve ter no máximo 500 caracteres."),
});

export type ContactActionState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export interface ContactFormData {
  name: string;
  email: string;
  project_type: string;
  description: string;
}

export async function sendContactAction(
  data: ContactFormData
): Promise<ContactActionState> {
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { status: "error", message: first.message };
  }

  const { name, email, project_type, description } = parsed.data;

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("contact_requests")
    .insert({ name, email, project_type, description });

  if (error) {
    return { status: "error", message: "Não foi possível enviar a solicitação. Tente novamente." };
  }

  return { status: "success" };
}
