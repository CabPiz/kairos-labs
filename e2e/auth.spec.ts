import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

test.describe("Autenticação /admin", () => {
  test("rota protegida redireciona para /admin/login sem sessão", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("página de login exibe formulário", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/login");
    await expect(page.getByRole("textbox", { name: "E-mail" })).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("credenciais inválidas exibem mensagem de erro", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/login");
    await page.getByRole("textbox", { name: "E-mail" }).fill("invalido@kairos.com");
    await page.locator("input[type='password']").fill("senhaErrada123");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("alert")).toBeVisible();
  });

  test("login com credenciais válidas acessa o dashboard", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/login");
    await page.getByRole("textbox", { name: "E-mail" }).fill(ADMIN_EMAIL);
    await page.locator("input[type='password']").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin(?!\/login)/);
    await expect(page.getByRole("heading", { name: "Founder Dashboard" })).toBeVisible();
  });

  test("usuário autenticado acessando /admin/login é redirecionado para /admin", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/login");
    await page.getByRole("textbox", { name: "E-mail" }).fill(ADMIN_EMAIL);
    await page.locator("input[type='password']").fill(ADMIN_PASSWORD);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/admin(?!\/login)/);

    await page.goto("/admin/login");
    await expect(page).toHaveURL(/\/admin(?!\/login)/, { timeout: 10_000 });
  });

  test("página de login exibe o switcher de idioma", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/admin/login");
    const toggleBtn = page.getByRole("button", { name: "Idioma" });
    await expect(toggleBtn).toBeVisible();
    await toggleBtn.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Português/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /English/ })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: /Español/ })).toBeVisible();
  });

  test("cookie NEXT_LOCALE=en faz a página de login renderizar em inglês", async ({
    browser,
  }) => {
    const ctx = await browser.newContext({
      extraHTTPHeaders: {},
    });
    await ctx.addCookies([
      { name: "NEXT_LOCALE", value: "en", domain: "localhost", path: "/" },
    ]);
    const page = await ctx.newPage();
    await page.goto("/admin/login");
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    await ctx.close();
  });
});
