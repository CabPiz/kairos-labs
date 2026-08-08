export const dynamic = "force-dynamic";

import { createServerAdminClient } from "@/lib/supabase-server";
import type { Database } from "@/lib/types";
import { productNames } from "@/lib/product-names";
import { KPICard } from "@/components/admin/KPICard";
import { DemandChart } from "@/components/admin/DemandChart";
import { LeadsTable } from "@/components/admin/LeadsTable";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];
type FeedbackRow = Database["public"]["Tables"]["feedback"]["Row"];

function sevenDaysAgoISO(): string {
  const ms = 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

function getMostDemandedProduct(leads: WaitlistRow[]): string {
  if (leads.length === 0) return "—";
  const counts: Record<string, number> = {};
  for (const row of leads) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return productNames[topId] ?? topId;
}

export default async function AdminPage() {
  const supabase = createServerAdminClient();

  const sevenDaysAgo = sevenDaysAgoISO();

  const { data: allLeadsData } = await supabase
    .from("waitlist")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: recentLeadsData } = await supabase
    .from("waitlist")
    .select("*")
    .gte("created_at", sevenDaysAgo);

  const { data: feedbackData } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  const allLeads: WaitlistRow[] = (allLeadsData as WaitlistRow[] | null) ?? [];
  const recentLeads: WaitlistRow[] = (recentLeadsData as WaitlistRow[] | null) ?? [];
  const sugestoes: FeedbackRow[] = (feedbackData as FeedbackRow[] | null) ?? [];

  const topProduct = getMostDemandedProduct(allLeads);

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <h1
          style={{
            margin: 0,
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
        <a
          href="/admin/logout"
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.4)",
            textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "6px",
            padding: "0.4rem 0.9rem",
          }}
        >
          Sair
        </a>
      </div>

      <section style={{ marginBottom: "3rem" }}>
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
          KPIs
        </h2>
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <KPICard
            label="Total na Waitlist"
            value={allLeads.length}
            sublabel="inscritos no geral"
          />
          <KPICard
            label="Últimos 7 dias"
            value={recentLeads.length}
            sublabel="novos inscritos"
          />
          <KPICard
            label="Maior Demanda"
            value={topProduct}
            sublabel="produto mais solicitado"
            highlight
          />
        </div>
      </section>

      <section style={{ marginBottom: "3rem" }}>
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
          Demanda por Produto
        </h2>
        <DemandChart leads={allLeads} />
      </section>

      <section style={{ marginBottom: "3rem" }}>
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
          Leads da Waitlist
        </h2>
        <LeadsTable leads={allLeads} />
      </section>

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
