# Design — Refatoração dos Monólitos (JS + CSS)

> Data: 2026-05-21
> Branch: `preview/security-fase1`
> Stack: Vanilla JS (ES Modules), CSS, sem build step (`npx serve`)

## 1. Objetivo

Quebrar os arquivos monolíticos do projeto em módulos coesos com **alvo de ~300 linhas cada (máximo 350)**, melhorando a manutenibilidade futura **sem alterar comportamento** do sistema.

## 2. Escopo

### Dentro do escopo

- **JS:** `app.js` (1038 linhas), `js/reservas.js` (813), `js/utils.js` (500).
- **CSS:** `style.css` (4715 linhas).
- **HTML:** `index.html` recebe apenas a troca de `<link>` do CSS. Sem split estrutural.

### Fora do escopo

- `css/tokens.css` — scaffold shadcn-style (OKLCH), não importado em lugar nenhum, sobra da Fase 1 planejada. Não será tocado.
- Consolidação das seções "CORREÇÃO" do CSS (abordagem B) — fica como follow-up futuro.
- CSS morto do Tippy.js (`style.css` linhas ~4697-4715) — Tippy foi removido na Fase 0. Mantido por ora (preservação de comportamento); cleanup opcional separado.
- `index.html` (880 linhas) e `login.html`/`login.js` — não entram no refactor.

## 3. Abordagem escolhida — A: Fatias contíguas

Cada arquivo novo é um pedaço **contíguo** do original. Nenhuma mudança de lógica, nenhum seletor/ID renomeado, nenhuma reordenação de código.

- **CSS:** `<link>` no `index.html` na mesma ordem das fatias = cascata final byte-idêntica.
- **JS:** corte por fronteira de função; `utils.js` e `reservas.js` viram arquivos *barrel* (somente re-exports), preservando os caminhos de import dos consumidores.

Abordagens descartadas:
- **B (split + consolidação dos "CORREÇÃO"):** mover blocos de override altera ordem de cascata = risco de regressão visual.
- **C (split + migração design system shadcn):** scope creep, alto risco.

## 4. Estrutura JS

### 4.1 `app.js` (1038 → ~200 linhas, entry HTML / orquestrador)

`app.js` continua sendo o entry-point (`<script type="module" src="app.js">`). Mantém: imports, `estado` global, bootstrap/wiring. Extrai para novos módulos:

| Novo módulo | Conteúdo | ~linhas |
|-------------|----------|---------|
| `js/handlers.js` | `switchTab`, `abrirDetalhes`, `filtrarPorEspaco`, `deletarUsuario` (handlers `window.*`) | 185 |
| `js/theme.js` | `initTheme`, `toggleTheme`, `updateThemeIcon` | 62 |
| `js/ui.js` | `initUI`, `construirInterfaceDinamica`, `mudarAno`, `atualizarSelecaoMes`, `aplicarBusca` | ~310 |
| `js/telas.js` | `atualizarTodasTelas` + `renderizarCards` + 6 funções `atualizar*`/`renderizar*` | ~190 |
| `js/admin.js` | `adicionarUsuarioViaAdmin`, `carregarListaUsuariosAdmin` | 62 |
| `js/export.js` | `obterDadosParaExportacao`, `exportarExcel`, `exportarPDF` | 43 |
| `js/backup.js` | `fazerBackupJSON`, `restaurarBackupJSON` | 134 |

### 4.2 `js/reservas.js` (813 → barrel ~12 linhas)

`js/reservas.js` vira barrel re-exportando a API pública atual (`salvarOuEditarEvento`, `deletarEvento`, `restaurarEvento`, `initReservasWindow`, `fecharModal`, `fecharModalForm`, `abrirModalFormulario`, `prepararEdicao`, `adicionarLinhaData`).

| Novo módulo | Conteúdo |
|-------------|----------|
| `js/reservas/datas.js` | `pad2`, `formatDateYmd`, `parseYmdToUtcDate`, `gerarUuid`, `montarSessao` |
| `js/reservas/recorrencia.js` | `coletarSessoesDoFormulario`, `validarHorarios`, `obterConfigRecorrencia`, `atualizarUIRecorrencia`, `resetRecorrenciaFormulario`, `gerarSessoesRecorrentes`, `bindRecorrenciaListeners` |
| `js/reservas/deteccao-conflitos.js` | `carregarSeriePorEscopo`, `carregarEventosConflito`, `detectarConflitos` |
| `js/reservas/crud.js` | `salvarOuEditarEvento`, `deletarEvento`, `restaurarEvento` |
| `js/reservas/modais.js` | `abrirModalFormulario`, `fecharModalForm`, `fecharModal`, `prepararEdicao`, `adicionarLinhaData`, `initReservasWindow` |

