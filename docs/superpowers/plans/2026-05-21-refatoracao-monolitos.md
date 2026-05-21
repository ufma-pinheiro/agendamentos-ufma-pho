# Refatoração dos Monólitos (JS + CSS) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quebrar `app.js`, `js/reservas.js`, `js/utils.js` e `style.css` em módulos de ~300 linhas (máx 350) sem alterar comportamento.

**Architecture:** Abordagem de fatias contíguas. CSS: 21 arquivos extraídos verbatim, carregados por `<link>` na ordem original (cascata idêntica). JS: `utils.js` e `reservas.js` viram barrels (re-export), preservando caminhos de import; `app.js` vira orquestrador + 7 módulos + `estado` movido para módulo próprio.

**Tech Stack:** Vanilla JS (ES Modules), CSS, sem build (`npx serve`). Spec: `docs/superpowers/specs/2026-05-21-refatoracao-monolitos-design.md`.

**Branch:** `preview/security-fase1`.

---

## Mapa de símbolos (referência para imports JS)

Ao mover funções, qualquer símbolo referenciado mas não definido no novo módulo precisa de `import`. Erro de import em ES Module = `ReferenceError: X is not defined` no console, nomeando o símbolo. Tabela: símbolo → módulo de origem.

| Símbolo | Módulo |
|---------|--------|
| `supabase` | `./supabaseClient.js` (de dentro de `js/`: `../supabaseClient.js`) |
| `showToast`, `setButtonLoading`, `hideLoading`, `debounce`, `stringToColor`, `adjustColor`, `escapeHtml` | `./js/utils.js` |
| `showSuccessModal`, `showConflictModal`, `showConfirmModal`, `showSeriesActionModal`, `showCancelMotivModal` | `./js/utils.js` |
| `dbParaFrontend`, `frontendParaDb` | `./js/db.js` |
| `initAuth`, `aplicarPermissoes`, `setupAuthListener` | `./js/auth.js` |
| `iniciarSistema`, `getCalendar`, `getCorPorEspaco`, `getClasseBadge`, `buscarDadosMensais`, `recarregarDados` | `./js/calendar.js` |
| `mesesAbrev`, `feriadosFixos` | `./js/constants.js` |
| `atualizarPainelNotificacoes` | `./js/notifications.js` |
| `atualizarDashboard` | `./js/dashboard.js` |
| `atualizarPainelConflitos` | `./js/conflitos.js` |
| `salvarOuEditarEvento`, `deletarEvento`, `initReservasWindow`, `fecharModal`, `fecharModalForm`, `abrirModalFormulario`, `prepararEdicao`, `adicionarLinhaData` | `./js/reservas.js` |
| `gerarCardEventoHtml` | `./js/components.js` |
| `estado` | `./js/estado.js` (criado na Fase 4) |
| `initTheme`, `toggleTheme`, `updateThemeIcon` | `./js/theme.js` |
| `initUI`, `construirInterfaceDinamica`, `mudarAno`, `atualizarSelecaoMes`, `aplicarBusca` | `./js/ui.js` |
| `atualizarTodasTelas`, `renderizarCards`, `atualizarUltimosEventos`, `atualizarMeusEventos`, `atualizarCancelamentos`, `renderizarCardsCancelados`, `atualizarResumoMes` | `./js/telas.js` |
| `adicionarUsuarioViaAdmin`, `carregarListaUsuariosAdmin` | `./js/admin.js` |
| `obterDadosParaExportacao`, `exportarExcel`, `exportarPDF` | `./js/export.js` |
| `fazerBackupJSON`, `restaurarBackupJSON` | `./js/backup.js` |

Caminhos relativos: de um módulo dentro de `js/`, use `./outro.js`; de dentro de `js/utils/` ou `js/reservas/` use `../outro.js`. De `app.js` (raiz) use `./js/modulo.js`.

---

## FASE 1 — Split CSS

### Task 1.1: Extrair os 21 arquivos CSS

**Files:**
- Create: `css/variaveis-tema.css` ... `css/conflitos.css` (21 arquivos, ver tabela)
- Source: `style.css` (4715 linhas, não modificar ainda)

Cada arquivo é uma fatia **contígua e verbatim** de `style.css`. Não editar conteúdo, não reformatar.

