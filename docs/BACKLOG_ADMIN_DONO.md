# 👑 Backlog — Funcionalidades Exclusivas do Admin (Dono)
> Atualizado em: 2026-04-22 | v2.0
> Gerado e revisado por: Antigravity (Product Strategist + Orchestrator)
> Estado do sistema: v1.7.0 | Branch: devAgendamento

---

## ✅ JÁ IMPLEMENTADO (não reimplementar)

| Feature | Status | Versão |
|---|---|---|
| Soft Delete com Motivo | ✅ Concluído | v1.7.0 |
| Modal de Conflitos com horários e badges | ✅ Concluído | v1.6.4 |
| Fix Timezone -03:00 | ✅ Concluído | v1.6.2 |
| Security Hardening (XSS, RLS, CSP) | ✅ Concluído | v1.4.x |
| Dashboard com gráficos (Chart.js) | ✅ Concluído | v1.x |

---

## 🔥 QUICK WINS — Alta Prioridade (Implementar Agora)

### 1. 📜 Histórico de Cancelamentos ⭐ NOVO (decorrência do soft delete)
O soft delete já persiste `cancelado=true`, `motivo_cancelamento`, `canceladopor` e `datacancelamento`.
**O banco já tem os dados — falta apenas a UI.**

Aba exclusiva do admin com todos os eventos cancelados:

| Data Cancelamento | Evento | Cancelado Por | Motivo |
|---|---|---|---|
| 22/04 às 10h15 | Aula Prática - Eng. Sala 3 | prof@ufma.br | Feriado nacional |
| 21/04 às 09h00 | Reunião TI | tecnico@ufma.br | Sala em manutenção |

- **Ação adicional:** Botão "♻️ Restaurar" para reverter cancelamentos equivocados (set `cancelado=false`)
- **Esforço:** 🟢 Baixo — Query simples + tabela HTML ✅ QUICK WIN IMEDIATO

---

### 2. 🚨 Painel de Conflitos Global
Aba com todos os agendamentos `isConflito = true` que foram forçados:
- Quem forçou, com quais eventos estavam em colisão, data e horário
- Botão de resolução rápida: cancelar um dos lados com motivo
- **Esforço:** 🟢 Baixo ✅ QUICK WIN

---

### 3. 📣 Comunicados para Usuários
Admin posta avisos que aparecem em banner para todos ao abrir o sistema:
- `⚠️ Manutenção no Bloco de Engenharia — 25 a 27/04`
- `📅 Recesso escolar: 01/05 a 05/05 — Agendamentos suspensos`
- Suporte a data de expiração automática do comunicado
- **Esforço:** 🟢 Baixo (tabela `comunicados` + banner no topo) ✅ QUICK WIN

---

### 4. 📤 Exportação do Histórico de Cancelamentos
Exportar todos os cancelamentos para Excel/PDF com filtros:
- Por período, por usuário, por espaço
- Inclui motivo, responsável e data/hora
- Aproveita sistema de exportação (XLSX/jsPDF) já existente
- **Esforço:** 🟢 Baixo ✅ QUICK WIN

---

## ⚙️ MÉDIA PRIORIDADE — Próximos Sprints

### 5. 🚧 Bloqueio de Período
Admin bloqueia um intervalo de datas (ex: recesso, reforma) e o sistema rejeita automaticamente novos agendamentos nesse período.
- Aparece no calendário como evento bloqueado em cinza
- Pode ser por espaço específico ou global
- **Esforço:** ⚙️ Médio (tabela `periodos_bloqueados` + validação no salvamento)

---

### 6. 📜 Log de Auditoria Completo (Audit Trail)
Todas as ações do sistema em ordem cronológica para o admin:

| Data/Hora | Usuário | Ação | Detalhes |
|---|---|---|---|
| 22/04 10:31 | prof@ufma.br | Criou agendamento | "Aula Prática" — Eng. Sala 3 |
| 22/04 09:15 | tecnico@ufma.br | Cancelou | "Reunião" — Motivo: sala fechada |
| 22/04 08:00 | admin@ufma.br | Alterou role | editor → leitor |

> **Nota:** O histórico de cancelamentos (item 1) é o primeiro passo dessa jornada.
- **Esforço:** ⚙️ Médio (tabela `audit_log` + triggers no Supabase)

---

### 7. 👥 Gestão Avançada de Usuários
- **Ativar/Suspender** conta temporariamente sem excluir
- **Transferir propriedade** de agendamentos (professor se aposenta)
- **Histórico de ações** por usuário
- **Esforço:** ⚙️ Médio

---

