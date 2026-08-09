import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { width: 375, height: 812, label: "iPhone SE" },
  { width: 390, height: 844, label: "iPhone 14" },
];

for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Mobile — ${viewport.label} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("página carrega sem scroll horizontal", async ({ page }) => {
      await page.goto("/");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth);
    });

    test("CTA Explorar Soluções visível e clicável", async ({ page }) => {
      await page.goto("/");
      const cta = page.getByRole("link", { name: /explorar soluções/i });
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(44);
      expect(box!.height).toBeGreaterThan(44);
    });

    test("CTA Falar com Especialista visível e clicável", async ({ page }) => {
      await page.goto("/");
      const cta = page.getByRole("button", { name: /falar com especialista/i });
      await expect(cta).toBeVisible();
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(44);
      expect(box!.height).toBeGreaterThan(44);
    });

    test("cards de produto visíveis", async ({ page }) => {
      await page.goto("/");
      const cards = page.getByTestId("product-card");
      await expect(cards.first()).toBeVisible();
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("modal de contato abre e exibe formulário em mobile", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: /falar com especialista/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByLabel(/nome/i)).toBeVisible();
      await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    });
  });
}
