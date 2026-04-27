# 🎨 Playbook de Prompts — Redesign Visual "Google Calendar Style"
## Agenda UFMA | Frontend-Only | Zero Breaking Changes

> **Regra de Ouro de todas as fases:** `MANTER` toda a lógica JavaScript existente. `APENAS` alterar CSS, HTML estrutural (classes e IDs devem permanecer os mesmos ou ter fallback), e atributos de layout. Nenhuma query Supabase, nenhum fluxo de auth, nenhuma regra de negócio pode ser modificada.

---

## 📋 INSTRUÇÕES GERAIS PARA A IA EXECUTORA

**ROLE:** Frontend UI Engineer — Especialista em CSS Arquitetural e Design Systems.

**CONTEXT:**
- Sistema: Agenda UFMA (Pinheiro). Stack Vanilla JS + HTML5 + CSS3. Supabase apenas como backend.
- Arquitetura modular: `app.js` (orquestrador), `js/utils.js`, `js/db.js`, `js/auth.js`, `js/calendar.js`, `js/dashboard.js`, `js/reservas.js`, `js/components.js`.
- Layout atual: Flexbox 100vh, sidebar fixa esquerda, topbar superior, área de conteúdo central.
- Problemas passados: BUG-CSS-001 (especificidade quebrando tabs), BUG-CSS-002 (calendário cortado). A nova CSS deve usar classes utilitárias e nunca sobrescrever via ID alto especificidade.
- Dark/Light mode já existem via classe no `<html>` ou `<body>`.
- FullCalendar@6 já renderiza o calendário. Não alterar a inicialização do FullCalendar, apenas seus estilos via CSS overrides.

**ANTI-GOALS (O que NUNCA fazer):**
1. Não alterar nomes de funções JavaScript.
2. Não alterar seletores DOM usados por `querySelector` no JS (a menos que seja para adicionar classes CSS puramente visuais).
3. Não remover IDs que o JS usa para `getElementById`.
4. Não alterar o schema de dados ou chamadas Supabase.
5. Não modificar a lógica de autenticação ou permissões (`aplicarPermissoes`, `initAuth`).
6. Não alterar o comportamento do modal de agendamento (apenas estilizar).
7. Não remover funcionalidades existentes (ex: drag-and-drop já está desativado, manter assim).
8. Não alterar o fluxo de criação/edição/exclusão de eventos.

**ESTRATÉGIA CSS:**
- Usar **CSS Custom Properties (variables)** para todos os tokens.
- Usar **BEM-like** ou classes utilitárias descritivas. Ex: `.ufma-topbar`, `.ufma-sidebar`, `.ufma-btn--primary`.
- Nunca usar `!important` a menos que seja para override de biblioteca de terceiros (FullCalendar).
- Manter compatibilidade com o tema escuro e claro existente.

---

## 🏗️ FASE 1: Design Tokens e Fundação CSS
**Objetivo:** Estabelecer o sistema de tokens visuais antes de tocar qualquer componente.
**Complexidade:** Baixa | **Risco:** Baixo

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Criar/atualizar o arquivo css/design-tokens.css (ou atualizar o CSS existente) com um sistema de tokens de design inspirado no Google Calendar, adaptado para a identidade UFMA.

CONTEXT:
- O sistema já possui dark mode e light mode. As variáveis devem funcionar para ambos via [data-theme="dark"] e [data-theme="light"] ou via classe .dark no html.
- O arquivo deve ser importado no index.html ANTES dos outros CSS.

TOKENS OBRIGATÓRIOS:

1. CORES:
   --ufma-bg-primary: fundo da página
   --ufma-bg-surface: fundo de cards, modais, sidebar
   --ufma-bg-elevated: hover states, elementos sobrepostos
   --ufma-bg-glass: fundo translúcido para cards (rgba com alpha baixo)
   --ufma-border-subtle: bordas de separação
   --ufma-text-primary: títulos
   --ufma-text-secondary: metadados, labels
   --ufma-text-tertiary: placeholders, desativados

   --ufma-accent-blue: botão primário, ações principais (#1a73e8 estilo Google)
   --ufma-accent-blue-hover: #1557b0
   --ufma-accent-blue-light: rgba(26,115,232,0.12)

   --ufma-campus-eng: #9333ea (roxo — Engenharia)
   --ufma-campus-lic: #f59e0b (âmbar/laranja queimado — Licenciaturas)
   --ufma-campus-sau: #10b981 (esmeralda — Saúde)
   --ufma-campus-all: #3b82f6 (azul — Todos)

   --ufma-campus-eng-light: rgba(147,51,234,0.10)
   --ufma-campus-lic-light: rgba(245,158,11,0.10)
   --ufma-campus-sau-light: rgba(16,185,129,0.10)

   --ufma-danger: #ef4444 (vermelho suave)
   --ufma-success: #10b981
   --ufma-warning: #f59e0b

2. ESPAÇAMENTO (base 4px):
   --ufma-space-1: 4px
   --ufma-space-2: 8px
   --ufma-space-3: 12px
   --ufma-space-4: 16px
   --ufma-space-5: 20px
   --ufma-space-6: 24px
   --ufma-space-8: 32px
   --ufma-space-10: 40px
   --ufma-space-12: 48px

3. TIPOGRAFIA:
   --ufma-font-family: 'Google Sans', 'Roboto', system-ui, -apple-system, sans-serif
   --ufma-text-xs: 11px
   --ufma-text-sm: 12px
   --ufma-text-base: 13px
   --ufma-text-md: 14px
   --ufma-text-lg: 16px
   --ufma-text-xl: 20px
   --ufma-text-2xl: 24px
   --ufma-font-normal: 400
   --ufma-font-medium: 500
   --ufma-font-semibold: 600
   --ufma-font-bold: 700

4. BORDAS E SOMBRAS:
   --ufma-radius-sm: 6px
   --ufma-radius-md: 8px
   --ufma-radius-lg: 12px
   --ufma-radius-xl: 16px
   --ufma-radius-full: 9999px
   --ufma-shadow-sm: 0 1px 2px rgba(0,0,0,0.04)
   --ufma-shadow-md: 0 2px 8px rgba(0,0,0,0.06)
   --ufma-shadow-lg: 0 4px 16px rgba(0,0,0,0.08)
   --ufma-shadow-fab: 0 2px 8px rgba(26,115,232,0.30)

5. TRANSIÇÕES:
   --ufma-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
   --ufma-transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1)
   --ufma-transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1)

CONSTRAINTS:
- Não modificar nenhum arquivo .js.
- Não remover CSS antigo ainda — apenas adicionar o novo arquivo de tokens.
- Garantir que as variáveis funcionem no modo escuro atual do sistema.
- O arquivo deve ser puro CSS, sem pré-processador.

ACCEPTANCE CRITERIA:
- [ ] Variáveis definidas para ambos os temas (dark/light).
- [ ] Nenhum erro de sintaxe CSS.
- [ ] Importado no index.html.
- [ ] Visual do sistema permanece funcional (nada quebrado).
```

---

## 🎯 FASE 2: Topbar (Header Principal) estilo Google Calendar
**Objetivo:** Redesenhar o header superior para o padrão Google Calendar.
**Complexidade:** Média | **Risco:** Médio (cuidado com seletores do JS)

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Redesenhar o topbar/header principal do sistema para o estilo Google Calendar, mantendo TODOS os elementos funcionais existentes.

CONTEXT ATUAL (o que existe e deve permanecer funcional):
- Logo "Agenda UFMA" + ícone
- Botão hamburger (se não existir, adicionar visualmente para colapsar sidebar)
- Botão "+ Novo Agendamento" (deve continuar abrindo o mesmo modal)
- Navegação de data: setas < >, botão "Hoje", título "abril de 2026"
- Toggle de visualização: "Mês", "Semana", "Dia" (ou equivalente atual)
- Barra de busca
- Ícones: settings (engrenagem), refresh/sync, tema dark/light
- Botão de filtro por campus: Todos, Engenharia, Licenciaturas, Saúde
- Avatar do usuário + email + badge "Editor"

ESTRUTURA VISUAL ALVO (Google Calendar style):

[LINHA 1 — TOOLBAR PRINCIPAL — height: 64px]
┌─────────────────────────────────────────────────────────────────────────────┐
│ ☰  [Logo]  + Novo        <  Hoje  >   Abril de 2026      🔍  ⚙️  🔄  🌙  👤 │
└─────────────────────────────────────────────────────────────────────────────┘

[LINHA 2 — SUBTOOLBAR/FILTROS — height: 48px]
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Todos] [Engenharia] [Licenciaturas] [Saúde]          [Mês] [Semana] [Dia] │
└─────────────────────────────────────────────────────────────────────────────┘

ESPECIFICAÇÃO VISUAL DETALHADA:

1. TOOLBAR PRINCIPAL (64px, background: var(--ufma-bg-surface), border-bottom: 1px solid var(--ufma-border-subtle)):

   a) GRUPO ESQUERDA:
      - Hamburger menu (☰): ícone 24px, padding 12px, border-radius: var(--ufma-radius-full), hover: bg rgba(0,0,0,0.05). Deve ter id="btn-toggle-sidebar" ou classe que o JS possa usar.
      - Logo: "Agenda UFMA" em 22px, font-weight: 600, color: var(--ufma-text-primary). Ícone de calendário à esquerda do texto em 28px.
      - Botão "Novo": estilo Google — pill-shaped (border-radius: var(--ufma-radius-full)), padding: 10px 24px, background: var(--ufma-accent-blue), color: white, font-weight: 500, shadow: var(--ufma-shadow-fab). Ícone "+" à esquerda. Hover: translateY(-1px), shadow mais intenso. Active: translateY(0).
      - Espaçamento entre logo e botão Novo: 32px.

   b) GRUPO CENTRO (navegação de data):
      - Container centralizado com display: flex, align-items: center, gap: 8px.
      - Botão "Hoje": border: 1px solid var(--ufma-border-subtle), bg: transparent, padding: 8px 16px, border-radius: var(--ufma-radius-md), font-weight: 500, color: var(--ufma-text-primary). Hover: bg var(--ufma-bg-elevated).
      - Setas < >: ícones 20px em botões circulares (36x36px), hover: bg var(--ufma-bg-elevated).
      - Título "Abril de 2026": font-size: var(--ufma-text-xl), font-weight: 400, color: var(--ufma-text-primary), margin-left: 12px. Deve refletir o mês/ano atual do calendário (o JS já atualiza isso, manter o seletor/ID que o JS usa).

   c) GRUPO DIREITA:
      - Busca: container com ícone lupa, input com border-radius: var(--ufma-radius-full), bg: var(--ufma-bg-elevated), border: none, padding: 8px 16px 8px 40px (espaço para ícone), width: 200px → focus: 320px (transição suave). Placeholder: "Buscar...". Cor do texto: var(--ufma-text-primary).
      - Ícones de ação (settings, refresh, tema): botões circulares 40x40px, ícone 20px, color: var(--ufma-text-secondary), hover: bg var(--ufma-bg-elevated) + color var(--ufma-text-primary). Tooltip nativo (title attribute) com descrição.
      - Avatar: imagem circular 36px com border: 2px solid var(--ufma-border-subtle). Hover: mostrar dropdown com email, badge "Editor" e botão "Sair". O dropdown deve usar o mesmo conteúdo atual (email, badge, sair).

2. SUBTOOLBAR / FILTROS (48px, bg: var(--ufma-bg-primary)):
   - Display: flex, justify-content: space-between, align-items: center, padding: 0 24px.
   - LADO ESQUERDO — Chips de Campus:
     * Estilo: pill-shaped, padding: 6px 16px, font-size: var(--ufma-text-sm), font-weight: 500.
     * Inativo: bg: transparent, border: 1px solid var(--ufma-border-subtle), color: var(--ufma-text-secondary).
     * Ativo: bg: var(--ufma-accent-blue-light), border: 1px solid var(--ufma-accent-blue), color: var(--ufma-accent-blue).
     * Hover inativo: bg: var(--ufma-bg-elevated).
     * Transição: var(--ufma-transition-fast).
     * Manter os event listeners e classes que o JS usa para filtrar.

   - LADO DIREITO — Toggle de Visualização:
     * Segmented control (botões agrupados): container com border: 1px solid var(--ufma-border-subtle), border-radius: var(--ufma-radius-md), overflow: hidden.
     * Cada botão: padding: 6px 16px, font-size: var(--ufma-text-sm), bg: transparent, color: var(--ufma-text-secondary), border: none, border-right: 1px solid var(--ufma-border-subtle) (exceto último).
     * Ativo: bg: var(--ufma-bg-elevated), color: var(--ufma-text-primary), font-weight: 500.
     * Hover: bg: var(--ufma-bg-elevated).
     * Opções: "Mês", "Semana", "Dia" (ou os equivalentes atuais do FullCalendar).

CONSTRAINTS CRÍTICAS:
- O JS atual provavelmente usa IDs como "btn-novo-agendamento", "btn-hoje", "busca-input", etc. MANTER esses IDs exatos. Se não souber o ID exato, inspecionar o HTML atual e preservar.
- O FullCalendar é inicializado em um container. Não alterar a inicialização, apenas garantir que o container tenha height correta após o redesign do header.
- O botão "Novo Agendamento" deve continuar chamando a mesma função JS (provavelmente `abrirModalAgendamento()` ou similar).
- Os filtros de campus devem continuar funcionando com os mesmos event listeners.
- A barra de busca deve continuar com o mesmo ID/name para o JS de filtro.

FILES_TO_MODIFY:
- index.html (estrutura do header)
- css/estilos existentes ou novo arquivo css/topbar.css

ACCEPTANCE CRITERIA:
- [ ] Header tem 2 linhas (toolbar + subtoolbar) visualmente separadas.
- [ ] Botão "Novo" estilo Google (pill, azul, shadow).
- [ ] Navegação de data centralizada com Hoje, setas e título.
- [ ] Busca expande no focus.
- [ ] Filtros de campus são pills, não botões quadrados coloridos.
- [ ] Toggle Mês/Semana/Dia é segmented control.
- [ ] Todos os botões funcionam exatamente como antes.
- [ ] Nenhum erro no console.
- [ ] Layout não quebra ao redimensionar (testar 1280px, 1440px, 1920px).
```

