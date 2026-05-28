# Design System shadcn (OKLCH) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrar o design system para tokens OKLCH shadcn-style com compat layer, adotando nova paleta de cores e fonte Inter sem alterar os 21 arquivos de componente CSS.

**Architecture:** `css/tokens.css` é a fonte de verdade (valores OKLCH, light + dark). `css/variaveis-tema.css` vira compat layer mapeando os nomes antigos para `oklch(var(--novo))`. Os 21 arquivos de componente não são tocados. Dark mode funciona automaticamente via CSS cascade.

**Tech Stack:** CSS custom properties (OKLCH), sem build step, Playwright para validação.

**Spec:** `docs/superpowers/specs/2026-05-28-design-system-shadcn.md`

---

## Mapa de arquivos

| Arquivo | Ação |
|---------|------|
| `tests/css-tokens.spec.js` | Criar — testes TDD (falham antes, passam depois) |
| `css/tokens.css` | Reescrita completa (fonte de verdade OKLCH) |
| `css/variaveis-tema.css` | Reescrita completa (compat layer) |
| `index.html` | Atualizar fonte Google Fonts + adicionar link tokens.css |
| `login.html` | Atualizar fonte Google Fonts + adicionar link tokens.css |

---

## Task 1: Testes CSS tokens (TDD — escrever antes de implementar)

**Files:**
- Create: `tests/css-tokens.spec.js`

- [ ] **Step 1: Criar arquivo de teste**

```javascript
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
```

- [ ] **Step 2: Rodar testes — devem FALHAR**

```bash
TEST_EMAIL="test@ufma.br" TEST_PASSWORD="123123" npx playwright test tests/css-tokens.spec.js --reporter=list
```

Expected: os 4 testes falham.
- `--font-sans usa Inter` falha porque `--font-sans` ainda contém `Plus Jakarta Sans`.
- `--primary tem formato OKLCH` falha porque `tokens.css` não está linkado no HTML.
- Se algum passar antes da implementação, algo já estava configurado — anote e continue.

---

## Task 2: Reescrever `css/tokens.css`

**Files:**
- Modify: `css/tokens.css` (rewrite completo)

NÃO incluir `@import` de fonte — fonte é carregada pelo `<link>` no HTML. @import em CSS causa waterfall de requests.

- [ ] **Step 1: Substituir conteúdo completo**

```css
/* css/tokens.css - Design System UFMA shadcn-style (OKLCH) */

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 0.625rem;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Valores "L C H" — uso: oklch(var(--name)) */
  --background:             100% 0 0;
  --foreground:             20% 0 0;
  --card:                   100% 0 0;
  --card-foreground:        20% 0 0;
  --popover:                100% 0 0;
  --popover-foreground:     20% 0 0;
  --primary:                45% 0.15 260;
  --primary-foreground:     98% 0 0;
  --secondary:              96% 0.01 260;
  --secondary-foreground:   20% 0 0;
  --muted:                  96% 0.01 260;
  --muted-foreground:       55% 0.02 260;
  --accent:                 96% 0.01 260;
  --accent-foreground:      20% 0 0;
  --destructive:            60% 0.2 25;
  --destructive-foreground: 98% 0 0;
  --success:                65% 0.15 150;
  --success-foreground:     98% 0 0;
  --warning:                75% 0.18 80;
  --warning-foreground:     20% 0 0;
  --border:                 90% 0.02 260;
  --input:                  90% 0.02 260;
  --ring:                   45% 0.15 260;

  --campus-eng: 55% 0.15 300;
  --campus-lic: 75% 0.18 80;
  --campus-sau: 65% 0.15 150;
}

[data-theme="dark"] {
  --background:             20% 0 0;
  --foreground:             98% 0 0;
  --card:                   20% 0 0;
  --card-foreground:        98% 0 0;
  --popover:                20% 0 0;
  --popover-foreground:     98% 0 0;
  --primary:                65% 0.15 260;
  --primary-foreground:     20% 0 0;
  --secondary:              30% 0.02 260;
  --secondary-foreground:   98% 0 0;
  --muted:                  30% 0.02 260;
  --muted-foreground:       70% 0.02 260;
  --accent:                 30% 0.02 260;
  --accent-foreground:      98% 0 0;
  --destructive:            50% 0.2 25;
  --destructive-foreground: 98% 0 0;
  --success:                55% 0.15 150;
  --success-foreground:     98% 0 0;
  --warning:                65% 0.18 80;
  --warning-foreground:     98% 0 0;
  --border:                 30% 0.02 260;
  --input:                  30% 0.02 260;
  --ring:                   65% 0.15 260;

  --campus-eng: 65% 0.15 300;
  --campus-lic: 75% 0.18 80;
  --campus-sau: 70% 0.15 150;
}
```

