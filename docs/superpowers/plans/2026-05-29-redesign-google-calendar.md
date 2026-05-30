# Redesign Visual "Google Calendar Style" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar a linguagem visual "Google Calendar" + craft da skill `frontend-design` a todo o sistema, reusando tokens OKLCH existentes, sem tocar no backend.

**Architecture:** Tokens OKLCH (`css/tokens.css` + `css/variaveis-tema.css`) já são a fonte de verdade. Cada fase estiliza um conjunto de módulos CSS já existentes; só a Fase E altera renderização JS (markup, não dados). Valores do `playbook-redesign-ufma-v2.md` são traduzidos de HEX/`--ufma-*` para `oklch(var(--token))`.

**Tech Stack:** Vanilla JS (ES modules), CSS custom properties (OKLCH), FullCalendar 6, Chart.js, `npx serve`, Playwright (smoke + css-tokens).

**Spec:** `docs/superpowers/specs/2026-05-29-redesign-google-calendar.md`

---

## Regra de tradução de valores (aplicar em TODAS as fases CSS)

Ao copiar specs do playbook, substituir:
- `#1a73e8` / `--ufma-accent-blue` → `oklch(var(--primary))`
- `--ufma-bg-surface` → `oklch(var(--card))` · `--ufma-bg-primary` → `oklch(var(--background))` · `--ufma-bg-elevated` → `oklch(var(--muted))`
- `--ufma-border-subtle` → `oklch(var(--border))`
- `--ufma-text-primary/secondary/tertiary` → `oklch(var(--foreground))` / `oklch(var(--muted-foreground))` / `oklch(var(--muted-foreground) / .7)`
- `--ufma-campus-eng/lic/sau` → `oklch(var(--campus-eng/lic/sau))`
- `--ufma-danger/success/warning` → `oklch(var(--destructive/success/warning))`
- Raios/sombras/transições → usar `--radius*`, `--shadow*`, `--transition*` já existentes.
- Fonte: sempre `var(--font-sans)` (Inter). **Não** adicionar Google Sans/Roboto.

**Constraint global:** preservar todos os IDs/classes/atributos listados na §2 da spec. Nenhuma query Supabase/auth/regra de negócio é tocada.

---

## Task A: Fundação — tokens de espaçamento + motion

**Files:**
- Modify: `css/tokens.css` (adicionar escala `--space-*` no `:root`)
- Create: `css/motion.css`
- Modify: `index.html`, `login.html` (linkar `motion.css` por último)

- [ ] **Step 1: Adicionar escala de espaçamento em `css/tokens.css`**

No bloco `:root` (após `--radius`), inserir:

```css
  /* Spacing scale (base 4px) */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;
  --space-12: 48px;
```

- [ ] **Step 2: Criar `css/motion.css`**

```css
/* css/motion.css — motion de alto impacto + acessibilidade (skill frontend-design) */

@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}

/* revelação escalonada — aplicar .reveal aos grupos de data/seções */
.reveal { animation: rise .45s cubic-bezier(.4,0,.2,1) both; }
.reveal:nth-child(2) { animation-delay: .05s; }
.reveal:nth-child(3) { animation-delay: .12s; }
.reveal:nth-child(4) { animation-delay: .19s; }

/* fade na troca de abas */
.tab-content.active { animation: rise .3s cubic-bezier(.4,0,.2,1) both; }

/* fallback: se motion reduzido, nada fica escondido */
@media (prefers-reduced-motion: reduce) {
  .reveal, .tab-content.active { animation: none !important; opacity: 1 !important; transform: none !important; }
}

/* focus ring refinado (acessibilidade + craft) */
:focus-visible {
  outline: 2px solid oklch(var(--primary));
  outline-offset: 2px;
  border-radius: 4px;
}

/* scrollbar custom */
* { scrollbar-width: thin; scrollbar-color: oklch(var(--border)) transparent; }
*::-webkit-scrollbar { width: 8px; height: 8px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: oklch(var(--border)); border-radius: 4px; }
*::-webkit-scrollbar-thumb:hover { background: oklch(var(--muted-foreground) / .5); }
```

- [ ] **Step 3: Linkar `motion.css` por último em `index.html` e `login.html`**

Adicionar após `css/components.css`:

