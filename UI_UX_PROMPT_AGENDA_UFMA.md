# 🎨 Prompt de Design UI/UX — Agenda UFMA (Gestão de Espaços)
> Estilo: Minimalista Elegante · Institucional · PT-BR · Vanilla JS / HTML / CSS

---

## 📌 Visão Geral do Redesign

Este documento é a **fonte da verdade** para a implementação visual do sistema **Agenda UFMA — Gestão de Espaços**. O redesign deve ser aplicado **exclusivamente na camada de UI/UX**, sem alterar qualquer lógica de negócio, funções JavaScript, chamadas ao Supabase, estrutura de dados ou comportamentos do FullCalendar, Chart.js, Flatpickr ou SweetAlert2.

---

## 🧭 Direção Estética

### Conceito
**"Arquivo Vivo"** — A interface remete a um sistema institucional de precisão: limpo como um documento oficial, mas respirável como um espaço bem projetado. Pense em uma agenda de mesa de couro sobre granito — ordem, clareza e qualidade silenciosa.

### Palavras-chave
`Minimalista` · `Elegante` · `Institucional` · `Profissional` · `Austero` · `Respeitoso`

### O que NÃO é este design
- ❌ Não é jovial ou colorido demais
- ❌ Não é dark mode total (usa claro como base)
- ❌ Não tem gradientes chamativos
- ❌ Não usa ícones decorativos sem propósito
- ❌ Não tem animações excessivas ou chamativas

---

## 🎨 Sistema de Cores

```css
:root {
  /* Superfícies */
  --color-bg:           #F7F6F3;   /* fundo geral — off-white quente */
  --color-surface:      #FFFFFF;   /* cards, modais, painéis */
  --color-surface-alt:  #F0EEE9;   /* fundo de inputs, linhas zebra */
  --color-border:       #E2DED7;   /* bordas suaves */
  --color-border-strong:#C8C3BA;   /* separadores mais visíveis */

  /* Tipografia */
  --color-text-primary: #1A1917;   /* títulos, labels */
  --color-text-secondary:#6B6660;  /* subtítulos, metadados */
  --color-text-muted:   #A09A94;   /* placeholders, dicas */
  --color-text-inverse: #FFFFFF;   /* texto sobre fundo escuro */

  /* Acento institucional */
  --color-accent:       #1B3A6B;   /* azul UFMA — ação primária */
  --color-accent-light: #EAF0F9;   /* fundo de estados hover no acento */
  --color-accent-hover: #152E58;   /* hover do botão primário */

  /* Semânticas */
  --color-success:      #2D6A4F;   /* confirmações, eventos confirmados */
  --color-success-bg:   #EAF4EF;
  --color-warning:      #B45309;   /* conflitos, atenção */
  --color-warning-bg:   #FEF3C7;
  --color-error:        #9B1C1C;   /* erros, exclusões */
  --color-error-bg:     #FEE2E2;
  --color-info:         #1E5799;
  --color-info-bg:      #DBEAFE;

  /* Conflito (estado especial do negócio) */
  --color-conflict:     #C45B1A;
  --color-conflict-bg:  #FFF0E6;
  --color-conflict-border: #F0935A;
}
```

> **Regra de uso:** O azul `--color-accent` é reservado exclusivamente para ações primárias (botão de salvar, links ativos, indicadores de seleção). Nunca use como decoração.

---

## 🔠 Tipografia

```css
/* Importar no <head> do index.html */
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --font-display: 'Fraunces', Georgia, serif;   /* títulos de seção, logo */
  --font-body:    'DM Sans', system-ui, sans-serif; /* todo o resto */

  /* Escala tipográfica */
  --text-xs:   0.70rem;   /* 11.2px — metadados, badges */
  --text-sm:   0.813rem;  /* 13px  — labels de input, dicas */
  --text-base: 0.938rem;  /* 15px  — corpo padrão */
  --text-md:   1.063rem;  /* 17px  — subtítulos de card */
  --text-lg:   1.25rem;   /* 20px  — títulos de seção */
  --text-xl:   1.563rem;  /* 25px  — título de página */
  --text-2xl:  2rem;      /* 32px  — números de KPI */

  --weight-light:   300;
  --weight-regular: 400;
  --weight-medium:  500;
  --weight-semibold:600;

  --leading-tight:  1.2;
  --leading-normal: 1.5;
  --leading-relaxed:1.75;

  --tracking-tight: -0.03em;
  --tracking-normal: 0;
  --tracking-wide:  0.06em;  /* para labels uppercase */
}
```

