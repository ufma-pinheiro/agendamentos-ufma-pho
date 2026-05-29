# Handoff: Fase 1 - Product Requirements Document (PRD)

## 1. Objetivo da Fase 1 (Design System shadcn-style)
A Fase 1 visa modernizar a base visual do sistema de agendamentos implementando um design system estruturado nos moldes do *shadcn/ui*, utilizando apenas CSS puro (sem dependências React). O foco está em cores, tokens, sombras e padronização de componentes reutilizáveis, garantindo que as lógicas de JavaScript permaneçam 100% inalteradas.

## 2. Requisitos e Escopo
- **`css/tokens.css`**: Deve ser criado e incluído antes do `style.css`.
  - Definir paleta global em formato `oklch` (background, foreground, card, muted, border, ring, etc.).
  - Definir cores acadêmicas `campus-eng` (roxo), `campus-lic` (âmbar), `campus-sau` (esmeralda).
  - Incluir tokens semânticos e estados de destruição (`destructive`, `success`, `warning`).
  - Suportar modo dark dinamicamente (`[data-theme="dark"]`).
- **`style.css`**: Refatorar para utilizar as novas variáveis CSS (`var(--...)`). Nenhum seletor CSS existente (ID ou classe acoplada ao JS) pode ser modificado. Remover dependências das cores antigas (`--ufma-blue`, etc.).
- **`css/components.css`**: Criar com componentes visuais reusáveis.
  - Botões (`.btn`, `.btn-primary`, `.btn-destructive`, `.btn-outline`, `.btn-ghost`).
  - Badges (`.badge` + modifiers).
  - Containers de layout (`.card`, `.card-header`, `.card-content`, `.card-footer`).
  - `.skeleton` para carregamento e `.separator`.
- **Tipografia**: Uso consistente da fonte Inter com hierarquia definida.
- **Risco**: Baixo (Zero interferência no JS e lógicas de negócios).

## 3. Findings
- [INFO] A inclusão de novos arquivos CSS (`tokens.css` e `components.css`) requer atualização nas tags `<link>` de `index.html` e `login.html`.
- [INFO] Será necessário cuidado ao mapear os tons do shadcn padrão para as necessidades de alto contraste da universidade.

## 8. Próximo
**Próximo:** ui-review
- [ ] **ACK** — Li e compreendi o PRD. Procederei com a elaboração dos tokens visuais em formato `oklch`.