```html
    <link rel="stylesheet" href="css/motion.css">
```

- [ ] **Step 4: Verificar no preview**

Servir (`npx serve -p 3030`), abrir `index.html`, no console:
`getComputedStyle(document.documentElement).getPropertyValue('--space-4')` → `"16px"`.
Confirmar 0 erros no console e que `motion.css` retorna 200.

- [ ] **Step 5: Commit**

```bash
git add css/tokens.css css/motion.css index.html login.html
git commit -m "feat(redesign): fase A — tokens de espacamento + motion.css (reveal, focus, scrollbar)"
```

---

## Task B: Layout base refinado

**Files:**
- Modify: `css/layout.css` (`.app-container`, `.main-content`, `.content-wrapper`)

- [ ] **Step 1: Garantir shell 100vh flex sem scroll global**

Em `css/layout.css`, conferir/ajustar:
- `.app-container { display:flex; height:100vh; overflow:hidden; }`
- `.main-content { flex:1; display:flex; flex-direction:column; overflow:hidden; }`
- `.content-wrapper { flex:1; overflow:auto; }`
- `#abaCalendario.active { display:flex; flex-direction:column; height:100%; }`
- `#calendario { flex:1; min-height:0; }` (CRÍTICO para FC não estourar)

- [ ] **Step 2: Atmosfera sutil no conteúdo**

```css
.content-wrapper {
  background: radial-gradient(120% 80% at 100% 0%, oklch(var(--primary) / .04), transparent 60%);
}
```

- [ ] **Step 3: Verificar** — navegar entre abas; calendário mostra todas as semanas; scroll só no `.content-wrapper`. Screenshot 1440px.

- [ ] **Step 4: Commit**

```bash
git add css/layout.css
git commit -m "feat(redesign): fase B — layout base 100vh + atmosfera sutil"
```

---

## Task C: Topbar estilo Google

**Files:**
- Modify: `css/topbar.css`

- [ ] **Step 1: Estilizar `.top-bar`, `.search-box`, `.legend-chip`, `#btnNovoAgendamento`**

Aplicar a spec da **Fase 2 do playbook** (linhas ~172-209), traduzindo valores via regra global:
- `.top-bar`: height 60-64px, `background:oklch(var(--card))`, `border-bottom:1px solid oklch(var(--border))`.
- `#btnNovoAgendamento`: pill (`border-radius:var(--radius-full)`), `background:oklch(var(--primary))`, `color:#fff`, `box-shadow:var(--shadow-md)`, hover `translateY(-1px)`.
- `.search-box input`: pill, `background:oklch(var(--muted))`, expandir width no `:focus`.
- `.legend-chip`: pill com `.chip-dot`; inativo borda sutil; `.active` → `background:oklch(var(--primary) / .1); border-color:oklch(var(--primary) / .4); color:oklch(var(--primary))`.
- `.btn-icon`: circular 38-40px, hover `background:oklch(var(--muted))`.

- [ ] **Step 2: Verificar** — chips alternam visual ao clicar (sem quebrar `filtrarPorEspaco`); busca expande no focus; botão Novo pill. Screenshot.

- [ ] **Step 3: Commit**

```bash
git add css/topbar.css
git commit -m "feat(redesign): fase C — topbar Google (pill Novo, busca, chips campus)"
```

---

## Task D: Sidebar estruturada

**Files:**
- Modify: `css/layout.css` (seção sidebar)
- Modify: `index.html` (somente se faltar atributo; não remover IDs/data-target)

- [ ] **Step 1: Estilizar `.sidebar`, `.nav-item`, `.nav-label`, `.sidebar-footer`**

Aplicar a spec da **Fase 3 do playbook** (linhas ~282-346), traduzida:
- `.sidebar`: `background:oklch(var(--card))`, `border-right:1px solid oklch(var(--border))`, padding `var(--space-4) var(--space-3)`.
- `.nav-item`: flex gap 14px, `border-radius:var(--radius)`, hover `background:oklch(var(--muted))`.
- `.nav-item.active`: `background:oklch(var(--primary) / .09); color:oklch(var(--primary))` + indicador lateral 3px via `::before`.
- `.nav-label`: 10-11px uppercase, `letter-spacing:.7px`, `color:oklch(var(--muted-foreground))`.
- `.sidebar-footer`: avatar 34px, email truncado, badge role, botão sair `hover:color:oklch(var(--destructive))`.

