# 🤝 Product Handoff — CICLO-2026-04-22-3

**Feature:** Histórico de Cancelamentos e Restauração
**Autor:** Antigravity (Product Strategist)
**Data:** 2026-04-22

---

## 🎯 Objetivo de Negócio
Criar a interface para visualização dos eventos cancelados (soft delete), tanto para o administrador global quanto para os editores individuais. Além disso, fornecer a funcionalidade de "Restaurar" para o administrador, permitindo reverter cancelamentos acidentais.

## 📋 Escopo Técnico (Backend / Frontend)
1. **Frontend UI**:
   - `index.html`: Nova aba `abaCancelamentos` exclusiva para admin. Novo toggle na `abaMeusEventos` para editores filtrarem "Ativos" vs "Cancelados".
   - `style.css`: Estilização das tabelas de cancelamento e botão de restauração.
2. **Backend / Data Fetching**:
   - `app.js`: Lógica para popular a `abaCancelamentos` (fetch `.eq('cancelado', true)`) e lógica do toggle na `abaMeusEventos`.
   - `js/reservas.js`: Função `restaurarEvento(id)` que faz o update `cancelado = false` no banco e atualiza as listas.

## ⚠️ Regras de Negócio e Casos Limite
- **Restauração sem Revalidação de Conflito**: Ao restaurar um evento, o sistema não fará revalidação complexa de choques de horário no momento do clique (definição de Quick Win aprovada). O usuário admin deve gerenciar conflitos resultantes no painel de conflitos.
- **Visualização Editor**: Editores só veem seus PRÓPRIOS eventos cancelados (RLS já garante isso se usado `criadopor`).

## 🔐 Critérios de Aceite
- [ ] Admin consegue ver a aba de Histórico de Cancelamentos populada.
- [ ] Admin consegue clicar em "Restaurar" e o evento volta à vida (cancelado = false).
- [ ] Editor consegue alternar entre Meus Eventos Ativos e Cancelados e vê os motivos.

## 🚀 Próximo Passo
O sistema está pronto para ser assumido pelo **Backend/Frontend Specialist** para iniciar a codificação conforme o `implementation_plan.md` e o `task.md`.
