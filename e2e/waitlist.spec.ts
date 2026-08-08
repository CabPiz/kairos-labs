import { test, expect } from "@playwright/test";

const E2E_EMAIL = "contact.kairoslabs@gmail.com";

async function openWaitlistModal(page: import("@playwright/test").Page) {
  await page.goto("/solucoes/devprint");
  await page.getByRole("button", { name: /garantir acesso antecipado/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test.describe("Fluxo de Waitlist — Server Action", () => {
  test("sucesso ou duplicado: e-mail válido atinge o Supabase e retorna resultado", async ({ page }) => {
    await openWaitlistModal(page);
    await page.locator("#waitlist-email").fill(E2E_EMAIL);
    await page.getByRole("button", { name: /garantir acesso antecipado/i }).click();

    // Aceita primeira inscrição ou duplicado — ambos validam o grant RLS de INSERT
    await expect(
      page.getByText(/você está na lista|já registrado/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("erro de validação: e-mail inválido exibe mensagem sem atingir o banco", async ({ page }) => {
    await openWaitlistModal(page);
    // Desabilita validação nativa do browser para o react-hook-form/zod poder exibir sua mensagem
    await page.locator("form").evaluate((form: HTMLFormElement) => { form.noValidate = true; });
    await page.locator("#waitlist-email").fill("nao-e-um-email");
    await page.getByRole("button", { name: /garantir acesso antecipado/i }).click();

    await expect(
      page.getByText(/formato de e-mail inválido/i)
    ).toBeVisible({ timeout: 5_000 });
  });

  test("erro de validação: campo e-mail vazio exibe mensagem de obrigatoriedade", async ({ page }) => {
    await openWaitlistModal(page);
    // Submete sem preencher o campo
    await page.getByRole("button", { name: /garantir acesso antecipado/i }).click();

    await expect(
      page.getByText(/e-mail é obrigatório/i)
    ).toBeVisible({ timeout: 5_000 });
  });
});