| # | Arquivo | Linhas origem |
|---|---------|---------------|
| 1 | `css/variaveis-tema.css` | 1-307 |
| 2 | `css/base.css` | 308-444 |
| 3 | `css/layout.css` | 445-783 |
| 4 | `css/topbar.css` | 784-1136 |
| 5 | `css/conteudo-cards.css` | 1137-1233 |
| 6 | `css/paginas.css` | 1234-1524 |
| 7 | `css/listas-eventos.css` | 1525-1759 |
| 8 | `css/listas-eventos-extra.css` | 1760-1985 |
| 9 | `css/calendario.css` | 1986-2149 |
| 10 | `css/modais.css` | 2150-2410 |
| 11 | `css/modais-form.css` | 2411-2705 |
| 12 | `css/modais-form-extra.css` | 2706-2895 |
| 13 | `css/login.css` | 2896-3100 |
| 14 | `css/login-extra.css` | 3101-3305 |
| 15 | `css/utilitarios-responsivo.css` | 3306-3422 |
| 16 | `css/overrides-1.css` | 3423-3624 |
| 17 | `css/overrides-2.css` | 3625-3849 |
| 18 | `css/modais-informativos.css` | 3850-4182 |
| 19 | `css/modal-cancelamento.css` | 4183-4296 |
| 20 | `css/cancelamentos-historico.css` | 4297-4578 |
| 21 | `css/conflitos.css` | 4579-4715 |

Nota arquivos 13/14 (`login.css`/`login-extra.css`): a seção LOGIN PAGE (2896-3305) não tem comentário interno. O corte 2896-3100 / 3101-3305 é arbitrário — qualquer ponto preserva cascata pois os dois carregam consecutivos. A soma das duas fatias deve continuar cobrindo 2896-3305 sem lacuna nem sobreposição.

- [ ] **Step 1: Criar `css/` e extrair os 21 arquivos**

Para cada linha da tabela: `Read` o intervalo de `style.css` e `Write` no arquivo destino. Conteúdo verbatim, sem alteração.

- [ ] **Step 2: Verificar que a concatenação reproduz `style.css` byte a byte**

Run:
```bash
cd "c:/Users/Admin/OneDrive/Documentos/SISTEMAS IA/agendamentos-ufma-pho"
cat css/variaveis-tema.css css/base.css css/layout.css css/topbar.css \
    css/conteudo-cards.css css/paginas.css css/listas-eventos.css \
    css/listas-eventos-extra.css css/calendario.css css/modais.css \
    css/modais-form.css css/modais-form-extra.css css/login.css \
    css/login-extra.css css/utilitarios-responsivo.css css/overrides-1.css \
    css/overrides-2.css css/modais-informativos.css css/modal-cancelamento.css \
    css/cancelamentos-historico.css css/conflitos.css > /tmp/css-merged.css
diff style.css /tmp/css-merged.css && echo "IDENTICO"
```
Expected: `IDENTICO`, sem saída de diff. Se houver diff, o corte de linha está errado — corrigir antes de prosseguir. Esta verificação garante cascata idêntica.

- [ ] **Step 3: Verificar limite de linhas**

Run:
```bash
wc -l css/*.css | sort -rn | head -5
```
Expected: nenhum arquivo (exceto a linha `total`) acima de 350 linhas. `css/tokens.css` pré-existente (94 linhas) pode aparecer — ignorar, está fora de escopo.

### Task 1.2: Trocar os `<link>` no `index.html`

**Files:**
- Modify: `index.html:36`

- [ ] **Step 1: Substituir a tag única por 21 tags na ordem da tabela**

