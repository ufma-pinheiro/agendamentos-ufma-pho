# Design System shadcn-style (OKLCH) — Design Doc

> Data: 2026-05-28
> Branch: main
> Stack: Vanilla JS, CSS puro, sem build step

---

## 1. Objetivo

Migrar o design system do sistema de agendamentos UFMA para tokens OKLCH no estilo shadcn, adotando novo visual (nova paleta de cores e fonte Inter) sem tocar nos 21 arquivos de componente CSS já refatorados.

---

## 2. Decisões

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Paleta | Nova (shadcn OKLCH) | Visual moderno, brand UFMA azul |
| Estratégia | Compat layer | Zero regressão nos componentes |
| Fonte | Inter (shadcn nativo) | Consistência com design system |
| Escopo | 4 arquivos apenas | YAGNI |

---

## 3. Arquitetura

```
css/tokens.css           ← fonte de verdade (OKLCH, light + dark)
    ↓  cascade
css/variaveis-tema.css   ← compat layer (old var names → oklch(var(--new)))
    ↓  referenciados por
css/layout.css, css/modais.css, ...  ← 21 arquivos inalterados
```

`tokens.css` carregado **antes** de `variaveis-tema.css` em `index.html` e `login.html`.

Dark mode automático: `tokens.css` redefine os tokens OKLCH em `[data-theme="dark"]`. As vars de compat herdam via cascade — sem código extra de dark mode em `variaveis-tema.css`.

---

## 4. Arquivos Alterados

### 4.1 `css/tokens.css` — conteúdo final

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --radius: 0.625rem;

  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  /* Valores "L C H" para uso em oklch(var(--name)) */
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

### 4.2 `css/variaveis-tema.css` — reescrita compat layer

Remove todo HEX/RGB de cor. Mantém sombras, radius, transições, z-index inalterados.

**Seção A — Palette estática (OKLCH direto):**
```css
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

  /* Campus colors */
  --eng-color:    oklch(var(--campus-eng));
  --lic-color:    oklch(var(--campus-lic));
  --sau-color:    oklch(var(--campus-sau));
  --outros-color: oklch(var(--primary));

  /* Calendario premium */
  --cal-eng-bg:     oklch(var(--campus-eng) / 0.08);
  --cal-eng-text:   oklch(var(--campus-eng));
  --cal-eng-border: oklch(var(--campus-eng) / 0.6);

  --cal-sau-bg:     oklch(var(--campus-sau) / 0.08);
  --cal-sau-text:   oklch(var(--campus-sau));
  --cal-sau-border: oklch(var(--campus-sau) / 0.6);

  --cal-lic-bg:     oklch(var(--campus-lic) / 0.08);
  --cal-lic-text:   oklch(var(--campus-lic));
  --cal-lic-border: oklch(var(--campus-lic) / 0.6);

  --cal-other-bg:     oklch(var(--primary) / 0.08);
  --cal-other-text:   oklch(var(--primary));
  --cal-other-border: oklch(var(--primary) / 0.6);

  --cal-grid-border: oklch(var(--border) / 0.6);

  /* Sombras (inalteradas) */
  --shadow-sm:    0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow:       0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md:    0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg:    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl:    0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* Border radius (inalterado) */
  --radius-sm:   0.375rem;
  --radius:      0.5rem;
  --radius-md:   0.75rem;
  --radius-lg:   1rem;
  --radius-xl:   1.5rem;
  --radius-full: 9999px;

  /* Tipografia */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, monospace;

  /* Transicoes (inalteradas) */
  --transition-fast: 150ms ease;
  --transition:      200ms ease;
  --transition-slow: 300ms ease;

  /* Z-index (inalterados) */
  --z-dropdown: 100;
  --z-sticky:   200;
  --z-modal:    300;
  --z-toast:    400;
  --z-loading:  500;
}
```

**Seção B — Compat aliases semânticos:**
```css
:root, [data-theme="light"] {
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

`[data-theme="dark"]` NÃO precisa de bloco extra aqui. O `tokens.css` redefine os tokens OKLCH para dark; as vars compat acima herdam automaticamente via cascade.

### 4.3 `index.html`

Substituir link da fonte (linha 16):
```html
<!-- antes -->
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<!-- depois -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Adicionar `css/tokens.css` como primeiro link de CSS (antes de `css/variaveis-tema.css`):
```html
<link rel="stylesheet" href="css/tokens.css">
<link rel="stylesheet" href="css/variaveis-tema.css">
<!-- ... demais 19 links CSS na ordem atual ... -->
```

### 4.4 `login.html`

Mesmo tratamento: trocar fonte Google Fonts, adicionar `css/tokens.css` antes dos demais CSS. `login.html` atualmente carrega `css/variaveis-tema.css`, `css/base.css`, `css/login.css`, `css/login-extra.css`.

---

## 5. Validação

- Smoke test Playwright: `npm test` deve continuar 9/9 passando (CSS-only, DOM inalterado).
- Diff visual manual: calendário, sidebar, modais, cards, formulário, login. Testar light e dark mode.
- Contraste WCAG AA: `oklch(45% 0.15 260)` (primary azul) vs branco ≈ 5.5:1 ✓
- Browser: OKLCH suportado desde Chrome 111 / Firefox 113 / Safari 16.4 (2023).

---

## 6. Fora de escopo

- Renomear vars antigas nos 21 arquivos de componente.
- Suporte a browsers sem OKLCH (Chrome < 111, Firefox < 113).
- Spacing/sizing tokens.
- Migração completa das vars `--cal-*` para dark mode OKLCH (parcialmente feito na Seção A).

---

## 7. Critério de "Pronto"

- `css/tokens.css` carregado antes de `variaveis-tema.css` em index.html e login.html.
- `variaveis-tema.css` sem valores HEX ou RGB de cor (sombras com rgb() são aceitas).
- Fonte Inter carregando e renderizando corretamente.
- Smoke tests 9/9 passando.
- Dark mode funcional visualmente.
