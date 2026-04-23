# Especificação de Design: Redesign Premium Calendário (FEAT-004)

Esta especificação define os padrões visuais e de interação para a implementação do novo calendário.

## 1. Design Tokens (Variáveis CSS)

Adicionar ao `:root` ou bloco específico de calendário:

```css
:root {
    /* Paleta Muted Premium */
    --cal-eng-bg: rgba(126, 34, 206, 0.08);
    --cal-eng-text: #7E22CE;
    --cal-eng-border: #D8B4FE;

    --cal-sau-bg: rgba(22, 163, 74, 0.08);
    --cal-sau-text: #166534;
    --cal-sau-border: #86EFAC;

    --cal-lic-bg: rgba(234, 88, 12, 0.08);
    --cal-lic-text: #9A3412;
    --cal-lic-border: #FDBA74;

    --cal-other-bg: rgba(37, 99, 235, 0.08);
    --cal-other-text: #075985;
    --cal-other-border: #93C5FD;

    /* Grid Tokens */
    --cal-grid-border: rgba(226, 232, 240, 0.6);
}
```

## 2. Anatomia do Card de Evento

O `eventContent` deve retornar o seguinte HTML estruturado:

```html
<div class="cal-event-card">
    <div class="cal-event-top">
        <span class="cal-event-time">08h</span>
        <div class="cal-event-indicators">
            <!-- Ícone de conflito se isconflito=true -->
        </div>
    </div>
    <div class="cal-event-title">Nome do Agendamento</div>
    <div class="cal-event-room">Auditório Central</div>
</div>
```

**Estilização Recomendada:**
- `.cal-event-card`: Padding 4px 8px, border-radius 6px, border-left 3px solid.
- `.cal-event-title`: Font-size 0.75rem, font-weight 600, line-clamp 1.
- `.cal-event-time`: Font-size 0.65rem, opacity 0.7.
- `.cal-event-room`: Font-size 0.65rem, opacity 0.6.

## 3. Tooltip (Hover)
- **Biblioteca**: Usar Tippy.js (via CDN) para tooltips performáticos.
- **Tema**: Glassmorphism (bg branco semi-transparente + blur).
- **Conteúdo**: Título (H4), Horário, Local e Responsável.

## 4. Interatividade
- **Drag & Drop**: O card deve ter um cursor `grab` e, ao ser arrastado, reduzir a opacidade para 0.5.
- **Resize**: Alça de redimensionamento na parte inferior sutil.

## 5. Responsividade (Mobile)
- Ocultar `dayGridMonth`.
- Ativar `listMonth` ou `listWeek`.
- Eventos em lista devem ocupar a largura total com padding generoso.
