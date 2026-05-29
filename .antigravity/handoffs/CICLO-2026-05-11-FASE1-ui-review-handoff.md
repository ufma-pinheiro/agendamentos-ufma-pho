# Handoff: Fase 1 - UI Review (Design System Base)

## 1. O que foi feito (UI-Review)
- Criado o arquivo `css/tokens.css`.
- Definida a paleta de cores principal em sintaxe `oklch` com variáveis seguindo o padrão shadcn (`--background`, `--foreground`, `--primary`, `--muted`, etc).
- Definidos os tokens dos campi (`--campus-eng`, `--campus-lic`, `--campus-sau`).
- Definidas as variáveis de sombras (`--shadow-sm/md/lg`), tipografia (`--font-sans`) e raios de borda (`--radius`).
- Implementada as sobreposições dinâmicas para modo escuro em `[data-theme="dark"]`.

## 2. Instruções para o Frontend
A base visual está pronta. Agora, o Frontend precisa:
1. Incluir `<link rel="stylesheet" href="css/tokens.css">` no `index.html` e `login.html` antes do `style.css`.
2. Incluir `<link rel="stylesheet" href="css/components.css">` no `index.html` e `login.html`.
3. Criar o arquivo `css/components.css` e estruturar as classes base (`.btn`, `.card`, `.badge`, `.skeleton`, etc.) usando as variáveis do `tokens.css`.
4. Varrer o arquivo `style.css` substituindo TODAS as cores fixas e hexadecimais pelas novas variáveis de tokens `oklch(var(--...))`.
5. Substituir as famílias de fonte (`'Plus Jakarta Sans'`, etc) por `var(--font-sans)`.
6. Garantir que não existam seletores quebrados.

## 3. Findings
- [INFO] A conversão para `oklch` fornece consistência perceptiva superior. Em `style.css`, as chamadas de cor agora serão no formato `oklch(var(--primary))` ou, caso tenha alpha, `oklch(var(--primary) / 0.5)`. *(Nota: no token CSS deixamos apenas os valores brutos para facilitar opacidade, se necessário, ou usar direto se for suportado pelas novas especificações).*
- [WARNING] O shadcn exporta variáveis puras sem `oklch()` (ex: `45% 0.15 260`), portanto no CSS deve-se usar `background: oklch(var(--primary));`.

## 8. Próximo
**Próximo:** frontend
- [ ] **ACK** — Li e compreendi o handoff. Inicializarei a aplicação do CSS.
