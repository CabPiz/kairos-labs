import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("inclui a URL raiz com prioridade 1.0", () => {
    const result = sitemap();
    const root = result.find((e) => e.url === "https://kairoslabs.com.br");
    expect(root).toBeDefined();
    expect(root?.priority).toBe(1.0);
  });

  it("inclui a URL de soluções com prioridade 0.8", () => {
    const result = sitemap();
    const solucoes = result.find(
      (e) => e.url === "https://kairoslabs.com.br/solucoes"
    );
    expect(solucoes).toBeDefined();
    expect(solucoes?.priority).toBe(0.8);
  });

  it("inclui as 5 páginas de produto com prioridade 0.7", () => {
    const slugs = [
      "devprint",
      "ascend",
      "elucya-talk",
      "agora-global",
      "kairos-labs",
    ];
    const result = sitemap();
    slugs.forEach((slug) => {
      const entry = result.find(
        (e) => e.url === `https://kairoslabs.com.br/solucoes/${slug}`
      );
      expect(entry).toBeDefined();
      expect(entry?.priority).toBe(0.7);
    });
  });

  it("retorna 7 entradas no total", () => {
    expect(sitemap()).toHaveLength(7);
  });

  it("cada entrada tem lastModified como Date", () => {
    sitemap().forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });
});
