# 📐 Spec — [Nome da Feature / Melhoria / Correção]
> ✅ Versão 3.1 — Integrado com Orquestrador v3.1 + Handoff Template v2.0
> ⚠️ Este arquivo define O QUE será construído, como deve se comportar e como sabemos que está pronto.
> Deve ser lido em conjunto com o `context.md` do projeto.
> Preencha antes de ativar qualquer especialista de execução.
> Se um campo estiver vazio, o especialista deve perguntar antes de inferir.

---

## 📌 Metadados

- **ID / Referência:** `[ex: FEAT-001, BUG-042, REFACTOR-003]`
- **Tipo:** `[Feature Nova / Melhoria / Correção / Refatoração / Auditoria / Experimento]`
- **Prioridade:** `[Crítica / Alta / Média / Baixa]`
- **Status:** `[Rascunho / Em Revisão / Aprovada / Em Execução / Concluída / Cancelada / Bloqueada]`
- **Criado por:** `[humano / IA / ambos]`
- **Data de criação:** `[YYYY-MM-DD]`
- **Última atualização:** `[YYYY-MM-DD]`
- **Ciclo de trabalho vinculado:** `[ex: CICLO-2026-04-22-001]`
- **Depende de:** `[IDs de specs]`
- **Bloqueia:** `[IDs de specs]`
- **spec-index.json:** Atualizar status ao concluir

---

## 1️⃣ Contexto e Motivação

### Problema ou Oportunidade
`[Descreva o problema real ou a oportunidade identificada. Seja específico.]`

### Conexão com o Produto
`[Como isso se conecta com os fluxos críticos, métricas ou anti-goals do context.md?]`

### O que acontece se não fizermos isso?
`[Qual o custo de não agir — para o usuário, para o negócio ou para a saúde técnica?]`

---

## 2️⃣ Objetivo e Escopo

### Objetivo Principal
`[Em uma frase: o que esta spec entrega?]`

### O que está DENTRO do escopo
- `[ ]`
- `[ ]`

### O que está FORA do escopo
- `[ ]`
- `[ ]`

### Dependências
`[Esta spec depende de outra spec, decisão ou recurso externo?]`

---

## 3️⃣ Usuários e Contexto de Uso

- **Quem usa esta feature:** `[ ]`
- **Quando usa:** `[ ]`
- **O que o usuário quer alcançar:** `[ ]`
- **Nível de confiança exigido:** `[Baixo / Médio / Alto / Regulamentado]`

---

## 4️⃣ Comportamento Esperado

### Fluxo Principal (Caminho Feliz)

[ ]
[ ]
[ ]
Estado final: [ ]


### Fluxos Alternativos

Alternativa 1: [ ]
→ [ ]


### Fluxos de Erro

Erro 1: [ ]
→ O que o sistema faz: [ ]
→ O que o usuário vê: [ ]
→ Estado após o erro: [ ]


### Estados do Sistema
| Estado | Descrição | Quem pode estar neste estado |
|--------|-----------|------------------------------|
| `[ ]` | `[ ]` | `[ ]` |

---

## 5️⃣ Critérios de Aceite

### Critérios Obrigatórios (Bloqueadores de Entrega)

CA-01
Dado: [ ]
Quando: [ ]
Então: [ ]
Status: [Pendente / Em Verificação / Verificado]
Verificado por: [especialista]
Evidência: [teste/link/handoff]

CA-02
Dado: [ ]
Quando: [ ]
Então: [ ]
Status: [Pendente / Em Verificação / Verificado]
Verificado por: [especialista]
Evidência: [teste/link/handoff]


### Critérios Desejáveis (Não Bloqueadores)

CD-01
Dado: [ ]
Quando: [ ]
Então: [ ]


---

## 6️⃣ Requisitos por Especialista (Ordem do Ciclo v3.1)

> 🔄 Sequência oficial: product → backend → security-arch → frontend → ui-review → security-code → qa → devops → auditor
> Cada especialista deve ler o handoff do anterior em `.antigravity/handoffs/`

### 🎨 Product (PRD e Estimativa)
- Escopo validado com o humano: `[sim / não]`
- Estimativa de esforço: `[Pequena / Média / Grande]`
- Justificativa da estimativa: `[ ]`
- Sequência recomendada: `[ciclo completo / ciclo parcial]`

### 🏗️ Backend
- Endpoints novos ou modificados: `[ ]`
- Contratos de API (método, rota, payload, resposta, erros): `[ ]`
- Regras de negócio específicas: `[ ]`
- Mudanças de schema ou migração necessária: `[ ]`
- Requisitos de transação ou idempotência: `[ ]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-backend-handoff.md`

