# 📋 Backlog — Melhorias para Usuário (Editor/Leitor)
> Levantamento realizado em: 2026-04-22
> Gerado por: Antigravity (Product Strategist)

---

## 🚀 Alto Impacto — Alta Prioridade

### 1. 📱 PWA (Progressive Web App)
Transformar o sistema em um PWA para que professores e técnicos possam "instalar" no celular, receber notificações push e usar offline para consultar a agenda.
- **Por quê:** A maioria dos usuários acessa pelo celular. Um ícone na home screen aumenta a adoção drasticamente.
- **Esforço:** Médio (manifest.json + service worker básico)

### 2. 🔔 Notificações Push de Conflito em Tempo Real
Quando um novo agendamento é criado que conflita com um existente, notificar o responsável do evento original via pop-up/push.
- **Por quê:** Atualmente o sistema detecta conflitos mas não avisa o criador do evento original.
- **Esforço:** Médio (Supabase Realtime + sistema de notificação já existente)

### 3. 📅 Agendamentos Recorrentes
Permitir criar um evento que se repete automaticamente (semanal, quinzenal, mensal).
- **Por quê:** A maioria das reservas de salas em universidades são de aulas — sempre no mesmo horário.
- **Esforço:** Médio (expansão do `groupId` + lógica de recorrência)

### 4. 🔗 Link Público de Visualização
Gerar uma URL pública (sem login) que mostre a agenda de um espaço específico.
- **Por quê:** Remove a necessidade de criar conta só para ver se uma sala está disponível.
- **Esforço:** Baixo (página estática com RLS de somente leitura)

---

## 📈 Médio Impacto — Valor Agregado

### 5. 📊 Heatmap de Ocupação por Espaço
Visualização em mapa de calor mostrando quais salas são mais usadas, em quais horários.
- **Por quê:** Dashboard atual tem gráficos genéricos. Heatmap é muito mais útil para decisões.
- **Esforço:** Médio (Chart.js heatmap)

### 6. ✉️ E-mail de Confirmação Automático
Após confirmar um agendamento, enviar e-mail com detalhes da reserva para o responsável.
- **Por quê:** Substitui a necessidade de "anotar" o agendamento. Já há coluna `contatoemail` no banco.
- **Esforço:** Médio (Supabase Edge Functions + Resend ou SMTP)

### 7. 🗑️ Cancelamento com Motivo
Ao excluir, solicitar motivo que fica registrado e notifica o criador do evento.
- **Por quê:** Não há rastro do motivo do cancelamento, gerando confusão administrativa.
- **Esforço:** Baixo (campo adicional no modal de exclusão já criado)

### 8. 📋 Aprovação de Agendamentos
Para espaços premium (auditórios), agendamento fica "Pendente" até o admin aprovar.
- **Por quê:** Auditórios têm custo de logística. Aprovação evita uso indevido.
- **Esforço:** Alto (campo `status` no banco + workflow de aprovação)

---

## 🔧 Melhorias de UX

### 9. 🎨 Personalização de Cor por Evento
Permitir que o criador escolha a cor do evento no calendário.
- **Esforço:** Baixo (color picker no formulário)

### 10. 📱 View de Dia/Semana Estilizada
Grade de horários (tipo Google Calendar) estilizada com o design system atual.
- **Esforço:** Baixo (CSS + configuração do FullCalendar)

### 11. 🔍 Busca por Disponibilidade
Usuário informa o horário desejado e o sistema lista quais salas estão disponíveis.
- **Por quê:** Elimina a busca manual sala por sala.
- **Esforço:** Médio (lógica de filtro inverso)

---

## 📊 Quadro de Priorização

| Feature | Impacto | Esforço | Recomendação |
|---|---|---|---|
| Agendamentos Recorrentes | 🔥 Alto | ⚙️ Médio | **Iniciar primeiro** |
| Link Público de Visualização | 🔥 Alto | 🟢 Baixo | **Iniciar primeiro** |
| E-mail de Confirmação | 🔥 Alto | ⚙️ Médio | Segunda prioridade |
| Busca por Disponibilidade | 📈 Médio | ⚙️ Médio | Segunda prioridade |
| PWA | 🔥 Alto | ⚙️ Médio | Segunda prioridade |
| Cancelamento com Motivo | 📈 Médio | 🟢 Baixo | Quick win |
| Aprovação de Agendamentos | 📈 Médio | 🔴 Alto | Planejar bem antes |
