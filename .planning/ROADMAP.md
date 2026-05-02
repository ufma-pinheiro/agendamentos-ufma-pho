# ROADMAP.md — Sistema de Agendamentos UFMA Pinheiro

**Milestone 1:** Refatoração & Redesign do Calendário

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

**Objetivo:** Quebrar `app.js` em módulos de feature menores, organizados por domínio.

**Planos:**
1. Criar estrutura de diretórios: `src/features/{calendar,dashboard,users,reports,reservas,notifications}/`
2. Migrar lógica de calendário (`iniciarSistema`, `filtrarPorEspaco`, `abrirDetalhes`) para `src/features/calendar/`
3. Migrar lógica de dashboard (`atualizarDashboard`, gráficos) para `src/features/dashboard/`
4. Migrar gestão de usuários e relatórios para seus respectivos módulos
5. Refatorar `app.js` para ser apenas um orquestrador slim (<200 linhas)
6. Substituir todos os `onclick="window.fn()"` por `addEventListener` no JS
7. Validar: nenhuma regressão funcional

**UAT:** Criar, editar e deletar eventos funciona; dashboard carrega; exportação Excel/PDF funciona.

---

## Fase 3 — Reorganização do CSS
**Status:** `[ ] Pendente`

**Objetivo:** Dividir o `style.css` monolítico (~4.600 linhas) em camadas organizadas.

**Planos:**
1. Criar `src/styles/tokens.css` — variáveis de design (cores, espaçamento, tipografia, breakpoints)
2. Criar `src/styles/base.css` — reset, tipografia global, elementos HTML básicos
3. Criar `src/styles/components/` — um arquivo por componente (modal, sidebar, topbar, cards, etc.)
4. Criar `src/styles/pages/` — estilos específicos de cada seção (calendar, dashboard, users)
5. Criar `src/styles/main.css` — arquivo de entrada que importa tudo na ordem correta
6. Validar: UI idêntica visualmente ao estado anterior

**UAT:** Tema claro e escuro funcionam; todas as seções renderizam corretamente.

---

## Fase 4 — Redesign da UI: Sidebar & Topbar
**Status:** `[ ] Pendente`

**Objetivo:** Otimizar a interface para dar máximo espaço ao calendário e melhorar a usabilidade para o usuário final.

**Planos:**
1. Redesenhar sidebar: modo compacto com ícones por padrão, expandível ao hover/click
2. Redesenhar topbar: remover elementos redundantes, concentrar apenas filtros de espaço e busca global
3. Implementar sidebar totalmente retrátil (estado persistido no localStorage)
4. Melhorar chips de filtro de espaço (mais visuais, com cores das categorias)
5. Ajustar layout do calendário para ocupar 100% do espaço restante

**UAT:** Sidebar recolhe e expande corretamente; calendário usa espaço máximo; filtros por espaço funcionam.

---

## Fase 5 — Redesign da UI: Calendário & Modal de Evento
**Status:** `[ ] Pendente`

**Objetivo:** Melhorar a experiência dentro do calendário — como os eventos são exibidos e como o usuário interage com eles.

**Planos:**
1. Customizar o tema visual do FullCalendar para integrar melhor com o design system
2. Melhorar o tooltip/preview de eventos ao passar o mouse
3. Redesenhar o modal de detalhes do evento: layout mais claro, informações hierarquizadas
4. Melhorar o formulário de criação de reserva (UX do accordion de seleção de salas)
5. Adicionar animação de transição ao abrir/fechar modais

**UAT:** Eventos são fáceis de ler no calendário; modal de detalhes é claro e ações são intuitivas.

---

## Fase 6 — Build de Produção & Deploy
**Status:** `[ ] Pendente`

**Objetivo:** Garantir que o build final funcione corretamente no Vercel.

**Planos:**
1. Configurar `vercel.json` (se necessário) para apontar para `dist/`
2. Rodar `npm run build` e auditar o bundle (tamanho, dependências não usadas)
3. Testar o build estático localmente com `npx serve dist/`
4. Deploy para Vercel e validar em ambiente de produção
5. Atualizar CSP no `index.html` para remover entradas de CDN

**UAT:** Aplicação funciona completamente no Vercel; sem erros de console; autenticação Supabase funciona.

---

*Milestone 1 completo após Fase 6 verificada.*
