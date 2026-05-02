# REQUIREMENTS.md — Sistema de Agendamentos UFMA Pinheiro

## Milestone 1: Refatoração & Redesign do Calendário

**Objetivo:** Modernizar a base técnica do sistema para facilitar manutenções futuras e melhorar a experiência do usuário final, com foco no calendário como tela principal.

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

### ÉPICO 2 — Modularização do Código
**Objetivo:** Quebrar `app.js` (>1.000 linhas) e `style.css` (~4.600 linhas) em módulos menores e especializados.

**Critérios de Aceitação:**
- [ ] `app.js` refatorado em módulos de feature (ex: `features/calendar/`, `features/dashboard/`, `features/users/`)
- [ ] Handlers de eventos migrados de `onclick` inline para `addEventListener`
- [ ] Eliminação de dependências no escopo `window` onde possível
- [ ] CSS dividido em camadas: `tokens.css` → `base.css` → `components/` → `pages/`
- [ ] Nenhuma regressão funcional — todas as features existentes continuam funcionando

---

### ÉPICO 3 — Redesign da UI (Calendário como Foco)
**Objetivo:** Redesenhar a topbar e sidebar para liberar espaço máximo para o calendário e melhorar a experiência do usuário final.

**Critérios de Aceitação:**
- [ ] Sidebar colapsável por padrão em telas menores, com ícones como modo compacto
- [ ] Topbar minimalista — apenas o essencial (busca, filtros de espaço, ações rápidas)
- [ ] Calendário ocupa o máximo da área disponível na viewport
- [ ] Filtros de espaço (Engenharia, Licenciaturas, Saúde) mais visuais e intuitivos
- [ ] Modal de detalhes do evento mais rico (informações claras, ações contextualmente visíveis)
- [ ] Layout responsivo preservado (mobile/tablet)

---

## Out of Scope (Milestone 1)
- Novas funcionalidades de negócio (ex: aprovação de reservas, integração WhatsApp)
- Migração de banco de dados ou mudança no schema do Supabase
- Implementação de testes automatizados E2E (pode ser considerado em Milestone 2)
- Migração para um framework JS (React, Vue, etc.)
