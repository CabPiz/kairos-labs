import { test, expect } from "@playwright/test";

async function openContactModal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.locator("#contato").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: /formulário de contato/i }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test.describe("Fluxo de Contato — Modal Formulário de Contato", () => {
  test("abre o modal ao clicar no card de formulário na seção de contato", async ({ page }) => {
    await openContactModal(page);
    await expect(page.getByText(/vamos conversar sobre seu projeto/i)).toBeVisible();
  });

  test("sucesso: formulário válido atinge o Supabase e exibe confirmação", async ({ page }) => {
    await openContactModal(page);

    await page.locator("#contact-name").fill("César Pizarro");
    await page.locator("#contact-email").fill("cesar@exemplo.com");
    await page.locator("#contact-project-type").selectOption("Consultoria Técnica");
    await page.locator("#contact-description").fill(
      "Preciso de uma consultoria para arquitetura de sistema de pagamentos com Next.js e Supabase."
    );

    await page.getByRole("button", { name: /enviar mensagem/i }).click();

    await expect(
      page.getByText(/mensagem enviada/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test("erro de validação: campos vazios exibem mensagens de erro sem atingir o banco", async ({ page }) => {
    await openContactModal(page);
    await page.getByRole("button", { name: /enviar mensagem/i }).click();

    await expect(page.getByText(/nome é obrigatório/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/e-mail é obrigatório/i)).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/descrição é obrigatória/i)).toBeVisible({ timeout: 5_000 });
  });

  test("sucesso: formulário com anexo faz upload direto e exibe confirmação", async ({ page }) => {
    await openContactModal(page);

    await page.locator("#contact-name").fill("César Pizarro");
    await page.locator("#contact-email").fill("cesar@exemplo.com");
    await page.locator("#contact-project-type").selectOption("Consultoria Técnica");
    await page.locator("#contact-description").fill(
      "Teste de upload direto via presigned URL para arquivo de até 10 MB."
    );

    await page.locator("#contact-files").setInputFiles({
      name: "teste-anexo.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("conteúdo de teste para upload direto"),
    });

    await page.getByRole("button", { name: /enviar mensagem/i }).click();

    await expect(
      page.getByText(/mensagem enviada/i)
    ).toBeVisible({ timeout: 20_000 });
  });

  test("fecha e reseta o formulário ao clicar em Fechar após sucesso", async ({ page }) => {
    await openContactModal(page);

    await page.locator("#contact-name").fill("César Pizarro");
    await page.locator("#contact-email").fill("cesar@exemplo.com");
    await page.locator("#contact-description").fill(
      "Preciso de uma consultoria para arquitetura de sistema de pagamentos."
    );
    await page.getByRole("button", { name: /enviar mensagem/i }).click();

    await expect(page.getByText(/mensagem enviada/i)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /fechar/i }).click();

    await expect(page.getByRole("dialog")).not.toBeVisible();

    // Ao reabrir, o formulário deve estar limpo
    await page.getByRole("button", { name: /formulário de contato/i }).click();
    await expect(page.locator("#contact-name")).toHaveValue("");
    await expect(page.locator("#contact-email")).toHaveValue("");
    await expect(page.locator("#contact-description")).toHaveValue("");
  });
});