---

## 📂 FASE 3: Sidebar estilo Google Calendar
**Objetivo:** Redesenhar a navegação lateral para o padrão Google Calendar (colapsável, com mini-calendário e itens de navegação limpos).
**Complexidade:** Média-Alta | **Risco:** Médio

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a sidebar esquerda para o estilo Google Calendar, mantendo todos os links de navegação funcionais e adicionando um mini-calendário mensal.

CONTEXT ATUAL (o que existe e deve permanecer):
- Itens de navegação: Calendário, Meus Eventos, Resumo Mensal, Últimos Registros.
- Cada item tem ícone + texto.
- Item ativo tem destaque visual.
- Rodapé: Avatar do usuário, email, badge "Editor", botão "Sair".
- A sidebar deve continuar funcionando como navegação entre as abas (provavelmente via classes .active ou data-attribute que o JS lê).

ESTRUTURA VISUAL ALVO:

LARGURA EXPANDIDA: 280px
LARGURA COLAPSADA: 72px (apenas ícones)

┌─────────────────────────────┐
│  [+ Novo Agendamento]       │  ← botão grande estilo "Compose"
│                             │
│  ┌─────────────────────┐    │
│  │ Mini Calendário     │    │  ← novo componente
│  │ (mês atual,         │    │     navegação rápida,
│  │  clicável)          │    │     seleciona data no calendário principal)
│  └─────────────────────┘    │
│                             │
│  ─── Navegação ───          │  ← label secção
│  📅 Calendário              │  ← item ativo: bg leve + border-left azul
│  👤 Meus Eventos            │
│  📊 Resumo Mensal           │
│  🕐 Últimos Registros       │
│                             │
│  ─── Meus Espaços ───       │  ← label secção (novo)
│  ☑️ Engenharia        [cor] │  ← checkbox + label + indicador de cor
│  ☑️ Licenciaturas     [cor] │
│  ☑️ Saúde             [cor] │
│                             │
│  [Avatar  Email       ]     │  ← compacto, hover expande
│  [Sair]                     │
└─────────────────────────────┘

ESPECIFICAÇÃO VISUAL DETALHADA:

1. CONTAINER DA SIDEBAR:
   - Width: 280px (expanded) / 72px (collapsed).
   - Height: 100vh - 64px (subtrair a nova topbar).
   - Background: var(--ufma-bg-surface).
   - Border-right: 1px solid var(--ufma-border-subtle).
   - Transition: width var(--ufma-transition-slow).
   - Overflow-y: auto, overflow-x: hidden.
   - Padding: 16px 12px.

2. BOTÃO "NOVO" (na sidebar, estilo Gmail Compose):
   - Aparece apenas quando EXPANDIDA.
   - Width: 100%, padding: 12px, border-radius: var(--ufma-radius-full).
   - Background: white (light) / #2c2c2c (dark). Border: 1px solid var(--ufma-border-subtle).
   - Shadow: var(--ufma-shadow-md).
   - Ícone "+" + texto "Criar" ou "Novo".
   - Hover: shadow mais intenso, translateY(-1px).
   - Mesma função do botão "Novo Agendamento" da topbar (pode ser redundante mas é padrão Google).

3. MINI CALENDÁRIO (NOVO COMPONENTE — apenas visual, não quebrar funcionalidade):
   - Container: padding: 12px, border-radius: var(--ufma-radius-lg).
   - Header: Setas < > + "Abril 2026" centralizado, font-size: var(--ufma-text-sm), font-weight: 500.
   - Grid: 7 colunas (D S T Q Q S S), células 32x32px.
   - Dias da semana: 11px, color: var(--ufma-text-tertiary), text-align: center.
   - Números: 12px, color: var(--ufma-text-secondary), border-radius: var(--ufma-radius-full).
   - Hover em número: bg var(--ufma-bg-elevated).
   - Dia selecionado (hoje): bg var(--ufma-accent-blue), color: white.
   - Dia com evento: pequeno dot (4px) abaixo do número na cor do campus predominante.
   - Funcionalidade: ao clicar em um dia, deve navegar o calendário principal para aquele dia. Se isso exigir JS novo, criar uma função separada que apenas chama os métodos existentes do FullCalendar (ex: calendar.gotoDate()).
   - Biblioteca: pode usar um mini-calendário custom em CSS+JS leve. Não adicionar bibliotecas pesadas.

4. ITENS DE NAVEGAÇÃO:
   - Cada item: display: flex, align-items: center, gap: 16px, padding: 10px 16px, border-radius: var(--ufma-radius-md).
   - Ícone: 20px, color: var(--ufma-text-secondary), stroke-width: 2.
   - Texto: var(--ufma-text-base), color: var(--ufma-text-primary), font-weight: 500.
   - Hover: bg var(--ufma-bg-elevated).
   - ATIVO: bg: rgba(26,115,232,0.08), color: var(--ufma-accent-blue). Ícone também na cor azul. Adicionar border-left: 3px solid var(--ufma-accent-blue) OU um indicador circular sutil à esquerda.
   - Transition: var(--ufma-transition-fast).
   - Manter os atributos data-tab ou classes que o JS usa para trocar de aba.

5. SEÇÃO "MEUS ESPAÇOS" (Checkboxes de filtro):
   - Label da seção: 11px uppercase, font-weight: 600, color: var(--ufma-text-tertiary), letter-spacing: 0.5px, padding: 16px 16px 8px.
   - Cada item: display: flex, align-items: center, justify-content: space-between, padding: 8px 16px.
   - Esquerda: checkbox custom (estilo Google — redondo, cor do campus quando checked) + label.
   - Direita: círculo 12px com a cor do campus.
   - Funcionalidade: deve sincronizar com os filtros da topbar. Se marcar/desmarcar aqui, reflete lá (e vice-versa). Usar os mesmos event listeners ou delegação.

6. RODAPÉ — PERFIL DO USUÁRIO:
   - Container: margin-top: auto, padding: 12px, border-top: 1px solid var(--ufma-border-subtle).
   - Layout: flex, align-items: center, gap: 12px.
   - Avatar: 32px circular.
   - Info: email truncado (max-width: 160px), font-size: var(--ufma-text-sm), color: var(--ufma-text-secondary). Badge "Editor" abaixo do email em 10px, bg var(--ufma-bg-elevated), color var(--ufma-text-tertiary), border-radius: var(--ufma-radius-sm).
   - Botão Sair: ícone de porta 18px, color: var(--ufma-text-tertiary), hover: var(--ufma-danger). Tooltip "Sair do sistema".
   - Quando COLAPSADA: apenas o avatar (36px) centralizado, com indicador de status online (dot verde 8px no canto inferior direito). Click no avatar abre dropdown com opções.

7. TOGGLE COLAPSAR/EXPANDIR:
   - Quando colapsada (72px):
     * Apenas ícones dos itens de navegação, centralizados.
     * Tooltip no hover de cada ícone (title attribute ou custom tooltip) mostrando o nome.
     * Mini-calendário some ou vira ícone de calendário que abre popover.
     * Botão "Novo" vira ícone "+" circular FAB.
   - Toggle: pode ser via o hamburger ☰ da topbar ou um ícone de seta no rodapé da sidebar.
   - Estado (expandida/colapsada) pode ser salvo no localStorage para persistir.

CONSTRAINTS CRÍTICAS:
- Preservar TODAS as classes/IDs que o JS usa para detectar qual aba está ativa.
- Preservar o evento de click que troca entre Calendário/Meus Eventos/Resumo/Últimos Registros.
- O botão "Sair" deve continuar chamando a mesma função de logout.
- O mini-calendário é um PLUS. Se não for possível sincronizar perfeitamente com o FullCalendar sem muito JS novo, deixar como visual-only primeiro (não obrigatório na Fase 3, pode ser Fase 5).
- Não alterar a lógica de permissões (o que cada role vê).

FILES_TO_MODIFY:
- index.html (estrutura da sidebar)
- css/sidebar.css (novo arquivo)
- js/ possivelmente para sincronizar mini-calendário (mínimo possível)

ACCEPTANCE CRITERIA:
- [ ] Sidebar tem largura 280px expandida, 72px colapsada.
- [ ] Botão "Novo" estilo Compose presente.
- [ ] Itens de navegação com hover e estado ativo refinados.
- [ ] Seção "Meus Espaços" com checkboxes sincronizados aos filtros.
- [ ] Rodapé com avatar compacto e botão sair.
- [ ] Transição suave entre expandida/colapsada.
- [ ] Navegação entre abas funciona perfeitamente.
- [ ] Nenhum conteúdo da área principal é cortado ou sobreposto.
```

---

## 📐 FASE 4: Layout Base e Área de Conteúdo
**Objetivo:** Ajustar o container principal para acomodar a nova topbar e sidebar sem quebrar as views existentes.
**Complexidade:** Média | **Risco:** Alto (layout é crítico)

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Refatorar o layout base (container principal) para funcionar com a nova topbar de 64px + subtoolbar de 48px e a sidebar colapsável, garantindo que todas as views (Calendário, Meus Eventos, Resumo, Últimos Registros) ocupem o espaço correto.

CONTEXTO DO BUG PASSADO:
- BUG-CSS-002: calendário cortado ou invisível devido a problemas de height e flexbox.
- A solução anterior foi: App em 100vh + Flexbox dinâmico.
- Não reverter essa solução, apenas refiná-la.

ESTRUTURA ALVO:

<body>
  <div id="app" class="ufma-app">

    <!-- TOPBAR: height 64px, fixed ou sticky -->
    <header class="ufma-topbar">...</header>

    <!-- SUBTOOLBAR: height 48px -->
    <div class="ufma-subtoolbar">...</div>

    <!-- MAIN CONTAINER -->
    <div class="ufma-main">

      <!-- SIDEBAR: width 280px/72px, flex-shrink: 0 -->
      <aside class="ufma-sidebar">...</aside>

      <!-- CONTENT AREA: flex-grow: 1, overflow: auto -->
      <main class="ufma-content">

        <!-- Aba Calendário -->
        <section id="abaCalendario" class="ufma-tab-content active">
          <div id="calendario"></div> <!-- FullCalendar container -->
        </section>

        <!-- Aba Meus Eventos -->
        <section id="abaMeusEventos" class="ufma-tab-content">...</section>

        <!-- Aba Resumo Mensal -->
        <section id="abaResumoMensal" class="ufma-tab-content">...</section>

        <!-- Aba Últimos Registros -->
        <section id="abaUltimosRegistros" class="ufma-tab-content">...</section>

      </main>

    </div>

  </div>
</body>

ESPECIFICAÇÃO CSS:

1. .ufma-app:
   - display: flex;
   - flex-direction: column;
   - height: 100vh;
   - width: 100vw;
   - overflow: hidden;
   - background: var(--ufma-bg-primary);

2. .ufma-topbar:
   - height: 64px;
   - flex-shrink: 0;
   - z-index: 100;
   - position: relative;

3. .ufma-subtoolbar:
   - height: 48px;
   - flex-shrink: 0;
   - z-index: 90;
   - border-bottom: 1px solid var(--ufma-border-subtle);

4. .ufma-main:
   - display: flex;
   - flex-grow: 1;
   - overflow: hidden;

5. .ufma-sidebar:
   - width: 280px; (ou 72px quando colapsada)
   - flex-shrink: 0;
   - overflow-y: auto;
   - transition: width var(--ufma-transition-slow);
   - z-index: 80;

6. .ufma-content:
   - flex-grow: 1;
   - overflow: auto; /* scroll apenas aqui */
   - padding: 0; /* views internas controlam seu padding */
   - position: relative;

7. .ufma-tab-content:
   - display: none;
   - height: 100%;
   - width: 100%;

   &.active {
     display: flex; /* ou block, conforme a view precisar */
     flex-direction: column;
   }

8. #abaCalendario.active:
   - display: flex;
   - flex-direction: column;
   - height: 100%;

9. #calendario (container do FullCalendar):
   - flex-grow: 1;
   - min-height: 0; /* CRÍTICO para flexbox não estourar */
   - overflow: auto;

CONSTRAINTS CRÍTICAS:
- Preservar o ID "abaCalendario" e a classe "active" — o JS usa isso para mostrar/esconder tabs.
- Preservar o ID "calendario" — é onde o FullCalendar é instanciado.
- Garantir que o FullCalendar preencha 100% da altura disponível SEM cortar a última semana do mês.
- Garantir que as listas (Meus Eventos, etc.) tenham scroll próprio se necessário, sem quebrar o layout.
- Não usar `display: flex` diretamente em `#abaCalendario` no CSS global — usar a classe `.active` combinada: `#abaCalendario.active { display: flex; }`. Isso evita BUG-CSS-001 (calendário visível em todas as abas).

