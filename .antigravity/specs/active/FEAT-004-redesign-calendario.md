# FEAT-004: Redesign Premium do Calendário (UX/UI SaaS)

## 1. Visão Geral
Redesenhar completamente a interface do calendário para atingir um nível de qualidade "SaaS Premium" (inspirado em ferramentas como Linear e Cron), focando em escaneabilidade, leveza visual e interatividade moderna.

## 2. Personas e Casos de Uso
- **Dono/Admin**: Gerenciar conflitos visualmente e ajustar horários via drag-and-drop.
- **Editor**: Visualizar rapidamente a ocupação das salas para novos agendamentos.
- **Leitor**: Consultar horários com clareza em dispositivos móveis.

## 3. Especificações de Design (UI)

### 3.1. Grid do Calendário
- **Bordas**: `#E2E8F0` (ultra-suave).
- **Células**: Padding interno aumentado, fundo branco puro.
- **Números de Dias**: Pequenos, canto superior direito, cor `#94A3B8`.

### 3.2. Eventos (Cards)
- **Hierarquia**:
  - `Nome`: Destaque (semibold), cor principal da categoria.
  - `Horário`: Sutil, tamanho reduzido (0.7rem).
  - `Local`: Menor contraste, ícone discreto.
- **Estilo**:
  - Cantos arredondados (8px).
  - Fundo semi-transparente (Alpha 0.15 da cor da categoria).
  - Borda esquerda sólida (4px) com a cor da categoria.
  - Hover: Leve elevação (shadow) e aumento da opacidade do fundo.

### 3.3. Paleta de Cores (Muted)
| Categoria | Background (HEX) | Texto/Borda (HEX) |
|-----------|------------------|-------------------|
| Engenharia | `#F3E8FF` | `#7E22CE` |
| Saúde | `#DCFCE7` | `#166534` |
| Licenciaturas | `#FFEDD5` | `#9A3412` |
| Outros | `#E0F2FE` | `#075985` |

## 4. Funcionalidades de UX (Interatividade)

### 4.1. Gestão de Densidade
- **Regra**: Máximo de 3 eventos visíveis por dia.
- **Overflow**: Link "+X mais" que abre o modal nativo do FullCalendar redesenhado com o novo estilo de cards.

### 4.2. Drag & Drop e Resize
- Habilitar edição direta no calendário (`editable: true`).
- Feedback visual durante o arrasto (ghosting suave).
- **Persistence**: Atualizar o banco de dados via Supabase ao finalizar a interação.

### 4.3. Detecção de Conflitos
- Eventos com `isconflito: true` devem exibir:
  - Uma borda tracejada vermelha pulsante OU
  - Um ícone de exclamação (`!`) no canto superior direito do card.

### 4.4. Tooltips (Hover)
- Exibir minicard ao passar o mouse com:
  - Título completo.
  - Período total.
  - Responsável e contato.

## 5. Responsividade (Mobile)
- Ocultar o grid mensal em telas < 768px.
- Exibir visão de lista cronológica (`listMonth` ou custom layout) com navegação por swipe.

## 6. Restrições Técnicas
- **Tecnologia**: Vanilla JS + CSS Variables + FullCalendar v6.
- **Não usar**: React ou Tailwind (conforme regra de arquitetura do projeto).
- **Performance**: Evitar re-renders desnecessários; usar a API de `eventContent` do FullCalendar para customização.

## 7. Critérios de Aceite
- [ ] Interface visualmente idêntica aos mockups de SaaS premium.
- [ ] Drag-and-drop atualizando o banco de dados com sucesso.
- [ ] Tooltips exibindo informações corretas sem delay.
- [ ] Mobile apresentando lista legível e funcional.
