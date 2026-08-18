import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { createServerAdminClient } from "@/lib/supabase-server";
import { inngest } from "@/inngest/client";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 5;

function isValidEmailFormat(val: string) {
  const at = val.indexOf("@");
  return at > 0 && val.indexOf(".", at) > at + 1;
}

const bodySchema = z.object({
  product_id: z.string().min(1, "product_id é obrigatório"),
  nome: z.string().optional(),
  email: z.union([
    z.literal(""),
    z.string().refine(isValidEmailFormat, { message: "Formato de e-mail inválido." }),
  ]),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
  locale: z.string().optional().default("pt"),
  notify_on_completion: z.enum(["true", "false"]).optional().default("false"),
  notify_email: z.union([
    z.literal(""),
    z.string().refine(isValidEmailFormat, { message: "Formato de e-mail de notificação inválido." }),
  ]).optional(),
});

/**
 * POST /api/feedback — recebe multipart/form-data com campos de texto e até 5 anexos.
 * Insere o feedback na tabela `feedback` e os arquivos em `feedback_attachments` + Storage.
 */
export async function POST(req: NextRequest) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ status: "error", message: "Requisição inválida." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse({
    product_id: formData.get("product_id"),
    nome: formData.get("nome") || undefined,
    email: formData.get("email") ?? "",
    mensagem: formData.get("mensagem"),
    locale: formData.get("locale") ?? "pt",
    notify_on_completion: formData.get("notify_on_completion") ?? "false",
    notify_email: formData.get("notify_email") ?? "",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { status: "error", message: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { product_id, nome, mensagem, locale, notify_on_completion, notify_email } = parsed.data;
  const email = parsed.data.email || null;
  const notifyEmail = notify_on_completion === "true" ? (notify_email || null) : null;

  const files = (formData.getAll("attachments") as File[]).filter((f) => f.size > 0);

  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { status: "error", message: `Máximo de ${MAX_FILES} arquivos permitidos.` },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { status: "error", message: `Tipo de arquivo não permitido: ${file.name}.` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { status: "error", message: `Arquivo "${file.name}" excede o limite de 10 MB.` },
        { status: 400 },
      );
    }
  }

  const supabase = createServerAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: feedbackRow, error: feedbackError } = await (supabase as any)
    .from("feedback")
    .insert({
      product_id,
      nome: nome ?? null,
      email,
      mensagem,
      mensagem_locale: locale,
      notify_on_completion: notify_on_completion === "true",
      notify_email: notifyEmail,
    })
    .select("id")
    .single();

  if (feedbackError || !feedbackRow) {
    return NextResponse.json(
      { status: "error", message: "Não foi possível registrar o feedback. Tente novamente." },
      { status: 500 },
    );
  }

  for (const file of files) {
    const ext = file.name.split(".").pop() ?? "bin";
    const storagePath = `${feedbackRow.id}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const bytes = await file.arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from("feedback-attachments")
      .upload(storagePath, Buffer.from(bytes), { contentType: file.type });

    if (uploadError) {
      return NextResponse.json(
        { status: "error", message: `Erro ao enviar o arquivo "${file.name}". Tente novamente.` },
        { status: 500 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("feedback_attachments").insert({
      feedback_id: feedbackRow.id,
      filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      size_bytes: file.size,
    });
  }

  await inngest.send({ name: "feedback/submitted", data: { feedbackId: feedbackRow.id as string } });

  return NextResponse.json({ status: "success" });
}
