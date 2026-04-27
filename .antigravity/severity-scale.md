# Escala de Severidade Padrão — Antigravity v4.0
> ✅ Versão 1.0.0 — Único ponto de verdade para TODO o ecossistema
> 📍 Localização: `.antigravity/severity-scale.md`
> 🔄 Todos os especialistas DEVEM referenciar este arquivo, nunca definir escala própria
> ⚖️ Hierarquia: Segurança > Corretude > Restrições > Custo/Prazo > Valor > Sustentabilidade > Performance

---

## 📊 Tabela Mestre de Severidade

| Severidade | Definição Única | Gatilhos Específicos por Camada | Ação do Orquestrador | Cor Dashboard | SLA de Resolução |
|-----------|----------------|--------------------------------|---------------------|--------------|-----------------|
| **🔴 Crítico** | Compromete segurança, dados, funcionamento do sistema OU bloqueia aprovação do Auditor sem negociação | **Security:** Bypass de auth, exposição massiva de dados, RCE, SQLi confirmado<br>**Backend:** Perda de dados, corrupção de schema, deadlock em produção<br>**Frontend:** Fluxo principal inacessível, perda de dados do usuário<br>**QA:** Fluxo crítico sem cobertura de teste, regressão confirmada em produção<br>**DevOps:** Secret exposto, downtime não recuperável, deploy impossível<br>**Product:** CA obrigatório não implementado, escopo crítico omitido | **STOP** → Modo 7 (Retrabalho obrigatório)<br>Nenhum merge/deploy até resolução<br>Notificação imediata ao humano | 🔴 Vermelho | 0h (bloqueia tudo) |
| **🟠 Alto** | Impacta fluxo crítico, performance degradada, integridade de dados em risco OU bloqueia merge/deploy | **Security:** Escalada de privilégio, IDOR, dados sensíveis vazados em logs<br>**Backend:** API sem rate limiting, transação sem rollback, race condition<br>**Frontend:** Acessibilidade quebrada (WCAG AA), mobile inutilizável<br>**QA:** CA obrigatório não verificado com evidência, edge case P0 não testado<br>**DevOps:** Sem rollback definido, observabilidade zero em fluxo crítico, staging ≠ prod<br>**Product:** Dependência crítica não mapeada, risco de compliance não mitigado | **STOP** → Modo 7 (Retrabalho obrigatório)<br>Merge/deploy bloqueados<br>Prazo de resolução definido no context.md | 🟠 Laranja | ≤ 24h |
| **🟡 Médio** | Problema real com condições limitantes OU débito técnico que acumula risco | **Security:** Header de segurança ausente, CORS permissivo demais (não crítico)<br>**Backend:** Query N+1, falta de índice, validação incompleta de input<br>**Frontend:** Estado de erro genérico, responsividade quebrada em breakpoint não-crítico<br>**QA:** Cobertura parcial em fluxo importante, teste fraco em área de risco médio<br>**DevOps:** CI/CD frágil, alerta ausente em área importante, .env.example desatualizado<br>**Product:** CA desejável não implementado, wireframe ambíguo | **AVANÇAR** com registro no context.md<br>Planejar resolução no próximo ciclo<br>Documentar trade-off aceito | 🟡 Amarelo | ≤ 1 sprint |
| **🔵 Baixo** | Melhoria de qualidade sem urgência OU observação para refinamento futuro | **Security:** Conselho de hardening, cipher não-ideal, header opcional<br>**Backend:** Refatoração de legibilidade, log não-estruturado<br>**Frontend:** Ajuste de espaçamento, cor de hover inconsistente<br>**QA:** Teste de regressão pode ser otimizado, cobertura abaixo da meta<br>**DevOps:** Pipeline pode ser mais rápido, documentação de deploy pode melhorar<br>**Product:** Sugestão de UX, oportunidade de monetização não explorada | **AVANÇAR**, registrar no histórico<br>Não bloqueia entrega<br>Converter em spec futura se persistir | 🔵 Azul | ≤ 3 sprints |
| **⚪ Informacional** | Conselho, tendência de mercado, oportunidade futura SEM impacto atual | **Todas as camadas:** Sugestão de biblioteca nova, padrão emergente, benchmark de concorrente, alerta de depreciação futura (não iminente) | **AVANÇAR**, não registrar no context.md<br>Apenas nota no handoff<br>Revisar em retrospectiva do ciclo | ⚪ Cinza | N/A |

