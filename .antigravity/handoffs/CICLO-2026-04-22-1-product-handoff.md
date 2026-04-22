# Handoff — Product Strategist
## Ciclo: CICLO-2026-04-22-1 | Feature: Cancelamento com Motivo

---

## 1. Resumo
PRD definido para a feature "Cancelamento com Motivo". Feature de Quick Win de médio escopo que adiciona campo de motivo obrigatório ao fluxo de cancelamento de agendamentos.

## 2. Decisões Tomadas
- Campo `motivo_cancelamento` é obrigatório (mínimo 10 chars, máximo 200)
- Campos adicionais: `canceladopor` (email) e `datacancelamento` (timestamptz)
- Motivo não é exibido no calendário — apenas persistido para audit trail
- Botão de confirmação desabilitado até texto válido

## 3. Findings

| ID | Severidade | Descrição | Quem deve resolver |
|----|-----------|-----------|-------------------|
| F-01 | Médio | Schema de banco precisa de migração (3 novas colunas) | Backend |
| F-02 | Baixo | Campo `motivo_cancelamento` pode gerar coluna NULL em registros antigos — aceitar NULLs | Backend |

## 4. Restrições
- ZERO regressão no fluxo de exclusão atual
- Usar design system nativo (sem SweetAlert2)
- Fuso horário -03:00 em `datacancelamento`

## 5. Schema Necessário
```sql
ALTER TABLE reservas
  ADD COLUMN motivo_cancelamento TEXT,
  ADD COLUMN canceladopor TEXT,
  ADD COLUMN datacancelamento TIMESTAMPTZ;
```

## 6. Critérios de Aceite
- [ ] Campo obrigatório (min 10 chars)
- [ ] Botão desabilitado até texto válido
- [ ] Motivo salvo antes da deleção
- [ ] Design consistente

## 7. Diffs no context.md
- Adicionar feature "Cancelamento com Motivo" ao histórico de decisões
- Atualizar schema da tabela `reservas` na seção de artefatos

## 8. Próximo Especialista
**backend** — Implementar migração do schema e atualizar `db.js` + `reservas.js` com a lógica de persistência.

---
✅ ACK — Handoff válido. Próximo: backend.
