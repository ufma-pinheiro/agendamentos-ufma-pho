# Fase 1 — Scaffold Vite + Dependências npm

**Status:** `[x] Concluído`
**Objetivo:** Migrar todas as dependências de CDN para npm com Vite como bundler, sem alterar nenhuma lógica da aplicação.

---

## Plano 1.1 — Inicializar Vite e instalar dependências

```yaml
wave: 1
depends_on: []
files_modified:
  - package.json
  - vite.config.js
autonomous: true
```

### Contexto
O projeto atual usa `npx serve` como dev server e carrega todas as bibliotecas via tags `<script src="cdn...">` no `index.html`. A migração para Vite resolve o controle de versões, habilita HMR e permite tree-shaking no build de produção.

### Tarefas

#### Tarefa 1.1.1 — Atualizar `package.json` com dependências npm

```xml
<task id="1.1.1" type="execute">
  <title>Atualizar package.json com todas as dependências</title>

  <read_first>
    - package.json (estado atual — ver versões e scripts existentes)
    - index.html (linhas 13-40 — mapear todos os CDNs a substituir)
  </read_first>

  <action>
Substituir o conteúdo de package.json pelo seguinte (manter "name", "description", "repository", etc. do original):

```json
{
  "name": "em-dev-agendamentos-main",
  "version": "1.0.0",
  "description": "Sistema de Agendamentos UFMA Pinheiro",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.49.4",
    "@fullcalendar/core": "^6.1.11",
    "@fullcalendar/daygrid": "^6.1.11",
    "@fullcalendar/timegrid": "^6.1.11",
    "@fullcalendar/list": "^6.1.11",
    "@fullcalendar/interaction": "^6.1.11",
    "@fullcalendar/multimonth": "^6.1.11",
    "chart.js": "^4.4.9",
    "sweetalert2": "^11.17.2",
    "flatpickr": "^4.6.13",
    "@popperjs/core": "^2.11.8",
    "tippy.js": "^6.3.7",
    "xlsx": "^0.18.5",
    "jspdf": "^2.5.2",
    "jspdf-autotable": "^3.8.5"
  },
  "devDependencies": {
    "vite": "^6.3.5"
  }
}
```
  </action>

  <acceptance_criteria>
    - package.json contém `"vite": "^6.3.5"` em devDependencies
    - package.json contém `"@fullcalendar/core"` em dependencies
    - package.json contém `"@supabase/supabase-js"` em dependencies
    - package.json contém `"sweetalert2"` em dependencies
    - script "dev" é `"vite"` e script "build" é `"vite build"`
  </acceptance_criteria>
</task>
```

#### Tarefa 1.1.2 — Criar `vite.config.js`

```xml
<task id="1.1.2" type="execute" depends_on="1.1.1">
  <title>Criar vite.config.js</title>

  <read_first>
    - package.json (confirmar type: "module")
  </read_first>

  <action>
Criar o arquivo `vite.config.js` na raiz do projeto com o seguinte conteúdo:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // Raiz do projeto é a pasta raiz (onde está index.html)
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        login: 'login.html',
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
```
  </action>

  <acceptance_criteria>
    - Arquivo `vite.config.js` existe na raiz do projeto
    - Contém `outDir: 'dist'`
    - Contém entradas `main: 'index.html'` e `login: 'login.html'`
    - Contém `port: 3000`
  </acceptance_criteria>
</task>
```

#### Tarefa 1.1.3 — Instalar dependências com npm

```xml
<task id="1.1.3" type="execute" depends_on="1.1.2">
  <title>Executar npm install</title>

  <read_first>
    - package.json (confirmar que está correto antes de instalar)
  </read_first>

  <action>
Executar na raiz do projeto:

```bash
npm install
```

Verificar que `node_modules/` foi criado e que as seguintes pastas existem dentro dele:
- `node_modules/vite/`
- `node_modules/@fullcalendar/core/`
- `node_modules/@supabase/supabase-js/`
- `node_modules/sweetalert2/`
- `node_modules/chart.js/`
  </action>

  <acceptance_criteria>
    - `node_modules/` existe na raiz
    - `node_modules/vite/package.json` existe
    - `node_modules/@fullcalendar/core/package.json` existe
    - `node_modules/@supabase/supabase-js/package.json` existe
    - `package-lock.json` gerado na raiz
  </acceptance_criteria>
</task>
```

---

## Plano 1.2 — Atualizar index.html e supabaseClient.js para imports locais

```yaml
wave: 2
depends_on: [1.1]
files_modified:
  - index.html
  - login.html
  - supabaseClient.js
  - .gitignore
