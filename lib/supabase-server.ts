import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

/**
 * Cria um cliente Supabase com service_role key — bypassa RLS.
 * Usar exclusivamente para writes em Server Actions e route handlers.
 * `persistSession: false` e `autoRefreshToken: false` são obrigatórios
 * para evitar erros de armazenamento de sessão em contexto de servidor.
 */
export function createServerAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Cria um cliente Supabase com anon key, propagando os cookies da requisição.
 * Usar para leituras em Server Components e verificação de sessão.
 * O `try/catch` em `setAll` é necessário porque Server Components não podem
 * escrever cookies — a exceção é silenciada intencionalmente.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — cookies são read-only, ignorar
          }
        },
      },
    }
  );
}