### 🔒 Security-Arch (ANTES do código — Threat Modeling)
- Trust boundaries afetados: `[ ]`
- Requisitos de compliance desta feature: `[LGPD / GDPR / HIPAA / SOC2 / Nenhum]`
- Ativos a proteger: `[ ]`
- Atores e ameaças identificadas: `[ ]`
- Entregáveis: threat model, trust boundaries, requisitos para implementação
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-security-arch-handoff.md`

### 🎨 Frontend
- Telas ou componentes afetados: `[ ]`
- Referência visual (Figma, protótipo, screenshot): `[ ]`
- Estados visuais necessários: `[loading / vazio / erro / sucesso / desabilitado]`
- Requisitos de acessibilidade: `[ ]`
- Requisitos de responsividade: `[mobile / desktop / ambos]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-frontend-handoff.md`

### 🖥️ UI/UX
- Hierarquia de informação esperada: `[ ]`
- Fluxo de navegação afetado: `[ ]`
- Feedback para o usuário em cada estado: `[ ]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-ui-review-handoff.md`

### 🔒 Security-Code (APÓS implementação — Revisão de Código)
- Código revisado para vulnerabilidades: `[sim / não]`
- Findings Crítico/Alto resolvidos: `[sim / não]`
- Linha direta enviada (se aplicável): `[sim / não]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-security-code-handoff.md`

### 🧪 QA
- Fluxos críticos com cobertura total obrigatória: `[ ]`
- Edge cases prioritários: `[ ]`
- Dados de teste necessários: `[ ]`
- Ambiente de teste requerido: `[ ]`
- Testes de regressão a verificar: `[ ]`
- Cobertura mínima exigida: `[X%]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-qa-handoff.md`

### 🚀 DevOps
- Variáveis de ambiente novas ou modificadas: `[ ]`
- Serviços externos a provisionar: `[ ]`
- Mudanças de configuração de infra: `[ ]`
- Requisitos de feature flag: `[sim / não]`
- Estratégia de rollback específica: `[ ]`
- Monitoramento ou alertas adicionais: `[ ]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-devops-handoff.md`

### 🔍 Auditor Independente
- Veredicto: `[APROVADO / CONDICIONADO / REJEITADO]`
- CAs obrigatórios verificados: `[N de N]`
- Findings em aberto: `[C: N | A: N | M: N | B: N]`
- Handoff salvo em: `.antigravity/handoffs/[CICLO]-auditor-handoff.md`

---

## 7️⃣ Edge Cases e Riscos

### Edge Cases Mapeados
| Edge Case | Comportamento Esperado | Especialista Responsável |
|-----------|----------------------|--------------------------|
| `[ ]` | `[ ]` | `[ ]` |

### Riscos Identificados
| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| `[ ]` | Alta/Média/Baixa | Alto/Médio/Baixo | `[ ]` |

---

## 8️⃣ Definição de Pronto (v3.1)

- [ ] Código implementado e revisado
- [ ] Todos os CAs obrigatórios verificados com evidência
- [ ] Todos os edge cases mapeados têm comportamento implementado
- [ ] Nenhum finding Crítico ou Alto em aberto
- [ ] Estados de erro têm feedback claro para o usuário
- [ ] Requisitos de security-arch verificados (threat model, trust boundaries)
- [ ] Requisitos de security-code verificados (vulnerabilidades, linha direta)
- [ ] QA aprovou cobertura dos fluxos críticos
- [ ] DevOps confirmou prontidão de ambiente (se aplicável)
- [ ] Gates obrigatórios do Orchestrator verificados
- [ ] **Auditor Independente emitiu veredicto APROVADO ou CONDICIONADO**
- [ ] Spec atualizada no spec-index.json com status "Concluída"
- [ ] Todos os handoffs salvos em `.antigravity/handoffs/`
- [ ] Context.md atualizado com diffs do ciclo
- [ ] Histórico de ciclo arquivado em `.antigravity/history/`

---

## 9️⃣ Artefatos e Referências

- Protótipo / Figma: `[link]`
- Spec de API (OpenAPI / Postman): `[link]`
- Schema de banco relacionado: `[link ou trecho]`
- Spec anterior relacionada: `[ID]`
- Ticket / Issue relacionado: `[link]`
- Handoffs do ciclo: `.antigravity/handoffs/[CICLO-ID]-*-handoff.md`

---

## 🔟 Métricas do Ciclo (preenchido pelo Orquestrador)

```yaml
metricas_ciclo:
  ciclo_id: "[ID]"
  spec_id: "[ID]"
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
```

---

## 🔄 Histórico de Alterações desta Spec

| Data | Alterado por | O que mudou | Motivo |
|------|-------------|-------------|--------|
|      |             |             |        |

---

## 🔍 Contexto Inferido pelo Especialista
*(Preenchido pelo especialista que executar esta spec. Não apague.)*

- Hipóteses assumidas: `[ ]`
- Decisões tomadas durante execução: `[ ]`
- Desvios do escopo original: `[ ]`
- Itens que ficaram fora e devem virar nova spec: `[ ]`
- Riscos observados não mapeados originalmente: `[ ]`
- Handoffs gerados: `[lista de arquivos em .antigravity/handoffs/]`
