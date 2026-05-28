// tests/css-tokens.spec.js
import { test, expect } from '@playwright/test';

test.describe('Design System Tokens', () => {

  test('--font-sans usa Inter', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sidebar').waitFor({ timeout: 15_000 });

    const fontSans = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-sans').trim()
    );
    expect(fontSans).toContain('Inter');
    expect(fontSans).not.toContain('Plus Jakarta');
  });

  test('--bg-body esta definida e nao vazia', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sidebar').waitFor({ timeout: 15_000 });

    const bgBody = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-body').trim()
    );
    expect(bgBody).toBeTruthy();
    expect(bgBody.length).toBeGreaterThan(0);
  });

  test('tokens.css carregado: --primary tem formato OKLCH "L C H"', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sidebar').waitFor({ timeout: 15_000 });

    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--primary').trim()
    );
    expect(primary).toBeTruthy();
    expect(primary).toMatch(/\d+%\s+[\d.]+\s+\d+/);
  });

  test('dark mode: --bg-body muda ao trocar tema', async ({ page }) => {
    await page.goto('/');
    await page.locator('#sidebar').waitFor({ timeout: 15_000 });

    const bgLight = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-body').trim()
    );

    await page.locator('#btnToggleTheme').click();
    await page.waitForTimeout(300);

    const bgDark = await page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue('--bg-body').trim()
    );

    expect(bgDark).not.toBe(bgLight);

    // Restaura tema original
    await page.locator('#btnToggleTheme').click();
  });

});