Nota: `js/reservas/deteccao-conflitos.js` é a detecção interna de conflitos do fluxo de reserva — distinta de `js/conflitos.js` (painel de conflitos global, FEAT-002).

### 4.3 `js/utils.js` (500 → barrel ~10 linhas)

`js/utils.js` vira barrel re-exportando todas as funções atuais.

| Novo módulo | Conteúdo |
|-------------|----------|
| `js/utils/helpers.js` | `showToast`, `setButtonLoading`, `hideLoading`, `debounce`, `stringToColor`, `adjustColor`, `escapeHtml` |
| `js/utils/modais-feedback.js` | `showSuccessModal`, `showConflictModal` |
| `js/utils/modais-prompt.js` | `showConfirmModal`, `showSeriesActionModal`, `showCancelMotivModal` |

## 5. Estrutura CSS

`style.css` (4715 linhas) → pasta `css/`, ~17 arquivos. Múltiplas tags `<link>` no `index.html` na ordem original (cascata preservada). `style.css` é deletado ao final.

| Arquivo | Faixa original aprox. | ~linhas |
|---------|----------------------|---------|
| `css/variaveis-tema.css` | 1-308 | 308 |
| `css/base.css` | 309-445 | 136 |
| `css/layout.css` | 446-783 | 337 |
| `css/topbar.css` | 784-1137 | 353 |
| `css/conteudo-cards.css` | 1138-1234 | 96 |
| `css/paginas.css` | 1235-~1524 | ~290 |
| `css/listas-eventos.css` | ~1525-1986 | ~460 → sub-split em 2 |
| `css/calendario.css` | 1987-2150 | 163 |
| `css/modais.css` | 2151-~2520 | ~370 → sub-split em 2 |
| `css/modais-info.css` | ~2520-2896 | ~376 → sub-split em 2 |
| `css/login.css` | 2897-3306 | 409 → sub-split em 2 |
| `css/utilitarios-responsivo.css` | 3307-3423 | 116 |
| `css/overrides.css` | 3424-4579 | ~1155 → sub-split em ~4 |
| `css/conflitos.css` | 4580-4715 | 135 |

Faixas acima de 350 linhas são sub-divididas em pontos de comentário de seção existentes. Os cortes exatos de linha são definidos no plano de implementação (writing-plans).

## 6. Plano de execução — 4 fases

Cada fase = 1 commit isolado, validado antes do próximo.

| Fase | Conteúdo | Risco |
|------|----------|-------|
| 1 | Split CSS: extrair ~17 arquivos em `css/`, adicionar `<link>` em `index.html`, deletar `style.css` | Baixo |
| 2 | `js/utils.js` → barrel + `js/utils/*` | Baixo |
| 3 | `js/reservas.js` → barrel + `js/reservas/*` | Médio |
| 4 | `app.js` → orquestrador + 7 novos módulos | Médio-alto |

Ordem: CSS primeiro (mecânico, verificável visualmente). JS barrel (fases 2-3) antes de `app.js` (fase 4) — caminho de import inalterado isola erros.

## 7. Estratégia de validação

O projeto não tem suíte de testes, lint ou build configurados. Validação:

- **Baseline (antes de iniciar):** capturar screenshots das telas-chave no estado atual — calendário, dashboard, modais (detalhe de evento, formulário, conflito, cancelamento), login.
- **JS:** rodar `npx serve` local; console do navegador deve ficar limpo (import quebrado em ES Module gera erro visível).
- **CSS:** diff visual contra a baseline.
- **Smoke test golden path:** login → calendário → criar evento → editar evento → deletar evento → dashboard → exportar Excel → exportar PDF → backup JSON.
- **Pós-fase:** push para `preview/security-fase1` → conferir Vercel preview.

## 8. Garantias anti-regressão

- *Barrel* mantém os caminhos de import dos consumidores → fases 2-3 não tocam importadores.
- Fatias CSS contíguas + `<link>` na ordem original → cascata final idêntica.
- Sem mudança de lógica, sem renomear seletores ou IDs.
- Cada fase commitada isolada → rollback simples se houver regressão.

## 9. Critério de "Pronto"

- Nenhum arquivo JS/CSS novo acima de 350 linhas.
- `style.css` removido; `app.js` reduzido a orquestrador (~200 linhas).
- Smoke test golden path passa sem erro de console.
- Diff visual sem regressão contra a baseline.
