# Redesign Visual "Google Calendar Style" — Agenda UFMA

> **Data:** 2026-05-29 | **Branch base:** `preview/security-fase1`
> **Origem:** `playbook-redesign-ufma-v2.md` (9 fases) + skill `frontend-design` (Anthropic)
> **Decisão de tokens:** adaptar o LAYOUT/interações do playbook sobre o sistema OKLCH/shadcn já existente (Fase 1). Não criar camada `--ufma-*`.

---

## 1. Objetivo

Modernizar toda a interface do sistema para a linguagem visual "Google Calendar" (topbar limpa, sidebar estruturada, listas minimalistas agrupadas por data, modais refinados), **sem tocar no backend**. Reaproveitar os tokens OKLCH e os 23 módulos CSS existentes; elevar o craft visual aplicando os princípios da skill `frontend-design`.

## 2. Regra de Ouro (Anti-Regressão)

`MANTER` 100% da lógica JavaScript de negócio. Alterações permitidas:
- CSS (tokens, módulos, novos arquivos).
- HTML estrutural **desde que** IDs/classes/atributos lidos pelo JS sejam preservados.
- Renderização de markup no JS (`gerarCardEventoHtml`, `renderizarCards`) **somente** para mudar a estrutura visual — sem alterar dados, queries, validações ou fluxos.

**Proibido:** alterar queries Supabase, auth, permissões (`aplicarPermissoes`/`initAuth`), schema, ou qualquer regra de negócio.

### Hooks JS que NÃO podem quebrar
- `switchTab(tabId, navElement)` + `data-target` nos `.nav-item` + classe `.active`.
- `filtrarPorEspaco(filtro, el)` + `data-filter` nos `.legend-chip`.
- IDs: `#appContainer`, `#sidebar`, `#calendario`, `#abaCalendario` (+ demais `aba*`), `#btnNovoAgendamento`, `#btnToggleTheme`, `#btnRefreshDados`, `#buscaGlobal`, `#menuToggle`.
- `data-event-id` / `data-event-json` no card; `window.prepararEdicaoPorId`, `window.deletarPorId`.
- IDs dos canvas Chart.js e dos selects de exportação.

## 3. Direção Estética (skill frontend-design)

**Conceito: "Calma Institucional Editorial"** — sóbrio, confiável, com personalidade acadêmica; nunca clone genérico.

| Eixo | Decisão |
|------|---------|
| **Tipografia** | Inter apenas (decisão do usuário). Hierarquia por peso (400–700), tamanho e `letter-spacing`. Âncoras: número do dia em 34px tracking negativo; labels de seção uppercase tracked. |
| **Cor** | Canvas neutro dominante (`--background`/`--muted`) + um acento UFMA (`--primary`). Cores de campus (`--campus-*`) **apenas** como indicador 3px / dot — nunca background inteiro. |
| **Motion** | Momento de alto impacto: revelação escalonada (`@keyframes rise`) dos grupos de data no load + fade na troca de abas. Sem micro-animações dispersas. **Obrigatório** `@media (prefers-reduced-motion: reduce)` e fallback de visibilidade (conteúdo nunca fica `opacity:0` se a animação não disparar). |
| **Espaço** | Número do dia "quebra o grid" como âncora. Negative space generoso entre grupos. |
| **Detalhes** | Gradiente radial sutil de atmosfera no conteúdo/login; focus rings `2px solid oklch(var(--primary))` com offset; scrollbar custom; skeleton/empty states cuidados. |

## 4. Mapa de Fases → Arquivos

> 23 módulos CSS já existem em `css/`. A sidebar é estilizada em `css/layout.css` (não há `sidebar.css`).

