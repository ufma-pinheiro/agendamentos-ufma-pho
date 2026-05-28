// tests/auth.setup.js - login com Supabase e salva storageState para os demais testes
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const authFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth/user.json');

setup('autenticar usuario de teste', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Defina TEST_EMAIL e TEST_PASSWORD no ambiente antes de rodar os testes.\n' +
      'Exemplo: TEST_EMAIL=test@ufma.br TEST_PASSWORD=senha npx playwright test'
    );
  }

  await page.goto('/login.html');

  // Preenche formulário de login (email + senha Supabase)
  await page.getByLabel(/e-mail/i).fill(email);
  await page.getByLabel(/senha/i).fill(password);
  await page.getByRole('button', { name: /entrar/i }).click();

  // Aguarda redirecionamento para a app principal
  await page.waitForURL('/', { timeout: 15_000 });
  await expect(page.locator('#sidebar')).toBeVisible();

  // Salva cookies + localStorage (sessão Supabase)
  await page.context().storageState({ path: authFile });
});
