import { chromium } from '@playwright/test';
import { mkdirSync, existsSync } from 'node:fs';

const scratchDir = 'C:/Users/Cesar/AppData/Local/Temp/claude/kairos-mobile-screenshots';
if (!existsSync(scratchDir)) mkdirSync(scratchDir, { recursive: true });

const devices = [
  { name: 'iPhone_SE', width: 375, height: 667, isMobile: true },
  { name: 'iPhone_14_Pro_Max', width: 430, height: 932, isMobile: true },
  { name: 'Pixel_8', width: 412, height: 915, isMobile: true },
  { name: 'iPad_Mini', width: 768, height: 1024, isMobile: false },
  { name: 'Surface_Pro_7', width: 912, height: 1368, isMobile: false },
];

const browser = await chromium.launch();

for (const d of devices) {
  console.log(`Capturing ${d.name}...`);
  const ctx = await browser.newContext({
    viewport: { width: d.width, height: d.height },
    isMobile: d.isMobile,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${scratchDir}/${d.name}_hero.png` });

  await page.evaluate(() => document.getElementById('sobre')?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${scratchDir}/${d.name}_sobre.png` });

  await page.evaluate(() => document.getElementById('tecnologia')?.scrollIntoView());
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${scratchDir}/${d.name}_tecnologia.png` });

  if (d.isMobile) {
    await page.reload({ waitUntil: 'networkidle' });
    const ham = page.getByRole('button', { name: 'Menu de navegação' });
    if (await ham.count() > 0) {
      await ham.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: `${scratchDir}/${d.name}_menu.png` });
    }
  }

  await ctx.close();
}

await browser.close();
console.log('Done. Screenshots at:', scratchDir);
