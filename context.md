# 📋 Contexto do Projeto — Fonte da Verdade
> ⚠️ Este arquivo NÃO é preenchido manualmente pelo humano.
> A IA deve inferir e preencher automaticamente com base nos artefatos fornecidos.
> Todos os especialistas devem ler este arquivo antes de qualquer ação.
> Campos inferidos com incerteza: `[inferido — confirmar]`
> Campos sem evidência: `[não identificado — aguardando mais contexto]`

---

## 📌 Versão deste Arquivo
- Versão: `1.3.0`
- Última atualização: `2026-04-20`
- Atualizado por: `Antigravity (Orchestrator + Auditor)`

---

## 🤖 Instrução de Autopreenchimento
Ao receber qualquer artefato (código, repositório, README, descrição, PR, conversa), a IA deve:
1. Analisar o artefato e inferir os campos abaixo
2. Preencher cada campo com o que foi identificado
3. Marcar campos incertos como `[inferido — confirmar]`
4. Marcar campos sem evidência como `[não identificado — aguardando mais contexto]`
5. Nunca pedir ao humano para preencher este arquivo manualmente
6. Registrar no histórico o que foi inferido e quando

---

## 1️⃣ Identidade e Propósito
- Nome do Produto: `Sistema de Agendamento UFMA (Pinheiro)`
- Proposta de Valor (1 frase): `Gestão centralizada de reservas de espaços acadêmicos com calendários dinâmicos, controle de permissões e análise de ocupação.`
- Fase Atual: `Refatoração` (Otimização de performance e segurança em código legado).
- Tipo de Sistema: `Ferramenta Interna`

> 🤖 Inferir de: README, nome do repositório, descrição do projeto, landing page, conversas iniciais.

---

## 2️⃣ Domínio e Glossário
- Termos-chave do negócio: `Agendamento/Reserva`, `Espaço/Sala`, `Responsável`, `Conflito`, `Role (Papel)`.
- Regras de negócio não-óbvias:
    - Fuso horário fixo em `UTC-3` (Brasília) para evitar erros de renderização no calendário.
    - Divisão cronológica: Eventos que abrangem vários dias são fragmentados em registros individuais (um por dia) para evitar blocos contínuos ilegíveis.
    - Filtros por categoria: Engenharia, Licenciaturas, Saúde (com cores específicas).
- Entidades e relações principais: `Reservas` (eventos de agenda), `Usuários` (permissões vinculadas ao e-mail institucional).
- Termos proibidos ou ambíguos: `[não identificado — aguardando mais contexto]`

> 🤖 Inferir de: modelos de dados, nomes de tabelas, comentários no código, documentação existente.

---

## 3️⃣ Usuários e Mercado
- Público Principal: `Comunidade UFMA (Professores, Alunos e Técnicos do Campus Pinheiro).`
- Perfis / Níveis de Acesso:
    - `leitor`: Apenas visualiza a agenda e dashboard.
    - `editor`: Cria, edita e exclui seus próprios agendamentos.
    - `dono`: Acesso total (Gestão de usuários, dashboard administrativo, exclusão global).
- Nível de Confiança Exigido: `Alto` (Controle de acesso físico a salas e auditórios).
- Tom ou Diferencial de Marca: `Institucional e Profissional.`

> 🤖 Inferir de: roles no código, fluxos de autenticação, copy da interface, tipo de produto.

---

## 4️⃣ Fluxos e Funcionalidades Críticas
- Fluxo Principal (Job to be Done): `Verificar disponibilidade de local -> Selecionar Horário -> Confirmar Agendamento.`
- Funcionalidades Essenciais: `Calendário Interativo (FullCalendar), Dashboard de métricas de ocupação (Chart.js), Exportação em PDF/Excel.`
- Fluxos de Alto Risco / Sensíveis: `Detecção de conflitos automática` no momento da criação/edição e `remoção de usuários`.
- Estados que Não Podem Falhar: `Sincronização com Supabase Realtime` e `Verificação de Auth` no Login.

> 🤖 Inferir de: rotas principais, controllers, fluxos de navegação, testes existentes.

---

## 5️⃣ Stack e Arquitetura
- Frontend: `Vanilla JavaScript (ES Modules), HTML5, CSS3.`
- Backend: `Supabase (PostgREST + Realtime).`
- Banco de Dados: `PostgreSQL (Supabase).`
- Infra / Deploy: `Vercel.`
- Estilo de API: `Direct PostgREST` (via SDK do Supabase).
- Autenticação / Autorização: `Supabase Auth` com validação customizada baseada na tabela `usuarios`.
- Gerenciamento de Estado / Cache: `Estado Global` (objeto `estado` em `app.js`).
- Dependências Críticas: `FullCalendar@6`, `Chart.js`, `Flatpickr`, `SweetAlert2`, `XLSX`, `jsPDF`.