Substituir a linha 36 (`<link rel="stylesheet" href="style.css">`) por:
```html
    <link rel="stylesheet" href="css/variaveis-tema.css">
    <link rel="stylesheet" href="css/base.css">
    <link rel="stylesheet" href="css/layout.css">
    <link rel="stylesheet" href="css/topbar.css">
    <link rel="stylesheet" href="css/conteudo-cards.css">
    <link rel="stylesheet" href="css/paginas.css">
    <link rel="stylesheet" href="css/listas-eventos.css">
    <link rel="stylesheet" href="css/listas-eventos-extra.css">
    <link rel="stylesheet" href="css/calendario.css">
    <link rel="stylesheet" href="css/modais.css">
    <link rel="stylesheet" href="css/modais-form.css">
    <link rel="stylesheet" href="css/modais-form-extra.css">
    <link rel="stylesheet" href="css/login.css">
    <link rel="stylesheet" href="css/login-extra.css">
    <link rel="stylesheet" href="css/utilitarios-responsivo.css">
    <link rel="stylesheet" href="css/overrides-1.css">
    <link rel="stylesheet" href="css/overrides-2.css">
    <link rel="stylesheet" href="css/modais-informativos.css">
    <link rel="stylesheet" href="css/modal-cancelamento.css">
    <link rel="stylesheet" href="css/cancelamentos-historico.css">
    <link rel="stylesheet" href="css/conflitos.css">
```

A ordem é obrigatória — define a cascata.

### Task 1.3: Deletar `style.css` e validar

**Files:**
- Delete: `style.css`

- [ ] **Step 1: Capturar baseline visual (ANTES de deletar)**

Antes de qualquer mudança desta fase ter efeito visual, abrir o sistema no estado atual e tirar screenshots de: calendário, dashboard, modal de detalhe de evento, modal de formulário, modal de conflito, modal de cancelamento, página de login. Guardar para comparação. (Se a baseline já foi capturada antes da Task 1.1, reutilizar.)

- [ ] **Step 2: Deletar `style.css`**

```bash
git rm style.css
```

- [ ] **Step 3: Rodar local e validar visualmente**

```bash
npx serve
```
Abrir no navegador. Verificar: console sem erro 404 de CSS; layout idêntico à baseline em todas as telas listadas no Step 1. Testar tema claro e escuro.
Expected: zero regressão visual; nenhum 404.

- [ ] **Step 4: Commit**

```bash
git add css/ index.html
git commit -m "refactor(css): divide style.css em 21 modulos por componente"
```

---

## FASE 2 — `js/utils.js` → barrel

### Task 2.1: Extrair `js/utils/helpers.js`

**Files:**
- Create: `js/utils/helpers.js`
- Source: `js/utils.js:11-107`

- [ ] **Step 1: Criar `js/utils/helpers.js`**

Mover verbatim as funções `showToast` (11-34), `setButtonLoading` (35-45), `hideLoading` (46-57), `debounce` (58-70), `stringToColor` (71-79), `adjustColor` (80-89), `escapeHtml` (90-107) — linhas 11-107 de `js/utils.js`. Manter os `export` existentes. Adicionar no topo o comentário `// js/utils/helpers.js - utilitarios de UI puros`. Estas funções não têm dependências externas; se alguma referenciar símbolo não definido, importar pela tabela de símbolos.

### Task 2.2: Extrair `js/utils/modais-feedback.js`

**Files:**
- Create: `js/utils/modais-feedback.js`
- Source: `js/utils.js:108-318`

- [ ] **Step 1: Criar `js/utils/modais-feedback.js`**

Mover verbatim `showSuccessModal` (108-198) e `showConflictModal` (199-318). Manter `export`. Se referenciarem `showToast`/`escapeHtml`/etc., adicionar `import { ... } from './helpers.js';` no topo.

### Task 2.3: Extrair `js/utils/modais-prompt.js`

**Files:**
- Create: `js/utils/modais-prompt.js`
- Source: `js/utils.js:319-500`

- [ ] **Step 1: Criar `js/utils/modais-prompt.js`**

Mover verbatim `showConfirmModal` (319-362), `showSeriesActionModal` (363-419), `showCancelMotivModal` (420-500). Manter `export`. Importar de `./helpers.js` o que for referenciado.

### Task 2.4: Converter `js/utils.js` em barrel

**Files:**
- Modify: `js/utils.js` (rewrite completo)

- [ ] **Step 1: Reescrever `js/utils.js` como barrel**

