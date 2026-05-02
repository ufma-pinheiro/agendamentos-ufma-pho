# REQUIREMENTS.md — Sistema de Agendamentos UFMA Pinheiro

## Milestone 1: Refatoração & Redesign Completo do Sistema

**Objetivo:** Modernizar a base técnica e redesenhar toda a interface do sistema para facilitar manutenções futuras e entregar uma experiência premium ao usuário final em todas as telas.

---

## Épicos

### ÉPICO 1 — Migração para Vite + npm
**Objetivo:** Substituir o carregamento de bibliotecas via CDN por pacotes gerenciados pelo npm com Vite como bundler.

**Critérios de Aceitação:**
- [ ] Projeto inicializado com Vite (build estático)
- [ ] Todas as dependências (FullCalendar, Chart.js, SweetAlert2, Flatpickr, etc.) movidas para `package.json`
- [ ] Build de produção gera `dist/` compatível com Vercel
- [ ] Hot Module Replacement (HMR) funcionando em desenvolvimento
- [ ] CSP atualizada para remover referências a CDNs externos

---

### ÉPICO 2 — Modularização do Código JS
**Objetivo:** Quebrar `app.js` (>1.000 linhas) em módulos de feature menores e especializados, eliminando dependência de escopo global.

**Critérios de Aceitação:**
- [ ] `app.js` refatorado em módulos de feature (ex: `features/calendar/`, `features/dashboard/`, `features/users/`)
- [ ] Handlers de eventos migrados de `onclick` inline para `addEventListener`
- [ ] Eliminação de dependências no escopo `window` onde possível
- [ ] Nenhuma regressão funcional — todas as features existentes continuam funcionando

---

### ÉPICO 3 — Reorganização do CSS
**Objetivo:** Dividir o `style.css` monolítico (~4.600 linhas) em camadas organizadas e reutilizáveis.

**Critérios de Aceitação:**
- [ ] CSS dividido em camadas: `tokens.css` → `base.css` → `components/` → `pages/`
- [ ] Design tokens centralizados (cores, tipografia, espaçamento, sombras, bordas)
- [ ] Tema claro e escuro funcionando via variáveis CSS
- [ ] Nenhuma regressão visual

---

### ÉPICO 4 — Redesign do Layout Global (Sidebar & Topbar)
**Objetivo:** Redesenhar a navegação principal para ser mais intuitiva, compacta e moderna.

**Critérios de Aceitação:**
- [ ] Sidebar colapsável com modo ícones (compacto) e modo expandido
- [ ] Estado da sidebar persistido no localStorage
- [ ] Topbar minimalista com apenas os controles essenciais
- [ ] User card da sidebar redesenhado (avatar, nome, role visível)
- [ ] Botão de novo agendamento sempre visível e acessível
- [ ] Responsividade preservada (mobile/tablet)

---

### ÉPICO 5 — Redesign: Calendário & Modal de Evento
**Objetivo:** Redesenhar o calendário (tela principal) e a experiência de interação com eventos.

**Critérios de Aceitação:**
- [ ] Calendário ocupa o máximo da área disponível na viewport
- [ ] Filtros de espaço (Engenharia, Licenciaturas, Saúde) mais visuais e com cores das categorias
- [ ] Customização visual do tema do FullCalendar integrada ao design system
- [ ] Tooltip/preview de evento ao passar o mouse com informações-chave
- [ ] Modal de detalhes do evento redesenhado: hierarquia clara, ações contextuais
- [ ] Formulário de nova reserva com UX melhorada (seleção de salas, datas, responsável)

---

### ÉPICO 6 — Redesign: Dashboard & Relatórios
**Objetivo:** Redesenhar o painel analítico e a tela de exportação de relatórios.

**Critérios de Aceitação:**
- [ ] Cards de métricas redesenhados (estilo moderno com ícone, valor e tendência)
- [ ] Gráficos com tema consistente (claro/escuro) e tooltips informativos
- [ ] Filtros de dashboard (ano, mês, categoria) integrados visualmente
- [ ] Tela de Relatórios com cards de exportação redesenhados (Excel, PDF, Backup)
- [ ] Feedback visual ao gerar/baixar relatório

---

### ÉPICO 7 — Redesign: Seções Administrativas
**Objetivo:** Redesenhar as abas de uso exclusivo do administrador (`dono`): Usuários, Cancelamentos, Conflitos e Notificações.

**Critérios de Aceitação:**
- [ ] **Gestão de Usuários:** Tabela/lista com avatar, badge de role e ações inline
- [ ] **Histórico de Cancelamentos:** Cards redesenhados com motivo, data e ação de restaurar
- [ ] **Painel de Conflitos:** Destaque visual claro para conflitos, com ações de resolução
- [ ] **Central de Notificações:** Formulário de configuração e log de disparos redesenhados

---

### ÉPICO 8 — Redesign: Resumo Mensal & Últimos Registros
**Objetivo:** Melhorar as abas de visualização disponíveis para todos os usuários.

**Critérios de Aceitação:**
- [ ] **Resumo Mensal:** Grid de meses com indicação visual de meses com eventos; cards de evento redesenhados
- [ ] **Meus Eventos:** Cards redesenhados com filtro ativo/cancelado mais claro
- [ ] **Últimos Registros:** Lista com indicação de data, espaço e responsável de forma escaneável

---

## Out of Scope (Milestone 1)
- Novas funcionalidades de negócio (ex: aprovação de reservas, integração WhatsApp)
- Migração de banco de dados ou mudança no schema do Supabase
- Migração para um framework JS (React, Vue, etc.)
- Testes automatizados E2E (pode ser considerado em Milestone 2)
