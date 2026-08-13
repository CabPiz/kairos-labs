import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/lib/supabase-server";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

/**
 * Recebe arquivos de anexo de uma solicitação de contato, valida tipo/tamanho,
 * faz upload para o bucket `contact-attachments` e registra os metadados em
 * `contact_attachments`. Chamada pelo ContactModal após `sendContactAction` retornar sucesso.
 *
 * @param request - FormData com campos `contact_request_id` (string) e `files` (File[])
 * @returns 200 com `{ paths: string[] }` ou 400/500 com `{ error: string }`
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const contactRequestId = formData.get("contact_request_id");
  if (typeof contactRequestId !== "string" || !contactRequestId) {
    return NextResponse.json({ error: "contact_request_id ausente." }, { status: 400 });
  }

  const files = formData.getAll("files") as File[];
  if (files.length === 0) {
    return NextResponse.json({ paths: [] });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: `Máximo de ${MAX_FILES} arquivos por envio.` }, { status: 400 });
  }

  for (const file of files) {
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: `Tipo não permitido: ${file.name}. Aceitos: PDF, DOCX, TXT, PNG, JPG.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `${file.name} excede o limite de 10 MB.` },
        { status: 400 }
      );
    }
  }

  const supabase = createServerAdminClient();
  const paths: string[] = [];

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")) : "";
    const storagePath = `${contactRequestId}/${crypto.randomUUID()}${ext}`;
    const buffer = await file.arrayBuffer();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: uploadError } = await (supabase as any).storage
      .from("contact-attachments")
      .upload(storagePath, buffer, { contentType: file.type });

    if (uploadError) {
      return NextResponse.json({ error: "Falha no upload de anexo. Tente novamente." }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: dbError } = await (supabase as any)
      .from("contact_attachments")
      .insert({
        contact_request_id: contactRequestId,
        filename: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
      });

    if (dbError) {
      return NextResponse.json({ error: "Falha ao registrar anexo." }, { status: 500 });
    }

    paths.push(storagePath);
  }

  return NextResponse.json({ paths });
}
