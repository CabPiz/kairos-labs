import sitemap from "@/app/sitemap";

describe("sitemap", () => {
  it("inclui a URL raiz com prioridade 1.0", () => {
    const result = sitemap();
    const root = result.find((e) => e.url === "https://kairoslabs.com.br");
    expect(root).toBeDefined();
    expect(root?.priority).toBe(1.0);
  });

  it("inclui as 6 páginas de produto com prioridade 0.8", () => {
    const slugs = [
      "devprint",
      "ascend",
      "elucya-talk",
      "agora-global",
      "talvrix",
      "kairos-labs",
    ];
    const result = sitemap();
    slugs.forEach((slug) => {
      const entry = result.find(
        (e) => e.url === `https://kairoslabs.com.br/${slug}`
      );
      expect(entry).toBeDefined();
      expect(entry?.priority).toBe(0.8);
    });
  });

  it("retorna 7 entradas no total (raiz + 6 produtos)", () => {
    expect(sitemap()).toHaveLength(7);
  });

  it("cada entrada tem lastModified como Date", () => {
    sitemap().forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });

  it("não contém URLs /solucoes (rota migrada para /<slug>)", () => {
    const result = sitemap();
    const solucoes = result.filter((e) => e.url.includes("/solucoes"));
    expect(solucoes).toHaveLength(0);
  });
});
