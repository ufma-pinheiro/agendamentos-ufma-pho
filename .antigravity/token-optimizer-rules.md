# Token Optimizer Rules — Antigravity v4.0
> ✅ Versão 1.0.0 — Obrigatório para Gate 0 do Orquestrador
> 🎯 Foco: Maximizar qualidade do contexto dentro do limite de tokens do modelo
> 📊 Métrica: Redução de 30-50% no consumo de tokens sem perda de informação crítica

---

## 🎯 Princípio Fundamental

**Contexto é caro. Silêncio é caro. Informação errada é catastrófico.**

O Token Optimizer aplica regras ANTES de qualquer especialista receber o prompt final. Ele não remove informação — ele **reorganiza prioridade**.

---

## 📋 Regras de Otimização (Aplicadas em Ordem)

### Regra 1: Deduplicação Inteligente (DEDUP-01)

**Quando aplicar:** Sempre, antes de montar o prompt de qualquer especialista.

**Como funciona:**
1. Identificar seções do `context.md` que também aparecem no handoff anterior
2. Se a informação é idêntica ou equivalente → **referenciar, não repetir**
3. Formato de referência: `Ver context.md §[seção].[subseção]`

**Exemplo:**
```
❌ ANTES (redundante):
context.md diz: "Stack: React + Node.js + PostgreSQL"
handoff do backend diz: "Stack definida: React + Node.js + PostgreSQL"
Prompt do frontend recebe AMBOS → tokens duplicados

✅ DEPOIS (otimizado):
Prompt do frontend recebe:
"Stack: React + Node.js + PostgreSQL (ver context.md §5 para detalhes de infra)"
```

**Exceções (NUNCA deduplicar):**
- Findings Crítico/Alto (sempre incluir completos)
- Decisões tomadas no ciclo atual (sempre incluir completas)
- Código implementado na atuação anterior (incluir diff, não referência)

---

### Regra 2: Compressão de Código (CODE-01)

**Quando aplicar:** Quando código fonte é parte do contexto.

**Limite de linhas:**

| Tipo | Limite | Ação |
|------|--------|------|
| Código novo/alterado | ≤ 50 linhas | Incluir COMPLETO |
| Código novo/alterado | > 50 linhas | Resumir com comentários de alto nível + diff |
| Código existente (referência) | ≤ 20 linhas | Incluir trecho relevante |
| Código existente (referência) | > 20 linhas | Referenciar arquivo + linhas |

**Formato de resumo:**
```
// [arquivo: src/auth/login.js]
// Função: valida credenciais, gera JWT, registra último login
// Linhas 45-78 (33 linhas totais)
// Principais operações: bcrypt.compare → jwt.sign → db.update
// Edge case tratado: usuário inativo retorna 403 com mensagem específica
```

**Exceções (sempre incluir completo):**
- Funções de autenticação/autorização
- Validação de input sanitization
- Queries de banco (SQL/ORM)
- Configuração de CORS/security headers

---

### Regra 3: Hierarquia de Contexto (HIER-01)

**Ordem de prioridade para inclusão no prompt:**

```
1. 🔴 CRÍTICO (sempre incluir, nunca omitir)
   ├── Findings Crítico/Alto do ciclo atual
   ├── CAs obrigatórios pendentes
   ├── Decisões ativas que afetam este especialista
   ├── Contradições detectadas (Modo 4)
   └── Locks de sessão (context.lock)

2. 🟠 ALTO (incluir completo, resumir se necessário)
   ├── Handoff do especialista anterior
   ├── Spec enriquecida (seções relevantes ao especialista)
   ├── Fluxos críticos do context.md
   └── Requisitos de security-arch (se aplicável)

3. 🟡 MÉDIO (referenciar, incluir se espaço permitir)
   ├── Histórico de decisões do context.md
   ├── Stack e arquitetura (context.md §5)
   ├── Integrações externas (context.md §7)
   └── Métricas do ciclo anterior

4. 🟢 BAIXO (omitir, referenciar se perguntado)
   ├── Anti-padrões históricos já mitigados
   ├── Métricas de ciclos antigos (>3 ciclos)
   ├── Artefatos de versões deprecadas
   └── Exemplos de código de implementações anteriores
```

**Algoritmo de corte:**
- Calcular tokens estimados do prompt completo
- Se > 80% do limite do modelo: remover camada Baixo
- Se > 90% do limite: remover camada Médio, manter apenas referências
- Se > 95% do limite: emitir ALERTA ao Orquestrador para ativar Modo 5 (Reavaliação)

---

### Regra 4: Fallback por Estouro (OVERFLOW-01)

**Trigger:** Prompt estimado > 95% do limite de tokens do modelo.

**Ações em cascata:**

1. **Primeiro corte:** Remover exemplos de código (manter apenas assinaturas)
2. **Segundo corte:** Resumir histórico de decisões (manter apenas últimas 3)
3. **Terceiro corte:** Referenciar spec completa (incluir apenas CAs relevantes)
4. **Quarto corte:** Emitir PERGUNTA_RAPIDA ao humano: "Contexto excede limite. Quer resumir [área] ou dividir em sub-ciclos?"
5. **Último recurso:** Ativar Modo 5 (Reavaliação) + registrar no context.md: `estouro_tokens: true`

**NUNCA cortar:**
- Findings Crítico/Alto
- Instruções de segurança (security-arch/code)
- Requisitos de compliance ativo
- Locks de sessão

---

### Regra 5: Compactação de Handoff (HAND-01)

**Quando o handoff anterior é muito longo:**

