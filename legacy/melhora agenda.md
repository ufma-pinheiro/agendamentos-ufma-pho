# 🎯 CONTEXTO & OBJETIVO
Atue como Engenheiro de Software Sênior especializado em otimização de código legado, performance frontend e boas práticas de desenvolvimento web. Sua missão é otimizar o sistema atual (arquivos: login.js, app.js, index.html, login.html) criando um branch `preview` separado, garantindo ZERO regressão de funcionalidades existentes. O código atual é extenso e já funciona em produção; o foco é melhorar performance, segurança, legibilidade e manutenibilidade sem alterar comportamentos, fluxos de negócio ou interfaces visuais.

# 📊 ANÁLISE PRÉVIA DO CÓDIGO (Baseado nos arquivos fornecidos)
- `app.js`: ~800+ linhas monolíticas, estado global mutável (`estado`), exposição excessiva via `window.*`, uso de `.innerHTML` com dados dinâmicos, queries Supabase com `.select('*')`, channel de realtime sem `unsubscribe()`, handlers inline e manipulação de DOM em loops.
- `login.js`: Hardcoded de email admin (`tipinheiro@ufma.br`), redirecionamento via `setTimeout` frágil, injeção de HTML para mensagens de erro.
- Estrutura: HTML estável, dependências externas (FullCalendar, Chart.js, XLSX, jsPDF, Flatpickr, SweetAlert2) devem permanecer 100% compatíveis.

# 🚫 RESTRIÇÕES CRÍTICAS (NÃO VIOLAR)
1. NÃO quebre funcionalidades existentes. Todo comportamento atual (agendamento, validação de conflitos, exportação, dashboard, realtime, auth, permissões por role) deve permanecer 100% funcional.
2. NÃO reescreva do zero. Faça otimizações cirúrgicas e incrementais. Se uma mudança exigir refatoração profunda, explique o trade-off e ofereça uma versão "low-risk" primeiro.
3. NÃO altere a estrutura visual/HTML além do necessário para acessibilidade e remoção de inline events.
4. Trabalhe exclusivamente no branch `preview`. Não toque em `main`.
5. Mantenha compatibilidade com todas as bibliotecas atuais e padrões de nomenclatura existentes.

# 🔧 DIRETRIZES DE OTIMIZAÇÃO (FOCO EM ALTO IMPACTO / BAIXO RISCO)
## 1. Performance & DOM
- Substitua `.innerHTML` por `textContent`, `DocumentFragment` ou `DOMPurify` onde houver dados de usuário/eventos.
- Otimize `carregarDadosDaNuvem()`: use projeção explícita de colunas em vez de `.select('*')`.
- Adicione `unsubscribe()` ao channel de realtime para evitar memory leaks em navegações/recarregamentos.
- Use `requestAnimationFrame` para transições visuais e evite layout thrashing em loops de renderização.
- Implemente lazy loading por aba: inicialize FullCalendar, Chart.js e listas apenas quando a aba for ativada.

## 2. Segurança & Boas Práticas
- Remova o fallback hardcoded `tipinheiro@ufma.br`. Substitua por verificação via tabela `usuarios` ou Supabase Auth Metadata.
- Sanitize inputs antes de renderizar ou salvar. Evite injeção acidental de scripts.
- Substitua `onclick` inline por `addEventListener` com event delegation onde aplicável.
- Adicione `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline';">` no `<head>`.

## 3. Arquitetura & Legibilidade (Sem Quebra)
- Isole variáveis globais em um módulo `state.js` ou use Module Pattern. Mantenha `window.*` apenas para bridges necessárias com bibliotecas externas (ex: FullCalendar callbacks).
- Extraia utilitários repetitivos (`debounce`, `setButtonLoading`, `showToast`, `stringToColor`, `ajustarCor`) para `utils.js`.
- Adicione JSDoc e comentários explicativos nas funções críticas.
- Substitua `setTimeout` de redirecionamento por `Promise`/`await` ou navegação baseada em estado.

## 4. Supabase & Banco de Dados
- Use projeção explícita de colunas em todas as queries (`select('id, title, titulopuro, start_time, end_time, espacos, responsavel, contatowhats, contatoemail, color, isconflito, groupid, datacriacao, criadopor')`).
- Adicione tratamento robusto de erros com logging estruturado e rollback de UI em caso de falha.
- Sugira índices e RLS como recomendação, sem alterar schema atual.

# 📦 FORMATO DE SAÍDA ESPERADO
1. **Comando Inicial**: Instruções exatas para criar e checkout no branch `preview` via Git.
2. **Diff Otimizado por Arquivo**: Mostre apenas as alterações necessárias (patch ou antes/depois) com explicações técnicas claras.
3. **Mapa de Dependências**: Como os novos módulos se conectam sem quebrar imports existentes.
4. **Checklist de Validação**: Testes obrigatórios antes do merge (auth, CRUD, realtime, exportação, permissões, mobile, acessibilidade).
5. **Plano de Rollback**: Como reverter rapidamente se algo falhar (ex: `git reset --hard HEAD~1` ou restore de `app.js` original).

# ⚠️ GUARDRAILS ADICIONAIS
- Priorize mudanças que reduzam bundle size, melhorem TTI (Time to Interactive) e eliminem memory leaks.
- Mantenha o código em português onde aplicável, com padrões técnicos internacionais.
- Gere a resposta pronta para aplicação imediata no IDE/CLI.
- Se alguma otimização exigir alteração significativa de arquitetura, explique o impacto e forneça a versão gradual primeiro.

Analise os arquivos fornecidos, identifique os pontos de melhoria de maior impacto e gere o roteiro de otimização seguindo estritamente estas regras. NÃO altere o que já funciona. Foco em performance, segurança e manutenibilidade sustentável.