ACCEPTANCE CRITERIA:
- [ ] App ocupa 100vh sem scroll global na página.
- [ ] Scroll só ocorre dentro de .ufma-content ou .ufma-sidebar.
- [ ] Calendário mensal mostra todas as semanas (incluindo a última).
- [ ] Transição entre abas não gera flicker ou quebra de layout.
- [ ] Sidebar colapsar/expandir não empurra conteúdo para fora da tela.
- [ ] Testar em 1366x768, 1920x1080.
```

---

## 🗓️ FASE 5: Calendário, Listagem Principal e Views de Lista
**Objetivo:** Refinar a aparência do FullCalendar e redesenhar COMPLETAMENTE as listas de eventos com agrupamento por data, novo card minimalista e seção colapsável de encerrados.
**Complexidade:** Alta | **Risco:** Médio

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Aplicar estilos visuais refinados ao FullCalendar e redesenhar COMPLETAMENTE as listas de evento em todas as views de lista (Meus Eventos, Resumo Mensal, Últimos Registros) com: (1) agrupamento por data, (2) novo item minimalista, (3) seção colapsável para eventos encerrados.

═══════════════════════════════════════════════════════════════════
PARTE A — FULLCALENDAR OVERRIDES
═══════════════════════════════════════════════════════════════════

1. Cabeçalho do FullCalendar:
   - Ocultar o header padrão do FullCalendar (botões e título nativos), pois agora controlamos pela topbar.
   - Configuração no JS (se necessário): headerToolbar: false.
   - Se não puder tocar no JS, usar CSS: `.fc .fc-toolbar { display: none !important; }`.

2. Células do calendário:
   - Border: 1px solid var(--ufma-border-subtle).
   - Header dos dias (DOM, SEG, etc.): font-size: 11px, font-weight: 500, color: var(--ufma-text-tertiary), text-transform: uppercase, padding: 8px.
   - Número do dia: 12px, color: var(--ufma-text-secondary), padding: 8px.
   - Dia atual: número com fundo circular var(--ufma-accent-blue), color: white, width: 28px, height: 28px, display: inline-flex, align-items: center, justify-content: center.
   - Dias de outros meses: opacity: 0.4.

3. Eventos no calendário:
   - Altura: 20px (compacto).
   - Border-radius: var(--ufma-radius-sm).
   - Padding: 2px 6px.
   - Font-size: 11px.
   - Font-weight: 500.
   - NÃO usar background colorido inteiro. Usar:
     * background: var(--ufma-campus-XXX-light) — ex: rgba da cor do campus com 10% opacidade
     * color: var(--ufma-campus-XXX) — cor sólida do campus
     * border-left: 3px solid var(--ufma-campus-XXX)
   - Hover: background opacidade aumenta para 20%, cursor: pointer.
   - Texto truncado com ellipsis.
   - Máximo 3 eventos visíveis por célula. O "+more" do FullCalendar deve ser estilizado:
     * color: var(--ufma-text-secondary)
     * font-size: 11px
     * font-weight: 500
     * hover: color: var(--ufma-text-primary), bg: var(--ufma-bg-elevated)

4. Hover na célula vazia:
   - Mostrar um botão "+" sutil no canto inferior direito da célula (apenas no hover).
   - Botão: 24px circular, bg: var(--ufma-accent-blue), color: white, ícone "+" 14px.
   - Opacidade 0 → 1 no hover da célula.
   - Click: abre modal de novo agendamento com a data pré-preenchida.

═══════════════════════════════════════════════════════════════════
PARTE B — LISTAGEM PRINCIPAL: AGRUPAMENTO POR DATA
═══════════════════════════════════════════════════════════════════

ESTRUTURA OBRIGATÓRIA DA LISTA:

<div class="ufma-lista-agendamentos">

  <!-- GRUPO DE DATA -->
  <div class="ufma-grupo-data">
    <div class="ufma-grupo-data__header">
      <span class="ufma-grupo-data__dia">17</span>
      <span class="ufma-grupo-data__info">de Abril (quinta-feira)</span>
    </div>
    <div class="ufma-grupo-data__linha"></div>
    <div class="ufma-grupo-data__eventos">
      <!-- ITENS DE EVENTO AQUI -->
    </div>
  </div>

  <!-- PRÓXIMO GRUPO -->
  <div class="ufma-grupo-data">...</div>

</div>

REGRAS DE AGRUPAMENTO:
- Eventos devem ser agrupados cronologicamente por data.
- A data do grupo deve ser formatada: "DD de Mês (dia-da-semana)".
- Exemplo: "17 de Abril (quinta-feira)", "18 de Abril (sexta-feira)".
- NUNCA repetir a data em cada item individual.
- Se houver múltiplos eventos no mesmo dia, todos ficam sob o mesmo header de data.
- Ordem: do mais recente para o mais antigo (ou conforme já ordenado pelo JS).

ESTILO DO HEADER DE DATA:
- Display: flex, align-items: baseline, gap: 8px, padding: 24px 0 12px.
- Número do dia: font-size: 28px, font-weight: 700, color: var(--ufma-text-primary), line-height: 1.
- Texto "de Abril (quinta-feira)": font-size: var(--ufma-text-md), font-weight: 400, color: var(--ufma-text-secondary).
- Linha divisória abaixo: width: 100%, height: 1px, background: var(--ufma-border-subtle), margin-bottom: 12px.
- Primeiro grupo: padding-top: 8px (sem espaço excessivo no topo).

═══════════════════════════════════════════════════════════════════
PARTE C — ITEM DE AGENDAMENTO (REDESIGN COMPLETO)
═══════════════════════════════════════════════════════════════════

ESTRUTURA HTML:

<div class="ufma-evento-item" data-campus="eng|lic|sau">
  <!-- Indicador de cor lateral (apenas 1 elemento visual de cor) -->
  <div class="ufma-evento-item__indicador"></div>

  <div class="ufma-evento-item__conteudo">
    <!-- Nome do evento — DESTAQUE PRINCIPAL -->
    <h3 class="ufma-evento-item__titulo">Nome do Evento</h3>

    <!-- Informações secundárias — menor contraste -->
    <div class="ufma-evento-item__meta">
      <span class="ufma-evento-item__horario">08:00 – 18:00</span>
      <span class="ufma-evento-item__separador">•</span>
      <span class="ufma-evento-item__sala">Sala 05</span>
      <span class="ufma-evento-item__separador">•</span>
      <span class="ufma-evento-item__responsavel">SEME</span>
    </div>

    <!-- Tags discretas -->
    <div class="ufma-evento-item__tags">
      <span class="ufma-tag ufma-tag--eng">Engenharia</span>
      <span class="ufma-tag ufma-tag--lic">Licenciaturas</span>
    </div>
  </div>

  <!-- Ações (aparecem no hover ou sempre visíveis em desktop) -->
  <div class="ufma-evento-item__acoes">
    <button class="ufma-evento-item__acao ufma-evento-item__acao--editar" title="Editar">
      <svg><!-- pencil --></svg>
    </button>
    <button class="ufma-evento-item__acao ufma-evento-item__acao--excluir" title="Excluir">
      <svg><!-- trash --></svg>
    </button>
  </div>
</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. CONTAINER DO ITEM (.ufma-evento-item):
   - Display: flex, align-items: flex-start, gap: 0.
   - Padding: 14px 16px.
   - Border-radius: var(--ufma-radius-md).
   - Background: var(--ufma-bg-glass) — levemente diferente do fundo, ex: rgba(255,255,255,0.02) no dark, rgba(0,0,0,0.02) no light.
   - Border: 1px solid transparent. NUNCA borda forte visível por padrão.
   - Margin-bottom: 8px.
   - Cursor: pointer (item inteiro clicável).
   - Transition: var(--ufma-transition-fast).
   - Position: relative.

2. INDICADOR DE COR (.ufma-evento-item__indicador):
   - Width: 3px.
   - Height: 100% (ou auto com align-self: stretch).
   - Border-radius: var(--ufma-radius-full) à esquerda.
   - Background: var(--ufma-campus-XXX) conforme o campus principal do evento.
   - Margin-right: 14px.
   - Flex-shrink: 0.
   - ⚠️ ESTE É O ÚNICO ELEMENTO COM A COR DO CAMPUS. Nunca duplicar cor no mesmo item.

3. CONTEÚDO (.ufma-evento-item__conteudo):
   - Flex-grow: 1.
   - Min-width: 0 (para truncar corretamente).

4. TÍTULO (.ufma-evento-item__titulo):
   - Font-size: var(--ufma-text-md), font-weight: 600.
   - Color: var(--ufma-text-primary).
   - Line-height: 1.4.
   - Margin-bottom: 4px.
   - White-space: nowrap, overflow: hidden, text-overflow: ellipsis.

5. METADADOS (.ufma-evento-item__meta):
   - Display: flex, align-items: center, gap: 6px, flex-wrap: wrap.
   - Font-size: var(--ufma-text-sm).
   - Color: var(--ufma-text-tertiary).
   - Ícones: NÃO usar ícones visuais pesados. Apenas texto com separador "•".
   - Se quiser ícones, usar SVG de 12px, stroke 1.5, cor var(--ufma-text-tertiary), MUITO sutis.

6. TAGS (.ufma-evento-item__tags):
   - Display: flex, gap: 6px, margin-top: 8px.
   - Tag (.ufma-tag):
     * Padding: 2px 8px.
     * Border-radius: var(--ufma-radius-sm).
     * Font-size: var(--ufma-text-xs).
     * Font-weight: 500.
     * Background: var(--ufma-bg-elevated).
     * Color: var(--ufma-text-tertiary).
     * Border: 1px solid var(--ufma-border-subtle).
   - Tag com cor de campus (opcional, mas se usar):
     * Apenas o texto muda de cor, ou um pequeno dot (4px) à esquerda.
     * NUNCA background colorido inteiro na tag.

7. AÇÕES (.ufma-evento-item__acoes):
   - Display: flex, gap: 4px, align-items: center.
   - Opacidade: 0 por padrão (aparece no hover do item).
   - Transition: var(--ufma-transition-fast).
   - Botão ação: 28px circular, bg: transparent, border: none, color: var(--ufma-text-tertiary).
   - Hover editar: color: var(--ufma-accent-blue), bg: var(--ufma-accent-blue-light).
   - Hover excluir: color: var(--ufma-danger), bg: rgba(239,68,68,0.08).
   - Em mobile (< 768px): opacidade sempre 1 (touch não tem hover).

8. HOVER DO ITEM INTEIRO:
   - Background: var(--ufma-bg-elevated).
   - Border-color: var(--ufma-border-subtle).
   - Ações aparecem (opacity: 1).
   - Transform: translateX(2px) no indicador lateral (sutil).
   - NENHUM glow, NENHUM shadow exagerado, NENHUMA borda colorida.

9. ESTADOS ESPECIAIS:
   - Conflito: adicionar classe `.ufma-evento-item--conflito`.
     * Indicador lateral fica vermelho (var(--ufma-danger)) em vez da cor do campus.
     * Badge "Conflito" ao lado do título: font-size: 10px, font-weight: 600, color: var(--ufma-danger), bg: rgba(239,68,68,0.10), padding: 1px 6px, border-radius: var(--ufma-radius-sm).
   - Cancelado/Encerrado: adicionar classe `.ufma-evento-item--encerrado`.
     * Opacidade: 0.55 no item inteiro.
     * Título: text-decoration: line-through.
     * Indicador lateral: cor cinza (var(--ufma-text-tertiary)).
     * Cursor: default (não pointer, ou pointer se ainda puder ver detalhes).

═══════════════════════════════════════════════════════════════════
PARTE D — SEÇÃO: EVENTOS ENCERRADOS (MUITO IMPORTANTE)
═══════════════════════════════════════════════════════════════════

ESTRUTURA OBRIGATÓRIA:

<div class="ufma-encerrados">
  <!-- HEADER COLAPSÁVEL -->
  <button class="ufma-encerrados__toggle" aria-expanded="false">
    <span class="ufma-encerrados__icone">▼</span>
    <span class="ufma-encerrados__titulo">Encerrados do mês</span>
    <span class="ufma-encerrados__contador">(49)</span>
  </button>

  <!-- CONTEÚDO (inicia fechado) -->
  <div class="ufma-encerrados__conteudo" hidden>
    <!-- Mesma estrutura de agrupamento por data -->
    <div class="ufma-grupo-data">...</div>
    <div class="ufma-grupo-data">...</div>
  </div>
</div>

COMPORTAMENTO:
- A seção fica no FINAL da listagem principal.
- Separada visualmente por um espaçamento maior (margin-top: 32px) e uma linha divisória sutil.
- Estado padrão: FECHADA (colapsada).
- Click no toggle: expande/contrai com animação de height (max-height transition ou grid-template-rows).

ESTILO DO TOGGLE (FECHADO):
- Display: flex, align-items: center, gap: 10px.
- Padding: 12px 16px.
- Background: transparent.
- Border: 1px dashed var(--ufma-border-subtle).
- Border-radius: var(--ufma-radius-md).
- Width: 100%, text-align: left.
- Cursor: pointer.
- Transition: var(--ufma-transition-fast).

ÍCONE ▼:
- Font-size: 10px.
- Color: var(--ufma-text-tertiary).
- Transition: transform var(--ufma-transition-fast).
- Quando aberto: rotate(180deg) → ▲.

TÍTULO "Encerrados do mês":
- Font-size: var(--ufma-text-sm).
- Font-weight: 500.
- Color: var(--ufma-text-secondary).

CONTADOR "(49)":
- Font-size: var(--ufma-text-sm).
- Color: var(--ufma-text-tertiary).
- Margin-left: 4px.

ESTILO DO TOGGLE (ABERTO / HOVER):
- Hover fechado: bg: var(--ufma-bg-elevated), border-style: solid.
- Aberto: border-bottom-left-radius: 0, border-bottom-right-radius: 0, border-bottom: none.

CONTEÚDO EXPANDIDO:
- Background: var(--ufma-bg-primary) — levemente diferente do fundo da lista principal.
- Border: 1px solid var(--ufma-border-subtle).
- Border-top: none.
- Border-radius: 0 0 var(--ufma-radius-md) var(--ufma-radius-md).
- Padding: 16px.
- Animação: max-height 0 → max-height: 2000px, opacity 0 → 1, transition: var(--ufma-transition-slow).
- Overflow: hidden.

ITENS DENTRO DE ENCERRADOS:
- MESMO componente visual da lista principal (ufma-evento-item).
- Mas com classe `.ufma-evento-item--encerrado` aplicada (opacidade reduzida, line-through).
- Menor destaque visual: padding ligeiramente menor (12px 16px em vez de 14px 16px).
- Sem ações de editar/excluir visíveis (ou desabilitadas).
- Agrupamento por data MANTIDO dentro da seção encerrada.

SEPARADOR VISUAL:
- Antes da seção de encerrados: margin-top: 40px, padding-top: 24px, border-top: 1px solid var(--ufma-border-subtle).
- Label opcional: "Agendamentos ativos" acima da lista principal (quando houver encerrados).

CONSTRAINTS:
- Não alterar a função gerarCardEventoHtml a menos que seja para retornar a nova estrutura HTML. Se alterar, garantir que todos os lugares que a chamam continuem funcionando.
- Não alterar a lógica de renderização das listas (js/components.js, js/reservas.js, etc.).
- FullCalendar overrides apenas via CSS (evitar tocar na inicialização do calendário no JS).
- A seção de encerrados deve usar os mesmos dados que já vêm do backend (campo `cancelado=true` ou `datacancelamento` existente).
- O JS já separa ativos de encerrados. Manter essa lógica, apenas mudar o HTML gerado.

ACCEPTANCE CRITERIA:
- [ ] FullCalendar não mostra header nativo (controlado pela topbar).
- [ ] Eventos no calendário têm border-left colorido e fundo translúcido (nunca bg inteiro).
- [ ] Listas agrupadas por data com header "DD de Mês (dia-da-semana)".
- [ ] Data NUNCA repetida em cada item.
- [ ] Item minimalista: indicador lateral 3px + título + meta + tags sutis.
- [ ] Cor do campus APENAS no indicador lateral. Nunca duplicada.
- [ ] Hover suave: bg elevado, ações aparecem, translateX sutil no indicador.
- [ ] Sem glow, sem bordas fortes, sem background colorido nos itens.
- [ ] Seção "Encerrados do mês (N)" colapsável no final da lista.
- [ ] Itens encerrados com opacidade 0.55 e line-through.
- [ ] Animação suave de abrir/fechar accordion.
- [ ] Badge de conflito discreto ao lado do título.
- [ ] Estados cancelados/encerrados visualmente diferenciados.
- [ ] Mobile: itens com ações sempre visíveis.
```

