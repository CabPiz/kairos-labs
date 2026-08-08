"use client";

import { useState } from "react";
import type { Database } from "@/lib/types";
import { productNames } from "@/lib/product-names";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

interface Props {
  readonly leads: WaitlistRow[];
}

const PAGE_SIZE = 10;

function buildCsv(leads: WaitlistRow[]): string {
  const header = "email,produto,data_cadastro";
  const rows = leads.map((l) => {
    const date = new Date(l.created_at).toLocaleString("pt-BR");
    const product = productNames[l.product_id] ?? l.product_id;
    return `${l.email},${product},${date}`;
  });
  return [header, ...rows].join("\n");
}

function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const cellStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.84rem",
  color: "rgba(255,255,255,0.75)",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
};

const headerCellStyle: React.CSSProperties = {
  padding: "0.6rem 1rem",
  fontSize: "0.68rem",
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase" as const,
  color: "rgba(255,255,255,0.35)",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  textAlign: "left" as const,
};

export function LeadsTable({ leads }: Props) {
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(leads.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const slice = leads.slice(start, start + PAGE_SIZE);

  function handleExport() {
    const csv = buildCsv(leads);
    downloadCsv(csv, "leads-waitlist.csv");
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
          {leads.length} lead{leads.length !== 1 ? "s" : ""} no total
        </span>
        <button
          type="button"
          onClick={handleExport}
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#d4a017",
            background: "rgba(212,160,23,0.1)",
            border: "1px solid rgba(212,160,23,0.3)",
            borderRadius: "6px",
            padding: "0.45rem 1rem",
            cursor: "pointer",
          }}
        >
          Exportar CSV
        </button>
      </div>

      {leads.length === 0 && (
        <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.88rem" }}>
          Nenhum lead cadastrado ainda.
        </p>
      )}

      {leads.length > 0 && (
        <>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "10px",
              }}
            >
              <thead>
                <tr>
                  <th style={headerCellStyle}>E-mail</th>
                  <th style={headerCellStyle}>Produto</th>
                  <th style={headerCellStyle}>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((lead) => (
                  <tr key={lead.id}>
                    <td style={cellStyle}>{lead.email}</td>
                    <td style={cellStyle}>
                      {productNames[lead.product_id] ?? lead.product_id}
                    </td>
                    <td style={{ ...cellStyle, color: "rgba(255,255,255,0.4)" }}>
                      {new Date(lead.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginTop: "1rem",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: page === 0 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  padding: "0.35rem 0.8rem",
                  cursor: page === 0 ? "not-allowed" : "pointer",
                }}
              >
                Anterior
              </button>
              <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)" }}>
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages - 1}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: page === totalPages - 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  padding: "0.35rem 0.8rem",
                  cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
                }}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
