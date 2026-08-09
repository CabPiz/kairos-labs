import { productNames } from "@/lib/product-names";
import type { Database } from "@/lib/types";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

/**
 * Retorna o nome de exibição do produto com mais inscrições na waitlist.
 * Agrega por `product_id`, ordena por contagem decrescente e resolve o nome
 * via `productNames`. Retorna "—" se a lista estiver vazia.
 *
 * @param leads - Registros completos da tabela `waitlist`
 * @returns Nome de exibição do produto mais demandado, ou "—"
 */
export function getMostDemandedProduct(leads: WaitlistRow[]): string {
  if (leads.length === 0) return "—";
  const counts: Record<string, number> = {};
  for (const row of leads) {
    counts[row.product_id] = (counts[row.product_id] ?? 0) + 1;
  }
  const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return productNames[topId] ?? topId;
}