### Uso da tipografia

| Elemento | Fonte | Tamanho | Peso | Cor |
|---|---|---|---|---|
| Logo / Nome do sistema | `--font-display` | `--text-xl` | 300 (light) | `--color-text-primary` |
| Título de página | `--font-display` | `--text-xl` | 400 | `--color-text-primary` |
| Título de card/seção | `--font-body` | `--text-md` | 500 | `--color-text-primary` |
| Labels de formulário | `--font-body` | `--text-sm` | 500 | `--color-text-secondary` |
| Corpo de texto | `--font-body` | `--text-base` | 400 | `--color-text-primary` |
| Metadados / datas | `--font-body` | `--text-xs` | 400 | `--color-text-muted` |
| Números KPI | `--font-display` | `--text-2xl` | 300 | `--color-text-primary` |
| Labels uppercase | `--font-body` | `--text-xs` | 500 | `--color-text-secondary`, `letter-spacing: --tracking-wide`, `text-transform: uppercase` |

---

## 📐 Espaçamento e Grade

```css
:root {
  /* Grade de 4px */
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Bordas */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Sombras (sutis, sem cor) */
  --shadow-xs: 0 1px 2px rgba(26, 25, 23, 0.05);
  --shadow-sm: 0 1px 3px rgba(26, 25, 23, 0.08), 0 1px 2px rgba(26, 25, 23, 0.04);
  --shadow-md: 0 4px 6px rgba(26, 25, 23, 0.06), 0 2px 4px rgba(26, 25, 23, 0.04);
  --shadow-lg: 0 10px 15px rgba(26, 25, 23, 0.08), 0 4px 6px rgba(26, 25, 23, 0.04);
  --shadow-xl: 0 20px 25px rgba(26, 25, 23, 0.10), 0 8px 10px rgba(26, 25, 23, 0.04);

  /* Layout */
  --sidebar-width: 240px;
  --topbar-height: 60px;
  --content-max:   1280px;
  --content-pad:   var(--space-8);  /* padding lateral do conteúdo */
}
```

---

## 🏗️ Layout Global

### Estrutura de página

```
┌─────────────────────────────────────────────────────────┐
│                     TOPBAR (60px)                       │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  SIDEBAR     │         CONTENT AREA                     │
│  (240px)     │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### Topbar

- `height: var(--topbar-height)` · `background: var(--color-surface)` · `border-bottom: 1px solid var(--color-border)`
- `position: sticky; top: 0; z-index: 100`
- Conteúdo (esquerda → direita):
  1. **Logo/Nome**: ícone simples (SVG inline) + "Agenda UFMA" em `--font-display` light
  2. **Espaçador flex** (`flex: 1`)
  3. **Busca Global**: campo com ícone de lupa, bordas sutis, `width: 260px`, colapsa em mobile
  4. **Avatar do usuário**: círculo `32px` com inicial do nome, cor de fundo `--color-accent-light`, cor do texto `--color-accent`
- Sem sombra na topbar — a borda inferior é suficiente

### Sidebar

- `width: var(--sidebar-width)` · `background: var(--color-bg)` · `border-right: 1px solid var(--color-border)`
- `position: sticky; height: calc(100vh - var(--topbar-height)); overflow-y: auto`
- Padding interno: `var(--space-4)` lateral, `var(--space-6)` vertical
- **Seções separadas por label uppercase** (ex: "NAVEGAÇÃO", "FILTROS")
- **Item de menu ativo**: fundo `--color-accent-light`, borda-esquerda `3px solid var(--color-accent)`, texto `--color-accent`
- **Item de menu normal**: texto `--color-text-secondary`, hover fundo `--color-surface-alt`
- Todos os itens: `border-radius: var(--radius-md)`, `padding: var(--space-2) var(--space-3)`, `font-size: var(--text-sm)`, `font-weight: --weight-medium`
- Ícones: `16px`, linha fina (stroke), cor herdada do texto

### Content Area

- `flex: 1; overflow-y: auto; padding: var(--content-pad)`
- `background: var(--color-bg)`
- **Page Header** (topo de cada seção):
  - Título em `--font-display`, `--text-xl`, `font-weight: 400`
  - Subtítulo/breadcrumb em `--text-sm`, `--color-text-muted`
  - Ações (botões) alinhadas à direita
  - `border-bottom: 1px solid var(--color-border)`, `padding-bottom: var(--space-6)`, `margin-bottom: var(--space-8)`

---

## 🧩 Componentes

### Botões

```css
/* Base */
.btn {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  line-height: 1;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: background 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
  white-space: nowrap;
  text-decoration: none;
}