### 8. 🔑 Convite por Link
Admin gera link com prazo de validade e role pré-definida. Usuário clica e entra com permissão correta.
- Resolve o problema de precisar saber o e-mail antes do cadastro
- **Esforço:** ⚙️ Médio (tabela `invites` no Supabase)

---

### 9. 📏 Limites por Usuário
Admin define políticas como:
- "Editores: máximo 5 agendamentos/mês"
- "Duração máxima por agendamento: 4h"
- Evita monopolização dos espaços
- **Esforço:** ⚙️ Médio (tabela `politicas` + validação no salvamento)

---

### 10. 📉 Dashboard Executivo Avançado
Métricas exclusivas do admin além das já existentes:
- **Taxa de ocupação** por espaço (% do tempo reservado vs. disponível)
- **Ranking de usuários** mais ativos
- **Taxa de cancelamentos** por usuário (novo — dados disponíveis graças ao soft delete)
- **Pico de uso** por hora e dia
- **Esforço:** ⚙️ Médio (queries agregadas + novos gráficos Chart.js)

---

## 🔴 ALTA COMPLEXIDADE — Planejar Bem

### 11. 🏛️ Cadastro Dinâmico de Espaços
Hoje os espaços estão **hardcoded** no código. O admin deve poder:
- Adicionar/remover salas pelo sistema
- Definir capacidade máxima por sala
- Bloquear espaço para manutenção
- Definir categoria (Engenharia, Saúde, Licenciaturas)
- **Esforço:** 🔴 Alto (tabela `espacos` + UI de gestão + refatoração das queries)

---

### 12. ✅ Fila de Aprovação de Agendamentos
Para espaços premium (auditórios), agendamento fica "Pendente" até admin aprovar:
```
🟡 "Formatura 2025" — Eng. Auditório
   Solicitado por: prof@ufma.br em 22/04 às 10h
   [✅ Aprovar]  [❌ Recusar com motivo]
```
- **Esforço:** 🔴 Alto (campo `status` + UI de fila + notificações)

---

### 13. 🔒 Sessões Ativas
Admin vê quem está logado agora + botão de forçar logout.
- **Esforço:** ⚙️ Médio (Supabase `auth.sessions`)

---

## 📊 Quadro de Priorização Atualizado — Admin

| # | Feature | Valor | Esforço | Quick Win? | Dependência |
|---|---|---|---|---|---|
| 1 | Histórico de Cancelamentos + Restaurar | 🔥 Crítico | 🟢 Baixo | **✅ Sim** | Soft delete (feito) |
| 2 | Painel de Conflitos Global | 🔥 Crítico | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 3 | Comunicados para Usuários | 📈 Alto | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 4 | Exportação Histórico Cancelamentos | 📈 Alto | 🟢 Baixo | **✅ Sim** | Item 1 |
| 5 | Bloqueio de Período | 🔥 Crítico | ⚙️ Médio | Não | Nenhuma |
| 6 | Log de Auditoria Completo | 🔥 Crítico | ⚙️ Médio | Não | Item 1 |
| 7 | Dashboard Executivo Avançado | 📈 Alto | ⚙️ Médio | Não | Item 6 |
| 8 | Gestão Avançada de Usuários | 📈 Alto | ⚙️ Médio | Não | Nenhuma |
| 9 | Convite por Link | 📈 Alto | ⚙️ Médio | Não | Nenhuma |
| 10 | Limites por Usuário | 📈 Alto | ⚙️ Médio | Não | Item 11 |
| 11 | Cadastro Dinâmico de Espaços | 🔥 Crítico | 🔴 Alto | Não | Nenhuma |
| 12 | Fila de Aprovação | 📈 Alto | 🔴 Alto | Não | Item 11 |
| 13 | Sessões Ativas | 🛡️ Segurança | ⚙️ Médio | Não | Nenhuma |

---

## 💡 Sequência de Implementação Recomendada

```
Sprint 1 (Quick Wins — esta semana):
  ├── 1. Histórico de Cancelamentos + Restauração ← dados já existem no banco
  ├── 2. Painel de Conflitos Global ← query simples
  └── 3. Comunicados para Usuários ← nova tabela pequena

Sprint 2 (Controle — próxima semana):
  ├── 4. Bloqueio de Período ← fundamental para o acadêmico
  └── 5. Log de Auditoria Completo ← fundação de controle

Sprint 3 (Analytics e Gestão):
  ├── 6. Dashboard Executivo Avançado
  ├── 7. Gestão Avançada de Usuários
  └── 8. Cadastro Dinâmico de Espaços

Sprint 4 (Avançado):
  ├── 9. Fila de Aprovação
  ├── 10. Limites por Usuário
  └── 11. Convite por Link
```
