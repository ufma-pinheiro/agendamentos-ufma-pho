// tests/smoke.spec.js - smoke test do golden path da aplicacao
import { test, expect } from '@playwright/test';

test.describe('Golden Path', () => {

  test('carrega pagina principal e sidebar visivel', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#sidebar')).toBeVisible();
    await expect(page.locator('#pageTitle')).toBeVisible();
  });

  test('aba Calendario carrega FullCalendar', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item[data-target="abaCalendario"]').click();
    await expect(page.locator('.fc-view-harness')).toBeVisible({ timeout: 10_000 });
  });

  test('aba Dashboard renderiza graficos', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item[data-target="abaDashboard"]').click();
    // Canvas dos graficos Chart.js deve existir
    await expect(page.locator('canvas').first()).toBeVisible({ timeout: 10_000 });
  });

  test('aba Meus Eventos carrega sem erro', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item[data-target="abaMeusEventos"]').click();
    // Container deve aparecer (vazio ou com eventos)
    await expect(page.locator('#containerMeusEventos')).toBeVisible({ timeout: 10_000 });
  });

  test('abre modal de novo agendamento', async ({ page }) => {
    await page.goto('/');
    await page.locator('#btnNovoAgendamento').click();
    await expect(page.locator('#modalFormAgendamento')).toHaveClass(/active/, { timeout: 5_000 });
    // Fecha modal
    await page.locator('#btnFecharModalForm').click();
    await expect(page.locator('#modalFormAgendamento')).not.toHaveClass(/active/);
  });

  test('troca tema claro/escuro', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const temaBefore = await html.getAttribute('data-theme');
    await page.locator('#btnToggleTheme').click();
    const temaAfter = await html.getAttribute('data-theme');
    expect(temaAfter).not.toBe(temaBefore);
    // Volta ao tema original
    await page.locator('#btnToggleTheme').click();
  });

  test('busca global filtra eventos', async ({ page }) => {
    await page.goto('/');
    const busca = page.locator('#buscaGlobal');
    await busca.fill('teste');
    // Dropdown ou calendario reage (sem erro de console)
    await page.waitForTimeout(400);
    await busca.fill('');
  });

  test('aba Ultimos Registros carrega lista', async ({ page }) => {
    await page.goto('/');
    await page.locator('.nav-item[data-target="abaUltimosRegistros"]').click();
    await expect(page.locator('#listaUltimosRegistros')).toBeVisible({ timeout: 10_000 });
  });

  test('sem erros criticos no console', async ({ page }) => {
    const erros = [];
    page.on('console', msg => {
      if (msg.type() === 'error') erros.push(msg.text());
    });
    page.on('pageerror', err => erros.push(err.message));

    await page.goto('/');
    // Aguarda carregamento completo
    await page.locator('#sidebar').waitFor({ timeout: 15_000 });
    await page.waitForTimeout(2_000);

    // Filtra erros conhecidos e inofensivos (ex: CSP reports externos)
    const criticos = erros.filter(e =>
      !e.includes('favicon') &&
      !e.includes('ERR_BLOCKED_BY_CLIENT')
    );
    expect(criticos, `Erros no console: ${criticos.join('\n')}`).toHaveLength(0);
  });

});