/* Tamanhos */
.btn-sm  { padding: var(--space-2) var(--space-3); font-size: var(--text-xs); }
.btn-md  { padding: 9px var(--space-5); }
.btn-lg  { padding: var(--space-3) var(--space-6); font-size: var(--text-base); }

/* Primário — ação principal (Salvar, Confirmar) */
.btn-primary {
  background: var(--color-accent);
  color: var(--color-text-inverse);
  border-color: var(--color-accent);
}
.btn-primary:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

/* Secundário — ação de suporte (Cancelar, Filtrar) */
.btn-secondary {
  background: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border-strong);
}
.btn-secondary:hover {
  background: var(--color-surface-alt);
}

/* Ghost — ação terciária, inline */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border-color: transparent;
}
.btn-ghost:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}

/* Destrutivo — excluir */
.btn-danger {
  background: var(--color-surface);
  color: var(--color-error);
  border-color: var(--color-border);
}
.btn-danger:hover {
  background: var(--color-error-bg);
  border-color: var(--color-error);
}

/* Disabled */
.btn:disabled, .btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}
```

> **Regra crítica:** Cada modal/formulário deve ter **no máximo 1 botão primário**. Demais ações devem ser secundárias ou ghost.

---

### Campos de Formulário

```css
/* Label */
.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/* Input / Select / Textarea */
.form-control {
  width: 100%;
  padding: 9px var(--space-3);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
  appearance: none;
  -webkit-appearance: none;
}
.form-control::placeholder {
  color: var(--color-text-muted);
  font-weight: var(--weight-light);
}
.form-control:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(27, 58, 107, 0.10);
}
.form-control:hover:not(:focus) {
  border-color: var(--color-border-strong);
}

/* Grupo de formulário */
.form-group {
  margin-bottom: var(--space-5);
}

/* Mensagem de erro inline */
.form-error {
  font-size: var(--text-xs);
  color: var(--color-error);
  margin-top: var(--space-1);
}

/* Hint / dica */
.form-hint {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: var(--space-1);
}
```

> **Flatpickr:** Sobrescrever apenas cores do `.flatpickr-calendar` para usar as variáveis acima. Não alterar layout interno do Flatpickr.

---

### Cards

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: var(--shadow-xs);
  transition: box-shadow 200ms ease;
}
.card:hover {
  box-shadow: var(--shadow-sm);
}

/* Cabeçalho do card */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.card-title {
  font-size: var(--text-md);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  font-family: var(--font-body);
}
.card-subtitle {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  margin-top: 2px;
}
```

---

### Badges / Tags de Status

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  line-height: 1.4;
  white-space: nowrap;
}

.badge-neutral  { background: var(--color-surface-alt); color: var(--color-text-secondary); }
.badge-success  { background: var(--color-success-bg);  color: var(--color-success); }
.badge-warning  { background: var(--color-warning-bg);  color: var(--color-warning); }
.badge-error    { background: var(--color-error-bg);    color: var(--color-error); }
.badge-conflict { background: var(--color-conflict-bg); color: var(--color-conflict); border: 1px solid var(--color-conflict-border); }
.badge-info     { background: var(--color-info-bg);     color: var(--color-info); }
```

---

### Tabelas (Listagem de Reservas)

```css
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--text-sm);
}

/* Cabeçalho */
.data-table thead th {
  background: var(--color-surface-alt);
  padding: var(--space-3) var(--space-4);
  text-align: left;
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border-bottom: 1px solid var(--color-border);
  white-space: nowrap;
}

