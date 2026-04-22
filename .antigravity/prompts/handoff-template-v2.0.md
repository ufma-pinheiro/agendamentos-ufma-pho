# Protocolo de Handoff — Especialistas IA (Oficial)
> ✅ Versão 2.0 — Integrado com Orquestrador v3.1
> 📁 Persistência obrigatória: `.antigravity/handoffs/[CICLO-ID]-[ESPECIALISTA]-handoff.md`
> 🔗 O próximo especialista DEVE ler o handoff do anterior antes de atuar
> 🤖 TUDO é criado automaticamente pela IA — NUNCA exija ação manual do humano

---

## Instruções de Uso (NOVO — H-01 + H-02)

### Ao FINALIZAR sua atuação:
1. Preencha TODAS as seções abaixo com dados REAIS do ciclo (não deixe placeholders)
2. Salve este handoff no caminho obrigatório:
   ```
   .antigravity/handoffs/[CICLO-ID]-[SEU-ID]-handoff.md
   ```
   Exemplo: `.antigravity/handoffs/CICLO-2026-04-22-001-backend-handoff.md`

   > ⚠️ Se a pasta `.antigravity/handoffs/` não existir → CRIE AUTOMATICAMENTE.
   > ⚠️ Se não conseguir criar arquivo → inclua o handoff COMPLETO no corpo da resposta (fallback).
   > ⚠️ NUNCA peça ao humano para criar pastas ou arquivos.

3. Inclua o handoff completo no FINAL da sua resposta ao Orquestrador

### Ao INICIAR sua atuação (se você NÃO é o primeiro):
1. Verifique se existe handoff do especialista anterior em:
   ```
   .antigravity/handoffs/[CICLO-ID]-[ESPECIALISTA-ANTERIOR]-handoff.md
   ```
2. Se existir → ler ANTES de começar. O contexto dele é obrigatório.
3. Se não existir → ler o handoff no corpo da resposta anterior (fallback)
4. Marque ACK abaixo como lido

---

## Handoff: [nome curto da tarefa ou módulo]

**Especialista:** [backend / frontend / security-arch / security-code / qa / devops / ui-review / product / auditor]
**Data/Ciclo:** [data ou ID do ciclo de trabalho]
**Status:** [Concluído / Bloqueado / Aguardando decisão / Parcial]
**Arquivo deste handoff:** `.antigravity/handoffs/[CICLO-ID]-[ESPECIALISTA]-handoff.md`
**Modo de entrega:** [Arquivo salvo / Inline (fallback)]

---

## ✅ ACK — Confirmação de Leitura (Corrigido — H-03)

> Em sistema 100% automatizado, o ACK é implícito pela leitura do arquivo de handoff.
> Se você é o PRIMEIRO especialista do ciclo, marque: "PRIMEIRO — não há handoff anterior"

- [ ] **ACK** — Li o handoff do especialista anterior (ou sou o primeiro)
- [ ] **NACK** — Não encontrei o handoff do anterior em `.antigravity/handoffs/`
- [ ] **CONTRADIÇÃO** — Conflito detectado com: [qual decisão/contexto]

> Se NACK → notificar Orquestrador imediatamente. Não avance sem contexto anterior.
> Se CONTRADIÇÃO → STOP. Orquestrador entra em Modo 4 (Gestão de Conflito).

---

## 1. O que foi feito

Lista cronológica e objetiva do que foi produzido, tentado ou descartado.
Se algo foi descartado, explique por quê.

- [ ] `[ação realizada]` — `[resultado ou artefato gerado]`
- [ ] `[ação realizada]` — `[resultado ou artefato gerado]`
- [ ] `[descartado: X]` — motivo: `[por que não foi feito]`

---

## 2. Estado atual

Onde exatamente a atuação parou.
O que está funcionando, o que está incompleto, o que está quebrado.

- **Funcionando:** `[o que está pronto e validado]`
- **Incompleto:** `[o que foi iniciado mas não finalizado]`
- **Quebrado / Bloqueado:** `[o que não funciona ou impediu avanço]`

---

## 3. Findings em aberto

> ⚠️ ATENÇÃO: Silêncio não equivale a ausência de problemas.
> Se não há findings, declare explicitamente: "Nenhum finding em aberto."

| Severidade | Título | Impacto | Quem deve resolver |
|---|---|---|---|
| Crítico | `[ ]` | `[ ]` | `[ID do especialista]` |
| Alto | `[ ]` | `[ ]` | `[ID do especialista]` |
| Médio | `[ ]` | `[ ]` | `[ID do especialista]` |
| Baixo | `[ ]` | `[ ]` | `[ID do especialista]` |