```
Tamanho do handoff | Ação
-------------------|------
≤ 2000 tokens      | Incluir completo
2001-4000 tokens   | Incluir seções 1, 2, 3, 8 completas; resumir 4, 5, 6, 7
4001-6000 tokens   | Incluir seções 1, 2, 3, 8; referenciar 4, 5, 6, 7
> 6000 tokens      | Incluir seções 1 (resumo), 3 (findings), 8 (próximo); referenciar restante
```

**Formato de resumo de handoff:**
```
## Resumo do Handoff Anterior — [especialista]
Status: [Concluído/Bloqueado/Parcial]
Findings: [N Crítico | N Alto | N Médio | N Baixo]
Decisões chave: [D1], [D2]
Próximo sugerido: [ID]
Artefatos: [lista breve]
⚠️ Ver arquivo completo: .antigravity/handoffs/[CICLO]-[especialista]-handoff.md
```

---

### Regra 6: Cache de Contexto Estático (CACHE-01)

**Informações que raramente mudam dentro de um ciclo:**

| Informação | Frequência de mudança | Estratégia |
|------------|----------------------|------------|
| Nome do produto | Nunca | Incluir apenas na primeira ativação |
| Stack definida | Estágio 2 apenas | Referenciar após Estágio 2 |
| Compliance ativo | Nunca | Referenciar sempre |
| Glossário de domínio | Raramente | Incluir termos relevantes apenas |
| North Star | Raramente | Referenciar após Estágio 1 |

**Implementação:**
- Orquestrador mantém `contexto_estatico_checksum` no context.lock
- Se checksum não mudou desde última ativação → referenciar, não incluir
- Se mudou → incluir apenas delta (o que mudou)

---

## 📊 Métricas de Eficiência

O Orquestrador deve registrar a cada ciclo:

```yaml
metricas_token:
  ciclo_id: "[ID]"
  tokens_prompt_orquestrador: "[N]"
  tokens_prompt_discovery: "[N]"
  tokens_prompt_product: "[N]"
  tokens_prompt_backend: "[N]"
  tokens_prompt_frontend: "[N]"
  tokens_prompt_auditor: "[N]"
  tokens_totais_ciclo: "[N]"
  reducao_por_optimizacao: "[N%]"
  estouros_detectados: "[N]"
  cortes_aplicados: ["DEDUP-01", "CODE-01", "HIER-01", "HAND-01"]
```

**Meta de eficiência:**
- Redução mínima de 30% vs. prompt não otimizado
- Zero estouros em ciclos normais (especs < 10 CAs)
- Máximo 1 estouro por ciclo em especs grandes (aceitável)

---

## 🔄 Integração com Orquestrador

### Gate 0 — Passo 3 (Atualizado)
```
3. Token Optimizer (O-05): 
   a. Ler `.antigravity/token-optimizer-rules.md` ← ESTE ARQUIVO
   b. Aplicar DEDUP-01, CODE-01, HIER-01, HAND-01, CACHE-01
   c. Calcular tokens estimados do prompt do próximo especialista
   d. Se estouro detectado → aplicar OVERFLOW-01
   e. Registrar métricas em `.antigravity/metrics/[CICLO]-tokens.json`
```

### Modo 5 — Reavaliação (Trigger por estouro)
```
Se OVERFLOW-01 ativar quarto corte:
→ Orquestrador pergunta: "Contexto excede limite. Opções:
   1. Dividir ciclo em sub-ciclos (menor escopo por ciclo)
   2. Resumir áreas não-críticas (pode perder detalhe)
   3. Usar modelo com maior contexto (se disponível)
   4. Prosseguir com risco de omissão (registrar no context.md)"
```

---

## ✅ Checklist de Aplicação

Antes de ativar qualquer especialista, o Orquestrador deve:

- [ ] Ler este arquivo (token-optimizer-rules.md)
- [ ] Identificar especialista alvo e suas necessidades de contexto
- [ ] Aplicar DEDUP-01 (remover redundâncias context.md vs handoff)
- [ ] Aplicar CODE-01 (comprimir código >50 linhas)
- [ ] Aplicar HIER-01 (priorizar Crítico/Alto, referenciar Baixo)
- [ ] Aplicar HAND-01 (resumir handoff anterior se muito longo)
- [ ] Aplicar CACHE-01 (referenciar contexto estático)
- [ ] Calcular tokens estimados
- [ ] Se estouro → aplicar OVERFLOW-01
- [ ] Registrar métricas em `.antigravity/metrics/[CICLO]-tokens.json`

---

## 📝 Exemplo de Aplicação Completa

**Cenário:** Ativar `backend` após `security-arch` em ciclo de API de pagamentos.

**ANTES (sem otimização):**
```
Prompt backend recebe:
- context.md completo (~3000 tokens)
- handoff security-arch completo (~2500 tokens)  
- spec-enriquecida completa (~4000 tokens)
- código de referência (~2000 tokens)
TOTAL: ~11.500 tokens → ESTOURO em modelo 8k/16k
```

**DEPOIS (com otimização):**
```
Prompt backend recebe:
- context.md: §4 (fluxos críticos) + §5 (stack) + §8 (compliance) = ~800 tokens
  Referência: "Ver context.md §1-3, §6-7, §9-10 para detalhes"
- handoff security-arch: Resumo (§1, §3 findings Crítico/Alto, §8) = ~600 tokens
  Referência: "Ver handoff completo em .antigravity/handoffs/..."
- spec-enriquecida: CAs de backend + edge cases P0/P1 = ~1200 tokens
  Referência: "Ver spec-enriquecida.md para CAs de frontend/QA"
- código: Apenas interfaces e contratos de API = ~400 tokens
TOTAL: ~3.000 tokens ✅
```

**Redução: 74%** sem perda de informação crítica para o backend.

---

## 🆕 Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-04-24 | Criação inicial — arquivo faltante no ecossistema v4.0 |
