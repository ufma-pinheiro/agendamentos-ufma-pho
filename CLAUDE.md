# CLAUDE.md — ECC + RTK + Graphify Stack

> **Versão:** 1.0  
> **Stack:** Everything Claude Code (ECC) + Redux Toolkit (RTK) + Graphify  
> **Uso:** Cole este arquivo na raiz do projeto ou em `~/.claude/CLAUDE.md` para instruções de contexto persistente.

---

## 1. Visão Geral da Stack

Esta stack combina três camadas para maximizar produtividade e minimizar consumo de tokens no Claude Code:

| Camada | Ferramenta | Função |
|--------|-----------|--------|
| **Orquestração** | ECC (Everything Claude Code) | Sistema de agents, skills, hooks e regras de segurança |
| **Estado** | RTK (Redux Toolkit) | Gerenciamento de estado global com slices, thunks e RTK Query |
| **Contexto** | Graphify | Knowledge graph da codebase para navegação eficiente sem carregar arquivos inteiros |

---

## 2. Princípios de Interação

### 2.1 Antes de qualquer ação
- Sempre verifique se existe um `graphify.json` ou `.graphify/` na raiz do projeto.
- Se existir, consulte o knowledge graph antes de sugerir refatorações ou novas features.
- Se não existir, ofereça-se para gerar um com `/graphify init`.

### 2.2 Ao trabalhar com RTK
- Prefira **slices** com `createSlice` ao invés de reducers manuais.
- Use `createAsyncThunk` para operações assíncronas.
- Use `RTK Query` para APIs REST/GraphQL — evite `useEffect` + `fetch` manual.
- Mantenha a lógica de estado no slice, não nos componentes.
- Siga a estrutura de pastas: `features/{domain}/{domain}Slice.ts`.

### 2.3 Ao usar ECC
- Respeite o perfil de hooks configurado (`ECC_HOOK_PROFILE=minimal`).
- Não declare hooks duplicados no `plugin.json` — use apenas os do ECC.
- Skills ECC ativas: `typescript`, `react`, `redux-patterns`, `security-audit`.
- Se um comando falhar por hook conflitante, desative-o via `ECC_DISABLED_HOOKS`.

### 2.4 Economia de Tokens (Graphify + Caveman)
- Quando o usuário pedir para "entender" ou "navegar" em um módulo grande, use o knowledge graph do Graphify em vez de ler todos os arquivos.
- Respostas devem ser diretas. Evite preâmbulos como "Claro, posso ajudar com isso!" ou "Vamos lá!".
- Use bullet points e tabelas para resumir informações complexas.
- Código > explicação. Mostre o código primeiro, explique depois se necessário.

---

## 3. Estrutura de Pastas Recomendada

```
project-root/
├── .claude/
│   └── CLAUDE.md              # este arquivo
├── .graphify/
│   └── graph.json             # knowledge graph gerado
├── src/
│   ├── app/
│   │   ├── store.ts           # configureStore com middleware RTK
│   │   └── hooks.ts           # useAppDispatch, useAppSelector tipados
│   ├── features/
│   │   ├── auth/
│   │   │   ├── authSlice.ts
│   │   │   ├── authThunks.ts
│   │   │   └── authApi.ts     # RTK Query endpoints
│   │   └── user/
│   │       ├── userSlice.ts
│   │       └── userApi.ts
│   ├── components/
│   └── utils/
├── ecc.config.js              # configuração do ECC (se aplicável)
└── claude-plugin.json         # manifesto do plugin ECC
```

---

## 4. Regras de Código RTK

### 4.1 Slices
```typescript
// ✅ Correto: slice com createSlice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = 'succeeded';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

### 4.2 RTK Query
```typescript
// ✅ Correto: API central com injectEndpoints
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['User', 'Post'],
  endpoints: () => ({}), // endpoints injetados por feature
});
```

### 4.3 Hooks Tipados
```typescript
// ✅ Correto: hooks tipados no app/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

### 4.4 Anti-padrões (nunca faça)
- ❌ Mutar state diretamente fora de um slice RTK.
- ❌ Usar `any` em actions ou state.
- ❌ Criar stores múltiplas. Use uma única `configureStore`.
- ❌ Colocar lógica de negócio em componentes quando pode estar em thunks.
- ❌ Usar `useEffect` para fetch quando `useQuery` ou `useMutation` estão disponíveis.

---

## 5. Workflows Comuns

### 5.1 Onboarding em Projeto Existente
1. Rode `/graphify init` para indexar a codebase.
2. Consulte o graph para identificar slices, APIs e dependências.
3. Verifique `src/app/store.ts` para entender o estado global.
4. Mapeie features ativas antes de propor mudanças.

### 5.2 Adicionar Nova Feature
1. Crie a pasta em `src/features/{feature}/`.
2. Crie o slice com `createSlice`.
3. Se houver API, crie endpoints com `injectEndpoints`.
4. Registre o reducer em `store.ts`.
5. Atualize o Graphify: `/graphify update`.

### 5.3 Refatoração de Estado
1. Use o knowledge graph para encontrar todos os consumidores do slice.
2. Verifique se há thunks dependentes.
3. Refatore mantendo a interface pública do slice (actions/exportados).
4. Atualize testes e graph.

### 5.4 Debug de Erro RTK
1. Verifique se o reducer está registrado no `store.ts`.
2. Confirme se os hooks tipados estão sendo usados.
3. Verifique `extraReducers` para matchers de thunks.
4. Use o ECC `security-audit` skill para verificar leaks de estado.

---

## 6. Comandos do Graphify (referência rápida)

| Comando | Descrição |
|---------|-----------|
| `/graphify init` | Indexa a codebase e gera o knowledge graph |
| `/graphify update` | Atualiza o graph após mudanças significativas |
| `/graphify query <termo>` | Busca entidades relacionadas no graph |
| `/graphify deps <arquivo>` | Mostra dependências upstream/downstream |
| `/graphify stats` | Exibe métricas de compressão de contexto |

---

## 7. Configuração ECC Recomendada

```bash
# .env ou export no shell
ECC_HOOK_PROFILE=minimal
ECC_DISABLED_HOOKS=post-edit-format,post-edit-typecheck
ECC_SKILLS_ACTIVE=typescript,react,redux-patterns,security-audit
ECC_AGENT_MODE=developer
```

---

## 8. Checklist de Qualidade

Antes de finalizar qualquer task, verifique:

- [ ] O código segue a estrutura `features/{domain}/`?
- [ ] Os hooks `useAppDispatch` / `useAppSelector` foram usados?
- [ ] O reducer foi registrado em `store.ts`?
- [ ] RTK Query endpoints usam `tagTypes` para cache invalidation?
- [ ] Não há `any` tipado no novo código?
- [ ] O Graphify foi atualizado se a estrutura mudou?
- [ ] Nenhum hook ECC está conflitando?

---

## 9. Notas de Segurança

- Nunca exponha secrets, tokens ou credenciais de API em slices ou thunks.
- Use variáveis de ambiente (`import.meta.env.VITE_API_URL`) para URLs e keys.
- O ECC `security-audit` skill deve ser acionado antes de commits em código de auth.
- Valide inputs em thunks antes de dispatch — RTK não faz validação automática de payload.

---

*Gerado para uso no Claude Code. Atualize conforme a evolução do projeto.*
