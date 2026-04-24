# Spec: Redesign do Painel de Últimos Registros (FEAT-005)

## 1. Problema
A seção "Últimos Registros" abaixo do calendário apresenta cards excessivamente simples, desalinhados com a estética "Premium SaaS" do restante do sistema (conforme visto em "Meus Eventos" e "Resumo Mensal").

## 2. Objetivo
Redesenhar os cards da seção para incluírem:
- Box de data estilizado (dia/mês).
- Tags de local (mini badges coloridos).
- Hierarquia tipográfica clara.
- Feedback visual de hover consistente.

## 3. Requisitos de UI (Frontend/UI-Review)
- **Card**: Deve ser uma versão compacta do `event-row`.
- **Data Box**: Tamanho reduzido (ex: 45x45px).
- **Meta-informação**: Ícones de relógio e usuário em escala menor.
- **Espaçamento**: Otimizado para o container colapsável.

## 4. Mudanças Técnicas
### `app.js`
- Modificar `atualizarUltimosEventos()` para:
    - Buscar os últimos 10 registros (em vez de 5) para dar mais profundidade.
    - Renderizar o HTML utilizando a estrutura de data box e tags de local.
    - Reutilizar a lógica de `getClasseBadge(e)` para cores consistentes.

### `style.css`
- Definir estilos para `.event-mini-card`:
    - Layout flexbox.
    - Transição de hover (translateY + shadow).
    - Estilo específico para o conteúdo interno.
- Ajustar `.recent-strip-content` para suportar o novo layout.

## 5. Critérios de Aceite
- [ ] Cards exibem dia/mês em um box colorido.
- [ ] Locais aparecem como badges coloridos.
- [ ] O clique no card abre o modal de detalhes corretamente.
- [ ] O layout permanece responsivo e não quebra a faixa inferior do calendário.