---

## 🪟 FASE 6: Modais e Formulários
**Objetivo:** Refinar o visual do modal de "Novo Agendamento" e demais modais para o padrão Google/Modern SaaS.
**Complexidade:** Média | **Risco:** Baixo-Médio

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Estilizar o modal de "Novo Agendamento" (e demais modais: detalhes, confirmação, conflitos) para um design moderno, limpo e alinhado aos tokens de design, mantendo TODOS os campos, validações e fluxos existentes.

CONTEXTO:
- O modal atual tem steps: (1) Informações do Evento, (2) Seleção de Espaços.
- Campos: Título, Responsável, WhatsApp, E-mail, Seleção de Campus/Espaços, Datas/Horários.
- Botões: Cancelar, Confirmar Agendamento.
- Já existe um modal nativo customizado (substituiu o SweetAlert2).

ESPECIFICAÇÃO VISUAL:

1. OVERLAY E CONTAINER:
   - Overlay: bg: rgba(0,0,0,0.6), backdrop-filter: blur(4px).
   - Modal: bg: var(--ufma-bg-surface), border-radius: var(--ufma-radius-xl), width: min(640px, 90vw), max-height: 90vh, overflow: auto.
   - Shadow: var(--ufma-shadow-lg).
   - Animação de entrada: fade in + scale(0.95) → scale(1), 200ms.

2. HEADER DO MODAL:
   - Padding: 20px 24px.
   - Título: "Novo Agendamento" ou "Editar Agendamento", font-size: var(--ufma-text-lg), font-weight: 600.
   - Subtítulo: "Preencha os dados para reservar o(s) espaço(s)", font-size: var(--ufma-text-sm), color: var(--ufma-text-secondary).
   - Botão fechar (X): 32px circular, posicionado absolute top-right, color: var(--ufma-text-tertiary), hover: var(--ufma-text-primary), bg: var(--ufma-bg-elevated).
   - Divider abaixo: 1px solid var(--ufma-border-subtle).

3. STEPS / PROGRESSO:
   - Indicador de step: círculo numerado (28px) + label.
   - Ativo: bg: var(--ufma-accent-blue), color: white.
   - Inativo: bg: var(--ufma-bg-elevated), color: var(--ufma-text-tertiary), border: 1px solid var(--ufma-border-subtle).
   - Conector entre steps: linha 2px, color: var(--ufma-border-subtle) (inativo) ou var(--ufma-accent-blue) (ativo/completo).

4. FORMULÁRIO:
   - Padding: 24px.
   - Grid: 1 coluna (padrão), 2 colunas para campos paralelos (WhatsApp | E-mail).
   - Gap entre fields: 20px.
   - Label: font-size: var(--ufma-text-sm), font-weight: 500, color: var(--ufma-text-primary), margin-bottom: 6px.
   - Input/Textarea/Select:
     * width: 100%, padding: 10px 14px.
     * bg: var(--ufma-bg-primary).
     * border: 1px solid var(--ufma-border-subtle).
     * border-radius: var(--ufma-radius-md).
     * color: var(--ufma-text-primary).
     * font-size: var(--ufma-text-base).
     * placeholder-color: var(--ufma-text-tertiary).
     * focus: border-color: var(--ufma-accent-blue), box-shadow: 0 0 0 3px var(--ufma-accent-blue-light), outline: none.
     * transition: var(--ufma-transition-fast).
   - Ícone dentro do input (prefix): posicionado absolute left 14px, color: var(--ufma-text-tertiary). Input com padding-left: 40px.

5. SELEÇÃO DE ESPAÇOS (Accordion):
   - Cada campus é um accordion item.
   - Header: padding: 14px 16px, bg: var(--ufma-bg-elevated), border-radius: var(--ufma-radius-md), margin-bottom: 8px.
   - Ícone do campus + nome + seta ▼ (rotaciona para ▲ quando aberto).
   - Hover: bg levemente mais claro.
   - Conteúdo: padding: 12px 16px, display: grid de checkboxes.
   - Checkbox custom: estilo Google — border-radius: var(--ufma-radius-sm), checked: bg var(--ufma-accent-blue), border: var(--ufma-accent-blue), check branco.

6. DATAS E HORÁRIOS:
   - Cada linha de data: display: flex, gap: 12px, align-items: center, padding: 10px, bg: var(--ufma-bg-elevated), border-radius: var(--ufma-radius-md), margin-bottom: 8px.
   - Input date: estilo padrão do formulário, width: auto.
   - Input time: mesma coisa.
   - Botão remover data: ícone "×" ou trash, 28px circular, hover: var(--ufma-danger).
   - Botão "+ Adicionar Data": text-only, color: var(--ufma-accent-blue), font-weight: 500, hover: underline.

7. FOOTER DO MODAL:
   - Padding: 16px 24px 24px.
   - Display: flex, justify-content: flex-end, gap: 12px.
   - Botão "Cancelar": padding: 10px 20px, border-radius: var(--ufma-radius-md), bg: transparent, border: 1px solid var(--ufma-border-subtle), color: var(--ufma-text-primary), font-weight: 500. Hover: bg: var(--ufma-bg-elevated).
   - Botão "Confirmar": padding: 10px 24px, border-radius: var(--ufma-radius-md), bg: var(--ufma-accent-blue), color: white, font-weight: 500, shadow: var(--ufma-shadow-fab). Hover: bg: var(--ufma-accent-blue-hover), translateY(-1px). Ícone check opcional à esquerda.

8. MODAL DE DETALHES:
   - Layout mais limpo, sem botão "Fechar" inferior (já foi removido em hotfix anterior).
   - Badges de local em tamanho maior (conforme já implementado).
   - Header com título do evento em destaque.
   - Metadados em grid de 2 colunas.
   - Botão "Editar" e "Excluir" no footer, alinhados à direita.

9. MODAL DE CONFLITO:
   - Ícone de alerta (triângulo) em var(--ufma-warning) no topo.
   - Título: "Conflito Detectado" em var(--ufma-text-primary).
   - Lista de conflitos com cards internos mostrando horários e locais.
   - Botão "Entendi": primary. Botão "Ver Agenda": secondary.

CONSTRAINTS:
- Não alterar os IDs/names dos inputs (o JS lê esses valores).
- Não alterar a lógica de validação.
- Não alterar o fluxo de steps (1 → 2 → confirmar).
- Preservar a integração com Flatpickr (se usado para datas).

ACCEPTANCE CRITERIA:
- [ ] Modal centralizado com backdrop blur.
- [ ] Animação suave de entrada.
- [ ] Inputs com estados focus visíveis e acessíveis.
- [ ] Accordion de espaços funciona (abre/fecha).
- [ ] Botões de ação no footer estilizados.
- [ ] Modal de conflito mostra informações claramente.
- [ ] Nenhum campo perde funcionalidade.
```

---

## 📱 FASE 7: Responsividade Mobile
**Objetivo:** Adaptar o layout para smartphones e tablets sem perder funcionalidades.
**Complexidade:** Alta | **Risco:** Médio

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Implementar responsividade mobile para o redesign, garantindo que todas as funcionalidades permaneçam acessíveis em telas pequenas.

BREAKPOINTS:
- Desktop: > 1024px (layout completo)
- Tablet: 768px - 1024px (sidebar colapsada por padrão)
- Mobile: < 768px (bottom nav + drawer)

ESPECIFICAÇÃO MOBILE (< 768px):

1. TOPBAR:
   - Height: 56px (reduzido).
   - Grupo esquerda: Hamburger + Logo apenas (texto "Agenda UFMA" some ou vira sigla "AUFMA").
   - Botão "Novo": some da topbar (vai para FAB flutuante).
   - Centro: Título do mês apenas (setas e "Hoje" somem ou vão para drawer).
   - Direita: Apenas ícone de busca (expande para full-width) + avatar.

2. FAB (Floating Action Button):
   - Posicionado fixed bottom-right: 24px, 24px.
   - Size: 56px circular.
   - Background: var(--ufma-accent-blue), ícone "+" 24px branco.
   - Shadow: var(--ufma-shadow-lg).
   - Mesma função do botão "Novo Agendamento".

3. SIDEBAR:
   - Não visível por padrão.
   - Abre via hamburger como Drawer/Overlay da esquerda.
   - Drawer: width: 280px, height: 100vh, overlay escuro, slide-in da esquerda.
   - Conteúdo igual ao desktop.
   - Fecha ao clicar em item de navegação ou no overlay.

4. SUBTOOLBAR/FILTROS:
   - Filtros de campus: horizontal scroll, snap em cada chip, padding: 0 16px.
   - Toggle Mês/Semana/Dia: presente mas compacto (segmented control menor).

5. CALENDÁRIO:
   - FullCalendar deve usar `dayMaxEventRows: 2` (em vez de 3) para caber.
   - Células menenas, fontes reduzidas.
   - Swipe horizontal entre meses (se possível via FullCalendar, senão ignorar).
   - Visualização padrão em mobile pode ser "Lista" ou "Semana" se "Mês" for muito denso. Mas manter "Mês" como padrão se já for.

6. LISTAS (Meus Eventos, etc.):
   - Cards em layout vertical (data em cima, não na lateral).
   - Padding reduzido: 16px.
   - Ações (editar/excluir): sempre visíveis, ícones 20px, touch-friendly (min 44px).

7. MODAIS:
   - Width: 100vw em mobile, border-radius apenas no topo (sheet style) ou fullscreen.
   - Campos em 1 coluna apenas.
   - Footer com botões em stack (100% width, um acima do outro) ou lado a lado.

8. BOTTOM NAVIGATION (alternativa ao drawer):
   - Se preferir, pode usar bottom nav com 4 ícones: Calendário, Meus, Resumo, Registros.
   - Height: 64px + safe-area-inset-bottom.
   - Background: var(--ufma-bg-surface), border-top: 1px solid var(--ufma-border-subtle).
   - Item ativo: ícone filled + label na cor azul.
   - Click: troca de aba diretamente.

TABLET (768px - 1024px):
- Sidebar colapsada (72px) por padrão.
- Topbar completa.
- Calendário em grade visível.
- 2 colunas para cards se houver espaço.

CONSTRAINTS:
- Não alterar a lógica de troca de abas — apenas o trigger visual (click no bottom nav vs click na sidebar).
- Garantir que o FAB não cubra conteúdo importante (padding-bottom no content).
- Testar touch targets mínimos de 44px.

ACCEPTANCE CRITERIA:
- [ ] Layout não quebra em 375px width.
- [ ] Drawer funciona (abre/fecha).
- [ ] FAB visível e funcional.
- [ ] Calendário legível em mobile.
- [ ] Listas scrollam corretamente.
- [ ] Modal não corta em mobile.
- [ ] Nenhum conteúdo inacessível por falta de scroll.
```