autonomous: true
```

### Tarefas

#### Tarefa 1.2.1 — Remover CDNs e atualizar imports do index.html

```xml
<task id="1.2.1" type="execute">
  <title>Substituir tags CDN por imports locais no index.html</title>

  <read_first>
    - index.html (linhas 1-45 — ver todos os scripts/links CDN)
    - index.html (linha 844 — ver script type="module" src="app.js")
  </read_first>

  <action>
No `index.html`:

1. REMOVER as seguintes tags do `<head>` (linhas 24-38):
   - `<script src='https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js'>`
   - `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">`
   - `<script src="https://cdn.jsdelivr.net/npm/flatpickr">`
   - `<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/pt.js">`
   - `<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11">`
   - `<script src="https://cdn.jsdelivr.net/npm/chart.js">`
   - `<script src="https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js">`
   - `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js">`
   - `<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js">`
   - `<script src="https://unpkg.com/@popperjs/core@2">`
   - `<script src="https://unpkg.com/tippy.js@6">`
   - `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/dist/tippy.css" />`
   - `<link rel="stylesheet" href="https://unpkg.com/tippy.js@6/themes/light-border.css" />`
   - `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">`

2. MANTER a tag de fontes do Google Fonts (preconnect + link de fontes) — essas continuam externas.

3. MANTER `<link rel="stylesheet" href="style.css">`.

4. O `<script type="module" src="app.js">` no final do body permanece igual — o Vite vai processar esse ponto de entrada.

5. ATUALIZAR a meta CSP (linha 8-9) para remover domínios de CDN desnecessários. Nova CSP:
```html
<meta http-equiv="Content-Security-Policy"
    content="default-src 'self'; script-src 'self' 'unsafe-inline' https://vercel.live; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' wss://ibukwhlxefiyqalrooam.supabase.co https://ibukwhlxefiyqalrooam.supabase.co; img-src 'self' data: https://vercel.live; frame-src https://vercel.live">
```
  </action>

  <acceptance_criteria>
    - index.html NÃO contém nenhuma referência a `cdn.jsdelivr.net`
    - index.html NÃO contém nenhuma referência a `cdnjs.cloudflare.com`
    - index.html NÃO contém nenhuma referência a `unpkg.com`
    - index.html CONTÉM `<link rel="stylesheet" href="style.css">`
    - index.html CONTÉM `<script type="module" src="app.js">`
    - index.html CONTÉM referências ao Google Fonts
    - meta CSP atualizada sem referências a CDNs de bibliotecas
  </acceptance_criteria>
</task>
```

#### Tarefa 1.2.2 — Atualizar supabaseClient.js para usar import npm

```xml
<task id="1.2.2" type="execute">
  <title>Atualizar supabaseClient.js para import npm</title>

  <read_first>
    - supabaseClient.js (ver import atual via esm.sh)
  </read_first>

  <action>
Substituir o conteúdo de `supabaseClient.js` por:

```js
// supabaseClient.js - Módulo centralizado do Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ibukwhlxefiyqalrooam.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlidWt3aGx4ZWZpeXFhbHJvb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODk1MDAsImV4cCI6MjA5MTI2NTUwMH0.8OZWvgn9GaNbzIT45frG1SGFPhsZk36vUVDdTgdbekw'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

A única mudança é na linha de import: de `'https://esm.sh/@supabase/supabase-js@2'` para `'@supabase/supabase-js'`.
  </action>

  <acceptance_criteria>
    - supabaseClient.js contém `from '@supabase/supabase-js'`
    - supabaseClient.js NÃO contém `esm.sh`
    - supabaseClient.js exporta `supabase` normalmente
  </acceptance_criteria>
</task>
```

#### Tarefa 1.2.3 — Atualizar imports de bibliotecas em todos os módulos JS

```xml
<task id="1.2.3" type="execute">
  <title>Atualizar imports de bibliotecas nos módulos js/</title>

  <read_first>
    - js/calendar.js (verificar imports de FullCalendar)
    - js/utils.js (verificar imports de bibliotecas)
    - js/reservas.js (verificar imports de Flatpickr, SweetAlert2)
    - js/dashboard.js (verificar imports de Chart.js)
    - js/notifications.js
    - app.js (verificar todos os imports no topo)
  </read_first>

  <action>
Verificar e atualizar os imports nos módulos JS para usar os pacotes npm.

Em `js/calendar.js`, substituir qualquer import do FullCalendar vindo de CDN/URL por:
```js
import { Calendar } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import 'flatpickr/dist/flatpickr.min.css'
import { Portuguese } from 'flatpickr/dist/l10n/pt.js'
```

Em `js/reservas.js` ou onde Flatpickr e SweetAlert2 forem usados como globais (carregados via CDN antes), adicionar imports explícitos:
```js
import flatpickr from 'flatpickr'
import { Portuguese } from 'flatpickr/dist/l10n/pt.js'
import Swal from 'sweetalert2'
```

Em `js/dashboard.js`, adicionar:
```js
import Chart from 'chart.js/auto'
```

Em `js/utils.js` ou onde XLSX/jsPDF forem usados, adicionar:
```js
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
```

Em `js/components.js` ou onde tippy.js for usado:
```js
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light-border.css'
```

Remover qualquer acesso via `window.Swal`, `window.flatpickr`, etc. — usar a variável importada diretamente.
  </action>

  <acceptance_criteria>
    - Nenhum arquivo em `js/` acessa `window.Swal` ou `window.flatpickr` ou `window.Chart`
    - `js/calendar.js` contém `import { Calendar } from '@fullcalendar/core'`
    - `js/dashboard.js` contém `import Chart from 'chart.js/auto'`
    - `app.js` não referencia nenhum global de CDN
  </acceptance_criteria>
</task>
```

