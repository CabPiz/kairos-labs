import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/admin/feedback-attachments/signed-url?path=<storage_path>
 * Gera URL assinada (5 min) para download de anexo (apenas fundadores autenticados).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "path é obrigatório" }, { status: 400 });
  }

  const adminClient = createServerAdminClient();
  const { data, error } = await adminClient.storage
    .from("feedback-attachments")
    .createSignedUrl(path, 300);

  if (error ?? !data) {
    return NextResponse.json(
      { error: error?.message ?? "Não foi possível gerar a URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: data.signedUrl });
}
