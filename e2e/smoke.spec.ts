import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD!;

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.context().clearCookies();
  await page.goto("/admin/login");
  await page.getByRole("textbox", { name: "E-mail" }).fill(ADMIN_EMAIL);
  await page.locator("input[type='password']").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin(?!\/login)/);
}

test.describe("Smoke — Home", () => {
  test("landing page carrega e exibe CTA principal", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /explorar soluções/i })).toBeVisible();
  });

  test("seção de portfólio exibe cards dos produtos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("DevPrint")).toBeVisible();
    await expect(page.getByText("Ascend")).toBeVisible();
    await expect(page.getByText("Talvrix")).toBeVisible();
  });

  test("link Saiba mais leva à página individual do produto", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /saiba mais/i }).first().click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/[^/]+$/);
  });
});

test.describe("Smoke — /admin (fluxo completo)", () => {
  test("KPI cards são exibidos no dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("Total na Waitlist")).toBeVisible();
    await expect(page.getByText("Últimos 7 dias")).toBeVisible();
    await expect(page.getByText("Maior Demanda")).toBeVisible();
  });

  test("tabela de leads e exportação CSV funcionam", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("Leads da Waitlist")).toBeVisible();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("leads-waitlist.csv");
  });

  test("logout redireciona para /admin/login", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("link", { name: /sair/i }).click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