Conteúdo completo do novo `js/utils.js`:
```javascript
/**
 * js/utils.js — barrel
 * Re-exporta os utilitarios. Caminhos de import dos consumidores preservados.
 */
export { showToast, setButtonLoading, hideLoading, debounce, stringToColor, adjustColor, escapeHtml } from './utils/helpers.js';
export { showSuccessModal, showConflictModal } from './utils/modais-feedback.js';
export { showConfirmModal, showSeriesActionModal, showCancelMotivModal } from './utils/modais-prompt.js';
```

- [ ] **Step 2: Validar**

```bash
npx serve
```
Abrir no navegador, console limpo (sem `ReferenceError` / sem erro de import). Smoke rápido: abrir um modal de detalhe e o de formulário (exercita `showToast` e os modais).
Expected: zero erro de console.

- [ ] **Step 3: Commit**

```bash
git add js/utils.js js/utils/
git commit -m "refactor(js): divide utils.js em modulos via barrel"
```

---

## FASE 3 — `js/reservas.js` → barrel

`js/reservas.js` cabeçalho atual (linhas 1-17): imports + constante `MAX_OCORRENCIAS_RECORRENCIA` (14) + estado de módulo `_salvando` (16) e `eventoSelecionadoNoModal` (17). Esse estado de módulo precisa ser compartilhado entre os novos arquivos.

### Task 3.1: Criar `js/reservas/estado-modulo.js`

**Files:**
- Create: `js/reservas/estado-modulo.js`

- [ ] **Step 1: Criar o módulo de estado compartilhado**

Conteúdo completo:
```javascript
// js/reservas/estado-modulo.js - estado compartilhado do fluxo de reservas
export const MAX_OCORRENCIAS_RECORRENCIA = 120;

let _salvando = false;
export function getSalvando() { return _salvando; }
export function setSalvando(v) { _salvando = v; }

let _eventoSelecionado = null;
export function getEventoSelecionado() { return _eventoSelecionado; }
export function setEventoSelecionado(v) { _eventoSelecionado = v; }
```

Nota: ao mover o código das tasks seguintes, substituir referências diretas a `_salvando` por `getSalvando()`/`setSalvando(...)` e a `eventoSelecionadoNoModal` por `getEventoSelecionado()`/`setEventoSelecionado(...)`. `MAX_OCORRENCIAS_RECORRENCIA` é importado.

### Task 3.2: Extrair `js/reservas/datas.js`

**Files:**
- Create: `js/reservas/datas.js`
- Source: `js/reservas.js:19-43`

- [ ] **Step 1: Criar `js/reservas/datas.js`**

Mover verbatim `pad2` (19-22), `formatDateYmd` (23-26), `parseYmdToUtcDate` (27-31), `gerarUuid` (32-36), `montarSessao` (37-43). Adicionar `export` em cada função (eram internas). Sem dependências externas.

### Task 3.3: Extrair `js/reservas/recorrencia.js`

**Files:**
- Create: `js/reservas/recorrencia.js`
- Source: `js/reservas.js:44-200` e `771-789`

- [ ] **Step 1: Criar `js/reservas/recorrencia.js`**

Mover verbatim: `coletarSessoesDoFormulario` (44-58), `validarHorarios` (59-67), `obterConfigRecorrencia` (68-76), `atualizarUIRecorrencia` (77-121), `resetRecorrenciaFormulario` (122-137), `gerarSessoesRecorrentes` (138-200), `bindRecorrenciaListeners` (771-789). Adicionar `export` em cada. Importar de `./datas.js` o que referenciarem (`montarSessao` etc.) e `MAX_OCORRENCIAS_RECORRENCIA` de `./estado-modulo.js`.

### Task 3.4: Extrair `js/reservas/deteccao-conflitos.js`

**Files:**
- Create: `js/reservas/deteccao-conflitos.js`
- Source: `js/reservas.js:201-288`

- [ ] **Step 1: Criar `js/reservas/deteccao-conflitos.js`**

Mover verbatim `carregarSeriePorEscopo` (201-217), `carregarEventosConflito` (218-258), `detectarConflitos` (259-288). Adicionar `export`. Importar `supabase` de `../supabaseClient.js` e o que mais referenciarem (ver tabela de símbolos).

### Task 3.5: Extrair `js/reservas/crud.js`

**Files:**
- Create: `js/reservas/crud.js`
- Source: `js/reservas.js:289-627`

- [ ] **Step 1: Criar `js/reservas/crud.js`**