---

## Task 3: Reescrever `css/variaveis-tema.css` (compat layer)

**Files:**
- Modify: `css/variaveis-tema.css` (rewrite completo)

`variaveis-tema.css` é carregado DEPOIS de `tokens.css`, então `var(--background)` etc. já estão definidos.

`[data-theme="dark"]` NÃO precisa de bloco aqui. `tokens.css` redefine os tokens OKLCH; as aliases compat herdam via cascade.

- [ ] **Step 1: Substituir conteúdo completo**

```css
/* css/variaveis-tema.css — compat layer
   Mapeia nomes legados → oklch(var(--token)).
   Requer css/tokens.css carregado antes.
   21 arquivos de componente usam os nomes legados sem alteração. */

/* ==============================================
   SEÇÃO A — Palette estática (OKLCH direto)
   ============================================== */
:root {
  /* Primary scale */
  --primary-50:  oklch(97% 0.02 260);
  --primary-100: oklch(93% 0.04 260);
  --primary-500: oklch(var(--primary));
  --primary-600: oklch(var(--ring));
  --primary-700: oklch(35% 0.15 260);
  --primary-900: oklch(22% 0.1 260);

  /* Success */
  --success-50:  oklch(97% 0.03 150);
  --success-100: oklch(93% 0.06 150);
  --success-500: oklch(var(--success));
  --success-600: oklch(58% 0.14 150);

  /* Warning */
  --warning-50:  oklch(97% 0.03 80);
  --warning-500: oklch(var(--warning));

  /* Danger */
  --danger-50:  oklch(97% 0.03 25);
  --danger-100: oklch(93% 0.06 25);
  --danger-500: oklch(var(--destructive));
  --danger-600: oklch(52% 0.19 25);

  /* Gray scale */
  --gray-50:  oklch(98% 0.005 265);
  --gray-100: oklch(96% 0.008 265);
  --gray-200: oklch(92% 0.01 265);
  --gray-300: oklch(86% 0.015 265);
  --gray-400: oklch(72% 0.02 265);
  --gray-500: oklch(58% 0.02 265);
  --gray-600: oklch(46% 0.02 265);
  --gray-700: oklch(34% 0.015 265);
  --gray-800: oklch(23% 0.012 265);
  --gray-900: oklch(13% 0.01 265);

  /* Campus / Space colors */
  --eng-color:    oklch(var(--campus-eng));
  --lic-color:    oklch(var(--campus-lic));
  --sau-color:    oklch(var(--campus-sau));
  --outros-color: oklch(var(--primary));

  /* Calendario premium
     Usa valores fixos OKLCH para compatibilidade maxima de browsers.
     (CSS relative color syntax tem suporte < universal) */
  --cal-eng-bg:     oklch(55% 0.15 300 / 0.08);
  --cal-eng-text:   oklch(var(--campus-eng));
  --cal-eng-border: oklch(55% 0.15 300 / 0.6);

  --cal-sau-bg:     oklch(65% 0.15 150 / 0.08);
  --cal-sau-text:   oklch(var(--campus-sau));
  --cal-sau-border: oklch(65% 0.15 150 / 0.6);

  --cal-lic-bg:     oklch(75% 0.18 80 / 0.08);
  --cal-lic-text:   oklch(var(--campus-lic));
  --cal-lic-border: oklch(75% 0.18 80 / 0.6);

  --cal-other-bg:     oklch(45% 0.15 260 / 0.08);
  --cal-other-text:   oklch(var(--primary));
  --cal-other-border: oklch(45% 0.15 260 / 0.6);

  --cal-grid-border:  oklch(90% 0.02 260 / 0.6);

  /* Sombras (inalteradas — rgb() para sombras e OK) */
  --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow:       0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md:    0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* Border radius */
  --radius-sm:   0.375rem;
  --radius:      0.5rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-xl:   1.5rem;
  --radius-full: 9999px;

  /* Tipografia */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;

  /* Transicoes */
  --transition-fast: 150ms ease;
  --transition:      200ms ease;
  --transition-slow: 300ms ease;

  /* Z-index */
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-modal:    300;
  --z-toast:    400;
  --z-loading:  500;
}

/* ==============================================
   SEÇÃO B — Compat aliases semânticos
   dark mode: tokens.css gerencia via [data-theme="dark"],
   cascade propaga automaticamente para estas aliases.
   ============================================== */
:root,
[data-theme="light"] {
  --bg-body:     oklch(var(--background));
  --bg-sidebar:  oklch(var(--card));
  --bg-card:     oklch(var(--card));
  --bg-elevated: oklch(var(--muted));
  --bg-input:    oklch(var(--input));

  --text-primary:   oklch(var(--foreground));
  --text-secondary: oklch(var(--muted-foreground));
  --text-tertiary:  oklch(var(--muted-foreground) / 0.7);

  --border-color: oklch(var(--border));
}
```