/* Linhas */
.data-table tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background 100ms ease;
}
.data-table tbody tr:last-child {
  border-bottom: none;
}
.data-table tbody tr:hover {
  background: var(--color-accent-light);
}

/* Células */
.data-table tbody td {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-primary);
  vertical-align: middle;
}

/* Linha em conflito */
.data-table tbody tr.row-conflict {
  background: var(--color-conflict-bg);
}
.data-table tbody tr.row-conflict:hover {
  background: #FDEBD8;
}

/* Célula de ações */
.data-table .col-actions {
  text-align: right;
  white-space: nowrap;
}
```

---

### Modais

```css
/* Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 25, 23, 0.40);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);

  /* Animação de entrada */
  animation: overlay-in 200ms ease forwards;
}
@keyframes overlay-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* Caixa do modal */
.modal-box {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 520px;
  max-height: calc(100vh - var(--space-12));
  overflow-y: auto;
  animation: modal-in 220ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes modal-in {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

/* Cabeçalho do modal */
.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-6) var(--space-6) var(--space-4);
  border-bottom: 1px solid var(--color-border);
}
.modal-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 400;
  color: var(--color-text-primary);
  line-height: var(--leading-tight);
}
.modal-close {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
  margin-left: var(--space-4);
  transition: background 150ms ease, color 150ms ease;
}
.modal-close:hover {
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
}

/* Corpo e rodapé */
.modal-body {
  padding: var(--space-6);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6) var(--space-6);
  border-top: 1px solid var(--color-border);
}
```

> **SweetAlert2:** Substituir completamente o tema padrão do SweetAlert2 usando sua API de `customClass` + `didOpen`. Os estilos `.swal2-popup`, `.swal2-title`, `.swal2-confirm`, `.swal2-cancel` devem usar as variáveis CSS acima.

---

### Calendário (FullCalendar)

**Regra fundamental:** Alterar apenas variáveis CSS e sobrescrever seletores do FullCalendar. Não remover ou modificar classes de lógica.

```css
/* Cabeçalho do calendário */
.fc .fc-toolbar-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 400;
  color: var(--color-text-primary);
}
.fc .fc-button {
  background: var(--color-surface) !important;
  border: 1px solid var(--color-border) !important;
  color: var(--color-text-secondary) !important;
  font-family: var(--font-body) !important;
  font-size: var(--text-sm) !important;
  font-weight: var(--weight-medium) !important;
  border-radius: var(--radius-md) !important;
  box-shadow: none !important;
  padding: var(--space-2) var(--space-3) !important;
  transition: background 150ms ease !important;
}
.fc .fc-button:hover {
  background: var(--color-surface-alt) !important;
  border-color: var(--color-border-strong) !important;
  color: var(--color-text-primary) !important;
}
.fc .fc-button-active,
.fc .fc-button-primary:not(:disabled).fc-button-active {
  background: var(--color-accent-light) !important;
  border-color: var(--color-accent) !important;
  color: var(--color-accent) !important;
}

/* Grid do calendário */
.fc-theme-standard td, .fc-theme-standard th,
.fc-theme-standard .fc-scrollgrid {
  border-color: var(--color-border) !important;
}
.fc .fc-daygrid-day-number,
.fc .fc-col-header-cell-cushion {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--weight-medium);
}
.fc .fc-day-today {
  background: var(--color-accent-light) !important;
}
.fc .fc-day-today .fc-daygrid-day-number {
  color: var(--color-accent);
  font-weight: var(--weight-semibold);
}

/* Eventos no calendário */
.fc-event {
  border: none !important;
  border-radius: var(--radius-sm) !important;
  padding: 2px var(--space-2) !important;
  font-size: var(--text-xs) !important;
  font-weight: var(--weight-medium) !important;
  font-family: var(--font-body) !important;
  cursor: pointer;
  transition: opacity 150ms ease, transform 150ms ease;
}
.fc-event:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

