# Modo Express — Protocolo de Aceleração (PT-BR · v1.0)
> ✅ Agnóstico de plataforma. Aplicável a: Discovery Agent, PRD Validator, Spec Enricher
> 🚀 Foco: Reduzir fricção para usuários experientes ou ciclos de correção rápida
> ⚡ Redução: De 10 perguntas → 1-2 interações para Discovery; De 8 → 1-2 para PRD Validator
> 🛡️ Salvaguarda: Modo Express NUNCA pula gates de segurança ou auditoria

---

## 🎯 Quando Usar Modo Express

### ✅ Apropriado para Modo Express:
- Usuário já tem PRD/documentação escrita e quer apenas validar
- Ciclo de correção rápida (hotfix, ajuste de escopo menor)
- Usuário experiente que já conhece o ecossistema Antigravity
- Replicação de feature similar a outra já implementada
- Refatoração técnica sem mudança de comportamento

### ❌ INAPROPRIADO para Modo Express (sempre usar modo completo):
- Novo projeto do zero (discovery obrigatório completo)
- Mudança em autenticação/autorização
- Dados sensíveis ou compliance ativo (LGPD/HIPAA/SOC2)
- Integração com sistema externo novo
- Mudança de arquitetura ou stack
- Usuário diz "não tenho certeza" ou "preciso pensar"

---

## 🚀 Protocolo de Ativação

### Como o usuário ativa:
O usuário deve enviar EXPLICITAMENTE uma das frases-chave:

```
"Modo express"
"Vamos no express"
"Já sei o que quero"
"Pular discovery"
"Ciclo rápido"
"Hotfix mode"
"Apenas validar"
"Modo auditoria rápida"
```

> ⚠️ O especialista NUNCA deve inferir Modo Express. Só ativar com comando explícito.
> ⚠️ Se o usuário enviar "quero", "preciso de", "adicionar" SEM frase-chave → usar modo normal.

---

## 📋 Modo Express por Especialista

---

### 1️⃣ Discovery Agent — Modo Express

**Pergunta única (substitui as 10 perguntas):**

```
─────────────────────────────────────
🚀 MODO EXPRESS ATIVADO — Discovery
─────────────────────────────────────

Você ativou o Modo Express. Em vez de 10 perguntas, 
preciso que você descreva em 3-5 frases:

1. Qual problema você quer resolver?
2. Quem é o usuário principal?
3. Qual a solução desejada (funcionalidades principais)?
4. Quais restrições (prazo, orçamento, tecnologia, compliance)?
5. Como você vai saber que deu certo?

💡 Dica: Seja específico. Quanto mais detalhe, melhor o PRD.
   Se precisar de ajuda para pensar, diga "voltar ao normal".
```

**Após resposta do usuário:**
1. Gerar relatório de discovery DIRETAMENTE com inferência autorizada
2. Marcar no handoff: `modo: express`
3. Incluir disclaimer: "Este discovery foi gerado em Modo Express. 
   Recomenda-se revisão humana antes de aprovação final."
4. Avançar para Product Strategist normalmente

**Handoff em Modo Express:**
```yaml
handoff_express:
  modo: "express"
  perguntas_economizadas: 9
  tempo_estimado_economizado: "15-20 minutos"
  nivel_confianca: "[alto/medio/baixo — baseado na especificidade da resposta]"
  recomendacao: "[aprovar / revisar com product / voltar para discovery completo]"
  risco: "Menor profundidade de discovery pode ocultar requisitos não-óbvios"
```

---

### 2️⃣ PRD Validator — Modo Express

**Pergunta única (substitui as 8 perguntas):**

```
─────────────────────────────────────
🚀 MODO EXPRESS ATIVADO — PRD Validator
─────────────────────────────────────

Você ativou o Modo Express. Analisando o PRD em specs/spec-ativa.md,
identifiquei os seguintes pontos que preciso que você confirme:

┌─────────────────────────────────────────────────────────────────────┐
│  ITEM                    │  STATUS DO PRD  │  SUA CONFIRMAÇÃO      │
├─────────────────────────────────────────────────────────────────────┤
│  Escopo do MVP           │  [resumo]       │  [ ] Correto          │
│                          │                 │  [ ] Precisa ajustar  │
├─────────────────────────────────────────────────────────────────────┤
│  CAs obrigatórios        │  [N definidos]  │  [ ] Claros           │
│                          │                 │  [ ] Precisam reescrever│
├─────────────────────────────────────────────────────────────────────┤
│  Edge cases P0/P1        │  [N mapeados]   │  [ ] Cobertos         │
│                          │                 │  [ ] Faltam           │
├─────────────────────────────────────────────────────────────────────┤
│  Riscos principais       │  [lista]        │  [ ] Concordo         │
│                          │                 │  [ ] Falta algum      │
├─────────────────────────────────────────────────────────────────────┤
│  Divisão em fases        │  [MVP→v2→v3]    │  [ ] Faz sentido      │
│                          │                 │  [ ] Quero ajustar    │
└─────────────────────────────────────────────────────────────────────┘

Responda com: "Tudo correto" ou indique qual item precisa de ajuste.
```

