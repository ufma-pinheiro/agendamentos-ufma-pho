# 👑 Backlog — Funcionalidades Exclusivas do Admin (Dono)
> Levantamento realizado em: 2026-04-22
> Gerado por: Antigravity (Product Strategist)

---

## 🔐 Controle Total de Acesso

### 1. 👥 Gestão Avançada de Usuários
Além de adicionar/remover, o admin precisa de:
- **Histórico de ações** por usuário (quem criou, editou, apagou o quê e quando)
- **Ativar/Suspender** contas temporariamente sem excluir
- **Transferir propriedade** de agendamentos entre usuários (ex: professor se aposenta)
- **Forçar logout** de uma sessão ativa
- **Esforço:** Médio

### 2. 🔑 Convite por Link
Admin gera link de convite com prazo de validade e role pré-definida. Usuário clica e entra com permissão correta.
- **Por quê:** Hoje exige saber o e-mail exato antes do login do usuário.
- **Esforço:** Médio (tabela `invites` no Supabase)

---

## 📊 Logs e Auditoria

### 3. 📜 Log de Auditoria (Audit Trail)
Aba exclusiva do admin com todas as ações do sistema em ordem cronológica:

| Data/Hora | Usuário | Ação | Detalhes |
|---|---|---|---|
| 22/04 10:31 | prof@ufma.br | Criou agendamento | "Aula Prática" — Eng. Sala 3 |
| 22/04 09:15 | tecnico@ufma.br | Excluiu agendamento | "Reunião" — Saúde Auditório |
| 22/04 08:00 | admin@ufma.br | Alterou role | editor → leitor para user@ufma.br |

- **Por quê:** Sem isso, quando algo some do calendário ninguém sabe quem apagou.
- **Esforço:** Médio (tabela `audit_log` no Supabase + trigger automático)

### 4. 🚨 Painel de Conflitos Global
Aba mostrando todos os agendamentos com `isConflito = true` que foram forçados:
- Quem forçou o conflito
- Quais eventos estavam em colisão
- Botão de resolução rápida (manter um, cancelar o outro)
- **Por quê:** Conflitos forçados ficam invisíveis para o admin atualmente.
- **Esforço:** Baixo (query simples + nova view) ✅ QUICK WIN

### 10. 📤 Exportação de Audit Trail
Exportar o log completo de ações para Excel/PDF, com filtro por usuário, período e tipo de ação.
- **Por quê:** Necessário para prestação de contas e compliance institucional.
- **Esforço:** Baixo (extensão do sistema de exportação já existente) ✅ QUICK WIN

---

## 🏗️ Gestão de Espaços

### 5. 🏛️ Cadastro Dinâmico de Espaços
Hoje os espaços estão **hardcoded** no `app.js`. O admin deveria poder:
- Adicionar/remover salas pelo sistema
- Definir capacidade máxima por sala
- Bloquear espaço para manutenção (aparece como "indisponível" no calendário)
- **Por quê:** Hoje abrir/fechar uma sala exige alteração de código.
- **Esforço:** Alto (tabela `espacos` no banco + UI de gestão)

### 6. 🚧 Bloqueio de Período
Admin bloqueia um período inteiro (ex: recesso, reforma) e o sistema rejeita automaticamente novos agendamentos nesse intervalo.
- **Por quê:** Fundamental para gestão do calendário acadêmico.
- **Esforço:** Médio (tabela `periodos_bloqueados` + validação no salvamento)

---

## 📋 Aprovação e Comunicação

### 7. ✅ Fila de Aprovação de Agendamentos
Para espaços premium (auditórios), agendamento fica em status **"Pendente"** até o admin aprovar ou recusar com motivo.

```
┌─────────────────────────────────────────────────────┐
│ 🟡 "Formatura 2025" — Eng. Auditório               │
│    Solicitado por: prof@ufma.br em 22/04 às 10h     │
│    [✅ Aprovar]  [❌ Recusar]  [💬 Pedir mais info] │
└─────────────────────────────────────────────────────┘
```
- **Esforço:** Alto (campo `status` no banco + UI de fila)

### 8. 📣 Comunicados para Usuários
Admin posta avisos que aparecem para todos ao abrir o sistema:
- "⚠️ Manutenção programada no bloco de Engenharia — Dias 25 a 27/04"
- **Esforço:** Baixo (tabela `comunicados` + banner no topo) ✅ QUICK WIN

---

## 📈 Analytics Avançado (Admin Only)

### 9. 📉 Dashboard Executivo
Métricas exclusivas do admin:
- **Taxa de ocupação** por espaço (% do tempo reservado vs. disponível)
- **Ranking de usuários** mais ativos (quem mais cria agendamentos)
- **Pico de uso** por hora e dia da semana
- **Taxa de conflitos forçados** (indicador de problema de gestão)
- **Esforço:** Médio (queries agregadas no Supabase + gráficos)

---

## 🛡️ Segurança e Controle Avançado

### 11. 🔒 Sessões Ativas
Admin visualiza quem está logado agora:
- E-mail, horário de login, último acesso
- Botão de "forçar logout" para sessão específica
- **Esforço:** Médio (Supabase `auth.sessions`)

### 12. 📏 Limites por Usuário
Admin define regras como:
- "Editores só podem criar até 5 agendamentos por mês"
- "Agendamentos não podem durar mais de 4 horas"
- **Por quê:** Evita monopolização dos espaços.
- **Esforço:** Médio (tabela `politicas` + validação no salvamento)

---

## 📊 Quadro de Priorização — Admin

| Feature | Valor Admin | Esforço | Quick Win? |
|---|---|---|---|
| Painel de Conflitos Global | 🔥 Crítico | 🟢 Baixo | **✅ Sim** |
| Comunicados para Usuários | 📈 Alto | 🟢 Baixo | **✅ Sim** |
| Exportação de Audit Trail | 📈 Alto | 🟢 Baixo | **✅ Sim** |
| Bloqueio de Período | 🔥 Crítico | ⚙️ Médio | Não |
| Log de Auditoria | 🔥 Crítico | ⚙️ Médio | Não |
| Dashboard Executivo | 📈 Alto | ⚙️ Médio | Não |
| Gestão de Espaços dinâmica | 🔥 Crítico | 🔴 Alto | Não |
| Fila de Aprovação | 📈 Alto | 🔴 Alto | Não |
| Limites por Usuário | 📈 Alto | ⚙️ Médio | Não |

---

## 💡 Sequência de Implementação Recomendada

1. ✅ **Painel de Conflitos Global** → Quick win, resolve problema real imediato
2. ✅ **Comunicados para Usuários** → Quick win, muito pedido em sistemas institucionais
3. **Bloqueio de Período** → Essencial para calendário acadêmico
4. **Log de Auditoria** → Fundação para todas as outras features de controle
5. **Fila de Aprovação** → Recurso mais complexo, maior impacto no controle de auditórios