Mover verbatim `salvarOuEditarEvento` (289-523), `deletarEvento` (524-596), `restaurarEvento` (597-627) — mantêm `export` (já o têm). Importar: `supabase` de `../supabaseClient.js`; `frontendParaDb` de `../db.js`; `getCorPorEspaco`, `recarregarDados` de `../calendar.js`; `showToast`, `showSuccessModal`, `showConflictModal`, `showConfirmModal`, `showCancelMotivModal`, `showSeriesActionModal` de `../utils.js`; funções de `./datas.js`, `./recorrencia.js`, `./deteccao-conflitos.js` conforme referência; estado de `./estado-modulo.js`.

### Task 3.6: Extrair `js/reservas/modais.js`

**Files:**
- Create: `js/reservas/modais.js`
- Source: `js/reservas.js:628-770` e `790-813`

- [ ] **Step 1: Criar `js/reservas/modais.js`**

Mover verbatim `abrirModalFormulario` (628-652), `fecharModalForm` (653-660), `fecharModal` (661-668), `prepararEdicao` (669-723), `adicionarLinhaData` (724-770), `initReservasWindow` (790-813) — mantêm `export`. Importar o que referenciarem (datas, recorrência, crud, estado-modulo, utils).

### Task 3.7: Converter `js/reservas.js` em barrel

**Files:**
- Modify: `js/reservas.js` (rewrite completo)

- [ ] **Step 1: Reescrever `js/reservas.js` como barrel**

Conteúdo completo do novo `js/reservas.js`:
```javascript
// js/reservas.js — barrel. API publica do fluxo de reservas.
export { salvarOuEditarEvento, deletarEvento, restaurarEvento } from './reservas/crud.js';
export { abrirModalFormulario, fecharModalForm, fecharModal, prepararEdicao, adicionarLinhaData, initReservasWindow } from './reservas/modais.js';
```

- [ ] **Step 2: Validar**

```bash
npx serve
```
Console limpo. Smoke test do fluxo de reservas: criar evento, criar evento recorrente, editar evento, deletar evento, disparar conflito (criar evento sobreposto), cancelar com motivo.
Expected: zero erro de console; fluxo funciona igual ao baseline.

- [ ] **Step 3: Commit**

```bash
git add js/reservas.js js/reservas/
git commit -m "refactor(js): divide reservas.js em modulos via barrel"
```

---

## FASE 4 — `app.js` → orquestrador + módulos

`app.js` atual (1038 linhas): imports (1-11), `estado` (13-23), `eventoSelecionadoNoModal`/`authVerificado`/bindings (24-31), handlers `window.*` (36-225), funções tema (235-273), bootstrap (275-296), demais funções (298-1038).

`estado` é referenciado por quase todos os módulos extraídos. Para evitar dependência circular (`app.js` importa módulo que importa `app.js`), `estado` vai para `js/estado.js`.

### Task 4.1: Criar `js/estado.js`

**Files:**
- Create: `js/estado.js`
- Source: `app.js:13-23`

- [ ] **Step 1: Criar `js/estado.js`**

Conteúdo completo:
```javascript
// js/estado.js - estado global da aplicacao
export const estado = {
    anoFiltro: new Date().getFullYear(),
    mesFiltro: new Date().getMonth(),
    usuarioLogado: null,
    nivelAcesso: 'leitor',
    graficosAtivos: { meses: null, espacos: null, dias: null, resps: null },
    termoBusca: '',
    timerBusca: null,
    meusEventosFiltro: 'ativos'
};
```

Confirmar contra `app.js:14-23` que os campos batem exatamente; copiar verbatim se divergir.

### Task 4.2: Extrair `js/theme.js`

**Files:**
- Create: `js/theme.js`
- Source: `app.js:235-273`

- [ ] **Step 1: Criar `js/theme.js`**

Mover verbatim `initTheme` (235-240), `toggleTheme` (241-255), `updateThemeIcon` (256-273). Adicionar `export` em cada. Importar de `./utils.js` se referenciar `showToast` (verificar).

### Task 4.3: Extrair `js/telas.js`

**Files:**
- Create: `js/telas.js`
- Source: `app.js:610-799`