---

## 4. Decisões tomadas

Escolhas feitas durante a atuação que afetam outros especialistas ou o sistema.
Registre também no histórico do `context.md`.

| Decisão | Motivo | Trade-off aceito |
|---|---|---|
| `[ ]` | `[ ]` | `[ ]` |
| `[ ]` | `[ ]` | `[ ]` |

---

## 5. O que o próximo especialista precisa saber

Contexto específico que não está no `context.md` mas é crítico para quem age a seguir.

- `[informação relevante 1]`
- `[informação relevante 2]`
- `[armadilha ou risco não óbvio]`

---

## 6. Perguntas em aberto

Coisas que ainda precisam de decisão, investigação ou confirmação humana.

- `[ ]` — responsável: `[especialista ou humano]`
- `[ ]` — responsável: `[especialista ou humano]`

---

## 7. Campos do context.md para atualizar

Liste os campos que devem ser atualizados com base nesta atuação.
O Orchestrator é responsável por confirmar e registrar.

- `[ campo ]` → `[ novo valor ou informação ]`
- `[ campo ]` → `[ novo valor ou informação ]`

---

## 8. Próximo especialista sugerido

Quem deve agir a seguir e com qual instrução de entrada.

**Próximo:** `[ID do especialista]`
**Instrução de entrada:** `[o que ele deve fazer ao iniciar]`
**Dependência:** `[o que precisa estar resolvido antes de ele começar]`
**Handoff anterior a ler:** `.antigravity/handoffs/[CICLO-ID]-[SEU-ID]-handoff.md`

---

## 9. Artefatos produzidos

Arquivos, endpoints, schemas, componentes, testes ou qualquer saída concreta desta atuação.

| Artefato | Tipo | Localização / Referência |
|---|---|---|
| `[ ]` | `[ ]` | `[ ]` |
| `[ ]` | `[ ]` | `[ ]` |

---

## 10. Resultados de QA / Testes (NOVO — H-04)

> Preenchido PRINCIPALMENTE por QA, mas outros especialistas podem registrar.
> DevOps DEVE ler esta seção antes de aprovar deploy.

| Teste | Status | Evidência |
|-------|--------|-----------|
| `[descrição do teste]` | `[Passou / Falhou / Não executado]` | `[link/log]` |
| `[descrição do teste]` | `[Passou / Falhou / Não executado]` | `[link/log]` |

**Cobertura de fluxos críticos:** `[X%]`
**CAs obrigatórios verificados:** `[N de N]`
**Regressões detectadas:** `[sim/não — descrever se sim]`

---

## 🔒 Validação do Handoff

| Check | Status | Validado por |
|-------|--------|-------------|
| Seção 3 (Findings) preenchida? | [ ] Sim / [ ] Não | Orquestrador (auto) |
| Seção 8 (Próximo) preenchido? | [ ] Sim / [ ] Não | Orquestrador (auto) |
| ACK/NACK/CONTRADIÇÃO declarado? | [ ] Sim / [ ] Não | Orquestrador (auto) |
| Context.md atualizado ou listado? | [ ] Sim / [ ] Não | Orquestrador (auto) |
| Arquivo salvo em `.antigravity/handoffs/`? | [ ] Sim / [ ] Não | Especialista |
| Próximo especialista é ID válido? | [ ] Sim / [ ] Não | Orquestrador (auto) |

> **Regra:** Handoff sem findings declarados + próximo especialista definido + ACK válido = handoff inválido.
> O Orchestrator pode rejeitar e solicitar repreenchimento antes de avançar.
> Handoff não salvo em arquivo = finding Médio automático (mas não bloqueia se inline foi entregue).

---

## 📎 Schema de Validação Automática (NOVO — H-05)

> Esta seção é técnica — para uso do Orquestrador na validação automática.
> Não preencha manualmente.

