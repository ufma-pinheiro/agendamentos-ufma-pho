# 📋 Contexto do Projeto — Fonte da Verdade Autônoma
> ✅ Versão 1.2.0 — Corrigido: sessao_ativa com strings explícitas + Referências a novos artefatos
> ⚠️ Este arquivo é LIDO e ESCRITO automaticamente pela IA.
> NUNCA edite manualmente. Use o Orchestrator para solicitar mudanças.
> Versão gerenciada por: `.antigravity/context.lock`
> 🔄 Integrado com Orquestrador v4.0 + Handoff Template v2.1 + Severity Scale v1.0

---
meta:
  versao: "1.2.0"
  ultima_atualizacao: "2026-04-27T13:08:09.7063686Z"
  atualizado_por: "orchestrator"
  ciclo_atual: "CICLO-2026-04-27-001"
  sessao_ativa: "active"  # "none" | "active" | "closed"
  checksum: "sha256:..."
---

> 📌 NOTA SOBRE `sessao_ativa` (C-01 — CORRIGIDO v1.2):
> - `"none"` = Nenhum ciclo ativo. Orquestrador iniciará Gate 0 normalmente.
> - `"active"` = Ciclo em andamento. Orquestrador ativará Modo 6 (Recuperação de Falha).
> - `"closed"` = Ciclo encerrado com sucesso. Orquestrador iniciará novo ciclo.
> ⚠️ NUNCA use valores booleanos (true/false/null) — strings obrigatórias.

---

## 📚 Artefatos do Ecossistema (Referências Obrigatórias)

Todos os especialistas devem referenciar estes arquivos quando aplicável:

| Artefato | Versão | Localização | Função |
|----------|--------|-------------|--------|
| **Severity Scale** | v1.0.0 | `.antigravity/severity-scale.md` | Escala única de severidade para TODOS os especialistas |
| **Token Optimizer** | v1.0.0 | `.antigravity/token-optimizer-rules.md` | Regras de otimização de contexto (Gate 0) |
| **Handoff Registry** | v1.0.0 | `.antigravity/handoff-registry.yaml` | Índice centralizado de handoffs com checksum |
| **Handoff Template** | v2.1.0 | `.antigravity/handoff-template-v2.1.md` | Protocolo padronizado de handoff |
| **Spec Template** | v3.1.0 | `specs/spec-template-v3.1.md` | Template de especificação |

---

## 1️⃣ Identidade e Propósito
- Nome do Produto: `Sistema de Agendamento UFMA (Pinheiro) [inferido - confirmar]`
- Proposta de Valor (1 frase): `Gestao centralizada de reservas de espacos academicos com controle de permissoes e visao de ocupacao. [inferido - confirmar]`
- Fase Atual: `Desenvolvimento [inferido - confirmar]`
- Tipo de Sistema: `Ferramenta Interna [inferido - confirmar]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 2️⃣ Domínio e Glossário
- Termos-chave do negócio: `[ ]`
- Regras de negócio não-óbvias: `[ ]`
- Entidades e relações principais: `[ ]`
- Termos proibidos ou ambíguos: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 3️⃣ Usuários e Mercado
- Público Principal: `[ ]`
- Perfis / Níveis de Acesso: `[ ]`
- Nível de Confiança Exigido: `[Baixo / Médio / Alto / Regulamentado]`
- Tom ou Diferencial de Marca: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 4️⃣ Fluxos e Funcionalidades Críticas
- Fluxo Principal (Job to be Done): `[ ]`
- Funcionalidades Essenciais: `[ ]`
- Fluxos de Alto Risco / Sensíveis: `[ ]`
- Estados que Não Podem Falhar: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 5️⃣ Stack e Arquitetura
- Frontend: `Vanilla JavaScript (ES Modules), HTML5, CSS3 [inferido - confirmar]`
- Backend: `Supabase (PostgREST + Realtime) [inferido - confirmar]`
- Banco de Dados: `PostgreSQL (Supabase) [inferido - confirmar]`
- Infra / Deploy: `Vercel [inferido - confirmar]`
- Estilo de API: `REST (PostgREST via SDK Supabase) [inferido - confirmar]`
- Autenticação / Autorização: `Supabase Auth + controle de role em tabela usuarios [inferido - confirmar]`
- Gerenciamento de Estado / Cache: `Estado global em JavaScript no cliente [inferido - confirmar]`
- Dependências Críticas ou Lock de Stack: `FullCalendar, Chart.js, Flatpickr, XLSX, jsPDF [inferido - confirmar]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 6️⃣ Ambientes e Secrets
- Ambientes ativos: `local e prod [inferido - confirmar]`
- Diferenças entre ambientes: `[nao identificado - aguardando mais contexto]`
- Estratégia de secrets: `Supabase URL e anon key via variaveis de ambiente [inferido - confirmar]`
- URLs de referência: `https://github.com/ufma-pinheiro/agendamentos-ufma-pho [inferido - confirmar]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 7️⃣ Integrações e Dependências Externas (C-02)

> 📝 Dono desta seção: `devops-specialist` (infra/ambiente) + `backend-specialist` (APIs/contratos)
> Ambos podem escrever. Em caso de conflito, DevOps decide infra, Backend decide contratos.

- Integrações ativas: `Supabase [inferido - confirmar]`
- SLAs ou limites conhecidos: `[nao identificado - aguardando mais contexto]`
- Fallback se integração cair: `feedback visual via toasts/modais [inferido - confirmar]`
- Dependências críticas: `CDNs externas e servicos Supabase [inferido - confirmar]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 8️⃣ Restrições e Regras
- Equipe e Recursos: `Refatoracao incremental sem regressao [inferido - confirmar]`
- Prazos ou Marcos: `[nao identificado - aguardando mais contexto]`
- Compliance / Privacidade: `LGPD (institucional) [inferido - confirmar]`
- Limites Técnicos ou de Negócio: `Nao quebrar fluxo principal de agendamento e auth [inferido - confirmar]`

