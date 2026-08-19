import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/lib/supabase-server";

interface AttachmentEntry {
  path: string;
  filename: string;
  size: number;
  mime_type: string;
}

/**
 * Registra os anexos no banco após upload direto ao Supabase Storage.
 * Chamado pelo cliente após todos os PUTs concluídos com sucesso.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { contact_request_id, files } = body as Record<string, unknown>;

  if (typeof contact_request_id !== "string" || !contact_request_id) {
    return NextResponse.json({ error: "contact_request_id ausente." }, { status: 400 });
  }
  if (!Array.isArray(files) || files.length === 0) {
    return NextResponse.json({ error: "files ausente ou vazio." }, { status: 400 });
  }

  const supabase = createServerAdminClient();

  for (const file of files as AttachmentEntry[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from("contact_attachments")
      .insert({
        contact_request_id,
        filename: file.filename,
        storage_path: file.path,
        mime_type: file.mime_type,
        size_bytes: file.size,
      });

    if (error) {
      return NextResponse.json({ error: "Falha ao registrar anexo." }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