```yaml
handoff_schema:
  versao: "2.0"
  campos_obrigatorios:
    - especialista: "enum[product,backend,frontend,ui-review,security-arch,security-code,qa,devops,auditor]"
    - status: "enum[Concluido,Bloqueado,Aguardando decisao,Parcial]"
    - ack: "enum[ACK,NACK,CONTRADICAO]"
    - findings: "array | string 'Nenhum'"
    - proximo_especialista: "enum[...] | null se auditor"
  validacoes_regex:
    secao_3: "##\s*3\.\s*Findings"
    secao_8: "##\s*8\.\s*Próximo"
    ack_marcado: "-\s*\[\s*x\s*\]\s*\*\*ACK\*\*"
    findings_critico: "\|\s*Crítico\s*\|"
    findings_alto: "\|\s*Alto\s*\|"
  regras_negocio:
    - "Se findings Crítico > 0 → proximo != auditor"
    - "Se especialista == auditor → proximo == null"
    - "Se status == Bloqueado → proximo == null"
    - "Se ack == NACK → bloquear ciclo"
    - "Se ack == CONTRADICAO → ativar Modo 4"
```

---

# Protocolo de Handoff — Especialistas IA
> Bloco obrigatório ao final de qualquer atuação.
> Preencha antes de devolver o controle ao Orchestrator.
> Nunca encerre sem este bloco — handoff incompleto é finding Médio automático.

---

## Handoff: [nome curto da tarefa ou módulo]

**Especialista:** [backend / frontend / security / qa / devops / ui-review / product / auditor]
**Data/Ciclo:** [data ou ID do ciclo de trabalho]
**Status:** [Concluído / Bloqueado / Aguardando decisão / Parcial]

---

## ✅ ACK — Confirmação de Leitura (Obrigatório)

O especialista que RECEBER este handoff deve responder com:

- [ ] **ACK** — Li e entendi todas as seções
- [ ] **NACK** — Não entendi a seção: [qual]
- [ ] **CONTRADIÇÃO** — Conflito detectado com: [qual decisão/contexto]

> Se NACK ou CONTRADIÇÃO → STOP. Não avança. Orchestrator entra em Modo 4.

---

## 1. O que foi feito

- [ ] `[ação realizada]` — `[resultado ou artefato gerado]`
- [ ] `[ação realizada]` — `[resultado ou artefato gerado]`
- [ ] `[descartado: X]` — motivo: `[por que não foi feito]`

---

## 2. Estado atual

- **Funcionando:** `[o que está pronto e validado]`
- **Incompleto:** `[o que foi iniciado mas não finalizado]`
- **Quebrado / Bloqueado:** `[o que não funciona ou impediu avanço]`

---

## 3. Findings em aberto

| Severidade | Título | Impacto | Quem deve resolver |
|---|---|---|---|
| Crítico | `[ ]` | `[ ]` | `[ ]` |
| Alto | `[ ]` | `[ ]` | `[ ]` |
| Médio | `[ ]` | `[ ]` | `[ ]` |
| Baixo | `[ ]` | `[ ]` | `[ ]` |

> Se não há findings: declare explicitamente "Nenhum finding em aberto."
> Silêncio não equivale a ausência de problemas.

---

## 4. Decisões tomadas

| Decisão | Motivo | Trade-off aceito |
|---|---|---|
| `[ ]` | `[ ]` | `[ ]` |
| `[ ]` | `[ ]` | `[ ]` |

---

## 5. O que o próximo especialista precisa saber

- `[informação relevante 1]`
- `[informação relevante 2]`
- `[armadilha ou risco não óbvio]`

---

## 6. Perguntas em aberto

- `[ ]` — responsável: `[especialista ou humano]`
- `[ ]` — responsável: `[especialista ou humano]`

---

## 7. Campos do context.md para atualizar

- `[ campo ]` → `[ novo valor ou informação ]`
- `[ campo ]` → `[ novo valor ou informação ]`

---

## 8. Próximo especialista sugerido

**Próximo:** `[ID do especialista]`
**Instrução de entrada:** `[o que ele deve fazer ao iniciar]`
**Dependência:** `[o que precisa estar resolvido antes de ele começar]`

---

## 9. Artefatos produzidos

| Artefato | Tipo | Localização / Referência |
|---|---|---|
| `[ ]` | `[ ]` | `[ ]` |
| `[ ]` | `[ ]` | `[ ]` |

---

## 🔒 Validação do Handoff

| Check | Status |
|-------|--------|
| Seção 3 (Findings) preenchida? | [ ] Sim / [ ] Não |
| Seção 8 (Próximo) preenchido? | [ ] Sim / [ ] Não |
| ACK/NACK/CONTRADIÇÃO declarado? | [ ] Sim / [ ] Não |
| Context.md atualizado ou listado? | [ ] Sim / [ ] Não |

> **Regra:** Handoff sem findings declarados + próximo especialista definido + ACK válido = handoff inválido.
> O Orchestrator pode rejeitar e solicitar repreenchimento antes de avançar.
