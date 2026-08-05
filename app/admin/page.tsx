export const dynamic = "force-dynamic";

// TODO(#12): Proteger com middleware de autenticação Supabase
// TODO(#13, #14, #15): Implementar KPIs, Gráfico e Tabela de Leads
import { createAdminClient } from "@/lib/supabase";
import type { Database } from "@/lib/types";

type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

const productNames: Record<string, string> = {
  devprint: "DevPrint",
  ascend: "Ascend",
  "elucya-talk": "Elucya Talk",
  "agora-global": "Ágora Global",
  "kairos-labs": "Kairos Labs",
};

export default async function AdminPage() {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  const sugestoes: FeedbackRow[] = (data as FeedbackRow[] | null) ?? [];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#050a14",
        color: "#fff",
        fontFamily: "var(--font-inter), sans-serif",
        padding: "3rem 2.5rem",
      }}
    >
      <h1
        style={{
          margin: "0 0 2rem",
          fontFamily: "var(--font-orbitron), sans-serif",
          fontSize: "1.2rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#d4a017",
        }}
      >
        Founder Dashboard
      </h1>

      <section>
        <h2
          style={{
            margin: "0 0 1.25rem",
            fontSize: "0.72rem",
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          Sugestões Recebidas ({sugestoes.length})
        </h2>

        {sugestoes.length === 0 && (
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>
            Nenhuma sugestão recebida ainda.
          </p>
        )}

        {sugestoes.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxWidth: "860px" }}>
            {sugestoes.map((s) => (
              <div
                key={s.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(59,130,246,0.14)",
                  borderRadius: "10px",
                  padding: "1.25rem 1.5rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#d4a017",
                      background: "rgba(212,160,23,0.12)",
                      border: "1px solid rgba(212,160,23,0.3)",
                      borderRadius: "4px",
                      padding: "0.2rem 0.6rem",
                    }}
                  >
                    {productNames[s.product_id] ?? s.product_id}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.78rem" }}>
                    {new Date(s.created_at).toLocaleString("pt-BR")}
                  </span>
                  {s.nome && (
                    <span style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem" }}>
                      {s.nome}
                    </span>
                  )}
                  {s.email && (
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>
                      {s.email}
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.88rem",
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {s.mensagem}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

    </main>
  );
}