- [ ] **Step 2: Colapso 72px (opcional nesta fase, só visual)**

`.sidebar.collapsed { width:72px; }` ocultando textos; tooltips via `title`. Estado em `localStorage` se trivial; caso contrário, deixar só a transição de largura.

- [ ] **Step 3: Verificar** — navegação entre abas funciona (`switchTab`), item ativo destacado, seção Administração visível p/ dono. Screenshot.

- [ ] **Step 4: Commit**

```bash
git add css/layout.css index.html
git commit -m "feat(redesign): fase D — sidebar (nav ativo c/ indicador, footer compacto)"
```

---

## Task F: Modais

**Files:**
- Modify: `css/modais.css`, `css/modais-form.css`, `css/modais-form-extra.css`, `css/modais-informativos.css`, `css/modal-cancelamento.css`

- [ ] **Step 1: Overlay + container**

Aplicar a **Fase 6 do playbook** (linhas ~840-911), traduzida:
- Overlay: `background:rgb(0 0 0 / .6); backdrop-filter:blur(4px)`.
- Container: `background:oklch(var(--card)); border-radius:var(--radius-xl); box-shadow:var(--shadow-lg)`; entrada `scale(.95)→1` + opacity (reusar `@keyframes rise` ou local).

- [ ] **Step 2: Inputs/selects/botões do form**

- Inputs: `border:1px solid oklch(var(--border)); border-radius:var(--radius-md)`; `:focus` → `border-color:oklch(var(--primary)); box-shadow:0 0 0 3px oklch(var(--primary) / .15)`.
- Footer: "Cancelar" outline, "Confirmar" `background:oklch(var(--primary))`.
- Accordion de espaços + linhas de data conforme playbook.

- [ ] **Step 3: Verificar** — abrir modal de Novo Agendamento; campos focáveis; sem alterar IDs/names; fluxo de steps intacto. Screenshot.

- [ ] **Step 4: Commit**

```bash
git add css/modais.css css/modais-form.css css/modais-form-extra.css css/modais-informativos.css css/modal-cancelamento.css
git commit -m "feat(redesign): fase F — modais (blur, inputs focus, accordion)"
```

---

## Task G: Telas administrativas

**Files:**
- Modify: `css/paginas.css` (Dashboard, Relatórios, Usuários), `css/cancelamentos-historico.css`, `css/conflitos.css`
- Modify: `index.html` (markup leve dos KPIs/tabela, preservando IDs de canvas e selects)

- [ ] **Step 1: Dashboard (KPIs + charts)** — Fase 9.2 do playbook, traduzida. Grid de KPI cards (1→2→4 colunas), `.chart-card` com header/body; preservar IDs dos `<canvas>`.
- [ ] **Step 2: Cancelamentos** — Fase 9.3. Itens com indicador cinza, título riscado, audit trail, botão Restaurar (preservar função de restauração).
- [ ] **Step 3: Conflitos** — Fase 9.4. Cards pareados (evento A × evento B), separador `×`, footer com sobreposição + ações.
- [ ] **Step 4: Relatórios** — Fase 9.5. 3 cards (Excel/PDF/Backup) com ícone colorido, mesma altura; preservar selects ano/mês e listeners de download.
- [ ] **Step 5: Usuários** — Fase 9.6. Tabela com header arredondado, avatar de iniciais, select de role colorido por tipo, hover de linha; preservar funções de update role / remover.

- [ ] **Step 6: Verificar** — logar como dono; cada aba admin carrega dados reais; gráficos renderizam; restaurar/role/remover funcionam. Screenshot de cada.

- [ ] **Step 7: Commit**

```bash
git add css/paginas.css css/cancelamentos-historico.css css/conflitos.css index.html
git commit -m "feat(redesign): fase G — telas admin (dashboard, cancelamentos, conflitos, relatorios, usuarios)"
```

---

## Task I: Polish

**Files:**
- Modify: `css/components.css` (skeleton, toasts, badges), `css/base.css` (empty states), `css/utilitarios-responsivo.css`