/* Evento em conflito — indicador visual obrigatório (não remover) */
.fc-event.isConflito,
.fc-event[data-conflito="true"] {
  outline: 2px dashed var(--color-conflict) !important;
  outline-offset: 1px;
}
```

---

### Dashboard / KPIs (Chart.js)

```css
/* Grid de KPIs */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.kpi-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5) var(--space-6);
  position: relative;
  overflow: hidden;
}

/* Linha de cor semântica no topo */
.kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: var(--kpi-color, var(--color-accent));
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.kpi-label {
  font-size: var(--text-xs);
  font-weight: var(--weight-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-2);
}
.kpi-value {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: 300;
  color: var(--color-text-primary);
  line-height: 1;
  margin-bottom: var(--space-1);
}
.kpi-delta {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}
```

**Paleta de gráficos (Chart.js):** Passar estas cores como `backgroundColor` e `borderColor`:

```javascript
const CHART_COLORS = {
  primary:   '#1B3A6B',
  secondary: '#4A7FB5',
  tertiary:  '#8FB8D8',
  success:   '#2D6A4F',
  warning:   '#B45309',
  neutral:   '#A09A94',
  conflict:  '#C45B1A',
};

// Configurações globais recomendadas para Chart.js
Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = '#6B6660';
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyleWidth = 8;
Chart.defaults.plugins.tooltip.backgroundColor = '#1A1917';
Chart.defaults.plugins.tooltip.titleFont.weight = '500';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 6;
Chart.defaults.plugins.tooltip.displayColors = true;
Chart.defaults.scale.grid.color = 'rgba(226, 222, 215, 0.7)';
Chart.defaults.scale.ticks.color = '#A09A94';
```

---

### Toast / Notificações

```css
/* Container de toasts */
.toast-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-5);
  box-shadow: var(--shadow-lg);
  min-width: 280px;
  max-width: 380px;
  pointer-events: auto;
  animation: toast-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes toast-in {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* Barra de cor lateral */
.toast::before {
  content: '';
  width: 3px;
  align-self: stretch;
  border-radius: var(--radius-full);
  background: var(--toast-accent, var(--color-accent));
  flex-shrink: 0;
}
.toast-success::before { --toast-accent: var(--color-success); }
.toast-error::before   { --toast-accent: var(--color-error); }
.toast-warning::before { --toast-accent: var(--color-warning); }

.toast-message {
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  line-height: var(--leading-normal);
  flex: 1;
}
```

---

## 🔐 Tela de Login

```css
/* Layout centralizado */
.login-page {
  min-height: 100vh;
  background: var(--color-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

/* Detalhe de fundo — linha diagonal sutil */
.login-page::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 55%;
  height: 120%;
  background: linear-gradient(135deg, transparent 0%, rgba(27,58,107,0.04) 100%);
  transform: skewX(-8deg);
  pointer-events: none;
}

/* Card de login */
.login-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-12);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-xl);
  text-align: center;
  position: relative;
}

/* Logo institucional */
.login-logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}
.login-logo-mark {
  width: 40px;
  height: 40px;
  background: var(--color-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 300;
}
.login-logo-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 300;
  color: var(--color-text-primary);
  letter-spacing: -0.01em;
}

/* Título e subtítulo */
.login-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 400;
  color: var(--color-text-primary);
  margin-bottom: var(--space-2);
}
.login-subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  margin-bottom: var(--space-8);
  line-height: var(--leading-relaxed);
}

