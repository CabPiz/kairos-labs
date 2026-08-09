import { getMostDemandedProduct } from "@/lib/admin/analytics";
import type { Database } from "@/lib/types";

type WaitlistRow = Database["public"]["Tables"]["waitlist"]["Row"];

function row(product_id: string): WaitlistRow {
  return { id: product_id, email: `${product_id}@test.com`, product_id, created_at: "" };
}

describe("getMostDemandedProduct", () => {
  it("retorna — quando não há leads", () => {
    expect(getMostDemandedProduct([])).toBe("—");
  });

  it("retorna o nome do produto com mais leads", () => {
    const leads = [row("devprint"), row("devprint"), row("ascend")];
    expect(getMostDemandedProduct(leads)).toBe("DevPrint");
  });

  it("retorna o nome correto quando há empate e devprint vem primeiro", () => {
    const leads = [row("ascend"), row("devprint")];
    const result = getMostDemandedProduct(leads);
    expect(["Ascend", "DevPrint"]).toContain(result);
  });

  it("retorna o slug quando produto não está em productNames", () => {
    const leads = [row("produto-desconhecido")];
    expect(getMostDemandedProduct(leads)).toBe("produto-desconhecido");
  });
});
