# Roadmap — Agenda UFMA
> Versão: 1.0 | Data: 2026-05-08 | Branch base: `preview/security-fase1`

## Regra de Ouro
**Nunca quebrar o sistema em produção.** Cada fase entrega valor isolado e pode ser deployada independentemente. Toda mudança de UI preserva IDs e seletores usados pelo JS.

---

## Visão Geral das Fases

```
FASE 0 ── Bugs Críticos (P0)              ~2 dias   [AGORA]
FASE 1 ── Design System shadcn-style      ~3 dias   [UI Foundation]
FASE 2 ── Layout & Responsividade         ~4 dias   [Mobile-ready]
FASE 3 ── Componentes & Micro-interações  ~4 dias   [Polimento]
FASE 4 ── Refatoração de Código           ~5 dias   [Arquitetura]
FASE 5 ── Features Backlog (Quick Wins)   ~5 dias   [Produto]
FASE 6 ── Features Avançadas             ~10 dias   [Produto+]
FASE 7 ── Testes & CI/CD                  ~4 dias   [Qualidade]
```

**Total estimado: ~37 dias de trabalho**

---

## FASE 0 — Bugs Críticos (P0)
> **Risco: Zero** — correções pontuais sem mudança de API ou estrutura
> **Duração: ~2 dias**

### 0.1 `canceladopor` nunca gravado
- **Arquivo:** `js/reservas.js` → função `deletarEvento()`
- **Fix:** Adicionar `canceladopor: estado.usuarioAtual.email` no objeto de update do soft delete
- **Impacto:** Histórico de cancelamentos passa a ter responsável registrado

### 0.2 Notificações falsas
- **Arquivo:** `js/notifications.js`
- **Fix:** Implementar `dispararNotificacaoManual()` com insert real na tabela `notificacoes` do Supabase ou remover o botão da UI até estar pronto
- **Impacto:** Remove funcionalidade enganosa

### 0.3 XSS em `components.js:55`
- **Arquivo:** `js/components.js` linha ~55
- **Fix:** Substituir `JSON.stringify` no atributo `onclick` por `data-*` attributes + event delegation
- **Impacto:** Fecha vulnerabilidade de segurança

### 0.4 `atualizarDashboard()` sem argumento
- **Arquivo:** `app.js`
- **Fix:** Passar `estado` como argumento em todas as chamadas de `atualizarDashboard()`
- **Impacto:** Dashboard não crashará silenciosamente

### 0.5 Tippy.js não utilizado
- **Arquivo:** `index.html`
- **Fix:** Remover as 4 tags script/link do Tippy.js e Popper.js
- **Impacto:** -2 requisições CDN por page load, CSP mais restrita

### Critério de conclusão
- [ ] Todos os 5 bugs corrigidos e validados manualmente
- [ ] Push para `preview/security-fase1`
- [ ] Nenhuma funcionalidade existente quebrada

---

## FASE 1 — Design System shadcn-style
> **Risco: Baixo** — apenas CSS, zero JS tocado
> **Duração: ~3 dias**
> **Inspiração:** shadcn/ui visual language adaptado para identidade acadêmica UFMA

