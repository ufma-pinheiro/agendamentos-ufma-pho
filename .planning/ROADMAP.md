# ROADMAP.md — Sistema de Agendamentos UFMA Pinheiro

**Milestone 1:** Refatoração & Redesign Completo do Sistema

---

## Fase 1 — Scaffold Vite + Dependências npm
**Status:** `[ ] Pendente`

**Objetivo:** Criar a estrutura do projeto Vite e mover todas as dependências do CDN para npm, sem alterar nada na lógica da aplicação.

**Planos:**
1. Inicializar projeto Vite (vanilla JS, modo estático)
2. Instalar dependências: `@supabase/supabase-js`, `fullcalendar`, `chart.js`, `sweetalert2`, `flatpickr`, `@popperjs/core`, `tippy.js`, `xlsx`, `jspdf`, `jspdf-autotable`, `@fortawesome/fontawesome-free`
3. Configurar `vite.config.js` para build estático (output `dist/`) compatível com Vercel
4. Atualizar `index.html` para usar assets locais (remover todos os `<script src="cdn...">`)
5. Validar: `npm run dev` sobe o servidor, `npm run build` gera `dist/` sem erros

**UAT:** App abre no navegador via Vite dev server; todas as funcionalidades respondem normalmente.

---

## Fase 2 — Modularização do Código JS
**Status:** `[ ] Pendente`

**Objetivo:** Quebrar `app.js` em módulos de feature menores, organizados por domínio, e eliminar dependência de `window`.

**Planos:**
1. Criar estrutura de diretórios: `src/features/{calendar,dashboard,users,reports,reservas,notifications,conflicts,cancellations}/`
2. Migrar lógica de calendário para `src/features/calendar/`
3. Migrar lógica de dashboard e gráficos para `src/features/dashboard/`
4. Migrar gestão de usuários, relatórios, conflitos, cancelamentos e notificações para seus módulos
5. Refatorar `app.js` para ser apenas um orquestrador slim (<200 linhas)
6. Substituir todos os `onclick="window.fn()"` por `addEventListener` no JS
7. Validar: nenhuma regressão funcional

**UAT:** Criar, editar e deletar eventos funciona; dashboard carrega; exportação Excel/PDF funciona.

---

## Fase 3 — Reorganização do CSS & Design Tokens
**Status:** `[ ] Pendente`

**Objetivo:** Dividir o `style.css` monolítico (~4.600 linhas) em camadas organizadas com design tokens centralizados.

**Planos:**
1. Criar `src/styles/tokens.css` — variáveis (cores, espaçamento, tipografia, sombras, bordas, breakpoints)
2. Criar `src/styles/base.css` — reset, tipografia global, elementos HTML básicos
3. Criar `src/styles/components/` — um arquivo por componente (modal, sidebar, topbar, cards, table, form, badge, etc.)
4. Criar `src/styles/pages/` — estilos específicos de cada seção (calendar, dashboard, users, reports, etc.)
5. Criar `src/styles/main.css` — arquivo de entrada que importa tudo
6. Validar: UI idêntica visualmente; tema claro/escuro funcionando

**UAT:** Todas as seções renderizam corretamente em modo claro e escuro.

---

## Fase 4 — Redesign: Layout Global (Sidebar & Topbar)
**Status:** `[ ] Pendente`

**Objetivo:** Redesenhar completamente a navegação principal — sidebar e topbar — para uma experiência mais moderna e compacta.

**Planos:**
1. Redesenhar sidebar: modo ícone (compacto) por padrão em telas médias, expandido em telas grandes
2. Implementar sidebar totalmente retrátil com estado no localStorage
3. Redesenhar topbar: remover elementos redundantes, manter apenas o essencial por contexto
4. Atualizar user card (avatar com iniciais coloridas, nome, badge de role)
5. Melhorar indicadores de aba ativa (nav-item)
6. Garantir responsividade: menu hambúrguer em mobile, overlay ao abrir sidebar

**UAT:** Sidebar recolhe/expande corretamente; estado persiste após reload; layout correto em mobile e desktop.

---

## Fase 5 — Redesign: Calendário & Interação com Eventos
**Status:** `[ ] Pendente`