| Fase | Escopo | Arquivos | Tipo | Risco |
|------|--------|----------|------|-------|
| **A** | Tokens de layout faltantes + motion | `css/tokens.css` (add `--space-1..12`); novo `css/motion.css` (keyframes `rise`, reduced-motion, focus-visible) + link nos HTML | CSS | 🟢 |
| **B** | Layout base refinado (100vh flex já existe) | `css/layout.css` | CSS | 🟢 |
| **C** | Topbar Google: botão "Novo" pill, busca expansível, chips campus | `css/topbar.css` | CSS | 🟡 |
| **D** | Sidebar: nav ativo c/ indicador, footer compacto, colapso 72px | `css/layout.css` (+ `index.html` se faltar atributo) | CSS | 🟡 |
| **F** | Modais: backdrop blur, inputs focus, accordion espaços | `css/modais.css`, `css/modais-form*.css`, `css/modais-informativos.css`, `css/modal-cancelamento.css` | CSS | 🟢 |
| **G** | Telas admin: Dashboard (KPIs+charts), Cancelamentos, Conflitos, Relatórios, Usuários | `css/paginas.css`, `css/cancelamentos-historico.css`, `css/conflitos.css` (+ markup leve em `index.html`) | CSS + markup | 🟡 |
| **I** | Polish: scrollbar, skeleton, toasts, empty states, dark consistente | `css/components.css`, `css/utilitarios-responsivo.css`, `css/base.css` | CSS | 🟢 |
| **E** | **Calendário + listas (núcleo):** FC overrides, card minimalista, agrupamento por data, seção "Encerrados" colapsável | `css/calendario.css`, `css/listas-eventos*.css`, `js/components.js` (`gerarCardEventoHtml`), `js/telas.js` (`renderizarCards`, `renderizarCardsCancelados`) | CSS + **JS render** | 🔴 |
| **H** | Mobile: drawer sidebar, FAB, media queries | `css/utilitarios-responsivo.css`, `css/topbar.css`, `css/layout.css` | CSS | 🟡 |

### Sequência de execução
`A → B → C → D → F → G → I → E → H`
(Fundação → componentes isolados → polish → núcleo de listas/JS de maior risco → mobile por fim.)

## 5. Detalhamento das mudanças por fase

### Fase A — Tokens & Motion
- `css/tokens.css`: adicionar escala `--space-1:4px … --space-12:48px` no `:root`.
- Novo `css/motion.css`:
  - `@keyframes rise { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }`
  - `.reveal` aplicada a grupos; delays escalonados.
  - `@media (prefers-reduced-motion: reduce){ .reveal{animation:none;opacity:1;transform:none} }`
  - `:focus-visible{ outline:2px solid oklch(var(--primary)); outline-offset:2px }`
  - Scrollbar custom (webkit + firefox).
- Linkar `motion.css` por último em `index.html` e `login.html`.

### Fase E — Núcleo (maior risco, fazer com verificação visual)
**`gerarCardEventoHtml` (js/components.js):** trocar `.event-row` + `.event-date-box` pela estrutura minimalista: indicador lateral 3px (cor do campus via classe, não inline), título, meta com `•`, tags sutis, ações no hover. Preservar `data-event-id`/`data-event-json` e os botões `prepararEdicaoPorId`/`deletarPorId`.
**`renderizarCards` (js/telas.js):** agrupar eventos por data → emitir header de grupo ("DD de Mês (dia-da-semana)") + itens; data nunca repetida. Seção "Encerrados" colapsável no fim (reusa separação ativos/cancelados que o JS já faz).
- Card de evento usa as classes novas; CSS em `listas-eventos*.css`.
- FC overrides em `calendario.css`: eventos com `border-left` 3px + fundo translúcido (tokens `--cal-*-bg/text/border` já existem), header nativo oculto, dia atual com bolinha azul.

### Demais fases
Aplicar a spec visual do `playbook-redesign-ufma-v2.md` (Fases 2,3,4,6,7,8,9) traduzindo cada valor HEX/`--ufma-*` para o token OKLCH equivalente já existente (`oklch(var(--primary))`, `oklch(var(--border))`, etc.). Critérios de aceite de cada fase = os do playbook.

## 6. Validação

- Cada fase: build local (`npx serve`) + verificação no preview + screenshot antes de avançar.
- Smoke E2E existente (`tests/smoke.spec.js`, `tests/css-tokens.spec.js`) deve continuar verde.
- Checklist cruzado do playbook (§"Checklist de Validação Cruzada") ao final.
- Deploy de preview no Vercel por fase concluída.

## 7. Fora de escopo (adiado)
- Mini-calendário na sidebar (playbook 3.2) — único item que exigiria JS novo de sincronização com FullCalendar. Fase futura opcional.
- Qualquer mudança de backend, schema, auth ou regra de negócio.

## 8. Riscos
- **Fase E** altera renderização JS — risco de regressão em ações de editar/excluir e na separação ativos/cancelados. Mitigação: preservar contratos de `data-*` e funções globais; testar os 3 papéis (dono/editor/leitor).
- **Motion headless**: animações de entrada podem esconder conteúdo se não dispararem. Mitigação: fallback `opacity:1` + `prefers-reduced-motion` (Fase A).
