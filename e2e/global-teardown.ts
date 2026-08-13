import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });

const TEST_EMAIL = "contact.kairoslabs@gmail.com";
const TEST_FEEDBACK_TEXT = "Esta é uma sugestão de teste E2E com mais de dez caracteres.";

/**
 * Remove dados de teste criados durante rodadas E2E.
 * Executado automaticamente pelo Playwright após todos os specs.
 */
export default async function globalTeardown() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    console.warn(
      "[teardown] Variáveis de ambiente ausentes — dados de teste não foram removidos."
    );
    return;
  }

  const supabase = createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { error: waitlistError } = await supabase
    .from("waitlist")
    .delete()
    .eq("email", TEST_EMAIL);

  if (waitlistError) {
    console.warn("[teardown] Erro ao limpar waitlist:", waitlistError.message);
  }

  const { error: feedbackError } = await supabase
    .from("feedback")
    .delete()
    .ilike("mensagem", `%${TEST_FEEDBACK_TEXT}%`);

  if (feedbackError) {
    console.warn("[teardown] Erro ao limpar feedback:", feedbackError.message);
  }
}