#### Tarefa 1.2.4 — Atualizar .gitignore

```xml
<task id="1.2.4" type="execute">
  <title>Atualizar .gitignore para ignorar node_modules e dist</title>

  <read_first>
    - .gitignore (verificar se existe e o que já está listado)
  </read_first>

  <action>
Criar ou atualizar `.gitignore` na raiz do projeto para incluir:

```
# Dependências
node_modules/

# Build de produção
dist/

# Variáveis de ambiente locais
.env
.env.local

# Logs
npm-debug.log*

# Editor
.vscode/
.idea/
```

Se o arquivo já existir, apenas adicionar as linhas ausentes sem remover as existentes.
  </action>

  <acceptance_criteria>
    - .gitignore contém `node_modules/`
    - .gitignore contém `dist/`
    - .gitignore contém `.env`
  </acceptance_criteria>
</task>
```

---

## Plano 1.3 — Validação: Dev Server e Build de Produção

```yaml
wave: 3
depends_on: [1.1, 1.2]
files_modified: []
autonomous: true
```

### Tarefas

#### Tarefa 1.3.1 — Validar dev server

```xml
<task id="1.3.1" type="execute">
  <title>Iniciar dev server e verificar que o app funciona</title>

  <read_first>
    - vite.config.js
    - package.json (confirmar script "dev": "vite")
  </read_first>

  <action>
Executar:
```bash
npm run dev
```

Verificar no terminal:
- Saída contém `Local:   http://localhost:3000/`
- Sem erros de módulo não encontrado
- Sem erros de `Failed to resolve import`

Abrir o browser em `http://localhost:3000` e confirmar:
- A tela de login carrega
- O calendário abre após autenticação
- Console do browser sem erros de `undefined` globais (Swal, flatpickr, Chart, etc.)
  </action>

  <acceptance_criteria>
    - `npm run dev` executa sem erros fatais no terminal
    - Terminal exibe `Local: http://localhost:3000/`
    - Browser exibe a interface do sistema sem tela em branco
    - Console do browser sem erros de `ReferenceError` ou `is not defined`
  </acceptance_criteria>
</task>
```

#### Tarefa 1.3.2 — Validar build de produção

```xml
<task id="1.3.2" type="execute" depends_on="1.3.1">
  <title>Gerar build de produção e validar</title>

  <read_first>
    - vite.config.js (confirmar outDir e entradas)
  </read_first>

  <action>
Executar:
```bash
npm run build
```

Verificar:
- Pasta `dist/` criada na raiz
- `dist/index.html` existe
- `dist/login.html` existe (se configurado como entrada)
- Sem erros de build no terminal (warnings são aceitáveis)

Opcionalmente testar o build local:
```bash
npm run preview
```
  </action>

  <acceptance_criteria>
    - `npm run build` termina com exit code 0
    - `dist/index.html` existe
    - `dist/assets/` existe com arquivos JS e CSS gerados
    - Sem erros do tipo `[vite] build error` no terminal
  </acceptance_criteria>
</task>
```

---

## Critérios de Conclusão da Fase

- [ ] `npm install` executado sem erros
- [ ] `npm run dev` inicia o servidor em `localhost:3000`
- [ ] App abre no browser com todas as funcionalidades operando (calendário, login, modais)
- [ ] Console do browser sem erros de globais não definidos
- [ ] `npm run build` gera `dist/` sem erros
- [ ] `node_modules/` e `dist/` adicionados ao `.gitignore`
- [ ] Nenhuma tag `<script src="cdn...">` restante no HTML

---

## must_haves

1. App abre e funciona após `npm run dev` (sem tela em branco)
2. Build de produção completa sem erros (`npm run build`)
3. Nenhuma biblioteca sendo carregada via CDN externo

---
*Fase: 01-scaffold-vite-npm*
*Plano gerado: 2026-05-02*
