# 📋 Contexto do Projeto — Fonte da Verdade Autônoma
> ⚠️ Este arquivo é LIDO e ESCRITO automaticamente pela IA.
> NUNCA edite manualmente. Use o Orchestrator para solicitar mudanças.
> Versão gerenciada por: `.antigravity/context.lock`
> 🔄 Integrado com Orquestrador v3.1 + Handoff Template v2.0

---
meta:
  versao: "1.0.0"
  ultima_atualizacao: "YYYY-MM-DDTHH:MM:SSZ"
  atualizado_por: "[ID do especialista]"
  ciclo_atual: "[ID do ciclo]"
  sessao_ativa: null
  checksum: "sha256:..."
---

> 📌 NOTA SOBRE `sessao_ativa` (C-01):
> - `null` = Nenhum ciclo ativo. Orquestrador iniciará Gate 0 normalmente.
> - `true` = Ciclo em andamento. Orquestrador ativará Modo 6 (Recuperação de Falha).
> - `false` = Ciclo encerrado. Orquestrador iniciará novo ciclo.
> NUNCA deixe como `false` no template — isso confundiria a lógica de recuperação.

---

## 1️⃣ Identidade e Propósito
- Nome do Produto: `[ ]`
- Proposta de Valor (1 frase): `[ ]`
- Fase Atual: `[Conceito / MVP / Desenvolvimento / Produção / Refatoração]`
- Tipo de Sistema: `[SaaS / Marketplace / Ferramenta Interna / App / API-Only / E-commerce / Outro]`

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
- Frontend: `[ ]`
- Backend: `[ ]`
- Banco de Dados: `[ ]`
- Infra / Deploy: `[ ]`
- Estilo de API: `[REST / GraphQL / tRPC / gRPC / WebSocket / Outro]`
- Autenticação / Autorização: `[ ]`
- Gerenciamento de Estado / Cache: `[ ]`
- Dependências Críticas ou Lock de Stack: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 6️⃣ Ambientes e Secrets
- Ambientes ativos: `[local / staging / prod]`
- Diferenças entre ambientes: `[ ]`
- Estratégia de secrets: `[ ]`
- URLs de referência: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 7️⃣ Integrações e Dependências Externas (C-02)

> 📝 Dono desta seção: `devops-specialist` (infra/ambiente) + `backend-specialist` (APIs/contratos)
> Ambos podem escrever. Em caso de conflito, DevOps decide infra, Backend decide contratos.

- Integrações ativas: `[ ]`
- SLAs ou limites conhecidos: `[ ]`
- Fallback se integração cair: `[ ]`
- Dependências críticas: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 8️⃣ Restrições e Regras
- Equipe e Recursos: `[ ]`
- Prazos ou Marcos: `[ ]`
- Compliance / Privacidade: `[LGPD / GDPR / HIPAA / SOC2 / Nenhum / Em definição]`
- Limites Técnicos ou de Negócio: `[ ]`

### 🛡️ Regra de Ouro do Fluxo (Anti-Regressão)
- **Gate do Auditor:** Nenhuma entrega é considerada "Pronta" (Done) sem o veredicto APROVADO do Auditor Independente.
- **Ordem de Validação:** A implementação pode ocorrer, mas o Auditor deve atuar **antes** de qualquer Merge em `main` ou Deploy em `produção`.
- **Falha de Processo:** É proibido declarar sucesso apenas com implementação técnica. O sucesso só é declarado após a auditoria final.

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 9️⃣ Contrato de Qualidade
- Cobertura de testes mínima: `[ ]`
- Padrão de code review: `[ ]`
- Tratamento de erros obrigatório: `[ ]`
- Acessibilidade: `[WCAG AA / Ignorar / Somente semântica básica]`
- Internacionalização: `[Não / PT-BR only / i18n preparado]`
- Definição de "Pronto": `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 🔟 Métricas e Sucesso
- Métrica Principal (North Star): `[ ]`
- Indicadores de Saúde Técnica: `[ ]`
- O que NÃO deve acontecer (Anti-Goals): `[ ]`

### 📊 Métricas do Ciclo Atual (NOVO — C-03)

> Preenchido automaticamente pelo Orquestrador ao final de cada ciclo.

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
    pode_mudar: [true / false]
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
  id: "[ID]"
  iniciado_por: "[humano / IA]"
  objetivo: "[texto]"
  especialistas_envolvidos:
    - [especialista]: "[status]"
  bloqueios_ativos:
    - tipo: "[dependencia / gate / humano]"
      de: "[quem]"
      para: "[quem]"
      motivo: "[texto]"
  proximos_passos:
    - "[ação]"

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

- Estrutura de Pastas Detectada: `[ ]`
- Contratos / Endpoints Identificados: `[ ]`
- Modelo de Dados / Schema Inferido: `[ ]`
- Riscos Imediatos Observados: `[ ]`
- Padrões, Dependências ou Locks de Stack: `[ ]`
- Estado do CI/CD e Testes: `[ ]`
- Lacunas de Documentação ou Contexto Faltante: `[ ]`

> 🔄 [AUTO] Atualizado por: [especialista] | [data] | motivo: [texto]

---

## 🔄 Histórico de Decisões e Atualizações

| Data | Especialista | O que mudou | Motivo / Trade-off | Gate Validado? |
|------|-------------|-------------|-------------------|----------------|
|      |             |             |                   |                |

---

## ✅ Checklist de Validação (Orchestrator)

- [ ] `context.md` está legível, versionado e atualizado
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
