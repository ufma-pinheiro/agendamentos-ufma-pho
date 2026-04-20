# Contexto do Projeto - Agenda UFMA

## Visão Geral
Sistema de gestão de espaços acadêmicos da UFMA. Baseado em Supabase (Auth + DB) e Vanilla JS com FullCalendar.

## Estado Atual
- **Branch:** `development`
- **Ponto de Estabilidade:** Commit `29d1bb8` (Rollback REFACTOR-001).
- **Interface:** Layout clássico estável (Sidebar colapsável, TopBar consolidada).
- **Log:** Modernização estética descontinuada em 20/04/2026 para priorizar estabilidade funcional.

## Histórico de Decisões Críticas
| Data | Responsável | Tópico | Descrição | Impacto |
| :--- | :--- | :--- | :--- | :--- |
| 2026-04-19 | Orchestrator | Supabase Migration | Migração de Firebase para Supabase (Auth/DB) | Alto |
| 2026-04-19 | Tech Lead | REFACTOR-001 | Consolidação da lógica monolítica estável | Alto |
| 2026-04-20 | Tech Lead | AESTHETIC-001 | [ABORTADO] Tentativa de modernização estética (Glassmorphism) | Crítico |
| 2026-04-20 | Tech Lead | Rollback Total | Retorno ao commit `29d1bb8` por instabilidade na modernização | Crítico |

## Regras de Negócio Inegociáveis
1. Acesso restrito a e-mails cadastrados na tabela `usuarios`.
2. Fallback de admin para `tipinheiro@ufma.br`.
3. Não deve haver manipulação direta de tokens; usar o cliente Supabase oficial.
