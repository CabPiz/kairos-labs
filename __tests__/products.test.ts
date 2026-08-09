import { getProducts, productNames } from "@/lib/products";

describe("getProducts", () => {
  it("retorna array com 6 produtos", () => {
    expect(getProducts()).toHaveLength(6);
  });

  it("cada produto tem os campos obrigatórios", () => {
    for (const p of getProducts()) {
      expect(p.slug).toBeTruthy();
      expect(p.nome).toBeTruthy();
      expect(p.cor).toBeTruthy();
      expect(["ativo", "breve"]).toContain(p.statusTipo);
    }
  });

  it("o primeiro produto é DevPrint (slug devprint)", () => {
    expect(getProducts()[0].slug).toBe("devprint");
  });

  it("todos os slugs são únicos", () => {
    const slugs = getProducts().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("productNames", () => {
  it("mapeia slug para nome corretamente", () => {
    expect(productNames["devprint"]).toBe("DevPrint");
    expect(productNames["ascend"]).toBe("Ascend");
    expect(productNames["kairos-labs"]).toBe("Kairos Labs");
  });

  it("tem 6 entradas correspondendo aos produtos", () => {
    expect(Object.keys(productNames)).toHaveLength(6);
  });
});
