# 📋 Backlog — Melhorias para Usuário (Editor/Leitor)
> Atualizado em: 2026-04-22 | v2.0
> Gerado e revisado por: Antigravity (Product Strategist + Orchestrator)
> Estado do sistema: v1.7.0 | Branch: devAgendamento

---

## ✅ JÁ IMPLEMENTADO (não reimplementar)

| Feature | Status | Versão |
|---|---|---|
| Cancelamento com Motivo (modal obrigatório) | ✅ Concluído | v1.7.0 |
| Soft Delete (motivo preservado no banco) | ✅ Concluído | v1.7.0 |
| Formato de data BR (DD/MM/YYYY) | ✅ Concluído | v1.6.1 |
| Badges de locais nos modais | ✅ Concluído | v1.6.3 |
| Horários no modal de conflito | ✅ Concluído | v1.6.4 |
| Fix overflow de título longo | ✅ Concluído | v1.6.5 |
| Fix timezone -03:00 | ✅ Concluído | v1.6.2 |

---

## 🔥 QUICK WINS — Alta Prioridade

### 1. 📜 Meu Histórico de Cancelamentos ⭐ NOVO
O usuário pode ver os próprios agendamentos que cancelou, com motivo e data.
- Lista na aba "Meus Eventos" com filtro "Cancelados"
- Não exibe na sidebar nem no calendário (soft delete já filtra)
- **Por quê:** Transparência — usuário precisa consultar o que cancelou e por quê.
- **Esforço:** 🟢 Baixo — Query com `cancelado=true AND criadopor=email` ✅ QUICK WIN

---

### 2. 🔗 Link Público de Visualização
Gerar URL pública (sem login) que mostre a agenda de um espaço específico.
- Ex: `https://agendamentos.ufma.br/sala/engenharia-sala-3`
- Mostra o calendário apenas com leitura, sem criar conta
- **Por quê:** Remove a barreira de login para quem só quer verificar disponibilidade.
- **Esforço:** 🟢 Baixo (página estática + RLS read-only) ✅ QUICK WIN

---

### 3. 🎨 Personalização de Cor por Evento
Ao criar um agendamento, o editor escolhe a cor que aparece no calendário.
- Color picker no formulário de criação
- Substituição da lógica de cor automática (hardcoded por espaço)
- **Por quê:** Identificação visual rápida na agenda.
- **Esforço:** 🟢 Baixo ✅ QUICK WIN

---

### 4. 📋 Duplicar Agendamento ⭐ NOVO
Botão "Duplicar" no modal de detalhes que abre o formulário pré-preenchido com os dados do evento atual.
- Útil para aulas e reuniões que se repetem com pequenas variações
- **Por quê:** Evita redigitar tudo para eventos similares.
- **Esforço:** 🟢 Baixo (pré-preencher formulário com dados existentes) ✅ QUICK WIN

---

## ⚙️ MÉDIA PRIORIDADE — Próximos Sprints

### 5. 📅 Agendamentos Recorrentes
Criar evento que se repete automaticamente (semanal, quinzenal, mensal).
- Campo "Repetir" no formulário: Diário / Semanal / Quinzenal / Mensal
- Define data de encerramento da recorrência
- Agrupa pelo `groupId` já existente
- **Por quê:** Maioria das reservas de salas em universidades são aulas — mesmo horário toda semana.
- **Esforço:** ⚙️ Médio (expansão do `groupId` + lógica de geração de ocorrências)

---

### 6. ✉️ E-mail de Confirmação Automático
Após confirmar um agendamento, enviar e-mail com detalhes para o responsável.
- Inclui: título, local, data, horário, link para o sistema
- Usa a coluna `contatoemail` já existente no banco
- **Esforço:** ⚙️ Médio (Supabase Edge Functions + Resend ou SMTP)

---

### 7. 🔍 Busca por Disponibilidade
Usuário informa um intervalo de horário e o sistema lista quais salas estão disponíveis.
- Ex: "Preciso de uma sala na Engenharia na sexta das 14h às 16h"
- Elimina a busca manual sala por sala
- **Esforço:** ⚙️ Médio (lógica de filtro inverso nas queries)

