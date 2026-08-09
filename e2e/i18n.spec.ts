import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("i18n — autodetecção de idioma", () => {
  test("browser em en → redireciona para /en e exibe textos em inglês", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "en-US",
      extraHTTPHeaders: { "Accept-Language": "en-US,en;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("h1")).toContainText("Technology");
    await context.close();
  });

  test("browser em es → redireciona para /es e exibe textos em espanhol", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "es-ES",
      extraHTTPHeaders: { "Accept-Language": "es-ES,es;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator("h1")).toContainText("Tecnología");
    await context.close();
  });

  test("idioma não suportado (ja) → fallback para /pt", async ({ browser }) => {
    const context = await browser.newContext({
      locale: "ja-JP",
      extraHTTPHeaders: { "Accept-Language": "ja-JP,ja;q=0.9" },
    });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await expect(page).toHaveURL(/\/pt/);
    await expect(page.locator("h1")).toContainText("Tecnologia");
    await context.close();
  });
});

test.describe("i18n — troca manual de idioma via seletor", () => {
  test("clicar em EN no seletor muda a URL para /en e o conteúdo para inglês", async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`);
    await page.getByRole("button", { name: /idioma/i }).click();
    await page.getByRole("option", { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en/);
    await expect(page.locator("h1")).toContainText("Technology");
  });

  test("clicar em ES no seletor muda a URL para /es e o conteúdo para espanhol", async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`);
    await page.getByRole("button", { name: /idioma/i }).click();
    await page.getByRole("option", { name: /español/i }).click();
    await expect(page).toHaveURL(/\/es/);
    await expect(page.locator("h1")).toContainText("Tecnología");
  });

  test("troca de idioma em página de produto preserva o slug na URL", async ({ page }) => {
    await page.goto(`${BASE_URL}/pt/devprint`);
    await page.getByRole("button", { name: /idioma/i }).click();
    await page.getByRole("option", { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en\/devprint/);
  });
});

test.describe("i18n — metadados e atributos HTML", () => {
  test("página /pt tem lang=pt no elemento html", async ({ page }) => {
    await page.goto(`${BASE_URL}/pt`);
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("pt");
  });

  test("página /en tem lang=en no elemento html", async ({ page }) => {
    await page.goto(`${BASE_URL}/en`);
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("página /es tem lang=es no elemento html", async ({ page }) => {
    await page.goto(`${BASE_URL}/es`);
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("es");
  });
});
