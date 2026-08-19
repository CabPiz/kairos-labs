import { NextRequest, NextResponse } from "next/server";
import { createServerAdminClient } from "@/lib/supabase-server";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/png",
  "image/jpeg",
]);
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — limite do bucket Supabase

/**
 * Gera uma presigned URL para upload direto ao Supabase Storage.
 * O binário nunca passa pelo serverless — contorna o limite de payload da Vercel.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const { contact_request_id, filename, mime_type, size } =
    body as Record<string, unknown>;

  if (typeof contact_request_id !== "string" || !contact_request_id) {
    return NextResponse.json({ error: "contact_request_id ausente." }, { status: 400 });
  }
  if (typeof filename !== "string" || !filename) {
    return NextResponse.json({ error: "filename ausente." }, { status: 400 });
  }
  if (typeof mime_type !== "string" || !ALLOWED_TYPES.has(mime_type)) {
    return NextResponse.json(
      { error: "Tipo não permitido. Aceitos: PDF, DOCX, TXT, PNG, JPG." },
      { status: 400 }
    );
  }
  if (typeof size !== "number" || size < 0 || size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Arquivo excede o limite de 10 MB." },
      { status: 400 }
    );
  }

  const ext = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")) : "";
  const storagePath = `${contact_request_id}/${crypto.randomUUID()}${ext}`;

  const supabase = createServerAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).storage
    .from("contact-attachments")
    .createSignedUploadUrl(storagePath);

  if (error || !data) {
    return NextResponse.json({ error: "Falha ao gerar URL de upload." }, { status: 500 });
  }

  return NextResponse.json({
    signed_url: data.signedUrl as string,
    token: data.token as string,
    path: storagePath,
  });
}
