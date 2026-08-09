import { createServerSupabaseClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

/**
 * Route handler de logout do painel admin.
 * Encerra a sessão Supabase e redireciona para `/admin/login`.
 * Usar `<Link prefetch={false}>` para este handler — prefetch executaria
 * o signOut antes do clique (ver CLAUDE.md › PADRÕES SONAR › prefetch).
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"));
}
