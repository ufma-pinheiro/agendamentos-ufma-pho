// tests/auth.setup.js
// Autentica via Supabase REST API (sem UI Google OAuth) e salva storageState.
// Pré-requisito: criar usuário com email+senha no Supabase Dashboard
// (Authentication → Users → Add user) E adicionar na tabela `usuarios` com role.
import { test as setup, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const SUPABASE_URL = 'https://ibukwhlxefiyqalrooam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidWt3aGx4ZWZpeXFhbHJvb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODk1MDAsImV4cCI6MjA5MTI2NTUwMH0.8OZWvgn9GaNbzIT45frG1SGFPhsZk36vUVDdTgdbekw';
const STORAGE_KEY = 'sb-ibukwhlxefiyqalrooam-auth-token';

const authFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth/user.json');

setup('autenticar usuario de teste', async ({ page }) => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Defina TEST_EMAIL e TEST_PASSWORD antes de rodar os testes.\n' +
      'Windows: $env:TEST_EMAIL="test@ufma.br"; $env:TEST_PASSWORD="senha"; npm test\n' +
      'Linux/Mac: TEST_EMAIL=test@ufma.br TEST_PASSWORD=senha npm test'
    );
  }

  // Autentica via Supabase REST API (ignora UI Google OAuth)
  const res = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Supabase auth falhou (${res.status}): ${body}`);
  }

  const session = await res.json();

  // Injeta sessão no localStorage antes de carregar o app
  await page.addInitScript(({ key, value }) => {
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEY, value: session });

  await page.goto('/');

  // App lê getSession() do localStorage e inicializa
  await expect(page.locator('#sidebar')).toBeVisible({ timeout: 15_000 });

  // Salva storageState (localStorage + cookies) para demais testes
  await page.context().storageState({ path: authFile });
});