- [ ] **Step 1: Skeleton + empty states + toasts** — Fase 8 do playbook, traduzida. `.skeleton` shimmer (já existe base em components.css — refinar); empty state centralizado com ícone + CTA; toasts com `border-left` 3px por tipo, slide-in.
- [ ] **Step 2: Revisão dark/light** — verificar todos os componentes novos em ambos os temas (toggle `#btnToggleTheme`), contraste ≥ 4.5:1.
- [ ] **Step 3: Verificar** — alternar tema; nenhum elemento sem hover; skeletons aparecem no load. Screenshot light + dark.
- [ ] **Step 4: Commit**

```bash
git add css/components.css css/base.css css/utilitarios-responsivo.css
git commit -m "feat(redesign): fase I — polish (skeleton, empty states, toasts, dark/light)"
```

---

## Task E: Núcleo — calendário + listas (MAIOR RISCO)

**Files:**
- Modify: `js/components.js:13-76` (`gerarCardEventoHtml`)
- Modify: `js/telas.js:23` (`renderizarCards`), `js/telas.js:173` (`renderizarCardsCancelados`)
- Modify: `css/listas-eventos.css`, `css/listas-eventos-extra.css`, `css/calendario.css`

- [ ] **Step 1: Reescrever `gerarCardEventoHtml` para o item minimalista**

Substituir o `return` (mantendo a lógica de datas/permissões/escape acima) por:

```javascript
    const campusClasse = getClasseBadge(espacos[0] || ''); // ex: badge-eng → mapear p/ cor
    const indClasse = isCancelado ? 'enc' : campusClasse.replace('badge-', 'ind-');
    return `
        <div class="evento ${passado ? 'past' : ''} ${isCancelado ? 'enc' : ''}"
             data-event-id="${ev.id}" data-event-json="${escapeHtml(JSON.stringify(ev))}">
            <div class="evento__ind ${indClasse}"></div>
            <div class="evento__body event-content-clickable">
                <div class="evento__title">
                    ${escapeHtml(ev.extendedProps.tituloPuro || ev.title)}
                    ${badgeConflito}${badgeCancelamento}
                </div>
                <div class="evento__meta">
                    <span>${periodo}</span>
                    <span class="sep">•</span>
                    <span>${escapeHtml(ev.extendedProps.responsavel) || '-'}</span>
                </div>
                <div class="evento__tags">
                    ${espacos.map(e => `<span class="tag">${escapeHtml(e)}</span>`).join('')}
                </div>
                ${blocoMotivo}
            </div>
            ${podeAgir ? `
            <div class="evento__acoes">
                <button class="acao" onclick="event.stopPropagation(); window.prepararEdicaoPorId('${ev.id}')" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="acao del" onclick="event.stopPropagation(); window.deletarPorId('${ev.id}')" title="Excluir"><i class="fas fa-trash"></i></button>
            </div>` : ''}
        </div>`;
```

> Manter `getClasseBadge` retornando `badge-eng/lic/sau/outros`; no CSS mapear `.ind-eng/.ind-lic/.ind-sau/.ind-outros`.

- [ ] **Step 2: Agrupar por data em `renderizarCards`**

Antes de renderizar, agrupar `eventos` por dia (chave `YYYY-MM-DD` de `ev.start`), ordenado desc. Para cada grupo emitir:

```javascript
function headerGrupo(d){
  const dia = String(d.getDate()).padStart(2,'0');
  const info = d.toLocaleDateString('pt-BR',{month:'long'}) ;
  const dow = d.toLocaleDateString('pt-BR',{weekday:'long'});
  return `<div class="grupo-data reveal">
    <div class="grupo-head"><span class="grupo-dia">${dia}</span>
      <span class="grupo-info">de ${info} (${dow})</span></div>
    <div class="grupo-linha"></div>`;
}
```

Fechar cada grupo com `</div>`. Itens via `gerarCardEventoHtml`. Data **nunca** repetida no item.

- [ ] **Step 3: Seção "Encerrados" colapsável**

No fim da lista (reusando a separação ativos/cancelados que o JS já faz), emitir:

