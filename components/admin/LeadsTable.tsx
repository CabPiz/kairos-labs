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
      <div className="flex items-center justify-between mb-4">
        <span className="text-[0.8rem] text-white/35">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} no total
        </span>
        <button
          type="button"
          onClick={handleExport}
          className="text-xs font-bold tracking-[0.1em] uppercase text-[#d4a017] bg-[rgba(212,160,23,0.1)] border border-[rgba(212,160,23,0.3)] rounded-[6px] px-4 py-[0.45rem] cursor-pointer"
        >
          Exportar CSV
        </button>
      </div>

      {leads.length === 0 && (
        <p className="text-white/35 text-[0.88rem]">
          Nenhum lead cadastrado ainda.
        </p>
      )}

      {leads.length > 0 && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white/[0.02] border border-white/[0.07] rounded-[10px]">
              <thead>
                <tr>
                  <th className="px-4 py-[0.6rem] text-[0.68rem] font-bold tracking-[0.16em] uppercase text-white/35 border-b border-white/10 text-left">
                    E-mail
                  </th>
                  <th className="px-4 py-[0.6rem] text-[0.68rem] font-bold tracking-[0.16em] uppercase text-white/35 border-b border-white/10 text-left">
                    Produto
                  </th>
                  <th className="px-4 py-[0.6rem] text-[0.68rem] font-bold tracking-[0.16em] uppercase text-white/35 border-b border-white/10 text-left">
                    Data de Cadastro
                  </th>
                </tr>
              </thead>
              <tbody>
                {slice.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-4 py-3 text-[0.84rem] text-white/75 border-b border-white/[0.06]">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] text-white/75 border-b border-white/[0.06]">
                      {productNames[lead.product_id] ?? lead.product_id}
                    </td>
                    <td className="px-4 py-3 text-[0.84rem] text-white/40 border-b border-white/[0.06]">
                      {new Date(lead.created_at).toLocaleString("pt-BR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-4 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 0}
                className={`text-xs font-semibold bg-transparent border border-white/[0.12] rounded-[6px] py-[0.35rem] px-[0.8rem] ${page === 0 ? "text-white/20 cursor-not-allowed" : "text-white/60 cursor-pointer"}`}
              >
                Anterior
              </button>
              <span className="text-[0.78rem] text-white/35">
                {page + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages - 1}
                className={`text-xs font-semibold bg-transparent border border-white/[0.12] rounded-[6px] py-[0.35rem] px-[0.8rem] ${page === totalPages - 1 ? "text-white/20 cursor-not-allowed" : "text-white/60 cursor-pointer"}`}
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