### 🛡️ Regra de Ouro do Fluxo (Anti-Regressão)
- **Gate do Auditor:** Nenhuma entrega é considerada "Pronta" (Done) sem o veredicto APROVADO do Auditor Independente.
- **Ordem de Validação:** A implementação pode ocorrer, mas o Auditor deve atuar **antes** de qualquer Merge em `main` ou Deploy em `produção`.
- **Falha de Processo:** É proibido declarar sucesso apenas com implementação técnica. O sucesso só é declarado após a auditoria final.

### 🆕 Regra de Integração de Contratos (C-06)
- **Contract Sync Gate:** Quando backend e frontend atuam em paralelo (∥), o especialista `contract-sync` DEVE ser ativado antes de `ui-review`.
- **Verificação Obrigatória:** Todos os endpoints declarados pelo backend devem ter chamada correspondente no frontend, com tipos alinhados.
- **Divergência Crítica:** Qualquer endpoint crítico sem alinhamento bloqueia o pipeline até resolução.

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 9️⃣ Contrato de Qualidade
- Cobertura de testes mínima: `[nao identificado - aguardando mais contexto]`
- Padrão de code review: `Mudancas incrementais com validacao de regressao [inferido - confirmar]`
- Tratamento de erros obrigatório: `Capturar erros Supabase e mostrar feedback ao usuario [inferido - confirmar]`
- Acessibilidade: `Somente semantica basica [inferido - confirmar]`
- Internacionalização: `PT-BR only [inferido - confirmar]`
- Definição de "Pronto": `Funcionalidade validada sem regressao no fluxo critico [inferido - confirmar]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 🔟 Métricas e Sucesso
- Métrica Principal (North Star): `[ ]`
- Indicadores de Saúde Técnica: `[ ]`
- O que NÃO deve acontecer (Anti-Goals): `[ ]`

### 📊 Métricas do Ciclo Atual (C-03)

> Preenchido automaticamente pelo Orquestrador ao final de cada ciclo.
> Referenciar `.antigravity/handoff-registry.yaml` para métricas detalhadas.

```yaml
metricas_ciclo:
  ciclo_id: "[ID]"
  inicio: "ISO8601"
  fim: "ISO8601"
  duracao_minutos: "[N]"
  especialistas_atuados: "[N]"
  findings:
    critico: "[N]"
    alto: "[N]"
    medio: "[N]"
    baixo: "[N]"
  taxa_aprovacao_auditor: "[APROVADO / CONDICIONADO / REJEITADO]"
  tokens_estimados: "[N]"
  retrabalhos: "[N]"
  regressoes_detectadas: "[sim/não]"
  divergencias_api: "[N]"  # 🆕 NOVO v1.2: Divergências encontradas pelo contract-sync