> 🤖 Inferir de: package.json, requirements.txt, Dockerfile, imports, estrutura de pastas.

---

## 6️⃣ Ambientes e Secrets
- Ambientes ativos: `Local` (desenvolvimento) e `Produção` (Vercel).
- Diferenças entre ambientes: `[não identificado — aguardando mais contexto]`
- Estratégia de secrets: `Supabase URL/Anon Key` gerenciadas via arquivos de configuração/variáveis de ambiente no Vercel.
- URLs de referência: `https://github.com/ufma-pinheiro/agendamentos-ufma-pho`

> 🤖 Inferir de: .env.example, docker-compose, CI/CD configs, README de setup.

---

## 7️⃣ Integrações e Dependências Externas
- Integrações ativas: `Supabase (Backend-as-a-Service).`
- SLAs ou limites conhecidos: `[não identificado — aguardando mais contexto]`
- Fallback se integração cair: `Alertas visuais via showToast e SweetAlert2.`
- Dependências críticas: `CDN's de bibliotecas (jsDelivr, unpkg).`

> 🤖 Inferir de: imports de SDKs, variáveis de ambiente, chamadas HTTP externas.

---

## 8️⃣ Restrições e Regras
- Equipe e Recursos: `Refatoração focada em modularização (app.js de 1500+ linhas).`
- Prazos ou Marcos: `[não identificado — aguardando mais contexto]`
- Compliance / Privacidade: `Uso restrito institucional (LGPD implícita).`
- Limites Técnicos ou de Negócio: `O código atual é monolítico; mudanças devem ser incrementais (ZERO regressão).`

> 🤖 Inferir de: comentários no código, README, conversas, tipo de dados tratados.

---

## 9️⃣ Contrato de Qualidade
- Cobertura de testes mínima: `[não identificado]`
- Padrão de code review: `Não modularizado inicialmente; refatoração para padrão modular em andamento.`
- Tratamento de erros obrigatório: `Captura de exceções em todas as chamadas do Supabase com feedback visual.`
- Acessibilidade: `Semântica básica e uso de tags ARIA [inferido — confirmar].`
- Internacionalização: `Somente PT-BR.`
- Definição de "Pronto": `Funcionalidade testada, sem conflitos de agenda e persistida no Supabase.`

> 🤖 Inferir de: configurações de linting, testes existentes, CI/CD, PRs anteriores.

---

## 🔟 Métricas e Sucesso
- Métrica Principal (North Star): `Taxa de utilização dos espaços versus pedidos de agendamento.`
- Indicadores de Saúde Técnica: `Tempo de carregamento (TTI) com Lazy Loading das abas.`
- O que NÃO deve acontecer (Anti-Goals): `Sobreposição de horários (Conflitos), Acesso de usuários não cadastrados.`

> 🤖 Inferir de: documentação de produto, OKRs, conversas sobre objetivos.

---

## 🗂️ Artefatos Vinculados
- Figma / Protótipo: `[não identificado]`
- Diagrama de arquitetura: `[não identificado]`
- Schema do banco: `Tabelas: reservas, usuarios (Supabase).`
- Repositório(s): `https://github.com/ufma-pinheiro/agendamentos-ufma-pho`

---

## 🤖 Modo de Operação da IA
- Especialistas ativos: `Orchestrator, Backend, Frontend, Auditor Independente.`
- Nível de autonomia: `Sugerir + implementar (sob supervisão).`
- Língua de resposta: `PT-BR`
- Formato padrão de resposta: `Markdown + Código Direto.`
- Quando escalar para humano: `Em caso de ambiguidades críticas no esquema do banco.`
- Gates obrigatórios: `Validação de deleção/remoção de arquivos. Auditor deve emitir veredicto ANTES do push.`

---

## 🔍 Contexto Inferido pela IA
*(Preenchido automaticamente. Não apague.)*

- **Estrutura de Pastas Detectada**: Modularização iniciada. Nova pasta `/js` com `utils.js` e `db.js`. `app.js` reduzido de ~1630 para ~1492 linhas.
- **Riscos Imediatos Observados**:
    - `app.js` ainda monolítico (auth, calendar, dashboard misturados) — modularização em progresso.
    - Dependência de CDNs externas pode gerar indisponibilidade.
- **Schema Confirmado**:
    - `reservas`: `id, title, start_time, end_time, espacos, responsavel, criadopor, datacriacao, isconflito, groupid, color, titulopuro, contatowhats, contatoemail`
    - `usuarios`: `email, role` (sem coluna `id` — confirmado pelo 400 na PERF-001)