---

## ✨ FASE 8: Polish, Microinterações e Dark/Light Mode
**Objetivo:** Aplicar refinamentos finais, animações sutis e garantir consistência entre temas.
**Complexidade:** Baixa | **Risco:** Baixo

### PROMPT:

```
ROLE: Frontend UI Engineer

TASK: Aplicar microinterações, estados de loading e garantir que o dark mode e light mode estejam perfeitamente consistentes após o redesign.

CHECKLIST DE POLISH:

1. SCROLLBAR CUSTOM:
   - Webkit scrollbar: width: 8px, track: transparent, thumb: var(--ufma-border-subtle), border-radius: 4px.
   - Hover thumb: var(--ufma-text-tertiary).
   - Firefox: scrollbar-color e scrollbar-width.

2. ESTADOS DE FOCUS (Acessibilidade):
   - Todos botões e inputs: focus-visible: outline: 2px solid var(--ufma-accent-blue), outline-offset: 2px.
   - Não remover outline sem substituir.

3. LOADING STATES:
   - Skeleton screens para listas: shimmer animation com bg gradiente animado.
   - CSS puro: @keyframes shimmer, background linear-gradient com background-size 200%.
   - Aplicar nas áreas de lista enquanto carrega dados do Supabase.

4. TOAST NOTIFICATIONS:
   - Se ainda usar showToast do utils.js, estilizar:
     * Container fixed top-right: 24px, 24px.
     * Border-radius: var(--ufma-radius-lg).
     * Shadow: var(--ufma-shadow-lg).
     * Tipos: Sucesso (border-left: 3px solid verde), Erro (border-left: 3px solid vermelho), Info (azul).
     * Animação: slide-in da direita, fade out após 3s.

5. EMPTY STATES:
   - Quando uma lista está vazia: ícone ilustrativo (SVG inline ou Lucide) + texto amigável + CTA opcional.
   - Ex: "Nenhum evento encontrado. Crie seu primeiro agendamento!"
   - Centralizado, color: var(--ufma-text-tertiary), padding: 60px 20px.

6. DARK/LIGHT MODE:
   - Verificar TODOS os novos componentes em ambos os temas.
   - Garantir contraste mínimo 4.5:1 para textos.
   - Sombras no light mode: usar rgba(0,0,0,0.08) etc.
   - Sombras no dark mode: usar rgba(0,0,0,0.3) ou remover (flat design escuro).
   - Inputs no dark: bg mais escuro que o surface, bordas visíveis.
   - Inputs no light: bg levemente cinza, bordas sutis.

7. ANIMAÇÕES:
   - Troca de abas: fade-in 150ms (opacity 0→1).
   - Modal: scale 0.95→1 + opacity.
   - Dropdowns: translateY(-4px)→0 + opacity.
   - Sidebar colapsar: width transition.
   - Accordion encerrados: grid-template-rows 0fr → 1fr ou max-height transition.
   - Nada de animação em propriedades que causem repaint pesado (width/height em mobile com muitos elementos).

8. HOVER STATES:
   - Verificar que TODOS elementos interativos têm hover state.
   - Botões: bg muda ou eleva.
   - Links: underline animado (left to right) ou color shift.
   - Cards: translateY(-1px) + shadow.
   - Itens de evento: bg elevado + ações aparecem + indicador translateX(2px).

CONSTRAINTS:
- Não adicionar bibliotecas de animação (GSAP, etc.). Usar CSS transitions/keyframes apenas.
- Não quebrar a funcionalidade existente do showToast.
- Performance: animar apenas transform e opacity.

ACCEPTANCE CRITERIA:
- [ ] Scrollbar custom visível e funcional.
- [ ] Focus rings visíveis em navegação por teclado.
- [ ] Skeleton loading aplicado.
- [ ] Toasts estilizados.
- [ ] Empty states amigáveis.
- [ ] Dark e light mode consistentes.
- [ ] Nenhum elemento sem hover state.
- [ ] Performance fluida (60fps nas animações).
- [ ] Accordion de encerrados anima suavemente.
```

---

## ✅ CHECKLIST DE VALIDAÇÃO CRUZADA (Pós-Todas as Fases)

Antes de considerar o redesign completo, verificar:

- [ ] **Funcionalidades preservadas:**
  - [ ] Login/logout funciona.
  - [ ] Criar agendamento funciona (todos os campos).
  - [ ] Editar agendamento funciona.
  - [ ] Excluir/cancelar agendamento funciona.
  - [ ] Filtros de campus funcionam (topbar e sidebar).
  - [ ] Busca funciona.
  - [ ] Troca entre abas funciona.
  - [ ] Calendário mostra todos os eventos corretamente.
  - [ ] Detecção de conflitos funciona.
  - [ ] Modal de conflito aparece e mostra dados.
  - [ ] Exportação PDF/Excel (se existir) continua funcionando.
  - [ ] Permissões por role funcionam (o que cada um vê).
  - [ ] Seção de encerrados expande/colapsa e mostra os eventos corretos.
  - [ ] Agrupamento por data funciona e não repete datas.

- [ ] **Visual:**
  - [ ] Topbar estilo Google Calendar implementada.
  - [ ] Sidebar colapsável implementada.
  - [ ] Layout 100vh sem scroll global.
  - [ ] Calendário preenche altura disponível.
  - [ ] Itens minimalistas com indicador lateral 3px.
  - [ ] Cor do campus NUNCA duplicada no mesmo item.
  - [ ] Sem glow, sem bordas fortes, sem backgrounds coloridos nos itens.
  - [ ] Seção encerrados colapsável no final da lista.
  - [ ] Modais estilizados.
  - [ ] Mobile funcional.

- [ ] **Código:**
  - [ ] Nenhum erro no console.
  - [ ] Nenhum `!important` desnecessário.
  - [ ] CSS organizado (tokens, componentes, overrides).
  - [ ] Nenhum seletor de ID de alta especificidade causando regressão.
  - [ ] Variáveis CSS usadas consistentemente.
  - [ ] HTML dos cards atualizado em todos os lugares que usam gerarCardEventoHtml.

---

## 🚀 ORDEM DE EXECUÇÃO RECOMENDADA

1. **Fase 1** → Tokens (fundação segura)
2. **Fase 4** → Layout Base (estrutura segura para receber os componentes)
3. **Fase 2** → Topbar (componente isolado)
4. **Fase 3** → Sidebar (componente isolado)
5. **Fase 5** → Calendário + Listagem Principal + Encerrados (views de conteúdo — MAIS COMPLEXA)
6. **Fase 6** → Modais (sobreposições)
7. **Fase 7** → Mobile (adaptações)
8. **Fase 8** → Polish (refinamentos finais)

> **Nota:** Cada fase deve ser testada individualmente antes de prosseguir. Não pular fases.
> **Fase 5 é a mais crítica** — envolve redesign completo dos cards, agrupamento por data e seção de encerrados. Executar com calma e testar todos os cenários.


## 🛡️ FASE 9: Telas Administrativas (Dono)
**Objetivo:** Redesenhar as 5 views exclusivas do administrador (dono) para o padrão visual Google Calendar, mantendo consistência com as telas de Editor/Leitor e zero breaking changes.
**Complexidade:** Alta | **Risco:** Médio
**Telas:** Dashboard, Cancelamentos, Conflitos, Relatórios, Usuários.

> **Nota:** Esta fase assume que as Fases 1–8 já foram aplicadas (tokens, topbar, sidebar, layout base, cards, modais). Todos os componentes visuais aqui devem reutilizar as classes e tokens já estabelecidos.

---

### 9.1 Estrutura da Seção ADMINISTRAÇÃO na Sidebar

```
ROLE: Frontend UI Engineer

TASK: Atualizar a sidebar para incluir a seção ADMINISTRAÇÃO com os 5 itens de navegação, visível apenas para usuários com role 'dono'. Manter a mesma estrutura visual dos itens de navegação da seção PRINCIPAL.

ITENS (na ordem exata):
1. 📈 Dashboard
2. 🗑️ Cancelamentos
3. ⚠️ Conflitos
4. 📊 Relatórios
5. 👥 Usuários

ESPECIFICAÇÃO:
- Label da seção: "ADMINISTRAÇÃO" — 10px uppercase, font-weight: 700, color: var(--ufma-text-tertiary), letter-spacing: 0.8px, padding: 20px 16px 8px.
- Divider sutil acima do label: 1px solid var(--ufma-border-subtle), margin: 16px 16px 0.
- Cada item: MESMO estilo dos itens da seção PRINCIPAL (padding, hover, ativo, ícone 20px, texto 13px).
- Item ativo: mesma regra — bg rgba(26,115,232,0.08), color azul, indicador lateral.
- Ícones sugeridos (Lucide): LayoutDashboard, Trash2, AlertTriangle, FileBarChart, Users.

CONSTRAINTS:
- Não alterar a lógica de permissões. O JS já controla o que o dono vê.
- Preservar os atributos data-tab ou IDs que o JS usa para trocar para essas abas.
- Se o item não existir no HTML atual, adicionar sem quebrar a navegação existente.
- A seção ADMINISTRAÇÃO deve ser a última na sidebar, acima do rodapé de perfil.

ACCEPTANCE CRITERIA:
- [ ] Seção ADMINISTRAÇÃO aparece na sidebar para donos.
- [ ] 5 itens listados na ordem correta.
- [ ] Mesmo estilo visual dos itens PRINCIPAL.
- [ ] Navegação entre abas admin funciona.
- [ ] Editor/Leitor não vê esses itens (verificar ocultação).
```

---

### 9.2 Dashboard Administrativo

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a view "Dashboard" administrativo para um layout clean, com cards de métricas no topo e gráficos abaixo, estilo Google Analytics / Google Calendar insights.

CONTEXTO ATUAL:
- Usa Chart.js para gráficos.
- Provavelmente mostra: total de agendamentos no mês, taxa de ocupação por campus, eventos por dia da semana, etc.
- Dados vêm do Supabase (tabela reservas).

ESTRUTURA VISUAL:

<div class="ufma-view-dashboard">

  <!-- HEADER DA VIEW -->
  <div class="ufma-view-header">
    <h1 class="ufma-view-header__titulo">Dashboard</h1>
    <p class="ufma-view-header__sub">Visão geral da ocupação dos espaços acadêmicos</p>
  </div>

  <!-- CARDS DE MÉTRICAS (KPIs) -->
  <div class="ufma-kpi-grid">
    <div class="ufma-kpi-card">
      <div class="ufma-kpi-card__icon" style="color: var(--ufma-accent-blue); bg: var(--ufma-accent-blue-light)">
        <svg><!-- calendar --></svg>
      </div>
      <div class="ufma-kpi-card__valor">247</div>
      <div class="ufma-kpi-card__label">Agendamentos no mês</div>
      <div class="ufma-kpi-card__trend ufma-kpi-card__trend--up">+12% vs anterior</div>
    </div>

    <div class="ufma-kpi-card">
      <div class="ufma-kpi-card__icon" style="color: var(--ufma-campus-sau); bg: var(--ufma-campus-sau-light)">
        <svg><!-- activity --></svg>
      </div>
      <div class="ufma-kpi-card__valor">84%</div>
      <div class="ufma-kpi-card__label">Taxa de ocupação</div>
    </div>

    <div class="ufma-kpi-card">
      <div class="ufma-kpi-card__icon" style="color: var(--ufma-danger); bg: rgba(239,68,68,0.10)">
        <svg><!-- alert-triangle --></svg>
      </div>
      <div class="ufma-kpi-card__valor">7</div>
      <div class="ufma-kpi-card__label">Conflitos pendentes</div>
    </div>

    <div class="ufma-kpi-card">
      <div class="ufma-kpi-card__icon" style="color: var(--ufma-campus-lic); bg: var(--ufma-campus-lic-light)">
        <svg><!-- users --></svg>
      </div>
      <div class="ufma-kpi-card__valor">42</div>
      <div class="ufma-kpi-card__label">Usuários ativos</div>
    </div>
  </div>

  <!-- GRÁFICOS -->
  <div class="ufma-charts-grid">
    <div class="ufma-chart-card ufma-chart-card--large">
      <div class="ufma-chart-card__header">
        <h3>Ocupação por Dia</h3>
        <select class="ufma-select--minimal">
          <option>Esta semana</option>
          <option>Este mês</option>
        </select>
      </div>
      <div class="ufma-chart-card__body">
        <canvas id="chartOcupacao"></canvas>
      </div>
    </div>

    <div class="ufma-chart-card">
      <div class="ufma-chart-card__header">
        <h3>Por Campus</h3>
      </div>
      <div class="ufma-chart-card__body">
        <canvas id="chartCampus"></canvas>
      </div>
    </div>

    <div class="ufma-chart-card">
      <div class="ufma-chart-card__header">
        <h3>Horários Mais Solicitados</h3>
      </div>
      <div class="ufma-chart-card__body">
        <canvas id="chartHorarios"></canvas>
      </div>
    </div>
  </div>