```

> 🔄 [AUTO] Atualizado por: Orquestrador | [data] | motivo: fechamento de ciclo

---

## 🧠 Mural de Decisões Ativas (C-04)

decisoes:
  - id: "[ID]"
    titulo: "[descrição]"
    tomada_por: "[especialista]"
    data: "[ISO8601]"
    raciocinio: "[por que]"
    afeta: ["[IDs de especialistas]"]
    status: "[ativa / revisada / revogada]"
    pode_mudar: true/false
    condicao_mudanca: "[texto]"
    revisada_em: "[ISO8601 ou null]"
    revisada_por: "[especialista ou null]"
    motivo_revisao: "[texto ou null]"

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 🚫 Anti-Padrões e Erros Recorrentes

erros_passados:
  - id: "ERR-001"
    tipo: "[categoria]"
    descricao: "[texto]"
    primeiro_ciclo: "[ID]"
    reincidencias: 0
    penalidade: "[texto]"
    status: "[ativo / aprendido]"

alertas_automaticos:
  - trigger: "[padrão de código]"
    acao: "[alerta ou bloqueio]"

---

## 🎯 Fio de Atenção do Ciclo Atual

ciclo_atual:
  id: "CICLO-2026-04-27-001"
  iniciado_por: "humano"
  objetivo: "Usar codigo pronto da pasta em-dev-agendamentos-main como baseline do ciclo"
  especialistas_envolvidos:
    - orchestrator: "concluido (Gate 0 + triagem inicial)"
    - discovery: "concluido"
    - tech-decision: "concluido"
    - security-arch: "concluido (sem findings criticos/altos)"
    - spec-enricher: "concluido"
    - sprint-planner: "concluido"
    - sprint-validator: "concluido"
    - backend: "concluido"
    - frontend: "concluido"
    - ui-review: "concluido"
    - security-code: "concluido"
    - qa: "em andamento"
  bloqueios_ativos:
    - tipo: "dependencia"
      de: "qa"
      para: "devops"
      motivo: "Falta validacao funcional manual em browser para serie recorrente"
  proximos_passos:
    - "Baseline confirmada: atuar direto em em-dev-agendamentos-main"
    - "Feature alvo confirmada: FEAT-007 (agendamentos recorrentes)"
    - "Concluir QA manual da FEAT-007"
    - "Executar roteiro em em-dev-agendamentos-main/docs/QA_FEAT-007_RECORRENCIA.md"
    - "Executar gate devops e preparar auditoria final"

---

## 🔍 Contexto Inferido pela IA (C-05)

> Quando este arquivo está vazio ou incompleto, o especialista DEVE inferir
> o contexto a partir dos artefatos disponíveis (código, configurações, docs).
> Use este mini-guia:

### Guia de Inferência Automática
1. **Estrutura de Pastas:** Liste diretórios principais (`src/`, `app/`, `api/`, etc.)
2. **Stack:** Identifique `package.json`, `requirements.txt`, `Cargo.toml`, etc.
3. **Framework:** Detecte imports principais (React, Vue, Django, FastAPI, etc.)
4. **Banco:** Busque `schema.prisma`, migrations, models
5. **Auth:** Busque middleware de auth, JWT, OAuth
6. **Deploy:** Busque `Dockerfile`, `.github/workflows/`, `vercel.json`
7. **Testes:** Busque `jest.config`, `pytest.ini`, `cypress/`
8. **Marque tudo como** `[inferido — confirmar]` até validação humana

- Estrutura de Pastas Detectada: `Projeto em em-dev-agendamentos-main com js/, docs/, specs/active e specs/completed [inferido - confirmar]`
- Contratos / Endpoints Identificados: `Supabase PostgREST para reservas e usuarios [inferido - confirmar]`
- Modelo de Dados / Schema Inferido: `Tabelas reservas e usuarios no Supabase [inferido - confirmar]`
- Riscos Imediatos Observados: `Dependencia de CDN e risco de regressao em app.js legado [inferido - confirmar]`
- Padrões, Dependências ou Locks de Stack: `Projeto ES Modules com frontend vanilla e deploy Vercel [inferido - confirmar]`
- Estado do CI/CD e Testes: `Sem suite automatizada declarada no package.json [inferido - confirmar]`
- Lacunas de Documentação ou Contexto Faltante: `SLA de integracoes, staging, meta de cobertura e prioridade da proxima entrega`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 🔄 Histórico de Decisões e Atualizações

| Data | Especialista | O que mudou | Motivo / Trade-off | Gate Validado? |
|------|-------------|-------------|-------------------|----------------|
|      |             |             |                   |                |

---

## ✅ Checklist de Validação (Orchestrator)

- [ ] `context.md` está legível, versionado e atualizado
- [ ] `sessao_ativa` usa strings explícitas ("none"/"active"/"closed")
- [ ] Referências a artefatos do ecossistema estão presentes (§Artefatos)
- [ ] Glossário e regras de domínio estão explícitos
- [ ] Stack, ambientes e integrações estão documentados
- [ ] Fluxos críticos e anti-goals estão definidos
- [ ] Contrato de qualidade e definição de "pronto" estão claros
- [ ] Modo de operação da IA e gates estão configurados
- [ ] Artefatos externos estão linkados
- [ ] Nenhuma decisão contradiz entrada anterior sem justificativa
- [ ] Mural de Decisões reflete estado atual
- [ ] Nenhum erro recorrente ativo sem mitigação
- [ ] **Métricas do ciclo atual estão preenchidas (se ciclo encerrado)**
- [ ] **Seção 7 tem dono definido (DevOps + Backend)**
- [ ] **Regra de Integração de Contratos (C-06) está ativa se backend ∥ frontend**