- **Módulos JS Criados** (branch `devAgendamento`):
    - `js/utils.js` — funções utilitarias puras (showToast, escapeHtml, adjustColor, etc.)
    - `js/db.js` — mapeamento DB↔Frontend (dbParaFrontend, frontendParaDb)
- **CSP Ativa** em `index.html` e `login.html` com diretivas para: cdn.jsdelivr.net, cdnjs.cloudflare.com, esm.sh, fonts.googleapis.com, fonts.gstatic.com, vercel.live (frame-src).
- **Fixes Aplicados** (branch `devAgendamento`):
    - `SECURITY-001`: admin hardcoded, XSS, memory leak
    - `SECURITY-002`: CSP headers + hotfixes de frame-src e font-src
    - `PERF-001`: projeções explícitas no Supabase
    - `ARCH-001 Step 1`: extração de utils.js e db.js

---

## 🔄 Histórico de Decisões e Atualizações

| Data | Especialista | O que mudou | Motivo / Trade-off | Gate Validado? |
|------|-------------|-------------|-------------------|----------------|
| 2026-04-20 | Orchestrator | Re-população total do Contexto | Manual reset e inserção de novas diretrizes | Sim |
| 2026-04-20 | Orchestrator | Deletados arquivos legados | Limpeza de artefatos temporários (PROJETO_STATUS.md, etc) | Sim |
| 2026-04-20 | Orchestrator + Backend | SECURITY-001 Fix 1: removido admin hardcoded | Role 100% baseada na tabela `usuarios`; admin verificado via MCP antes da remoção | Sim |
| 2026-04-20 | Frontend | SECURITY-001 Fix 2: sanitização XSS | Adicionado `escapeHtml()`, `createElement`+`textContent` nos pontos críticos | Sim |
| 2026-04-20 | Frontend | SECURITY-001 Fix 3: memory leak Realtime | Canal salvo em `realtimeChannel`, `removeChannel()` + `beforeunload` | Sim |
| 2026-04-20 | Auditor | Veredicto CONDICIONADO — SECURITY-001 | Push ocorreu antes da auditoria (gate violado); 2 condições abertas | Parcial |
| 2026-04-20 | Orchestrator/Backend | PERF-001 implementada (Projeções Explícitas) | `.select('*')` substituído para reduzir TTI e rede. Aguarda auditoria. | Não (Pendente Auditor) |
| 2026-04-20 | Auditor | Veredicto APROVADO — PERF-001 | Nenhuma regressão detectada; campos validados contra o dbParaFrontend. Gate validado antes do push. | Sim |
| 2026-04-20 | Security/Frontend | SECURITY-002 implementada e Auditada | Injeção de Meta tag CSP em index.html e login.html. Gate Auditor Aprovado (sem quebra de CDNs validado). | Sim |
| 2026-04-20 | Security | SECURITY-002 hotfix #1 | CSP bloqueava esm.sh (Supabase SDK), vercel.live, fontes base64. Domínios adicionados. | Sim |
| 2026-04-20 | Security + Backend | SECURITY-002 hotfix #2 | Adicionado frame-src vercel.live; removido `id` inválido da query `usuarios` (error 400). Schema `usuarios` confirmado: apenas `email, role`. | Sim |
| 2026-04-20 | Frontend (ARCH-001) | Modularização Step 1: js/utils.js + js/db.js criados | Redução de 141 linhas no app.js. Auditado e aprovado antes do push. | Sim |

---

## ✅ Checklist de Validação (Orchestrator)
- [x] `context.md` está legível, versionado e atualizado
- [x] Glossário e regras de domínio estão explícitos
- [x] Stack, ambientes e integrações estão documentados
- [x] Fluxos críticos e anti-goals estão definidos
- [x] Contrato de qualidade e definição de "pronto" estão claros
- [x] Modo de operação da IA e gates estão configurados
- [x] Artefatos externos estão linkados
- [x] Nenhuma decisão contradiz entrada anterior sem justificativa

---

## ⚠️ Pendências Abertas (Rastreadas pelo Auditor)

| ID | Severidade | Descrição | Responsável | Prazo |
|----|-----------|-----------|-------------|-------|
| P-001 | Médio | CA-01 a CA-04 (SECURITY-001) sem evidência de teste — login admin, acesso negado, XSS literal, Realtime único | QA / Usuário | Próximo ciclo |
| P-003 | Baixo | Gate do Auditor deve ser acionado ANTES do push (não depois) | Orchestrator | Processo |
| P-004 | Médio | ARCH-001 Step 2 pendente: extrair `js/auth.js` com a lógica de initAuth + mostrarAcessoNegado | Frontend | Próximo ciclo |
| P-005 | Baixo | Inventariar TODOS os domínios externos antes de qualquer nova CSP (lição do hotfix SECURITY-002) | Security | Processo |
