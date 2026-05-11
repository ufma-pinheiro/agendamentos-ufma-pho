# Handoff: Fase 0 - Bugs Críticos (P0)

## 1. O que precisa ser feito (Escopo Frontend)
A Fase 0 do `docs/ROADMAP.md` exige a correção de 5 bugs críticos:
1. `canceladopor` nunca gravado em `js/reservas.js` -> `deletarEvento()`
2. Notificações falsas em `js/notifications.js` -> Implementar ou ocultar.
3. XSS em `js/components.js:55` -> Mudar `JSON.stringify` no `onclick` para `data-*` + event delegation.
4. `atualizarDashboard()` sem argumento em `app.js` -> Passar `estado`.
5. Tippy.js não utilizado em `index.html` -> Remover 4 tags de script/link.

## 2. Restrições e Contexto
- **Branch base:** `preview/security-fase1` (Assuma que estamos nela).
- **Risco:** Zero. Não quebrar nenhuma API ou estrutura atual.
- Mantenha todos os seletores JS e IDs do HTML intactos.

## 3. Findings
- [INFO] A correção 0.3 (XSS) é a mais crítica e deve usar event delegation no container dos cards.
- [INFO] O `canceladopor` precisa receber `estado.usuarioAtual.email`.

## 8. Próximo
**Próximo:** qa
- [ ] **ACK** — Li e compreendi o handoff.