---

## 🎯 Critérios de Classificação Cruzada

Quando um finding afeta MÚLTIPLAS camadas, use a **severidade MÁXIMA** entre elas.

**Exemplo:**
```
Finding: "API de pagamento sem validação de idempotência"
- Backend: Alto (race condition em pagamento = dados inconsistentes)
- Security: Médio (condições limitantes para exploit)
- QA: Alto (CA obrigatório de pagamento não verificado)
→ CLASSIFICAÇÃO FINAL: 🔴 Crítico
  (pagamento = fluxo crítico + dados financeiros = segurança máxima)
```

---

## 📋 Matriz de Decisão Rápida

Use este fluxo para classificar qualquer finding em < 30 segundos:

```
1. O finding permite comprometimento remoto, bypass de auth, ou perda de dados?
   → SIM → 🔴 Crítico

2. O finding bloqueia uso principal do sistema OU impede merge/deploy?
   → SIM → 🟠 Alto

3. O finding é real, reproduzível, mas com condições limitantes?
   → SIM → 🟡 Médio

4. O finding é melhoria de qualidade sem impacto funcional?
   → SIM → 🔵 Baixo

5. O finding é apenas observação, conselho ou oportunidade futura?
   → SIM → ⚪ Informacional
```

---

## 🔄 Regras de Reclassificação

Um finding NUNCA pode ser reclassificado para BAIXO sem:
1. Nova evidência que reduz impacto (ex: descoberta de mitigação existente)
2. Aprovação do especialista que originalmente classificou
3. Registro no context.md: `reclassificacao: [ID] | de: [X] | para: [Y] | motivo: [Z]`

Um finding pode ser reclassificado para CIMA automaticamente se:
- Novo contexto revela impacto maior (ex: descoberta de que "Médio" afeta dados de produção)
- Registro obrigatório no context.md
- Notificação ao Orquestrador para reavaliação de gates

---

## 📊 Integração com Handoff

Todo handoff deve incluir, na seção 3 (Findings):

```markdown
| Severidade | Título | Impacto | Quem deve resolver |
|---|---|---|---|
| Crítico | `[título]` | `[impacto específico]` | `[ID especialista]` |
```

**Validação automática pelo Orquestrador:**
- Se findings Crítico > 0 → verificar se próximo especialista ≠ auditor
- Se findings Alto > 0 → verificar se coluna "Quem deve resolver" está preenchida
- Se findings Crítico/Alto sem plano de resolução → REJEITAR handoff

---

## 🎨 Cores no Dashboard do Orquestrador

```
╔══════════════════════════════════════════════════════════════╗
║  ORQUESTRADOR ANTIGRAVITY v4.0                               ║
║  Findings: 🔴 C:[N] 🟠 A:[N] 🟡 M:[N] 🔵 B:[N] ⚪ I:[N]     ║
╚══════════════════════════════════════════════════════════════╝
```

**Regra de cor:**
- Se 🔴 > 0 → Dashboard inteiro com borda vermelha
- Se 🟠 > 0 e 🔴 = 0 → Dashboard com borda laranja
- Se 🟡 > 0 e 🔴 = 🟠 = 0 → Dashboard com borda amarela
- Se apenas 🔵/⚪ → Dashboard verde (normal)

---

## ✅ Checklist de Adoção

Para cada especialista no ecossistema:

- [ ] Remover definição própria de escala de severidade do system prompt
- [ ] Adicionar referência: `Ver .antigravity/severity-scale.md para definições completas`
- [ ] Manter apenas gatilhos específicos da camada (se diferirem da tabela mestre)
- [ ] Atualizar exemplos de findings no prompt para usar classificações alinhadas
- [ ] Testar: um finding idêntico classificado por 3 especialistas diferentes deve ter a MESMA severidade

---

## 🆕 Changelog

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0.0 | 2026-04-24 | Criação inicial — consolida escalas divergentes de 15+ especialistas |
