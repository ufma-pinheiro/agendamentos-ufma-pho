# Token Optimizer — Rules para Antigravity (PT-BR · v2.0)
> Cole estas rules em ~/.gemini/antigravity/rules.md junto com o Orchestrator.
> 🔄 Integrado com Orquestrador v3.1 — Executado automaticamente no Gate 0.
> Objetivo: máximo resultado com mínimo consumo de tokens.

---

## INTEGRAÇÃO COM ORQUESTRADOR v3.1 (NOVO)

O Token Optimizer é uma **etapa obrigatória do Gate 0**.
Antes de ativar qualquer especialista, o Orquestrador:
1. Lê este arquivo
2. Aplica as regras abaixo
3. Configura o contexto da sessão para eficiência máxima

> Se o Orquestrador pular esta etapa → finding Médio automático.

---

## REGRAS DE EFICIÊNCIA DE TOKEN

### 1. Nunca varra o projeto inteiro sem ser solicitado
- Antes de ler arquivos, pergunte: "Quais arquivos são relevantes para ESTA tarefa?"
- Leia apenas os arquivos diretamente relacionados ao pedido
- Nunca leia node_modules, dist, .next, coverage, build ou arquivos de lock
- Se precisar entender o projeto, leia PRIMEIRO o `.antigravity/context.md` — não o diretório inteiro

### 2. Planeje antes de executar
- Antes de qualquer tarefa, declare em 2-3 linhas o que vai fazer e quais arquivos vai tocar
- Aguarde confirmação antes de varrer diretórios grandes
- Prefira perguntar "posso focar apenas em X?" a assumir que precisa de tudo

### 3. Uma tarefa de cada vez
- Não resolva problemas que não foram pedidos
- Se encontrar algo errado fora do escopo, registre como observação — não corrija
- Escopo expandido = tokens desperdiçados e contexto poluído

### 4. Respostas proporcionais ao pedido
- Pedido simples → resposta direta, sem introdução, sem resumo final desnecessário
- Pedido complexo → estruturado, mas sem repetir o que já foi dito
- Nunca repita o contexto de volta para o usuário
- Nunca produza código que não foi pedido "por precaução"

### 5. Reutilize contexto já carregado
- Se um arquivo foi lido nesta sessão, não o releia
- Se uma decisão foi tomada, referencie — não reexplique
- Construa sobre o que já existe no contexto em vez de recriar

---

## CAMINHOS DO SISTEMA AUTÔNOMO

Sempre priorize esta ordem de leitura:

1. `.antigravity/context.md` — memória viva do projeto
2. `.antigravity/context.lock` — estado da sessão
3. `.antigravity/spec-index.json` — specs e dependências
4. `specs/spec-ativa.md` — especificação do ciclo atual
5. `.antigravity/handoffs/[CICLO-ID]-[especialista]-handoff.md` — handoffs do ciclo
6. Código-fonte relevante (apontado pelo contexto ou spec)

NUNCA leia o diretório inteiro antes de ler o context.md.

---

## .antigravityignore RECOMENDADO

Crie este arquivo na raiz do projeto (automático no setup):

```
# Dependências
node_modules/
.pnp/
.pnp.js

# Build outputs
dist/
build/
.next/
.nuxt/
out/
.output/

# Testes e coverage
coverage/
.nyc_output/
*.test.ts
*.test.tsx
*.spec.ts
*.spec.tsx
__tests__/
__mocks__/

# Cache e temporários
.cache/
.turbo/
.parcel-cache/
*.tsbuildinfo

# Logs
*.log
logs/
npm-debug.log*

# Ambiente
.env
.env.*
!.env.example

# IDE e OS
.DS_Store
.vscode/
.idea/
Thumbs.db

# Assets pesados
*.png
*.jpg
*.jpeg
*.gif
*.svg
*.ico
*.woff
*.woff2
*.ttf
public/
assets/

# Sistema autônomo (já lido via context.md)
.antigravity/history/
```

---

## ESTRATÉGIA DE MODELO POR TAREFA

Use o modelo certo para cada tipo de tarefa:

| Tarefa | Modelo recomendado | Por quê |
|--------|-------------------|---------|
| Diagnóstico geral, arquitetura, decisões complexas | Gemini 3.1 Pro | Precisa entender contexto amplo |
| Implementação de feature, refatoração | Gemini 3.1 Pro | Qualidade importa |
| Boilerplate, documentação, formatação | Gemini Flash | Rápido e barato |
| Testes unitários simples | Gemini Flash | Tarefa repetitiva |
| Revisão de código pequena | Gemini Flash | Contexto limitado |
| Debug complexo multi-arquivo | Gemini 3.1 Pro | Precisa raciocinar |