</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. HEADER DA VIEW (.ufma-view-header):
   - Padding: 24px 32px 0.
   - Título: 24px, font-weight: 600, color: var(--ufma-text-primary).
   - Subtítulo: 14px, color: var(--ufma-text-secondary), margin-top: 4px.

2. GRID DE KPIs (.ufma-kpi-grid):
   - Display: grid, grid-template-columns: repeat(4, 1fr), gap: 20px.
   - Padding: 24px 32px.
   - Mobile: 1 coluna, tablet: 2 colunas.

3. CARD KPI (.ufma-kpi-card):
   - Background: var(--ufma-bg-surface).
   - Border: 1px solid var(--ufma-border-subtle).
   - Border-radius: var(--ufma-radius-lg).
   - Padding: 20px.
   - Transition: var(--ufma-transition-base).
   - Hover: translateY(-2px), shadow: var(--ufma-shadow-md).

   a) Ícone: 40px circular container, ícone 20px centralizado. Cor do ícone e bg conforme métrica.
   b) Valor: 32px, font-weight: 700, color: var(--ufma-text-primary), margin-top: 16px, line-height: 1.
   c) Label: 13px, color: var(--ufma-text-secondary), margin-top: 4px.
   d) Trend (opcional): 12px, margin-top: 8px. Up: color: var(--ufma-success). Down: color: var(--ufma-danger).

4. GRID DE GRÁFICOS (.ufma-charts-grid):
   - Display: grid, grid-template-columns: 2fr 1fr 1fr, gap: 20px.
   - Padding: 0 32px 32px.
   - Tablet: 2 colunas. Mobile: 1 coluna.
   - Primeiro gráfico (ocupação) ocupa 2 colunas (large).

5. CARD DE GRÁFICO (.ufma-chart-card):
   - Background: var(--ufma-bg-surface).
   - Border: 1px solid var(--ufma-border-subtle).
   - Border-radius: var(--ufma-radius-lg).
   - Overflow: hidden.

   a) Header: padding: 16px 20px, border-bottom: 1px solid var(--ufma-border-subtle), display: flex, justify-content: space-between, align-items: center.
      - Título: 14px, font-weight: 600, color: var(--ufma-text-primary).
      - Select minimal: border: none, bg: transparent, color: var(--ufma-text-secondary), font-size: 13px, cursor: pointer.

   b) Body: padding: 20px, min-height: 280px. Canvas deve preencher 100% width/height do container.

6. CHART.JS STYLING (overrides CSS):
   - Cores dos datasets devem usar os tokens de campus:
     * Engenharia: var(--ufma-campus-eng)
     * Licenciaturas: var(--ufma-campus-lic)
     * Saúde: var(--ufma-campus-sau)
   - Grid lines: color: var(--ufma-border-subtle), opacity: 0.5.
   - Textos dos eixos: color: var(--ufma-text-tertiary), font-size: 11px.
   - Tooltips: bg: var(--ufma-bg-surface), border: 1px solid var(--ufma-border-subtle), border-radius: var(--ufma-radius-md), color: var(--ufma-text-primary).
   - Legendas: color: var(--ufma-text-secondary), font-size: 12px.

CONSTRAINTS:
- Não alterar a inicialização dos gráficos Chart.js (configuração de datasets, labels, etc.).
- Não alterar as queries Supabase que alimentam o dashboard.
- Preservar os IDs dos canvas que o JS usa (`chartOcupacao`, `chartCampus`, etc.).
- Se o JS calcula os valores dos KPIs dinamicamente, manter os seletores/IDs onde esses valores são injetados.

ACCEPTANCE CRITERIA:
- [ ] 4 cards de KPI visuais no topo.
- [ ] Grid de KPIs responsivo (1→2→4 colunas).
- [ ] Gráficos Chart.js estilizados com cores dos tokens.
- [ ] Cards de gráfico com header e body separados.
- [ ] Hover nos KPI cards eleva sutilmente.
- [ ] Layout não quebra em nenhum breakpoint.
- [ ] Dados reais continuam aparecendo corretamente.
```

---

### 9.3 Cancelamentos (Soft Deletes)

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a view "Cancelamentos" para listar todos os agendamentos cancelados (soft deletes) com o novo padrão de cards minimalistas, mantendo as informações de audit trail e o botão de restauração.

CONTEXTO ATUAL:
- Mostra eventos com `cancelado=true`.
- Campos: título, responsável, data, motivo do cancelamento, quem cancelou, data do cancelamento.
- Botão "Restaurar" reverte o soft delete.
- Provavelmente usa a mesma função de renderização de cards que as outras listas.

ESTRUTURA VISUAL:

<div class="ufma-view-cancelamentos">

  <div class="ufma-view-header">
    <h1 class="ufma-view-header__titulo">Cancelamentos</h1>
    <p class="ufma-view-header__sub">Histórico de agendamentos cancelados e opções de restauração</p>
  </div>

  <!-- FILTROS RÁPIDOS -->
  <div class="ufma-filtros-bar">
    <div class="ufma-filtros-bar__grupo">
      <button class="ufma-chip ufma-chip--ativo">Todos</button>
      <button class="ufma-chip">Esta semana</button>
      <button class="ufma-chip">Este mês</button>
    </div>
    <div class="ufma-filtros-bar__contador">
      23 cancelamentos encontrados
    </div>
  </div>

  <!-- LISTA DE CANCELADOS -->
  <div class="ufma-lista-agendamentos">

    <!-- GRUPO DE DATA (mesmo padrão da Fase 5) -->
    <div class="ufma-grupo-data">
      <div class="ufma-grupo-data__header">
        <span class="ufma-grupo-data__dia">22</span>
        <span class="ufma-grupo-data__info">de Abril (quarta-feira)</span>
      </div>
      <div class="ufma-grupo-data__linha"></div>

      <!-- ITEM CANCELADO -->
      <div class="ufma-evento-item ufma-evento-item--cancelado">
        <div class="ufma-evento-item__indicador" style="background: var(--ufma-text-tertiary)"></div>
        <div class="ufma-evento-item__conteudo">
          <div class="ufma-evento-item__titulo-wrapper">
            <h3 class="ufma-evento-item__titulo">Nome do Evento Cancelado</h3>
            <span class="ufma-badge ufma-badge--cancelado">Cancelado</span>
          </div>
          <div class="ufma-evento-item__meta">
            <span>08:00 – 18:00</span>
            <span>•</span>
            <span>Sala 05</span>
            <span>•</span>
            <span>SEME</span>
          </div>
          <!-- AUDIT TRAIL -->
          <div class="ufma-evento-item__audit">
            <span class="ufma-evento-item__audit-item">
              <svg><!-- user-x --></svg>
              Cancelado por: João Silva
            </span>
            <span class="ufma-evento-item__audit-item">
              <svg><!-- clock --></svg>
              Em: 22/04/2026 às 14:30
            </span>
            <span class="ufma-evento-item__audit-item">
              <svg><!-- message-square --></svg>
              Motivo: Evento adiado pela coordenação
            </span>
          </div>
        </div>
        <div class="ufma-evento-item__acoes">
          <button class="ufma-btn ufma-btn--restore" title="Restaurar agendamento">
            <svg><!-- rotate-ccw --></svg>
            Restaurar
          </button>
        </div>
      </div>

    </div>
  </div>

</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. HEADER DA VIEW: Mesmo padrão do Dashboard (título 24px + subtítulo).

2. FILTROS RÁPIDOS (.ufma-filtros-bar):
   - Display: flex, justify-content: space-between, align-items: center.
   - Padding: 0 32px 16px.
   - Grupo de chips: display: flex, gap: 8px.
     * Chip inativo: padding: 6px 14px, border-radius: var(--ufma-radius-full), border: 1px solid var(--ufma-border-subtle), bg: transparent, color: var(--ufma-text-secondary), font-size: 13px.
     * Chip ativo: bg: var(--ufma-bg-elevated), color: var(--ufma-text-primary), border-color: var(--ufma-border-subtle), font-weight: 500.
   - Contador: 13px, color: var(--ufma-text-tertiary).

3. ITEM CANCELADO (.ufma-evento-item--cancelado):
   - MESMA estrutura base do item da Fase 5 (indicador 3px + conteúdo + ações).
   - Indicador lateral: cor var(--ufma-text-tertiary) (cinza, não colorido), simbolizando estado inativo.
   - Título: text-decoration: line-through, opacity: 0.7.
   - Badge "Cancelado": padding: 2px 8px, border-radius: var(--ufma-radius-sm), font-size: 11px, font-weight: 600, color: var(--ufma-danger), bg: rgba(239,68,68,0.10), margin-left: 8px.

4. AUDIT TRAIL (.ufma-evento-item__audit):
   - Display: flex, flex-wrap: wrap, gap: 12px, margin-top: 10px, padding-top: 10px, border-top: 1px dashed var(--ufma-border-subtle).
   - Cada item: display: flex, align-items: center, gap: 6px, font-size: 12px, color: var(--ufma-text-tertiary).
   - Ícone: 12px, stroke 1.5, color: var(--ufma-text-tertiary).
   - Texto: "Cancelado por: X", "Em: XX/XX/XXXX", "Motivo: X".

5. BOTÃO RESTAURAR (.ufma-btn--restore):
   - Padding: 8px 16px.
   - Border-radius: var(--ufma-radius-md).
   - Background: transparent.
   - Border: 1px solid var(--ufma-border-subtle).
   - Color: var(--ufma-text-secondary).
   - Font-size: 13px, font-weight: 500.
   - Display: flex, align-items: center, gap: 6px.
   - Ícone rotate-ccw: 14px.
   - Hover: bg: var(--ufma-success), color: white, border-color: var(--ufma-success). Ícone rotate com animação sutil.
   - Transition: var(--ufma-transition-fast).
   - Click: deve chamar a mesma função de restauração do JS (provavelmente restaurarReserva() ou similar).

6. AGRUPAMENTO POR DATA:
   - MESMO padrão da Fase 5 — agrupar por data do evento (não por data do cancelamento).
   - Ou, se preferir, agrupar por data do cancelamento — manter consistente com o que o JS já faz.

CONSTRAINTS:
- Não alterar a lógica de soft delete.
- Não alterar o schema dos dados de audit trail (canceladopor, datacancelamento, motivo_cancelamento).
- Preservar a função de restauração — apenas estilizar o botão.
- Se o JS já separa cancelados em uma lista, manter essa lógica.

ACCEPTANCE CRITERIA:
- [ ] Itens cancelados com indicador cinza e título riscado.
- [ ] Badge "Cancelado" discreto ao lado do título.
- [ ] Audit trail visível (quem, quando, motivo).
- [ ] Botão Restaurar com hover verde e ícone.
- [ ] Filtros rápidos funcionam (se já existirem no JS).
- [ ] Agrupamento por data consistente.
- [ ] Restaurar funciona e move o item para a lista ativa.
```

---

### 9.4 Conflitos (Painel Global)

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a view "Conflitos" para mostrar todos os conflitos de agendamento do sistema de forma clara, visual e acionável, usando o padrão de cards minimalistas.

CONTEXTO ATUAL:
- Visão pareada de eventos conflitantes.
- Mostra: evento A vs evento B, horários sobrepostos, locais conflitantes.
- Já existe modal de conflito (estilizado na Fase 6). Esta view é a listagem global.
- Badge "1 Conflito" já aparece nos cards (visto na imagem dos Últimos Registros).

ESTRUTURA VISUAL:

<div class="ufma-view-conflitos">

  <div class="ufma-view-header">
    <h1 class="ufma-view-header__titulo">Conflitos</h1>
    <p class="ufma-view-header__sub">Agendamentos com sobreposição de horário ou espaço</p>
    <div class="ufma-view-header__alerta">
      <svg><!-- alert-triangle --></svg>
      <span>7 conflitos pendentes de resolução</span>
    </div>
  </div>

  <!-- LISTA DE CONFLITOS PAREADOS -->
  <div class="ufma-conflitos-lista">

    <!-- CARD DE CONFLITO -->
    <div class="ufma-conflito-card">

      <!-- HEADER DO CONFLITO -->
      <div class="ufma-conflito-card__header">
        <div class="ufma-conflito-card__badge">
          <svg><!-- alert-triangle --></svg>
          Conflito de Horário
        </div>
        <div class="ufma-conflito-card__data">22 de Abril (quarta-feira)</div>
      </div>

      <!-- CORPO: DOIS EVENTOS LADO A LADO -->
      <div class="ufma-conflito-card__body">

        <!-- EVENTO A -->
        <div class="ufma-conflito-card__evento">
          <div class="ufma-conflito-card__evento-indicador" style="background: var(--ufma-campus-eng)"></div>
          <div class="ufma-conflito-card__evento-conteudo">
            <h4>Congresso de Engenharia</h4>
            <div class="ufma-conflito-card__evento-meta">
              <span>08:00 – 12:00</span>
              <span>•</span>
              <span>Auditório Engenharia</span>
            </div>
            <div class="ufma-conflito-card__evento-responsavel">👤 Prof. Carlos Silva</div>
          </div>
        </div>

        <!-- VS / SEPARADOR -->
        <div class="ufma-conflito-card__vs">
          <div class="ufma-conflito-card__vs-linha"></div>
          <div class="ufma-conflito-card__vs-icon">×</div>
          <div class="ufma-conflito-card__vs-linha"></div>
        </div>

        <!-- EVENTO B -->
        <div class="ufma-conflito-card__evento">
          <div class="ufma-conflito-card__evento-indicador" style="background: var(--ufma-campus-sau)"></div>
          <div class="ufma-conflito-card__evento-conteudo">
            <h4>Palestra Saúde Coletiva</h4>
            <div class="ufma-conflito-card__evento-meta">
              <span>10:00 – 14:00</span>
              <span>•</span>
              <span>Auditório Engenharia</span>
            </div>
            <div class="ufma-conflito-card__evento-responsavel">👤 Dra. Maria Santos</div>
          </div>
        </div>

      </div>

      <!-- FOOTER: AÇÕES -->
      <div class="ufma-conflito-card__footer">
        <div class="ufma-conflito-card__sobreposicao">
          <svg><!-- clock --></svg>
          Sobreposição: 10:00 – 12:00 (2h)
        </div>
        <div class="ufma-conflito-card__acoes">
          <button class="ufma-btn ufma-btn--ghost">Ver Detalhes</button>
          <button class="ufma-btn ufma-btn--danger-outline">Cancelar um</button>
        </div>
      </div>

    </div>

  </div>

</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. HEADER DA VIEW:
   - Mesmo padrão (título + subtítulo).
   - Alerta no header: display: flex, align-items: center, gap: 8px, margin-top: 12px, padding: 10px 16px, bg: rgba(245,158,11,0.08), border: 1px solid rgba(245,158,11,0.2), border-radius: var(--ufma-radius-md), color: var(--ufma-warning), font-size: 13px, font-weight: 500.
   - Ícone: 16px.

2. CARD DE CONFLITO (.ufma-conflito-card):
   - Background: var(--ufma-bg-surface).
   - Border: 1px solid var(--ufma-border-subtle).
   - Border-radius: var(--ufma-radius-lg).
   - Margin-bottom: 16px.
   - Overflow: hidden.
   - Hover: shadow: var(--ufma-shadow-md), border-color: rgba(245,158,11,0.3).
   - Transition: var(--ufma-transition-base).

3. HEADER DO CARD (.ufma-conflito-card__header):
   - Padding: 16px 20px.
   - Display: flex, justify-content: space-between, align-items: center.
   - Border-bottom: 1px solid var(--ufma-border-subtle).

   a) Badge: display: flex, align-items: center, gap: 6px, padding: 4px 10px, border-radius: var(--ufma-radius-sm), bg: rgba(245,158,11,0.10), color: var(--ufma-warning), font-size: 12px, font-weight: 600.
   b) Data: 13px, color: var(--ufma-text-secondary).

4. CORPO (.ufma-conflito-card__body):
   - Padding: 20px.
   - Display: grid, grid-template-columns: 1fr auto 1fr, gap: 16px, align-items: center.
   - Mobile: 1 coluna (eventos empilhados, VS horizontal no meio).

5. EVENTO INDIVIDUAL (.ufma-conflito-card__evento):
   - Display: flex, gap: 12px.
   - Indicador lateral: 3px width, border-radius: full, align-self: stretch. Cor do campus.
   - Conteúdo:
     * Título: 14px, font-weight: 600, color: var(--ufma-text-primary).
     * Meta: 12px, color: var(--ufma-text-tertiary), margin-top: 4px.
     * Responsável: 12px, color: var(--ufma-text-secondary), margin-top: 8px, display: flex, align-items: center, gap: 4px.

6. SEPARADOR VS (.ufma-conflito-card__vs):
   - Display: flex, flex-direction: column, align-items: center, gap: 4px.
   - Linhas: width: 1px, height: 20px, bg: var(--ufma-border-subtle).
   - Ícone ×: 16px, color: var(--ufma-danger), font-weight: 700, width: 28px, height: 28px, border-radius: full, border: 1px solid var(--ufma-border-subtle), display: flex, align-items: center, justify-content: center, bg: var(--ufma-bg-primary).
   - Mobile: flex-direction: row, linhas com width: 20px e height: 1px.

7. FOOTER (.ufma-conflito-card__footer):
   - Padding: 12px 20px.
   - Background: var(--ufma-bg-elevated).
   - Border-top: 1px solid var(--ufma-border-subtle).
   - Display: flex, justify-content: space-between, align-items: center.

   a) Sobreposição: display: flex, align-items: center, gap: 6px, font-size: 12px, color: var(--ufma-text-tertiary), font-weight: 500.
      - Ícone clock: 12px.

   b) Ações: display: flex, gap: 8px.
      - "Ver Detalhes": ghost button (padding: 6px 14px, border-radius: var(--ufma-radius-md), bg: transparent, border: 1px solid var(--ufma-border-subtle), color: var(--ufma-text-secondary), font-size: 13px). Hover: bg: var(--ufma-bg-surface).
      - "Cancelar um": danger-outline (padding: 6px 14px, border-radius: var(--ufma-radius-md), bg: transparent, border: 1px solid var(--ufma-danger), color: var(--ufma-danger), font-size: 13px). Hover: bg: rgba(239,68,68,0.08).

CONSTRAINTS:
- Não alterar a lógica de detecção de conflitos.
- Não alterar a estrutura de dados dos conflitos.
- Preservar a função que abre o modal de detalhes ao clicar "Ver Detalhes".
- Preservar a função de cancelar um dos eventos conflitantes.

ACCEPTANCE CRITERIA:
- [ ] Cards de conflito mostram dois eventos lado a lado.
- [ ] Indicador de cor do campus em cada evento.
- [ ] Separador "×" centralizado.
- [ ] Badge de tipo de conflito no header.
- [ ] Footer com tempo de sobreposição e ações.
- [ ] Hover no card destaca com shadow sutil.
- [ ] Responsivo: empilha em mobile.
- [ ] Ações funcionam (detalhes e cancelar).
```

---

### 9.5 Relatórios & Exportação

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a view "Relatórios" para um layout clean e profissional, com cards de ação bem definidos, mantendo as funcionalidades de exportar Excel, PDF e Backup/Restauração JSON.

CONTEXTO ATUAL (baseado na imagem real enviada):
- 3 cards: Exportar Excel, Exportar PDF, Backup do Sistema.
- Excel: select de ano + select de mês + botão "Baixar Excel" (verde).
- PDF: botão "Baixar PDF" (vermelho).
- Backup: botão "Backup" + "Restaurar" (amarelo/laranja).
- Layout atual é uma grid simples de 3 cards quadrados.

ESTRUTURA VISUAL:

<div class="ufma-view-relatorios">

  <div class="ufma-view-header">
    <h1 class="ufma-view-header__titulo">Relatórios & Exportação</h1>
    <p class="ufma-view-header__sub">Exporte dados em diferentes formatos ou faça backup do sistema</p>
  </div>

  <div class="ufma-relatorios-grid">

    <!-- CARD EXCEL -->
    <div class="ufma-relatorio-card">
      <div class="ufma-relatorio-card__icon ufma-relatorio-card__icon--excel">
        <svg><!-- file-spreadsheet --></svg>
      </div>
      <h3 class="ufma-relatorio-card__titulo">Exportar Excel</h3>
      <p class="ufma-relatorio-card__desc">Planilha completa com todos os campos para análise no Excel ou Google Sheets.</p>

      <div class="ufma-relatorio-card__form">
        <div class="ufma-select-group">
          <label>Ano</label>
          <select class="ufma-select">
            <option>2026</option>
            <option>2025</option>
          </select>
        </div>
        <div class="ufma-select-group">
          <label>Mês</label>
          <select class="ufma-select">
            <option>Todos os Meses</option>
            <option>Janeiro</option>
            <!-- ... -->
          </select>
        </div>
      </div>

      <button class="ufma-btn ufma-btn--excel">
        <svg><!-- download --></svg>
        Baixar Excel
      </button>
    </div>

    <!-- CARD PDF -->
    <div class="ufma-relatorio-card">
      <div class="ufma-relatorio-card__icon ufma-relatorio-card__icon--pdf">
        <svg><!-- file-text --></svg>
      </div>
      <h3 class="ufma-relatorio-card__titulo">Exportar PDF</h3>
      <p class="ufma-relatorio-card__desc">Relatório formatado em PDF pronto para impressão ou envio por e-mail.</p>

      <div class="ufma-relatorio-card__preview">
        <div class="ufma-relatorio-card__preview-box">
          <svg><!-- file --></svg>
          <span>Relatório_Mensal.pdf</span>
        </div>
      </div>

      <button class="ufma-btn ufma-btn--pdf">
        <svg><!-- download --></svg>
        Baixar PDF
      </button>
    </div>

    <!-- CARD BACKUP -->
    <div class="ufma-relatorio-card">
      <div class="ufma-relatorio-card__icon ufma-relatorio-card__icon--backup">
        <svg><!-- database --></svg>
      </div>
      <h3 class="ufma-relatorio-card__titulo">Backup do Sistema</h3>
      <p class="ufma-relatorio-card__desc">Exporte ou restaure o banco de dados completo em formato JSON.</p>

      <div class="ufma-relatorio-card__acoes-duplas">
        <button class="ufma-btn ufma-btn--secondary">
          <svg><!-- download --></svg>
          Backup
        </button>
        <button class="ufma-btn ufma-btn--warning">
          <svg><!-- upload --></svg>
          Restaurar
        </button>
      </div>
    </div>

  </div>

  <!-- SEÇÃO OPCIONAL: HISTÓRICO DE EXPORTAÇÕES -->
  <div class="ufma-relatorios-historico">
    <h3 class="ufma-relatorios-historico__titulo">Exportações Recentes</h3>
    <div class="ufma-relatorios-historico__lista">
      <div class="ufma-historico-item">
        <div class="ufma-historico-item__icon">
          <svg><!-- file-spreadsheet --></svg>
        </div>
        <div class="ufma-historico-item__info">
          <div class="ufma-historico-item__nome">agendamentos_abril_2026.xlsx</div>
          <div class="ufma-historico-item__meta">Excel • 2.4 MB • Há 2 horas</div>
        </div>
        <button class="ufma-historico-item__acao">
          <svg><!-- download --></svg>
        </button>
      </div>
    </div>
  </div>

</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. GRID DE CARDS (.ufma-relatorios-grid):
   - Display: grid, grid-template-columns: repeat(3, 1fr), gap: 24px.
   - Padding: 24px 32px.
   - Tablet: 2 colunas. Mobile: 1 coluna.

2. CARD DE RELATÓRIO (.ufma-relatorio-card):
   - Background: var(--ufma-bg-surface).
   - Border: 1px solid var(--ufma-border-subtle).
   - Border-radius: var(--ufma-radius-xl).
   - Padding: 28px.
   - Display: flex, flex-direction: column.
   - Transition: var(--ufma-transition-base).
   - Hover: translateY(-2px), shadow: var(--ufma-shadow-lg), border-color: transparent.
   - Min-height: 320px (para alinhar alturas).

3. ÍCONE (.ufma-relatorio-card__icon):
   - Width: 48px, height: 48px, border-radius: var(--ufma-radius-lg).
   - Display: flex, align-items: center, justify-content: center.
   - Margin-bottom: 20px.
   - Ícone interno: 24px.
   - Cores:
     * Excel: bg: rgba(16,185,129,0.10), color: var(--ufma-success).
     * PDF: bg: rgba(239,68,68,0.10), color: var(--ufma-danger).
     * Backup: bg: rgba(245,158,11,0.10), color: var(--ufma-warning).

4. TÍTULO (.ufma-relatorio-card__titulo):
   - Font-size: 18px, font-weight: 600, color: var(--ufma-text-primary).
   - Margin-bottom: 8px.

5. DESCRIÇÃO (.ufma-relatorio-card__desc):
   - Font-size: 13px, color: var(--ufma-text-secondary), line-height: 1.5.
   - Margin-bottom: 20px.
   - Flex-grow: 1 (empurra o botão para baixo).

6. FORMULÁRIO INTERNO (.ufma-relatorio-card__form):
   - Display: flex, flex-direction: column, gap: 12px, margin-bottom: 20px.
   - Select group: label (12px, font-weight: 500, color: var(--ufma-text-primary), margin-bottom: 4px) + select.
   - Select (.ufma-select): width: 100%, padding: 10px 14px, border-radius: var(--ufma-radius-md), border: 1px solid var(--ufma-border-subtle), bg: var(--ufma-bg-primary), color: var(--ufma-text-primary), font-size: 13px. Focus: border-color: var(--ufma-accent-blue).

7. BOTÕES:
   - Geral: width: 100%, padding: 12px, border-radius: var(--ufma-radius-md), font-size: 14px, font-weight: 500, display: flex, align-items: center, justify-content: center, gap: 8px, cursor: pointer, transition: var(--ufma-transition-fast).

   a) Excel (.ufma-btn--excel): bg: var(--ufma-success), color: white. Hover: filter: brightness(1.1), translateY(-1px).
   b) PDF (.ufma-btn--pdf): bg: var(--ufma-danger), color: white. Hover: filter: brightness(1.1), translateY(-1px).
   c) Secondary (.ufma-btn--secondary): bg: var(--ufma-bg-elevated), color: var(--ufma-text-primary), border: 1px solid var(--ufma-border-subtle). Hover: bg: var(--ufma-bg-surface).
   d) Warning (.ufma-btn--warning): bg: var(--ufma-warning), color: white. Hover: filter: brightness(1.1).

8. AÇÕES DUPLAS (.ufma-relatorio-card__acoes-duplas):
   - Display: grid, grid-template-columns: 1fr 1fr, gap: 10px.

9. PREVIEW BOX (.ufma-relatorio-card__preview-box):
   - Padding: 12px, border-radius: var(--ufma-radius-md), bg: var(--ufma-bg-elevated), border: 1px dashed var(--ufma-border-subtle), display: flex, align-items: center, gap: 10px, margin-bottom: 20px.
   - Ícone: 20px, color: var(--ufma-text-tertiary).
   - Texto: 13px, color: var(--ufma-text-secondary).

10. HISTÓRICO (.ufma-relatorios-historico):
    - Margin-top: 32px, padding: 0 32px.
    - Título: 16px, font-weight: 600, color: var(--ufma-text-primary), margin-bottom: 16px.
    - Lista: display: flex, flex-direction: column, gap: 8px.
    - Item: padding: 12px 16px, border-radius: var(--ufma-radius-md), bg: var(--ufma-bg-surface), border: 1px solid var(--ufma-border-subtle), display: flex, align-items: center, gap: 12px.
    - Ícone: 36px circular, bg: var(--ufma-bg-elevated), ícone 16px centralizado.
    - Info: flex-grow: 1. Nome: 13px, font-weight: 500. Meta: 12px, color: var(--ufma-text-tertiary).
    - Ação: 32px circular, hover: bg var(--ufma-bg-elevated).

CONSTRAINTS:
- Não alterar a lógica de exportação (XLSX.js, jsPDF).
- Não alterar a lógica de backup/restauração JSON.
- Preservar os event listeners dos botões de download.
- Preservar os selects de ano/mês e seus valores padrão.

ACCEPTANCE CRITERIA:
- [ ] 3 cards em grid responsivo (3→2→1 colunas).
- [ ] Cards com mesma altura alinhada.
- [ ] Ícones coloridos em container arredondado.
- [ ] Botões de ação no fundo de cada card.
- [ ] Hover nos cards eleva e adiciona shadow.
- [ ] Selects estilizados com focus state.
- [ ] Botão Restaurar em amarelo/laranja (ação destrutiva mas não delete).
- [ ] Todos os downloads funcionam.
- [ ] Seção de histórico (se implementada) mostra itens corretamente.
```

