# 📐 Spec — [Nome da Feature / Melhoria / Correção]
&gt; ✅ Agnóstico de plataforma. Compatível com: Google AI Studio, Claude, ChatGPT, Cursor, Windsurf e qualquer LLM com suporte a system prompt.
&gt; ⚠️ Este arquivo define O QUE será construído, como deve se comportar e como sabemos que está pronto.
&gt; Deve ser lido em conjunto com o `context.md` do projeto.
&gt; Preencha antes de ativar qualquer especialista de execução.
&gt; Se um campo estiver vazio, o especialista deve perguntar antes de inferir.

---

## 📌 Metadados

- **ID / Referência:** `[ex: FEAT-001, BUG-042, REFACTOR-003]`
- **Tipo:** `[Feature Nova / Melhoria / Correção / Refatoração / Auditoria / Experimento]`
- **Prioridade:** `[Crítica / Alta / Média / Baixa]`
- **Status:** `[Rascunho / Em Revisão / Aprovada / Em Execução / Concluída / Cancelada / Bloqueada]`
- **Criado por:** `[humano / IA / ambos]`
- **Data de criação:** `[YYYY-MM-DD]`
- **Última atualização:** `[YYYY-MM-DD]`
- **Ciclo de trabalho vinculado:** `[ex: Ciclo #3 — Autenticação]`
- **Depende de:** `[IDs de specs]`
- **Bloqueia:** `[IDs de specs]`

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
Evidência: [teste/link]
CA-02
Dado: [ ]
Quando: [ ]
Então: [ ]
Status: [Pendente / Em Verificação / Verificado]
Verificado por: [especialista]
Evidência: [teste/link]


### Critérios Desejáveis (Não Bloqueadores)

CD-01
Dado: [ ]
Quando: [ ]
Então: [ ]


---

## 6️⃣ Requisitos por Especialista

### 🏗️ Backend
- Endpoints novos ou modificados: `[ ]`
- Contratos de API (método, rota, payload, resposta, erros): `[ ]`
- Regras de negócio específicas: `[ ]`
- Mudanças de schema ou migração necessária: `[ ]`
- Requisitos de transação ou idempotência: `[ ]`

### 🔒 Security
- Dados sensíveis envolvidos: `[sim / não / quais]`
- Autenticação exigida: `[sim / não]`
- Autorização por role: `[ ]`
- Trust boundaries afetados: `[ ]`
- Requisitos de compliance desta feature: `[ ]`
- Inputs controlados por usuário externo: `[ ]`

### 🎨 Frontend
- Telas ou componentes afetados: `[ ]`
- Referência visual (Figma, protótipo, screenshot): `[ ]`
- Estados visuais necessários: `[loading / vazio / erro / sucesso / desabilitado]`
- Requisitos de acessibilidade: `[ ]`
- Requisitos de responsividade: `[mobile / desktop / ambos]`

### 🖥️ UI/UX
- Hierarquia de informação esperada: `[ ]`
- Fluxo de navegação afetado: `[ ]`
- Feedback para o usuário em cada estado: `[ ]`

### 🧪 QA
- Fluxos críticos com cobertura total obrigatória: `[ ]`
- Edge cases prioritários: `[ ]`
- Dados de teste necessários: `[ ]`
- Ambiente de teste requerido: `[ ]`
- Testes de regressão a verificar: `[ ]`

### 🚀 DevOps
- Variáveis de ambiente novas ou modificadas: `[ ]`
- Serviços externos a provisionar: `[ ]`
- Mudanças de configuração de infra: `[ ]`
- Requisitos de feature flag: `[sim / não]`
- Estratégia de rollback específica: `[ ]`
- Monitoramento ou alertas adicionais: `[ ]`

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

## 8️⃣ Definição de Pronto

- [ ] Código implementado e revisado
- [ ] Todos os CAs obrigatórios verificados com evidência
- [ ] Todos os edge cases mapeados têm comportamento implementado
- [ ] Nenhum finding Crítico ou Alto em aberto
- [ ] Estados de erro têm feedback claro para o usuário
- [ ] Requisitos de segurança verificados pelo Security
- [ ] QA aprovou cobertura dos fluxos críticos
- [ ] DevOps confirmou prontidão de ambiente (se aplicável)
- [ ] Gates obrigatórios do Orchestrator verificados
- [ ] **Auditor Independente emitiu veredicto APROVADO ou CONDICIONADO**
- [ ] Spec atualizada no spec-index.json com status "Concluída"

---

## 9️⃣ Artefatos e Referências

- Protótipo / Figma: `[link]`
- Spec de API (OpenAPI / Postman): `[link]`
- Schema de banco relacionado: `[link ou trecho]`
- Spec anterior relacionada: `[ID]`
- Ticket / Issue relacionado: `[link]`

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