- [ ] **Step 1: Criar `js/telas.js`**

Mover verbatim `atualizarTodasTelas` (610-621), `renderizarCards` (622-645), `atualizarUltimosEventos` (646-667), `atualizarMeusEventos` (668-701), `atualizarCancelamentos` (702-771), `renderizarCardsCancelados` (772-787), `atualizarResumoMes` (788-799). Adicionar `export`. Importar conforme tabela de símbolos: `estado` de `./estado.js`; `gerarCardEventoHtml` de `./components.js`; `getCalendar`/`buscarDadosMensais`/`getClasseBadge` de `./calendar.js`; `atualizarDashboard` de `./dashboard.js`; `atualizarPainelConflitos` de `./conflitos.js`; `atualizarPainelNotificacoes` de `./notifications.js`; helpers de `./utils.js`.

### Task 4.4: Extrair `js/admin.js`

**Files:**
- Create: `js/admin.js`
- Source: `app.js:800-861`

- [ ] **Step 1: Criar `js/admin.js`**

Mover verbatim `adicionarUsuarioViaAdmin` (800-827), `carregarListaUsuariosAdmin` (828-861). Adicionar `export`. Importar `supabase` de `../supabaseClient.js`, helpers de `./utils.js`.

### Task 4.5: Extrair `js/export.js`

**Files:**
- Create: `js/export.js`
- Source: `app.js:862-904`

- [ ] **Step 1: Criar `js/export.js`**

Mover verbatim `obterDadosParaExportacao` (862-884), `exportarExcel` (885-893), `exportarPDF` (894-904). Adicionar `export`. Importar `estado` de `./estado.js` e o que mais referenciar.

### Task 4.6: Extrair `js/backup.js`

**Files:**
- Create: `js/backup.js`
- Source: `app.js:905-1038`

- [ ] **Step 1: Criar `js/backup.js`**

Mover verbatim `fazerBackupJSON` (905-934), `restaurarBackupJSON` (935-1038). Adicionar `export`. Importar: `supabase` de `../supabaseClient.js`; `recarregarDados` de `./calendar.js`; `atualizarMeusEventos` de `./telas.js`; `showToast` de `./utils.js`.

### Task 4.7: Extrair `js/ui.js`

**Files:**
- Create: `js/ui.js`
- Source: `app.js:298-609`

- [ ] **Step 1: Criar `js/ui.js`**

Mover verbatim `initUI` (298-416), `construirInterfaceDinamica` (417-544), `mudarAno` (545-550), `atualizarSelecaoMes` (551-563), `aplicarBusca` (564-609). Adicionar `export`. `initUI` referencia muitos símbolos — importar todos pela tabela: `estado` de `./estado.js`; `initTheme`/`toggleTheme` de `./theme.js`; `fecharModal`/`fecharModalForm`/`deletarEvento`/`salvarOuEditarEvento` de `./reservas.js`; `recarregarDados` de `./calendar.js`; `atualizarDashboard` de `./dashboard.js`; `exportarExcel`/`exportarPDF` de `./export.js`; `fazerBackupJSON`/`restaurarBackupJSON` de `./backup.js`; `adicionarUsuarioViaAdmin` de `./admin.js`; `atualizarTodasTelas` de `./telas.js`; `debounce` de `./utils.js`; `mesesAbrev`/`feriadosFixos` de `./constants.js`.

Se `js/ui.js` passar de 350 linhas após os imports, mover `construirInterfaceDinamica` para `js/ui-interface.js` (exportada) e importá-la em `ui.js`.

### Task 4.8: Extrair `js/handlers.js`

**Files:**
- Create: `js/handlers.js`
- Source: `app.js:36-225`

- [ ] **Step 1: Criar `js/handlers.js`**

Mover verbatim os handlers `window.switchTab` (36-81), `window.abrirDetalhes` (83-162), `window.filtrarPorEspaco` (165-201), `window.deletarUsuario` (206-225). São atribuições a `window.*`. Envolvê-las numa função `export function initHandlers() { ... }` que executa as atribuições, chamada explicitamente pelo `app.js` (ordem de inicialização previsível).

