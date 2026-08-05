import { test, expect } from "@playwright/test";

const E2E_EMAIL = "contact.kairoslabs@gmail.com";

test.describe("Fluxo de Waitlist", () => {
  test("abre modal, preenche e-mail e vê confirmação de sucesso", async ({ page }) => {
    // O botão de waitlist fica na página individual do produto
    await page.goto("/solucoes/devprint");

    const ctaButton = page.getByRole("button", { name: /garantir acesso antecipado/i });
    await ctaButton.click();

    // Modal deve estar visível
    await expect(page.getByRole("dialog")).toBeVisible();

    // Preenche o e-mail — usa o id do input para evitar ambiguidade com o link de e-mail do footer
    await page.locator("#waitlist-email").fill(E2E_EMAIL);

    // Submete o formulário
    await page.getByRole("button", { name: /garantir acesso antecipado/i }).click();

    // Verifica painel de resultado — aceita primeira inscrição ("Você está na lista!")
    // ou e-mail já cadastrado ("Já Registrado"), ambos indicam fluxo completo com sucesso
    await expect(
      page.getByText(/você está na lista|já registrado/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
