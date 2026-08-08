import robots from "@/app/robots";

describe("robots", () => {
  it("retorna regras para todos os user-agents", () => {
    const result = robots();
    expect(result.rules).toEqual([
      { userAgent: "*", allow: "/", disallow: "/admin" },
    ]);
  });

  it("retorna a URL do sitemap", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://kairoslabs.com.br/sitemap.xml");
  });
});