---

### 9.6 Usuários (Gestão de Usuários)

```
ROLE: Frontend UI Engineer

TASK: Redesenhar a view "Usuários" para uma tabela/lista moderna de gestão de usuários, com ações de editar role, remover e adicionar novos usuários.

CONTEXTO ATUAL:
- Tabela `usuarios` no Supabase: email, role.
- Sem coluna `id` (confirmado pelo erro 400 na PERF-001).
- Roles: leitor, editor, dono.
- Admin pode adicionar usuários via whitelist (email + role).
- Admin pode remover usuários.

ESTRUTURA VISUAL:

<div class="ufma-view-usuarios">

  <div class="ufma-view-header">
    <h1 class="ufma-view-header__titulo">Usuários</h1>
    <p class="ufma-view-header__sub">Gerencie quem tem acesso ao sistema de agendamentos</p>
  </div>

  <!-- TOOLBAR DE AÇÕES -->
  <div class="ufma-usuarios-toolbar">
    <div class="ufma-usuarios-toolbar__busca">
      <svg><!-- search --></svg>
      <input type="text" placeholder="Buscar por e-mail...">
    </div>
    <button class="ufma-btn ufma-btn--primary">
      <svg><!-- user-plus --></svg>
      Adicionar Usuário
    </button>
  </div>

  <!-- TABELA DE USUÁRIOS -->
  <div class="ufma-usuarios-tabela-wrapper">
    <table class="ufma-usuarios-tabela">
      <thead>
        <tr>
          <th>Usuário</th>
          <th>E-mail</th>
          <th>Permissão</th>
          <th>Status</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div class="ufma-usuario-cell">
              <div class="ufma-usuario-cell__avatar">TI</div>
              <div class="ufma-usuario-cell__nome">Tiago Pinheiro</div>
            </div>
          </td>
          <td>tipinheiro@ufma.br</td>
          <td>
            <select class="ufma-role-select ufma-role-select--dono">
              <option selected>Dono</option>
              <option>Editor</option>
              <option>Leitor</option>
            </select>
          </td>
          <td>
            <span class="ufma-status ufma-status--ativo">Ativo</span>
          </td>
          <td>
            <button class="ufma-icon-btn" title="Remover">
              <svg><!-- trash-2 --></svg>
            </button>
          </td>
        </tr>
        <!-- mais linhas... -->
      </tbody>
    </table>
  </div>

  <!-- PAGINAÇÃO (se existir) -->
  <div class="ufma-paginacao">
    <button class="ufma-paginacao__btn" disabled>Anterior</button>
    <div class="ufma-paginacao__paginas">
      <button class="ufma-paginacao__numero ufma-paginacao__numero--ativo">1</button>
      <button class="ufma-paginacao__numero">2</button>
      <button class="ufma-paginacao__numero">3</button>
    </div>
    <button class="ufma-paginacao__btn">Próximo</button>
  </div>

</div>

ESPECIFICAÇÃO VISUAL DETALHADA:

1. TOOLBAR (.ufma-usuarios-toolbar):
   - Padding: 0 32px 20px.
   - Display: flex, justify-content: space-between, align-items: center.

   a) Busca: display: flex, align-items: center, gap: 10px, padding: 10px 14px, border-radius: var(--ufma-radius-full), bg: var(--ufma-bg-elevated), border: 1px solid var(--ufma-border-subtle), width: 320px.
      - Ícone: 16px, color: var(--ufma-text-tertiary).
      - Input: border: none, bg: transparent, color: var(--ufma-text-primary), font-size: 13px, outline: none, width: 100%.

   b) Botão "Adicionar": padding: 10px 20px, border-radius: var(--ufma-radius-md), bg: var(--ufma-accent-blue), color: white, font-size: 14px, font-weight: 500, display: flex, align-items: center, gap: 8px. Hover: bg var(--ufma-accent-blue-hover), translateY(-1px).

2. TABELA (.ufma-usuarios-tabela):
   - Width: 100%, border-collapse: separate, border-spacing: 0.
   - Margin: 0 32px, width: calc(100% - 64px).

   a) Header (thead):
      - Background: var(--ufma-bg-elevated).
      - Th: padding: 12px 16px, text-align: left, font-size: 12px, font-weight: 600, color: var(--ufma-text-tertiary), text-transform: uppercase, letter-spacing: 0.5px, border-bottom: 1px solid var(--ufma-border-subtle).
      - Primeira th: border-radius: var(--ufma-radius-md) 0 0 0.
      - Última th: border-radius: 0 var(--ufma-radius-md) 0 0.

   b) Body (tbody):
      - Tr: transition: var(--ufma-transition-fast).
      - Tr hover: bg: var(--ufma-bg-elevated).
      - Td: padding: 14px 16px, border-bottom: 1px solid var(--ufma-border-subtle), font-size: 13px, color: var(--ufma-text-primary), vertical-align: middle.
      - Última tr td: border-bottom: none.
        * Primeira td: border-radius: 0 0 0 var(--ufma-radius-md).
        * Última td: border-radius: 0 0 var(--ufma-radius-md) 0.

3. CÉLULA USUÁRIO (.ufma-usuario-cell):
   - Display: flex, align-items: center, gap: 12px.
   - Avatar: 36px circular, bg: var(--ufma-accent-blue), color: white, font-size: 14px, font-weight: 600, display: flex, align-items: center, justify-content: center. Texto: iniciais do nome (ex: "TI").
   - Nome: 14px, font-weight: 500, color: var(--ufma-text-primary).

4. SELECT DE ROLE (.ufma-role-select):
   - Padding: 6px 28px 6px 12px, border-radius: var(--ufma-radius-full), border: 1px solid var(--ufma-border-subtle), font-size: 12px, font-weight: 600, cursor: pointer, appearance: none, background-image: seta para baixo (SVG inline ou data URI).
   - Cores por role:
     * Dono: bg: rgba(147,51,234,0.10), color: var(--ufma-campus-eng), border-color: rgba(147,51,234,0.3).
     * Editor: bg: rgba(26,115,232,0.10), color: var(--ufma-accent-blue), border-color: rgba(26,115,232,0.3).
     * Leitor: bg: var(--ufma-bg-elevated), color: var(--ufma-text-secondary), border-color: var(--ufma-border-subtle).
   - Hover: filter: brightness(1.1).
   - Change: deve chamar a função de atualização de role no JS.

5. STATUS (.ufma-status):
   - Padding: 4px 10px, border-radius: var(--ufma-radius-full), font-size: 11px, font-weight: 600.
   - Ativo: bg: rgba(16,185,129,0.10), color: var(--ufma-success).
   - Inativo/Pendente: bg: rgba(245,158,11,0.10), color: var(--ufma-warning).

6. BOTÃO AÇÃO (.ufma-icon-btn):
   - Width: 32px, height: 32px, border-radius: var(--ufma-radius-full), border: none, bg: transparent, color: var(--ufma-text-tertiary), cursor: pointer, display: flex, align-items: center, justify-content: center.
   - Hover: bg: rgba(239,68,68,0.08), color: var(--ufma-danger).
   - Ícone: 16px.
   - Tooltip: title="Remover usuário".

7. PAGINAÇÃO (.ufma-paginacao):
   - Display: flex, justify-content: center, align-items: center, gap: 8px, padding: 24px 32px.
   - Botão anterior/próximo: padding: 8px 16px, border-radius: var(--ufma-radius-md), border: 1px solid var(--ufma-border-subtle), bg: var(--ufma-bg-surface), color: var(--ufma-text-secondary), font-size: 13px. Hover: bg: var(--ufma-bg-elevated). Disabled: opacity: 0.4, cursor: not-allowed.
   - Números: width: 32px, height: 32px, border-radius: var(--ufma-radius-md), border: none, bg: transparent, color: var(--ufma-text-secondary), font-size: 13px. Hover: bg: var(--ufma-bg-elevated).
   - Número ativo: bg: var(--ufma-accent-blue), color: white.

8. MODAL "ADICIONAR USUÁRIO" (se existir):
   - Mesmo estilo dos modais da Fase 6 (overlay blur, container arredondado, inputs estilizados).
   - Campos: E-mail (input), Role (select de pills ou dropdown), Botões Cancelar / Adicionar.
   - Validação de e-mail institucional (@ufma.br) mantida.

CONSTRAINTS:
- Não alterar a lógica de autenticação/whitelist.
- Não alterar a tabela `usuarios` (sem coluna id).
- Preservar a função que atualiza role no Supabase.
- Preservar a função que remove usuário.
- Preservar a validação de e-mail ao adicionar.

ACCEPTANCE CRITERIA:
- [ ] Tabela com header arredondado e linhas separadas por borda sutil.
- [ ] Avatar com iniciais do usuário.
- [ ] Select de role com cor por tipo (dono roxo, editor azul, leitor cinza).
- [ ] Hover nas linhas destaca sutilmente.
- [ ] Busca funcional (se já existir no JS).
- [ ] Botão "Adicionar" abre modal (ou formulário inline).
- [ ] Remover usuário com confirmação.
- [ ] Paginação estilizada (se existir).
- [ ] Responsivo: tabela scrolla horizontal em mobile.
```

---

### 9.7 Checklist de Validação Cruzada — Admin

```
- [ ] Todas as 5 abas admin navegáveis pela sidebar.
- [ ] Dono vê seção ADMINISTRAÇÃO; Editor/Leitor NÃO vê.
- [ ] Dashboard: KPIs e gráficos carregam dados reais.
- [ ] Cancelamentos: lista de soft deletes com audit trail e botão Restaurar funcional.
- [ ] Conflitos: cards pareados mostram ambos os eventos e sobreposição.
- [ ] Relatórios: Excel, PDF e Backup/Restaurar funcionam.
- [ ] Usuários: tabela lista todos, select de role atualiza, remover funciona.
- [ ] Nenhum erro de permissão (403) ao acessar abas admin.
- [ ] Consistência visual com as telas de Editor/Leitor (mesmos tokens, mesmas interações).
```

---

> **Fim da Fase 9.**

