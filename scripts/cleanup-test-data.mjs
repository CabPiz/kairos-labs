/**
 * Limpeza pontual de dados de teste gerados por rodadas E2E.
 * Uso: node scripts/cleanup-test-data.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error(
    "❌ Variáveis ausentes: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem estar em .env.local"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});

const TEST_EMAIL = "contact.kairoslabs@gmail.com";
const TEST_FEEDBACK_TEXT = "Esta é uma sugestão de teste E2E com mais de dez caracteres.";

async function run() {
  console.log("🧹 Iniciando limpeza de dados de teste...\n");

  const { error: waitlistError, count: waitlistCount } = await supabase
    .from("waitlist")
    .delete({ count: "exact" })
    .eq("email", TEST_EMAIL);

  if (waitlistError) {
    console.error("❌ Erro ao limpar waitlist:", waitlistError.message);
  } else {
    console.log(`✅ waitlist: ${waitlistCount ?? 0} entrada(s) removida(s) (email: ${TEST_EMAIL})`);
  }

  const { error: feedbackError, count: feedbackCount } = await supabase
    .from("feedback")
    .delete({ count: "exact" })
    .ilike("mensagem", `%${TEST_FEEDBACK_TEXT}%`);

  if (feedbackError) {
    console.error("❌ Erro ao limpar feedback:", feedbackError.message);
  } else {
    console.log(`✅ feedback: ${feedbackCount ?? 0} entrada(s) removida(s) (texto de teste E2E)`);
  }

  if (waitlistError || feedbackError) {
    process.exit(1);
  }

  console.log("\n✅ Limpeza concluída.");
}

run();