**Objetivo:** Redesenhar a tela principal do sistema — o calendário — e toda a experiência de criação e visualização de reservas.

**Planos:**
1. Customizar o tema visual do FullCalendar (cores, tipografia, bordas) integrado ao design system
2. Redesenhar chips de filtro de espaço (Engenharia, Licenciaturas, Saúde) com cores e ícones das categorias
3. Implementar tooltip/preview de evento ao hover com informações-chave
4. Redesenhar modal de detalhes do evento: layout em grid, informações hierarquizadas, ações claras
5. Melhorar formulário de criação/edição: UX do accordion de seleção de salas, validações visuais
6. Adicionar animações de transição ao abrir/fechar modais

**UAT:** Eventos são fáceis de ler; modal de detalhes é claro; criar um novo evento é intuitivo.

---

## Fase 6 — Redesign: Dashboard & Relatórios
**Status:** `[ ] Pendente`

**Objetivo:** Redesenhar o painel analítico e a tela de exportação para uma experiência mais visual e informativa.

**Planos:**
1. Redesenhar cards de métricas (estilo moderno com ícone em destaque, valor grande, label secundário)
2. Aplicar tema consistente nos gráficos Chart.js (cores da paleta, tooltips, responsividade)
3. Redesenhar filtros do dashboard (ano, mês, categoria) em formato mais compacto e visual
4. Redesenhar cards de exportação (Excel, PDF, Backup) com ícone colorido, descrição e botão de ação
5. Adicionar feedback visual (loading, sucesso) ao gerar/baixar relatórios

**UAT:** Dashboard carrega com dados corretos; gráficos são legíveis em modo claro/escuro; download de Excel e PDF funcionam.

---

## Fase 7 — Redesign: Seções Administrativas
**Status:** `[ ] Pendente`

**Objetivo:** Redesenhar todas as telas de administração (`dono`): Usuários, Cancelamentos, Conflitos e Notificações.

**Planos:**
1. **Gestão de Usuários:** Lista com avatar, badge colorido de role, e ações inline (editar role, remover)
2. **Histórico de Cancelamentos:** Cards com destaque visual para motivo, data e responsável pelo cancelamento; botão de restaurar mais visível
3. **Painel de Conflitos:** Indicador visual claro de severidade do conflito; ações de resolução (manter um, cancelar ambos)
4. **Central de Notificações:** Formulário de configuração com layout em duas colunas; log de disparos em tabela estilizada

**UAT:** Admin consegue gerenciar usuários, ver cancelamentos, resolver conflitos e configurar notificações sem dificuldade.

---

## Fase 8 — Redesign: Resumo Mensal, Meus Eventos & Últimos Registros
**Status:** `[ ] Pendente`

**Objetivo:** Redesenhar as abas de visualização disponíveis para todos os perfis de usuário.

**Planos:**
1. **Resumo Mensal:** Grid de meses com indicador visual de meses com eventos; cards de evento redesenhados por data
2. **Meus Eventos:** Cards com foto do evento, filtro ativo/cancelado mais prominente; estado vazio melhorado
3. **Últimos Registros:** Lista com indicação clara de data relativa (ex: "há 2 horas"), espaço e responsável em destaque

**UAT:** Usuário consegue visualizar seus eventos e o histórico recente sem dificuldade.

---

## Fase 9 — Build de Produção & Deploy
**Status:** `[ ] Pendente`

**Objetivo:** Garantir que o build final funcione corretamente no Vercel com todas as melhorias aplicadas.

**Planos:**
1. Rodar `npm run build` e auditar o bundle (tamanho, tree-shaking, dependências não usadas)
2. Testar o build estático localmente com `npx serve dist/`
3. Configurar `vercel.json` (se necessário) para apontar para `dist/`
4. Deploy para Vercel e validar em ambiente de produção
5. Testar autenticação Supabase, criação de eventos e exportação de relatórios em produção
6. Atualizar CSP no `index.html` para remover entradas de CDN

**UAT:** Aplicação funciona completamente no Vercel; sem erros de console; todas as funcionalidades validadas.

---

*Milestone 1 completo após Fase 9 verificada e deployada em produção.*