/* Botão Google OAuth */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-medium);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
}
.btn-google:hover {
  background: var(--color-surface-alt);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

/* Rodapé institucional */
.login-footer {
  margin-top: var(--space-8);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  line-height: var(--leading-relaxed);
}
```

---

## 📱 Responsividade

```css
/* Breakpoints */
/* --bp-sm: 640px  | mobile  */
/* --bp-md: 768px  | tablet  */
/* --bp-lg: 1024px | desktop */
/* --bp-xl: 1280px | wide    */

@media (max-width: 768px) {
  /* Sidebar vira drawer deslizante */
  .sidebar {
    position: fixed;
    top: var(--topbar-height);
    left: 0;
    height: calc(100vh - var(--topbar-height));
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 220ms ease;
    box-shadow: var(--shadow-xl);
  }
  .sidebar.is-open {
    transform: translateX(0);
  }
  /* Overlay ao abrir sidebar */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(26, 25, 23, 0.30);
    z-index: 199;
    display: none;
  }
  .sidebar-overlay.is-active {
    display: block;
  }

  .content-area {
    padding: var(--space-4);
  }

  .kpi-grid {
    grid-template-columns: 1fr 1fr;
  }

  .modal-box {
    max-width: 100%;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    margin-top: auto;
    margin-bottom: 0;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }
  .login-card {
    padding: var(--space-8) var(--space-6);
  }
}
```

---

## ✅ Regras de Implementação

### Obrigatórias (nunca violar)

1. **Não alterar IDs, classes de lógica ou atributos `data-*`** usados pelo JavaScript. Apenas adicionar classes CSS visuais.
2. **Conflitos devem permanecer visíveis**: O estado `isConflito` deve ser sempre distinguível visualmente (borda, fundo ou ícone diferenciado). Nunca suprima ou homogeneize este estado.
3. **Permissões visuais**: Elementos que dependem de role (`dono`, `editor`, `leitor`) devem continuar com sua lógica de exibição/ocultação. A UI não deve dar a ilusão de acesso onde não há.
4. **FullCalendar**: Sobrescrever apenas via CSS externo. Não modificar a configuração JS do FullCalendar.
5. **SweetAlert2**: Usar apenas `customClass` e `didOpen` para personalizar. Não substituir o SweetAlert2 por outro modal.
6. **Flatpickr**: Sobrescrever apenas via CSS do tema. Não alterar configuração JS do Flatpickr.
7. **Feedback sempre presente**: Todo botão de ação assíncrona deve ter estado de loading (spinner ou `disabled`). Não remover nenhum toast ou alerta existente.
8. **Acessibilidade mínima**: Todo input deve ter `label` associado. Botões de ícone devem ter `aria-label`. Contraste mínimo WCAG AA.

### Recomendadas

- Preferir transições CSS a JavaScript para animações simples.
- Usar `will-change: transform` apenas onde há animação real.
- Não usar `!important` exceto para sobrescrever estilos de terceiros (FullCalendar, SweetAlert2, Flatpickr).
- Manter o arquivo `style.css` organizado por seções com comentários `/* === SEÇÃO === */`.

---

## 🗂️ Estrutura sugerida de `style.css`

```
/* === 1. RESET & BASE === */
/* === 2. CSS VARIABLES (Design Tokens) === */
/* === 3. TIPOGRAFIA === */
/* === 4. LAYOUT GLOBAL (topbar, sidebar, content) === */
/* === 5. BOTÕES === */
/* === 6. FORMULÁRIOS === */
/* === 7. CARDS === */
/* === 8. BADGES === */
/* === 9. TABELAS === */
/* === 10. MODAIS === */
/* === 11. TOASTS === */
/* === 12. CALENDÁRIO (FullCalendar overrides) === */
/* === 13. DASHBOARD / KPIS === */
/* === 14. LOGIN === */
/* === 15. RESPONSIVIDADE === */
/* === 16. UTILITÁRIOS === */
/* === 17. ANIMAÇÕES === */
```

---

## 🧪 Checklist de Revisão Visual

Antes de considerar a implementação concluída, validar:

- [ ] Tela de login renderiza centralizada e elegante em mobile e desktop
- [ ] Sidebar ativa o item correto com destaque azul e borda lateral
- [ ] Topbar mostra avatar do usuário com inicial correta
- [ ] Calendário com cores suaves e eventos legíveis
- [ ] Eventos com conflito têm visual diferenciado (`outline` dashed laranja)
- [ ] Modais abrem com animação suave e fecham ao clicar no overlay
- [ ] Botões têm hierarquia clara (primário, secundário, ghost, danger)
- [ ] Formulários com labels uppercase e foco em azul
- [ ] Cards do dashboard com linha colorida no topo e números grandes
- [ ] Toasts aparecem no canto inferior direito com barra lateral colorida
- [ ] Nenhuma funcionalidade JS foi quebrada
- [ ] Todas as permissões de role continuam funcionando visualmente
- [ ] Sistema de conflitos continua detectável pelo usuário

---

*Documento gerado por IA · Versão 1.0.0 · Projeto: Agenda UFMA Pinheiro*
