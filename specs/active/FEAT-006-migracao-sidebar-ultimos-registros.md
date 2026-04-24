# Spec: Migração de Últimos Registros para Sidebar (FEAT-006)

## 1. Problema
A visualização de "Últimos Registros" como uma faixa colapsável abaixo do calendário (Recent Strip) limita o espaço disponível para o calendário e dificulta a navegação em telas menores. Além disso, limita a quantidade de registros visíveis.

## 2. Objetivo
Mover a funcionalidade para uma aba dedicada na Sidebar, integrando-a ao fluxo principal de navegação do sistema.

## 3. Requisitos de UI
- **Sidebar**: Adicionar botão "Últimos Registros" entre "Calendário" e "Resumo Mensal".
- **Container**: Criar `#abaUltimosRegistros` seguindo o layout de `tab-content`.
- **Header**: Título "Últimos Registros" com badge de contagem (opcional).
- **Lista**: Listagem vertical de `event-row` (padrão já estabelecido em FEAT-005).

## 4. Mudanças Técnicas
### `index.html`
- [ ] Adicionar `<button class="nav-item">` na Sidebar section "Principal".
- [ ] Remover `<div class="recent-strip">` de `#abaCalendario`.
- [ ] Criar `<div id="abaUltimosRegistros" class="tab-content">`.

### `app.js`
- [ ] Atualizar `switchTab` para suportar o novo título de página.
- [ ] Modificar `atualizarUltimosEventos()`:
    - Aumentar limite de registros de 10 para 30 ou 50.
    - Garantir que a renderização use o container correto.
- [ ] Garantir que `atualizarTodasTelas()` chame a atualização da nova aba.

### `style.css`
- [ ] Limpar estilos órfãos de `.recent-strip` (se não houver outros usos).
- [ ] Ajustar espaçamento da nova aba para ser consistente com "Meus Eventos".

## 5. Critérios de Aceite
- [ ] O item aparece na Sidebar e troca corretamente para a aba.
- [ ] O calendário ganha mais espaço vertical (sem a faixa inferior).
- [ ] A listagem exibe registros recentes com o padrão `event-row`.
- [ ] O clique nos cards continua abrindo o modal de detalhes.
