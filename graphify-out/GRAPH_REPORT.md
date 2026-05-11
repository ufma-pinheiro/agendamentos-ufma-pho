# Graph Report - C:\\Users\\Admin\\OneDrive\\Documentos\\SISTEMAS IA\\agendamentos-ufma-pho  (2026-05-08)

## Corpus Check
- Corpus is ~10,450 words - fits in a single context window. You may not need a graph.

## Summary
- 144 nodes · 220 edges · 21 communities (12 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Constants & Helpers|UI Constants & Helpers]]
- [[_COMMUNITY_Data Sync & Dashboard|Data Sync & Dashboard]]
- [[_COMMUNITY_Auth & User Management|Auth & User Management]]
- [[_COMMUNITY_Export & Data IO|Export & Data IO]]
- [[_COMMUNITY_Dashboard & Navigation|Dashboard & Navigation]]
- [[_COMMUNITY_Login Module|Login Module]]
- [[_COMMUNITY_Access Control Init|Access Control Init]]
- [[_COMMUNITY_UI Initialization|UI Initialization]]
- [[_COMMUNITY_Theme Management|Theme Management]]
- [[_COMMUNITY_Detail View & Colors|Detail View & Colors]]
- [[_COMMUNITY_Modal & Edit Flow|Modal & Edit Flow]]
- [[_COMMUNITY_Export Functions|Export Functions]]
- [[_COMMUNITY_App State|App State]]
- [[_COMMUNITY_Tab Navigation|Tab Navigation]]
- [[_COMMUNITY_Space Filter|Space Filter]]
- [[_COMMUNITY_Form Modal|Form Modal]]
- [[_COMMUNITY_Month Selector|Month Selector]]
- [[_COMMUNITY_Edit by ID|Edit by ID]]
- [[_COMMUNITY_Delete by ID|Delete by ID]]
- [[_COMMUNITY_Toggle Theme|Toggle Theme]]
- [[_COMMUNITY_JSON Backup|JSON Backup]]

## God Nodes (most connected - your core abstractions)
1. `supabase (client instance)` - 15 edges
2. `showToast()` - 10 edges
3. `initAuth` - 9 edges
4. `reservas (Supabase table)` - 9 edges
5. `atualizarTodasTelas()` - 8 edges
6. `salvarOuEditarEvento` - 8 edges
7. `atualizarTodasTelas` - 8 edges
8. `initAuth()` - 7 edges
9. `salvarOuEditarEvento()` - 7 edges
10. `iniciarSistema` - 7 edges

## Surprising Connections (you probably didn't know these)
- `showToast` --semantically_similar_to--> `showError`  [INFERRED] [semantically similar]
  app.js → login.js
- `index.html (main app shell)` --references--> `initAuth`  [EXTRACTED]
  index.html → app.js
- `initAuth` --semantically_similar_to--> `verificarAcesso`  [INFERRED] [semantically similar]
  app.js → login.js
- `deletarUsuario (window)` --calls--> `supabase (client instance)`  [EXTRACTED]
  app.js → supabaseClient.js
- `login.html (login page)` --references--> `checkSession`  [EXTRACTED]
  login.html → login.js

## Hyperedges (group relationships)
- **Authentication and authorization flow** — login_checksession, login_verificaracesso, app_initauth, app_aplicarpermissoes, db_usuarios_table [EXTRACTED 0.95]
- **Event CRUD cycle with realtime sync** — app_salvaroueditar, app_deletarevento, app_prepararedicao, app_iniciarrealtime, db_reservas_table [EXTRACTED 0.95]
- **DB-to-frontend data mapping layer** — app_dbparafrontend, app_frontendparadb, db_reservas_table, supabaseclient_supabase [EXTRACTED 0.95]

## Communities (21 total, 9 thin omitted)

### Community 0 - "UI Constants & Helpers"
Cohesion: 0.06
Nodes (26): activeFilters, algumAtivo, allChip, btn, categoryChips, container, estado, failsafeLoading (+18 more)

### Community 1 - "Data Sync & Dashboard"
Cohesion: 0.15
Nodes (25): animateValue, aplicarBusca, atualizarDashboard, atualizarMeusEventos, atualizarResumoMes, atualizarTodasTelas, atualizarUltimosEventos, buscarDadosMensais (+17 more)

### Community 2 - "Auth & User Management"
Cohesion: 0.13
Nodes (19): adicionarUsuarioViaAdmin, aplicarPermissoes, carregarListaUsuariosAdmin, construirInterfaceDinamica, debounce, deletarUsuario (window), hideLoading, initAuth (+11 more)

### Community 3 - "Export & Data IO"
Cohesion: 0.15
Nodes (15): adicionarUsuarioViaAdmin(), deletarEvento(), exportarExcel(), exportarPDF(), fazerBackupJSON(), fecharModal(), fecharModalForm(), frontendParaDb() (+7 more)

### Community 4 - "Dashboard & Navigation"
Cohesion: 0.23
Nodes (12): animateValue(), aplicarBusca(), atualizarDashboard(), atualizarMeusEventos(), atualizarResumoMes(), atualizarTodasTelas(), atualizarUltimosEventos(), buscarDadosMensais() (+4 more)

### Community 5 - "Login Module"
Cohesion: 0.36
Nodes (6): btn, checkSession(), overlay, showError(), verificarAcesso(), supabase

### Community 6 - "Access Control Init"
Cohesion: 0.4
Nodes (5): aplicarPermissoes(), carregarListaUsuariosAdmin(), hideLoading(), initAuth(), mostrarAcessoNegado()

### Community 7 - "UI Initialization"
Cohesion: 0.4
Nodes (5): atualizarSelecaoMes(), construirInterfaceDinamica(), debounce(), initUI(), stringToColor()

### Community 8 - "Theme Management"
Cohesion: 0.67
Nodes (3): initTheme(), toggleTheme(), updateThemeIcon()

### Community 9 - "Detail View & Colors"
Cohesion: 0.67
Nodes (3): abrirDetalhes (window), adjustColor, getCorPorEspaco

### Community 10 - "Modal & Edit Flow"
Cohesion: 0.67
Nodes (3): adicionarLinhaData (window), fecharModal, prepararEdicao

### Community 11 - "Export Functions"
Cohesion: 0.67
Nodes (3): exportarExcel, exportarPDF, obterDadosParaExportacao

## Knowledge Gaps
- **55 isolated node(s):** `estado`, `mesesAbrev`, `feriadosFixos`, `selectedTab`, `btn` (+50 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `supabase (client instance)` connect `Data Sync & Dashboard` to `Auth & User Management`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `initAuth` connect `Auth & User Management` to `Data Sync & Dashboard`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `salvarOuEditarEvento` connect `Data Sync & Dashboard` to `Detail View & Colors`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `estado`, `mesesAbrev`, `feriadosFixos` to the rest of the system?**
  _55 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Constants & Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Auth & User Management` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._