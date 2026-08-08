import { test, expect } from "@playwright/test";

async function openFeedbackModal(page: import("@playwright/test").Page) {
  await page.goto("/solucoes/devprint");
  await page.getByRole("button", { name: /enviar sugestão/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test.describe("Fluxo de Feedback — Server Action", () => {
  test("sucesso: mensagem válida atinge o Supabase e exibe confirmação", async ({ page }) => {
    await openFeedbackModal(page);
    await page.locator("#feedback-mensagem").fill("Esta é uma sugestão de teste E2E com mais de dez caracteres.");
    await page.getByRole("button", { name: /enviar sugestão/i }).click();

    // Painel de sucesso confirma que o INSERT chegou ao banco
    await expect(
      page.getByText(/sugestão enviada/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("erro de validação: mensagem curta exibe erro sem atingir o banco", async ({ page }) => {
    await openFeedbackModal(page);
    await page.locator("#feedback-mensagem").fill("curta");
    await page.getByRole("button", { name: /enviar sugestão/i }).click();

    await expect(
      page.getByText(/pelo menos 10 caracteres/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("erro de validação: mensagem vazia bloqueia submit", async ({ page }) => {
    await openFeedbackModal(page);
    // Submete sem preencher nenhum campo obrigatório
    await page.getByRole("button", { name: /enviar sugestão/i }).click();

    await expect(
      page.getByText(/pelo menos 10 caracteres/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
