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

test.describe("Leads da Waitlist — Tabela e Exportação CSV", () => {
  test("tabela de leads é exibida no dashboard", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByText("Leads da Waitlist")).toBeVisible();
  });

  test("cabeçalhos da tabela são exibidos", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("columnheader", { name: "E-mail" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Produto" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Data de Cadastro" })).toBeVisible();
  });

  test("botão Exportar CSV dispara download", async ({ page }) => {
    await loginAsAdmin(page);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV" }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("leads-waitlist.csv");
  });

  test("arquivo CSV baixado contém cabeçalho correto", async ({ page }) => {
    await loginAsAdmin(page);
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV" }).click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const content = Buffer.concat(chunks).toString("utf-8");
    expect(content).toContain("email,produto,data_cadastro");
  });
});