```javascript
`<div class="encerrados reveal">
   <button class="enc-toggle" aria-expanded="false"
     onclick="this.nextElementSibling.hidden=!this.nextElementSibling.hidden;this.setAttribute('aria-expanded',!this.nextElementSibling.hidden);this.querySelector('i').classList.toggle('open')">
     <i class="fas fa-chevron-down"></i> <b>Encerrados do mês</b> <span>(${encerrados.length})</span>
   </button>
   <div class="enc-conteudo" hidden>${htmlEncerrados}</div>
 </div>`
```

- [ ] **Step 4: CSS dos itens + grupos + encerrados**

Em `css/listas-eventos.css`, portar do mockup (`docs/redesign-mockup.html`): `.evento`, `.evento__ind` (+ `.ind-eng/lic/sau`), `.evento__title/meta/tags`, `.tag`, `.evento__acoes .acao`, `.grupo-data/head/dia/info/linha`, `.encerrados`, `.enc-toggle`, `.enc-conteudo`, `.evento.enc`. Indicador 3px é o ÚNICO uso de cor de campus.

- [ ] **Step 5: FC overrides em `css/calendario.css`** — Fase 5 PARTE A do playbook: ocultar header nativo (`.fc .fc-toolbar{display:none}`), eventos com `border-left` 3px + fundo translúcido (`--cal-*-bg/text/border`), dia atual com bolinha `oklch(var(--primary))`, `+more` estilizado.

- [ ] **Step 6: Verificar (crítico, 3 papéis)**

`npx serve` + preview. Validar:
- Listas agrupadas por data; data não repetida.
- Item minimalista; cor só no indicador.
- Hover mostra ações; **editar e excluir ainda funcionam** (`prepararEdicaoPorId`/`deletarPorId`).
- "Encerrados (N)" abre/fecha; itens riscados/opacos.
- Calendário mostra eventos com border-left; sem header nativo duplicado.
- Console sem erros. Testar como dono, editor, leitor.
- Rodar `npx playwright test` (smoke + css-tokens) → verde.

- [ ] **Step 7: Commit**

```bash
git add js/components.js js/telas.js css/listas-eventos.css css/listas-eventos-extra.css css/calendario.css
git commit -m "feat(redesign): fase E — cards minimalistas + agrupamento por data + encerrados + FC overrides"
```

---

## Task H: Responsividade mobile

**Files:**
- Modify: `css/utilitarios-responsivo.css`, `css/topbar.css`, `css/layout.css`

- [ ] **Step 1: Breakpoints** — Fase 7 do playbook: `<768px` sidebar vira drawer (overlay), topbar 56px (logo+busca+avatar), FAB `#btnNovoAgendamento` fixo bottom-right 56px; chips com scroll horizontal; listas em layout vertical com ações sempre visíveis; modais full-width.
- [ ] **Step 2: Verificar** — preview presets mobile (375px) e tablet (768px): drawer abre/fecha, FAB funcional, nada cortado, modal não estoura. Screenshots.
- [ ] **Step 3: Commit**

```bash
git add css/utilitarios-responsivo.css css/topbar.css css/layout.css
git commit -m "feat(redesign): fase H — responsividade mobile (drawer, FAB, breakpoints)"
```

---

## Validação final (após todas as fases)

- [ ] Checklist cruzado do playbook (§"Checklist de Validação Cruzada") — funcionalidades + visual + código.
- [ ] `npx playwright test` verde.
- [ ] Deploy preview Vercel; smoke manual dos 3 papéis.
- [ ] Remover `docs/redesign-mockup.html` (artefato de design) se não for mais útil.

---

## Self-Review (preenchido)

**Cobertura da spec:** Fases A–I e E,H da §4 da spec ↔ Tasks A,B,C,D,F,G,I,E,H. ✔ Todas cobertas. Fora de escopo (mini-calendário) não vira task. ✔
**Placeholders:** código completo nas partes novas (A, E); fases de estilização referenciam o playbook no repo + regra de tradução explícita (não é "TODO", é fonte de verdade versionada). ✔
**Consistência de tipos/classes:** `gerarCardEventoHtml` emite `.evento/.evento__ind/.ind-*/.evento__body/.evento__title/.evento__meta/.evento__tags/.evento__acoes .acao`; CSS da Task E Step 4 usa exatamente essas classes; `renderizarCards` usa `.grupo-data/.reveal/.encerrados/.enc-toggle/.enc-conteudo`. ✔