Importar conforme tabela: `estado` de `./estado.js`; `getCalendar`/`getCorPorEspaco` de `./calendar.js`; `adjustColor` de `./utils.js`; `atualizarResumoMes`/`atualizarMeusEventos`/`atualizarCancelamentos`/`atualizarUltimosEventos` de `./telas.js`; `atualizarDashboard` de `./dashboard.js`; `atualizarPainelConflitos` de `./conflitos.js`; `atualizarPainelNotificacoes` de `./notifications.js`; `supabase` de `../supabaseClient.js`; `carregarListaUsuariosAdmin` de `./admin.js`; `showToast` de `./utils.js`.

### Task 4.9: Reescrever `app.js` como orquestrador

**Files:**
- Modify: `app.js` (rewrite completo)

- [ ] **Step 1: Reescrever `app.js`**

O novo `app.js` contém apenas: imports dos módulos novos + bootstrap (lógica das linhas 275-296 originais). Estrutura:
```javascript
import { estado } from './js/estado.js';
import { initAuth, aplicarPermissoes, setupAuthListener } from './js/auth.js';
import { iniciarSistema, getCalendar } from './js/calendar.js';
import { hideLoading } from './js/utils.js';
import { initUI } from './js/ui.js';
import { initHandlers } from './js/handlers.js';
import { initReservasWindow } from './js/reservas.js';
import { atualizarTodasTelas } from './js/telas.js';
import { carregarListaUsuariosAdmin } from './js/admin.js';

window.estadoGlobal = estado;
window.getCalendar = getCalendar;

initHandlers();

let authVerificado = false;
initAuth(estado, () => {
    authVerificado = true;
    initUI();
    aplicarPermissoes(estado.nivelAcesso, carregarListaUsuariosAdmin);
    initReservasWindow(atualizarTodasTelas);
    iniciarSistema(estado, {
        onEventsLoaded: atualizarTodasTelas,
        onUpdate: atualizarTodasTelas,
        onDateClick: (date) => window.abrirModalFormulario(date),
        onEventClick: (info) => {
            if (typeof window.setEventoSelecionado === 'function') {
                window.setEventoSelecionado(info.event);
            }
            window.abrirDetalhes(info.event);
        }
    });
    hideLoading();
});

setupAuthListener();
```

Confirmar contra `app.js:24-31` e `275-296` originais: copiar verbatim qualquer `window.*` binding ou variável de bootstrap adicional que exista além do mostrado. O `app.js` original faz `window.estadoGlobal = estado` e `window.getCalendar = getCalendar` (linhas 29-30) — manter ambos.

- [ ] **Step 2: Validar**

```bash
npx serve
```
Console limpo. Para cada `ReferenceError: X is not defined`, adicionar o `import` de X conforme a tabela de símbolos, no módulo que acusou o erro.

Smoke test golden path completo: login → calendário carrega → criar evento → editar evento → deletar evento → trocar de aba (todas) → dashboard renderiza → trocar tema claro/escuro → exportar Excel → exportar PDF → backup JSON → restaurar backup JSON → gestão de usuários (adicionar/remover).
Expected: zero erro de console; todos os fluxos funcionam igual ao baseline.

- [ ] **Step 3: Verificar limite de linhas**

```bash
wc -l app.js js/*.js js/utils/*.js js/reservas/*.js | sort -rn | head -12
```
Expected: nenhum arquivo de código acima de 350 linhas. Se algum passar, dividir conforme nota da Task 4.7.

- [ ] **Step 4: Commit**

```bash
git add app.js js/
git commit -m "refactor(js): divide app.js em orquestrador + 8 modulos"
```

- [ ] **Step 5: Push e validar no Vercel preview**

```bash
git push
```
Abrir o Vercel preview da branch `preview/security-fase1` e repetir o smoke test golden path.

---

## Validação final

- [ ] Nenhum arquivo JS/CSS acima de 350 linhas (`wc -l app.js js/*.js js/utils/*.js js/reservas/*.js css/*.css`).
- [ ] `style.css` removido.
- [ ] `app.js` reduzido a orquestrador (~40 linhas).
- [ ] Smoke test golden path sem erro de console.
- [ ] Diff visual sem regressão contra a baseline (telas claras e escuras).
- [ ] `git log` mostra 4 commits isolados (1 por fase).
