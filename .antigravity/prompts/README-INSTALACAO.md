# 🚀 Antigravity v3.1 — Guia de Instalação

> Sistema de orquestração de IA para desenvolvimento de software profissional.
> Tudo é criado automaticamente pela IA — você não precisa criar pastas manualmente.

---

## 📥 Download dos Arquivos

| # | Arquivo Gerado | Nome Final | Tipo |
|---|---------------|------------|------|
| 1 | `orquestrador-v3.1.md` | `orquestrador.md` | Orquestrador |
| 2 | `context-v1.1.md` | `context.md` | Contexto (raiz) |
| 3 | `handoff-template-v2.0.md` | `handoff-template.md` | Template |
| 4 | `product-strategist-v3.2.md` | `product-specialist.md` | Especialista |
| 5 | `backend-specialist-v3.1.md` | `backend-specialist.md` | Especialista |
| 6 | `frontend-specialist-v3.1.md` | `frontend-specialist.md` | Especialista |
| 7 | `ui-review-specialist-v3.1.md` | `ui-review-specialist.md` | Especialista |
| 8 | `security-arch-specialist-v1.0.md` | `security-arch-specialist.md` | **NOVO** |
| 9 | `security-code-specialist-v1.0.md` | `security-code-specialist.md` | **NOVO** |
| 10 | `qa-specialist-v3.1.md` | `qa-specialist.md` | Especialista |
| 11 | `devops-specialist-v3.1.md` | `devops-specialist.md` | Especialista |
| 12 | `auditor-specialist-v3.1.md` | `auditor-specialist.md` | Especialista |

---

## 🏗️ Instalação (Automática)

Você NÃO precisa criar nada manualmente. Basta:

1. **Copie** o conteúdo de `orquestrador-v3.1.md`
2. **Cole** em uma IA com acesso a arquivos (Claude, ChatGPT, etc.)
3. **Diga**: `Execute o Gate 0. Meu projeto é [descrição].`

A IA cria TUDO sozinha:
- ✅ Pasta `.antigravity/` com subpastas
- ✅ `context.md`, `context.lock`, `spec-index.json`
- ✅ Copia especialistas para `prompts/`
- ✅ Inicia ciclo automático

---

## 🔄 Principais Mudanças v3.0 → v3.1

| Área | Mudança |
|------|---------|
| **Sequência** | Product é sempre primeiro; Security dividido em arch/code |
| **Persistência** | Handoffs salvos em `.antigravity/handoffs/` automaticamente |
| **Recuperação** | Modo 6 retoma ciclo após crash |
| **Retrabalho** | Modo 7 fecha loop quando auditor rejeita |
| **Token Optimizer** | Integrado no Gate 0 |
| **Estimativa** | Product entrega estimativa de esforço ao Orquestrador |
| **Métricas** | Context.md tem métricas de ciclo automáticas |

---

## 📊 Sequências Oficiais

```
Feature nova:
product → backend → security-arch → frontend → ui-review → security-code → qa → devops → auditor

Bug crítico:
security-code → backend → qa → devops → auditor

Redesign UI:
product → ui-review → frontend → qa → auditor
```
