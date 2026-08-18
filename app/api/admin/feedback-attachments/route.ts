import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServerAdminClient } from "@/lib/supabase-server";

/**
 * GET /api/admin/feedback-attachments?feedback_id=<uuid>
 * Lista os anexos de um feedback (apenas fundadores autenticados).
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feedbackId = req.nextUrl.searchParams.get("feedback_id");
  if (!feedbackId) {
    return NextResponse.json({ error: "feedback_id é obrigatório" }, { status: 400 });
  }

  const adminClient = createServerAdminClient();
  const { data, error } = await adminClient
    .from("feedback_attachments")
    .select("id, filename, storage_path, mime_type, size_bytes")
    .eq("feedback_id", feedbackId)
    .order("created_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ attachments: data ?? [] });
}
