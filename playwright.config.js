// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  workers: 1, // 1 worker para evitar conflito de estado de auth

  use: {
    // URL base: usar variável de ambiente ou servidor local
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    // Bypass Vercel Deployment Protection para preview URLs
    // Configurar em: Vercel Dashboard → Project → Settings → Deployment Protection
    extraHTTPHeaders: process.env.VERCEL_BYPASS_SECRET ? {
      'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_SECRET,
    } : {},
  },

  // Inicia servidor local automaticamente se TEST_BASE_URL não definida
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'npx serve -l 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 15_000,
  },

  projects: [
    // Setup: faz login e salva estado de auth
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
    },
    // Testes principais usam auth salvo
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  reporter: [['list'], ['html', { open: 'never' }]],
});