> Nota: Se o sistema não detectar o modelo, assuma Gemini 3.1 Pro para segurança.

---

## COMO FORMULAR PROMPTS QUE ECONOMIZAM TOKENS

### ❌ Prompt caro (vago, força varredura)
```
"Melhora o sistema de autenticação"
```
→ A IA vai ler o projeto inteiro para entender o que existe

### ✅ Prompt barato (específico, escopo definido)
```
"No arquivo src/auth/login.ts, o token JWT não está expirando corretamente.
A função validateToken na linha 45 não verifica o campo exp.
Corrija apenas essa função."
```
→ A IA lê 1 arquivo, 1 função, faz 1 mudança

---

### Fórmula de prompt eficiente:
```
[ARQUIVO ou MÓDULO] + [PROBLEMA ESPECÍFICO] + [O QUE FAZER] + [O QUE NÃO TOCAR]
```

Exemplos:
- "Em src/api/orders.ts, adicione validação de campo no endpoint POST /orders. Não altere os outros endpoints."
- "No componente CheckoutForm, o estado de loading não está sendo resetado após erro. Corrija apenas o handler onSubmit."
- "Revisa apenas as funções de permissão em src/lib/auth.ts. Não leia outros arquivos."

---

## SESSÕES INTELIGENTES — COMO ESTRUTURAR O DIA

### Sessão focada (recomendado)
Uma sessão = um problema ou uma feature.
Não misture "melhorar UI" com "corrigir bug de auth" na mesma sessão.
Contexto misturado = tokens desperdiçados + resultados piores.

### Ao iniciar uma sessão nova:
1. Cole o `.antigravity/context.md` atualizado (ou deixe a IA ler sozinha)
2. Descreva APENAS o que quer fazer nesta sessão
3. Referencie arquivos específicos com @arquivo.ts
4. Declare o que está fora do escopo

### Ao encerrar uma sessão:
1. Atualize o `.antigravity/context.md` com decisões tomadas
2. Registre o que ficou pendente
3. Feche a sessão — não arraste contexto antigo

---

## REGRA DO PROMPT ÚNICO

O pedido mal especificado custa muito mais do que o pedido completo:

```
❌ 4 prompts vagos = ~90 créditos
Prompt 1: "Cria página de login"           → 30 créditos
Prompt 2: "Adiciona Google auth também"    → 25 créditos  
Prompt 3: "Adiciona reset de senha"        → 20 créditos
Prompt 4: "Deixa o design mais moderno"    → 15 créditos

✅ 1 prompt completo = ~40 créditos
"Cria página de login com:
- Google auth + email/senha
- Reset de senha
- UI moderna com TailwindCSS e dark mode
- Validação de formulário com mensagens de erro
- Estados de loading
Stack: Next.js + Firebase Auth"
```

**Regra:** pense 2 minutos antes de enviar. Vale muito mais que 4 prompts de correção.

---

## REFERÊNCIA RÁPIDA ANTI-DESPERDÍCIO

| Situação | O que fazer |
|----------|-------------|
| Precisa entender o projeto | Leia o `.antigravity/context.md`, não o diretório |
| Precisa corrigir um bug | Aponte o arquivo e a linha |
| Precisa de nova feature | Use spec.md completo antes |
| Sessão está longa e lenta | Encerre, atualize context.md, abra nova sessão |
| IA está lendo arquivos desnecessários | Diga: "Pare. Leia apenas X e Y." |
| Resposta ficou enorme e desnecessária | Diga: "Responda em no máximo 5 linhas." |
| Contexto está poluído | Nova sessão com context.md atualizado |

---

## MÉTRICAS DE EFICIÊNCIA (NOVO)

O Orquestrador registra automaticamente:

```yaml
metricas_tokens:
  sessao_id: "[ID]"
  tokens_entrada: "[N]"
  tokens_saida: "[N]"
  custo_estimado: "[N créditos]"
  arquivos_lidos: "[N]"
  arquivos_modificados: "[N]"
  eficiencia: "[alta / media / baixa]"
  motivo_baixa_eficiencia: "[se aplicável]"
```

> Se eficiência = baixa por 3 sessões consecutivas → ativar revisão de processo.

---

## Princípio Final

Tokens economizados = tempo economizado = mais features entregues.
Não seja barato por ser barato. Seja eficiente por ser preciso.