### Por que "shadcn-style" e não shadcn
shadcn/ui requer React. Este projeto é Vanilla JS. O que adotamos é o *design language*:
oklch color system, CSS variables como tokens únicos, tipografia Inter, bordas sutis (#e2e8f0 estilo), sombras mínimas, raios consistentes. Tudo implementável em CSS puro.

### 1.1 Criar `css/tokens.css`
Arquivo novo. Importado no `index.html` e `login.html` antes do `style.css`.
Substitui o sistema duplo atual (`--primary-*` e `--ufma-*`) por um único sistema baseado em oklch:

```
Tokens obrigatórios:
  --background, --foreground
  --card, --card-foreground
  --muted, --muted-foreground
  --border, --input, --ring
  --brand (azul UFMA institucional)
  --campus-eng (roxo), --campus-lic (âmbar), --campus-sau (esmeralda)
  --destructive, --success, --warning
  --radius (0.625rem padrão shadcn)
  --font-sans: 'Inter', system-ui
  --shadow-sm, --shadow-md, --shadow-lg
```

Variantes dark em `[data-theme="dark"]` para todos os tokens semânticos.

### 1.2 Refatorar `style.css`
- Substituir todos os `--primary-*`, `--gray-*`, `--eng-color` pelos novos tokens
- Manter todos os seletores de classe intactos
- Resultado: visual mais coeso, dark mode sem inconsistências

### 1.3 Componentes base em `css/components.css`
Arquivo novo com classes reutilizáveis:
- `.btn` + variantes: `btn-primary`, `btn-destructive`, `btn-outline`, `btn-ghost`
- `.badge` + variantes: `badge-dono`, `badge-editor`, `badge-leitor`, `badge-eng`, `badge-sau`, `badge-lic`
- `.card`, `.card-header`, `.card-content`, `.card-footer`
- `.skeleton` (shimmer animation para loading)
- `.separator`

### 1.4 Tipografia acadêmica
- Inter como fonte primária (já carregada)
- Scale: h1(24px/700), h2(20px/600), h3(16px/600), body(14px/400), caption(12px/400)
- Line-height 1.6 para textos longos (leitura acadêmica)

### Critério de conclusão
- [ ] `css/tokens.css` criado e importado antes de `style.css`
- [ ] `style.css` sem tokens legados órfãos
- [ ] Dark mode funcionando com novo sistema
- [ ] Visual testado em Chrome + Firefox

---

## FASE 2 — Layout & Responsividade
> **Risco: Médio** — mexe em estrutura HTML, mas IDs e seletores JS preservados
> **Duração: ~4 dias**

### 2.1 App Shell responsivo

**Desktop (≥ 1280px):** Sidebar 240px fixa | Topbar 64px sticky | Content flex-1

**Tablet (768px–1279px):** Sidebar colapsada (ícones 60px) com botão hamburger no topbar

**Mobile (< 768px):** Sidebar oculta | Bottom navigation bar (5 ícones) | Content fullscreen

### 2.2 Topbar acadêmico
- Logo + nome da instituição à esquerda
- Título do período (mês/ano) ao centro
- Ações à direita: busca, theme toggle, avatar com badge de role
- Sem overflow em nenhum viewport

### 2.3 Sidebar estruturada
- Seções agrupadas: Calendário | Meus Eventos | Espaços | Admin
- Indicador visual da seção ativa (border-left 3px accent)
- Collapse suave via CSS transition
- Footer: versão do sistema

### 2.4 Calendar fix (BUG-CSS-002)
- Corrigir calendário cortado em viewports < 1400px
- Altura: `calc(100dvh - 64px - 32px)` responsivo
- Eventos recorrentes: badge visual de grupo

### 2.5 Modais responsivos
- `max-height: 90dvh` + `overflow-y: auto`
- Mobile: modal como bottom sheet (desliza de baixo)
- Formulário de recorrência legível no mobile

### Critério de conclusão
- [ ] Layout funcional em 320px, 768px, 1024px, 1440px
- [ ] Calendário sem cortes
- [ ] Bottom nav mobile funcional
- [ ] Nenhum seletor JS quebrado

---

## FASE 3 — Componentes & Micro-interações
> **Risco: Baixo** — CSS e pequenos ajustes HTML sem tocar lógica
> **Duração: ~4 dias**

### 3.1 Cards de evento
- Borda esquerda colorida por campus (3px solid var(--campus-*))
- Hover: shadow elevada + translateY(-1px) suave
- Ícone de recorrência para eventos com `groupid`
- Tooltip CSS puro (sem Tippy) no hover

### 3.2 Chips de filtro de campus
- Animação de seleção: background fill 150ms
- Badge numérico com contagem por campus
- Scroll horizontal no mobile

### 3.3 Skeleton loading
- Shimmer CSS animation ao carregar calendário e dashboard
- Sem JS adicional, sem biblioteca externa

### 3.4 Estado vazio
- Ilustração SVG inline quando sem eventos no período
- CTA "Criar Agendamento" no estado vazio

### 3.5 FAB mobile
- Desktop: botão pill no topbar (comportamento atual preservado)
- Mobile: FAB fixo bottom-right com position fixed
- Scale 0.95 no active state

### 3.6 Toast queue
- Toasts empilham verticalmente (não sobrepõem)
- Auto-dismiss com barra de progresso animada
- Swipe-to-dismiss no mobile

### 3.7 Badges de role
- Visual: chip colorido (dono=azul, editor=verde, leitor=cinza)
- Aplicado no avatar do topbar e na lista de usuários admin

### 3.8 Modal acadêmico
- Header com título + ícone + badge de status do evento
- Dividers entre seções do form
- Inline validation (vermelho embaixo do campo, não só no submit)
- Progress counter para recorrência: "X sessões serão criadas"

### 3.9 Acessibilidade básica
- `aria-label` em botões de ícone
- `role="dialog"` + `aria-modal="true"` nos modais
- `:focus-visible` consistente e customizado
- `prefers-reduced-motion` para desabilitar animações

### Critério de conclusão
- [ ] Estados loading/empty/error implementados em todas as seções
- [ ] Animações não bloqueiam fluxo funcional
- [ ] Tab navigation funcional nos modais
- [ ] WCAG AA verificado nas cores primárias

---

## FASE 4 — Refatoração de Código
> **Risco: Médio** — extrair módulos um por vez com testes manuais entre cada extração
> **Duração: ~5 dias**

### 4.1 Extrair `js/ui.js`
De `app.js` para `js/ui.js`:
- `showToast()`, `hideLoading()`, `showLoading()`
- `toggleTheme()`, `initTheme()`, `updateThemeIcon()`
- `initUI()`, `construirInterfaceDinamica()`
- `debounce()`

### 4.2 Extrair `js/admin.js`
De `app.js` para `js/admin.js`:
- `carregarListaUsuariosAdmin()`
- `adicionarUsuarioViaAdmin()`
- `deletarUsuario()`

### 4.3 Extrair `js/export.js`
De `app.js` para `js/export.js`:
- `exportarExcel()`, `exportarPDF()`, `fazerBackupJSON()`
- `obterDadosParaExportacao()`

### 4.4 Criar `js/state.js`
Estado global controlado — sem mutação direta:
```js
const _estado = {};
export const getEstado = () => ({ ..._estado });
export const setEstado = (patch) => Object.assign(_estado, patch);
```
Elimina acesso direto a `estado` de qualquer módulo.

### 4.5 Padronizar error handling
Wrapper `dbQuery(queryFn, context)` para todas as chamadas Supabase.
Garante: log no console, toast de erro para o usuário, retorno `null` (nunca throw não-tratado).

### 4.6 Meta final do `app.js`
- Target: < 300 linhas (orquestrador puro — apenas inicializa e conecta módulos)

### Critério de conclusão
- [ ] `app.js` < 300 linhas
- [ ] 6+ módulos JS coesos e testáveis
- [ ] Nenhuma funcionalidade quebrada
- [ ] `estado` só mutável via `setEstado()`

---

## FASE 5 — Features Backlog (Quick Wins)
> **Risco: Baixo-Médio** — features novas que não alteram existentes
> **Duração: ~5 dias**

### 5.1 Histórico de Cancelamentos (Admin)
- Aba "Cancelamentos" no painel admin
- Tabela: Data, Evento, Espaço, Cancelado Por, Motivo
- Botão "Restaurar" (set `cancelado=false, datacancelamento=null`)
- Filtros por período e por usuário
- Pré-requisito: Fix 0.1 (canceladopor gravado)

### 5.2 Painel de Conflitos Global (Admin)
- Aba "Conflitos" com todos `isConflito=true`
- Quem forçou, quais eventos em colisão, data/hora
- Resolução rápida: cancelar um dos lados com motivo

### 5.3 Comunicados / Avisos Banner
- Tabela `comunicados` no Supabase: `titulo`, `corpo`, `expira_em`, `criado_por`, `ativo`
- Banner dismissível no topo do app com aviso vigente
- Admin cria/arquiva comunicados em painel dedicado
- Auto-ocultar quando `expira_em < now()`

### 5.4 Exportação do Histórico de Cancelamentos
- Reutilizar `exportarExcel()` e `exportarPDF()` existentes
- Botão na aba de Histórico
- Filtros sincronizados com a tabela

### 5.5 Duplicar Agendamento
- Botão "Duplicar" no modal de detalhes
- Pré-preenche form com dados do evento original
- Usuário ajusta data e salva como novo

### Critério de conclusão
- [ ] 5 features funcionando em preview branch
- [ ] Tabela `comunicados` com RLS adequada
- [ ] Admin vê histórico com dados corretos (canceladopor preenchido)

---

## FASE 6 — Features Avançadas
> **Risco: Médio-Alto** — novas tabelas no banco, lógica complexa
> **Duração: ~10 dias**

### 6.1 Bloqueio de Período (Admin)
- Tabela `periodos_bloqueados`: `espaco` (null=global), `inicio`, `fim`, `motivo`
- Admin define períodos bloqueados (recessos, reformas)
- Aparecem no calendário como eventos cinza não-clicáveis
- Integrado com `detectarConflitos()` — bloqueia criação no período
- Validação na Fase de Preview antes do insert

### 6.2 Cadastro Dinâmico de Espaços
- Tabela `espacos`: `nome`, `campus`, `capacidade`, `categoria`, `ativo`
- Painel admin: CRUD de espaços com preview de cor
- `js/constants.js` → carregar de Supabase no init (com cache localStorage)
- `getCorPorEspaco()` e filtros passam a ser dinâmicos

### 6.3 Log de Auditoria
- Insert manual em `audit_log` em cada ação sensível (criar, editar, cancelar, forçar conflito)
- Campos: `usuario_email`, `acao`, `entidade`, `entidade_id`, `payload_json`, `timestamp`
- Aba "Auditoria" visível apenas para `dono`
- Filtros por data, usuário, ação

### 6.4 Dashboard Executivo Avançado
- Taxa de ocupação por espaço (% horas reservadas vs. disponíveis)
- Ranking de usuários mais ativos
- Taxa de cancelamentos por usuário
- Heatmap de pico de uso por hora/dia (novo gráfico Chart.js)

### 6.5 Central de Notificações (completar FEAT-001)
- Tabela `notificacoes`: `destinatario`, `titulo`, `corpo`, `lida`, `criado_em`
- Badge de contagem no ícone de sino
- Marcar como lida individualmente e em lote
- `dispararNotificacaoManual()` com insert real

### 6.6 Gestão Avançada de Usuários
- Suspender/ativar conta sem excluir (campo `suspenso` na tabela `usuarios`)
- Transferir agendamentos futuros entre usuários
- Histórico de ações por usuário (a partir do log de auditoria)

### Critério de conclusão
- [ ] Espaços sem hardcode
- [ ] Bloqueio de período integrado à validação
- [ ] Log de auditoria com dados reais
- [ ] Notificações persistidas e contabilizadas

---

## FASE 7 — Testes & CI/CD
> **Risco: Zero** — adiciona qualidade sem alterar produto
> **Duração: ~4 dias**

### 7.1 Vitest (zero config, funciona com ES Modules puro)
```bash
npm install -D vitest
```

### 7.2 Cobertura alvo — funções puras primeiro
Testar sem mock de Supabase:
- `js/utils.js`: `escapeHtml()`, `debounce()`, `stringToColor()`
- `js/db.js`: `dbParaFrontend()`, `frontendParaDb()`
- `js/reservas.js`: `gerarSessoesRecorrentes()`, `detectarConflitos()` (lógica pura)
- `js/calendar.js`: `getCorPorEspaco()`

Meta: ≥ 80% de cobertura nas funções puras.

### 7.3 ESLint
```bash
npm install -D eslint @eslint/js
```
Regras: `no-unused-vars`, `no-undef`, `eqeqeq`, `no-console` (warn).

### 7.4 GitHub Actions — CI pipeline
- Trigger: push em qualquer `preview/*` e PRs para `main`
- Jobs: lint + test
- Bloqueia merge se lint ou tests falharem

### 7.5 Vercel Preview automático
- Cada PR em `preview/*` → deploy automático com URL única
- Review manual antes de merge para `main`

### Critério de conclusão
- [ ] `npm test` passando com ≥ 80% cobertura
- [ ] CI verde em todo push
- [ ] ESLint sem erros críticos
- [ ] Preview deploy automático ativo

---

## Branches & Deploy Strategy

```
main                     ← produção (Vercel auto-deploy)
  └── preview/fase-0     ← bugs críticos → merge imediato em main
  └── preview/fase-1     ← design system
  └── preview/fase-2     ← layout
  └── preview/fase-3     ← componentes
  └── preview/fase-4     ← refatoração
  └── preview/fase-5     ← quick wins
  └── preview/fase-6     ← features avançadas
  └── preview/fase-7     ← testes/ci

Regra: nunca push direto para main.
Cada fase tem preview branch próprio.
Merge para main só após validação visual + funcional manual.
```

---

## Métricas de Sucesso

| Métrica | Antes | Meta (Fase 7) |
|---------|-------|----------------|
| Bugs críticos abertos | 5 | 0 |
| Mobile usável | Não | Sim |
| Cobertura de testes | 0% | ≥ 80% (funções puras) |
| `app.js` linhas | 1020 | < 300 |
| Features do backlog entregues | 0/13 | 5/13 (quick wins) + 4 avançadas |
| Acessibilidade | Nenhuma | WCAG AA básico |
| Espaços hardcoded | Sim | Não |
| Notificações reais | Não | Sim |
| CI/CD ativo | Não | Sim |
| Tippy.js não utilizado | Presente | Removido |

---

## Próximo passo imediato

**→ FASE 0** — 5 bug fixes críticos, risco zero, impacto imediato.
Começar por `0.3` (XSS em components.js) e `0.1` (canceladopor), que são os de maior impacto de segurança/integridade.