---

## Task 4: Atualizar `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Atualizar URL da fonte (linhas 16-18) — remover Plus Jakarta Sans**

Substituir:
```html
    <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
```

Por:
```html
    <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
```

- [ ] **Step 2: Adicionar `css/tokens.css` antes de `css/variaveis-tema.css` (linha 36)**

Substituir:
```html
    <link rel="stylesheet" href="css/variaveis-tema.css">
```

Por:
```html
    <link rel="stylesheet" href="css/tokens.css">
    <link rel="stylesheet" href="css/variaveis-tema.css">
```

---

## Task 5: Atualizar `login.html`

**Files:**
- Modify: `login.html`

- [ ] **Step 1: Atualizar URL da fonte (linhas 14-15)**

Substituir:
```html
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet">
```

Por:
```html
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet">
```

- [ ] **Step 2: Adicionar `css/tokens.css` antes de `css/variaveis-tema.css` (linha 18)**

Substituir:
```html
    <link rel="stylesheet" href="css/variaveis-tema.css">
```

Por:
```html
    <link rel="stylesheet" href="css/tokens.css">
    <link rel="stylesheet" href="css/variaveis-tema.css">
```

---

## Task 6: Rodar testes e validar

- [ ] **Step 1: Rodar todos os testes (9 smoke + 4 css-tokens)**

```bash
TEST_EMAIL="test@ufma.br" TEST_PASSWORD="123123" npx playwright test --reporter=list
```

Expected: 13 testes passando. Se `--font-sans usa Inter` falhar, verificar se o link da fonte foi atualizado corretamente. Se `--primary tem formato OKLCH` falhar, verificar se `css/tokens.css` aparece antes de `css/variaveis-tema.css` no HTML.

- [ ] **Step 2: Verificar ausência de HEX no variaveis-tema.css**

```bash
grep -n "#[0-9a-fA-F]\{3,6\}" css/variaveis-tema.css
```

Expected: sem output (sombras usam `rgb()` não HEX — aceitável).

- [ ] **Step 3: Commit**

```bash
git add css/tokens.css css/variaveis-tema.css index.html login.html tests/css-tokens.spec.js
git commit -m "feat(design-system): migra tokens para OKLCH shadcn-style com compat layer"
git push
```

---

## Validação final

- [ ] 13 testes Playwright passando (`npm test`).
- [ ] `css/tokens.css` linkado antes de `css/variaveis-tema.css` em `index.html` e `login.html`.
- [ ] Fonte Inter carregando (DevTools → Elements → Computed → font-family deve mostrar Inter).
- [ ] Dark mode funcional — `--bg-body` muda entre temas.
- [ ] Calendário com cores de campus visíveis em light e dark.
