# Protocolo de Handoff — Especialistas IA
&gt; Bloco obrigatório ao final de qualquer atuação.
&gt; Preencha antes de devolver o controle ao Orchestrator.
&gt; Nunca encerre sem este bloco — handoff incompleto é finding Médio automático.

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

&gt; Se NACK ou CONTRADIÇÃO → STOP. Não avança. Orchestrator entra em Modo 4.

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

| Severidade | Título | Impacto | Quem deve resolver |
|---|---|---|---|
| Crítico | `[ ]` | `[ ]` | `[ ]` |
| Alto | `[ ]` | `[ ]` | `[ ]` |
| Médio | `[ ]` | `[ ]` | `[ ]` |
| Baixo | `[ ]` | `[ ]` | `[ ]` |

&gt; Se não há findings: declare explicitamente "Nenhum finding em aberto."
&gt; Silêncio não equivale a ausência de problemas.

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

---

## 9. Artefatos produzidos

Arquivos, endpoints, schemas, componentes, testes ou qualquer saída concreta desta atuação.

| Artefato | Tipo | Localização / Referência |
|---|---|---|
| `[ ]` | `[ ]` | `[ ]` |
| `[ ]` | `[ ]` | `[ ]` |

---

## 🔒 Validação do Handoff

| Check | Status |
|-------|--------|
| Seção 3 (Findings) preenchida? | [ ] Sim / [ ] Não |
| Seção 8 (Próximo) preenchida? | [ ] Sim / [ ] Não |
| ACK/NACK/CONTRADIÇÃO declarado? | [ ] Sim / [ ] Não |
| Context.md atualizado ou listado? | [ ] Sim / [ ] Não |

**Regra:** Handoff sem findings declarados + próximo especialista definido + ACK válido = handoff inválido.
 O Orchestrator pode rejeitar e solicitar repreenchimento antes de avançar.