**Após resposta do usuário:**
1. Se "Tudo correto" → atualizar PRD com status "Validado Express" e avançar
2. Se ajustes solicitados → aplicar ajustes, atualizar PRD, avançar
3. Marcar no handoff: `modo: express`
4. Se ajustes forem MAIORES que 3 itens → RECOMENDAR voltar ao modo normal

**Handoff em Modo Express:**
```yaml
handoff_express:
  modo: "express"
  perguntas_economizadas: 7
  tempo_estimado_economizado: "10-15 minutos"
  ajustes_feitos: [N]
  ajustes_recusados: [N]
  nivel_confianca: "[alto/medio/baixo]"
  recomendacao: "[aprovar / revisar / voltar para validacao completa]"
```

---

### 3️⃣ Spec Enricher — Modo Express

**Pergunta única (substitui as 6 perguntas):**

```
─────────────────────────────────────
🚀 MODO EXPRESS ATIVADO — Spec Enricher
─────────────────────────────────────

Você ativou o Modo Express. Analisando a SPEC enriquecida:

Identifiquei [N] edge cases e [N] estados de UI que precisam de definição.

Quer que eu:
1. Proponha comportamentos padrão para TODOS (padrão de mercado)
2. Proponha apenas para os de impacto Alto/Crítico
3. Mostre a lista para você decidir um por um
4. Voltar ao modo normal (6 perguntas)

Responda com o número da opção.
```

---

## ⚠️ Salvaguardas Obrigatórias

### NUNCA permitir Modo Express quando:
- [ ] Usuário é novo no ecossistema (primeiro ciclo)
- [ ] Ciclo envolve autenticação, autorização ou dados sensíveis
- [ ] Compliance ativo (LGPD/GDPR/HIPAA/SOC2)
- [ ] Integração com API externa nova
- [ ] Mudança em schema de banco com dados em produção
- [ ] Usuário demonstrou incerteza na resposta express
- [ ] Resposta express tem < 50 palavras (muito vaga)

### SEMPRE fazer quando Modo Express é usado:
- [ ] Registrar `modo: express` no handoff
- [ ] Registrar `nivel_confianca` no handoff
- [ ] Incluir disclaimer no handoff
- [ ] Notificar Orquestrador para marcar no context.lock
- [ ] Auditor deve ser informado que ciclo usou Modo Express
- [ ] Se auditor rejeitar → próximo ciclo DEVE ser modo normal

---

## 📊 Métricas de Eficiência do Modo Express

```yaml
metricas_express:
  ciclo_id: "[ID]"
  especialista: "[discovery/prd-validator/spec-enricher]"
  modo: "express"
  perguntas_economizadas: "[N]"
  tempo_economizado_minutos: "[N]"
  nivel_confianca: "[alto/medio/baixo]"
  aprovado_por_auditor: "[sim/nao]"
  retrabalho_necessario: "[sim/nao]"

  # Meta: Modo Express deve ter taxa de aprovação ≥ 80%
  # Se taxa < 80% → desativar Modo Express para este usuário
```

---

## 🔄 Integração com Orquestrador

### Gate 0 — Detecção de Modo Express
```
Se usuário enviar frase-chave de Modo Express:
  1. Verificar se usuário já usou Modo Express antes
  2. Se sim → verificar taxa de aprovação do auditor
  3. Se taxa < 80% → RECUSAR Modo Express: "Modo Express indisponível. 
     Seu último ciclo express foi rejeitado. Use modo completo."
  4. Se taxa ≥ 80% → PERMITIR Modo Express
  5. Registrar no context.lock: `modo_express: true`
```

### Checklist do Auditor (quando ciclo usou Modo Express)
```
- [ ] Discovery/Validação foi feito em Modo Express?
- [ ] Se sim → aplicar escrutínio EXTRA nos CAs e edge cases
- [ ] Se findings Crítico/Alto relacionados a requisitos mal-mapeados → 
      REJEITAR e exigir modo normal no retrabalho
- [ ] Registrar no veredicto: "Ciclo usou Modo Express. [Aprovado/Rejeitado]"
```

---

## ✅ Checklist de Implementação

Para ativar Modo Express no ecossistema:

- [ ] Adicionar seção "Modo Express" ao `discovery-agent-v1.0.md`
- [ ] Adicionar seção "Modo Express" ao `prd-validator-v1.0.md`
- [ ] Adicionar seção "Modo Express" ao `spec-enricher-v1.0.md`
- [ ] Atualizar Orquestrador v4.1 para detectar frases-chave no Gate 0
- [ ] Atualizar Auditor para escrutínio extra em ciclos express
- [ ] Criar métricas de tracking em `.antigravity/metrics/express-usage.yaml`
- [ ] Definir threshold de aprovação (recomendado: ≥ 80%)
- [ ] Documentar no context.md: "Modo Express disponível para usuários com taxa ≥ 80%"

---

## 🆕 Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-04-24 | Criação inicial — protocolo de aceleração para ciclos experientes |
