# ARCH-001 — Modularização do app.js em ES Modules

**Status:** Em Andamento  
**Criado em:** 2026-04-20  
**Última atualização:** 2026-04-21  
**Especialista responsável:** Frontend  
**Gate obrigatório:** Auditor antes de cada push

---

## Objetivo

Quebrar o `app.js` monolítico (~1492 linhas atualmente) em módulos ES coesos, reduzindo acoplamento e aumentando a manutenibilidade — sem nenhuma regressão funcional.

---

## Critério de Conclusão

- `app.js` com menos de 300 linhas (apenas orquestração)
- Todos os módulos extraídos importados corretamente via `import`
- Nenhuma função global exposta no `window` desnecessariamente
- Auditor emitiu veredicto APROVADO para cada step

---

## Steps

| Step | Módulo | Funções a extrair | Status |
|------|--------|-------------------|--------|
| Step 1 | `js/utils.js` | showToast, escapeHtml, adjustColor, formatarData, etc. | ✅ Concluído (Auditado) |
| Step 1 | `js/db.js` | dbParaFrontend, frontendParaDb | ✅ Concluído (Auditado) |
| Step 2 | `js/auth.js` | initAuth, mostrarAcessoNegado, verificarRole | ✅ Concluído (Auditado) |
| Step 3 | `js/calendar.js` | initCalendar, renderizarEventos, abrirModal | 🔄 Pendente |
| Step 4 | `js/dashboard.js` | initDashboard, renderizarGraficos, exportarPDF/Excel | ⏳ Planejado |
| Step 5 | `js/reservas.js` | criarReserva, editarReserva, deletarReserva, detectarConflito | ⏳ Planejado |

---

## Restrições

- ZERO regressão funcional — cada step deve ser testado antes do push
- Auditor Independente deve validar ANTES de qualquer push
- Não usar bundler (projeto é Vanilla JS com CDN) — usar `type="module"` no HTML
- Manter compatibilidade com a CSP ativa

---

## Handoff Recebido (Step 1 — Auditor)

- **Veredicto:** APROVADO
- `js/utils.js` e `js/db.js` criados e validados
- `app.js` reduzido de ~1630 para ~1492 linhas
- Nenhuma regressão detectada
- Próximo: Step 2 — `js/auth.js`
