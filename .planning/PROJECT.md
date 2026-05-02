# Sistema de Agendamentos UFMA — Pinheiro

## What This Is

Sistema web de gerenciamento e agendamento de espaços físicos (salas, laboratórios e auditórios) da UFMA Pinheiro. Permite que usuários institucionais reservem espaços pelo calendário interativo e que administradores gerenciem usuários, resolvam conflitos e exportem relatórios. O sistema é acessado via browser sem necessidade de instalação.

## Core Value

O calendário deve ser a tela principal — claro, rápido e intuitivo — permitindo que qualquer usuário autorizado visualize e crie reservas em segundos.

## Requirements

### Validated

<!-- Funcionalidades já existentes e em produção -->

- ✓ Visualização de agendamentos via calendário interativo (FullCalendar) — existente
- ✓ Criação, edição e exclusão de eventos com suporte a múltiplos espaços — existente
- ✓ RBAC com 3 níveis: `leitor`, `editor`, `dono` — existente
- ✓ Dashboard analítico com métricas de uso (Chart.js) — existente
- ✓ Gestão de usuários pelo administrador — existente
- ✓ Exportação de relatórios em Excel e PDF — existente
- ✓ Detecção de conflitos de agendamento — existente
- ✓ Histórico de cancelamentos — existente
- ✓ Autenticação via Supabase Auth — existente
- ✓ Suporte a tema claro/escuro — existente

### Active

<!-- Objetivos do próximo ciclo de refatoração -->

- [ ] Migrar para Vite como bundler — substituir scripts CDN por pacotes npm gerenciados
- [ ] Modularizar `app.js` (>1000 linhas) em componentes menores e especializados por domínio
- [ ] Eliminar dependência de `window` para handlers — usar `addEventListener` de forma coesa
- [ ] Redesenhar a topbar e sidebar para maximizar o espaço do calendário (foco no usuário final)
- [ ] Melhorar a UX do calendário — filtros visuais, interação mais fluída, informações contextuais melhores
- [ ] Organizar CSS em camadas: design tokens → base → componentes → páginas

### Out of Scope

- App mobile nativo — o sistema é focado em browser desktop institucional
- Backend customizado — Supabase continua como único backend; não há planos de migração
- Integração com sistemas de RH ou ERP — fora do escopo desta fase
- Notificações push — a central de notificações existente (e-mail) é suficiente por ora

## Context

**Codebase atual:** Projeto brownfield. Vanilla JS com ESM modules carregados via CDN. ~14 arquivos de código principais. `app.js` é o controlador principal com mais de 1.000 linhas. CSS monolítico com ~4.600 linhas em um único `style.css`. Sem bundler, sem testes automatizados.

**Infraestrutura:** Supabase (auth + PostgreSQL). Hospedagem provável no Vercel. Domínio: `ufma-pinheiro/agendamentos-ufma-pho`.

**Problema central:** O código cresceu de forma orgânica e hoje é difícil de manter. Adicionar ou alterar uma feature requer entender muitas partes interdependentes. A UI do calendário, sendo a tela principal, precisa de mais espaço e mais clareza para o usuário final.

**Usuários:** Corpo docente e administrativo da UFMA Pinheiro. Perfis: `leitor` (visualiza), `editor` (cria e edita próprios eventos), `dono` (acesso total).

## Constraints

- **Tech Stack:** Manter Supabase e Vanilla JS/HTML — a migração para Vite não muda o paradigma, apenas o tooling
- **Compatibilidade:** Manter todas as funcionalidades existentes durante a refatoração — nenhum usuário pode perder funcionalidade
- **Deploy:** Manter compatibilidade com Vercel (build estático via Vite)
- **Idioma:** Interface em Português (pt-BR)

## Key Decisions

| Decisão | Rationale | Resultado |
|---|---|---|
| Migrar CDN → Vite + npm | Controle de versões, tree-shaking, DX melhor | — Pendente |
| Modularizar por domínio | Facilitar manutenção sem reescrever lógica | — Pendente |
| Redesenhar UI do calendário | Calendário é o core value; deve ter máximo espaço | — Pendente |
| Manter Vanilla JS (sem framework) | Equipe conhece o código; sem necessidade de React/Vue | — Pendente |

## Evolution

Este documento evolui a cada transição de fase e a cada milestone concluído.

**Após cada fase** (via `/gsd-plan-phase`):
1. Requisitos invalidados? → Mover para Out of Scope com motivo
2. Requisitos validados? → Mover para Validated com referência da fase
3. Novos requisitos emergiram? → Adicionar em Active
4. Decisões para registrar? → Adicionar em Key Decisions

**Após cada milestone** (via `/gsd-complete-milestone`):
1. Revisão completa de todas as seções
2. Core Value ainda correto?
3. Auditar Out of Scope — motivos ainda válidos?

---
*Last updated: 2026-05-02 — após inicialização do projeto (brownfield)*