---

### 8. 📱 View de Dia/Semana Estilizada
Grade de horários tipo Google Calendar com o design system atual.
- Visualização por hora (07h às 22h) com blocos coloridos
- Mais útil para identificar buracos na agenda
- **Esforço:** 🟢 Baixo (já configurável no FullCalendar — ajuste de CSS)

---

### 9. 🔔 Notificações Push de Conflito em Tempo Real
Quando um novo agendamento conflita com um existente, notificar o responsável do evento original.
- Usa Supabase Realtime (já configurado no sistema)
- **Por quê:** Atualmente o sistema detecta conflitos mas não avisa o criador do evento original.
- **Esforço:** ⚙️ Médio

---

## 🔴 ALTA COMPLEXIDADE — Planejar Bem

### 10. 📅 Agendamentos com Aprovação (Editor)
Para espaços premium (auditórios), editor submete solicitação que fica "Pendente" até admin aprovar.
- Editor vê o status em tempo real (Pendente / Aprovado / Recusado com motivo)
- **Esforço:** 🔴 Alto (campo `status` + workflow + notificações)
- **Dependência:** Fila de Aprovação do Admin deve ser implementada primeiro

---

### 11. 📱 PWA (Progressive Web App)
Instalar o sistema como app no celular, com ícone na home screen.
- Permite consultar a agenda offline (cache)
- Notificações push nativas no dispositivo
- **Esforço:** ⚙️ Médio (manifest.json + service worker)

---

### 12. 📊 Heatmap de Ocupação
Visualização em mapa de calor mostrando quais salas são mais usadas, em quais horários.
- Complementa o dashboard atual com visão espacial/temporal
- **Esforço:** ⚙️ Médio (Chart.js heatmap)

---

## 📊 Quadro de Priorização Atualizado — Editor/Leitor

| # | Feature | Impacto | Esforço | Quick Win? | Dependência |
|---|---|---|---|---|---|
| 1 | Meu Histórico de Cancelamentos | 🔥 Alto | 🟢 Baixo | **✅ Sim** | Soft delete (feito) |
| 2 | Link Público de Visualização | 🔥 Alto | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 3 | Duplicar Agendamento | 📈 Médio | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 4 | Personalização de Cor | 📈 Médio | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 5 | View Dia/Semana Estilizada | 📈 Médio | 🟢 Baixo | **✅ Sim** | Nenhuma |
| 6 | Agendamentos Recorrentes | 🔥 Alto | ⚙️ Médio | Não | Nenhuma |
| 7 | E-mail de Confirmação | 🔥 Alto | ⚙️ Médio | Não | Edge Functions |
| 8 | Busca por Disponibilidade | 🔥 Alto | ⚙️ Médio | Não | Nenhuma |
| 9 | Notificações Push de Conflito | 📈 Médio | ⚙️ Médio | Não | Realtime |
| 10 | Aprovação de Agendamentos | 📈 Médio | 🔴 Alto | Não | Admin: Fila |
| 11 | PWA | 🔥 Alto | ⚙️ Médio | Não | Nenhuma |
| 12 | Heatmap de Ocupação | 📈 Médio | ⚙️ Médio | Não | Nenhuma |

---

## 💡 Sequência de Implementação Recomendada

```
Sprint 1 (Quick Wins — esta semana):
  ├── 1. Meu Histórico de Cancelamentos ← dados já no banco
  ├── 2. Duplicar Agendamento ← reutiliza formulário existente
  ├── 3. View Dia/Semana Estilizada ← só CSS/config FullCalendar
  └── 4. Personalização de Cor ← color picker simples

Sprint 2 (Funcionalidades Essenciais):
  ├── 5. Link Público de Visualização
  └── 6. Agendamentos Recorrentes

Sprint 3 (Comunicação e Inteligência):
  ├── 7. E-mail de Confirmação Automático
  ├── 8. Busca por Disponibilidade
  └── 9. Notificações Push

Sprint 4 (Avançado):
  ├── 10. PWA
  ├── 11. Aprovação de Agendamentos
  └── 12. Heatmap de Ocupação
```
